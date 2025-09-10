/*
# EpicTracker - Schema Initial Complet
Migration complète pour l'application de prédiction d'épidémies infantiles au Cameroun

## Query Description: 
Cette opération créera la structure complète de la base de données pour EpicTracker, incluant :
- Tables pour utilisateurs, enfants, maladies, symptômes
- Système de prédictions IA avec confidences
- Gestion des médecins et consultations
- Paiements sécurisés et messagerie
- Notifications et rapports médicaux
- Configuration RLS pour la sécurité

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- user_profiles: Profils utilisateurs avec rôles
- children: Gestion des enfants par parents
- diseases: Base de données de 20+ maladies
- symptoms: Symptômes associés
- predictions: Prédictions IA avec rapports
- doctors: Médecins vérifiés MINSANTE
- appointments: Système de rendez-vous
- payments: Paiements sécurisés
- messages: Messagerie instantanée
- notifications: Système de notifications

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Authentification Supabase requise

## Performance Impact:
- Indexes: Added on frequently queried columns
- Triggers: Profile creation automation
- Estimated Impact: Optimisé pour performance
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'parent' CHECK (role IN ('parent', 'doctor', 'admin')),
    avatar_url TEXT,
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children Table
CREATE TABLE children (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    blood_type VARCHAR(5),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_history TEXT,
    vaccination_status JSONB DEFAULT '{}'::JSONB,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diseases Table
CREATE TABLE diseases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    severity_level VARCHAR(20) CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')) NOT NULL,
    common_age_range VARCHAR(50),
    prevention_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
    natural_treatments TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_treatments TEXT[] DEFAULT ARRAY[]::TEXT[],
    minsante_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms Table
CREATE TABLE symptoms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    severity_indicators TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disease Symptoms Junction Table
CREATE TABLE disease_symptoms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
    weight DECIMAL(3,2) DEFAULT 1.0,
    UNIQUE(disease_id, symptom_id)
);

-- Predictions Table
CREATE TABLE predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    symptoms_reported JSONB NOT NULL,
    predicted_disease_id UUID REFERENCES diseases(id),
    confidence_score DECIMAL(5,4),
    additional_info JSONB DEFAULT '{}'::JSONB,
    medical_report_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'confirmed', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE doctors (
    id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization TEXT[] NOT NULL,
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2) DEFAULT 3500.00,
    availability_schedule JSONB DEFAULT '{}'::JSONB,
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_consultations INTEGER DEFAULT 0,
    bio TEXT,
    education TEXT[] DEFAULT ARRAY[]::TEXT[],
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages TEXT[] DEFAULT ARRAY['Français']::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    prediction_id UUID REFERENCES predictions(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'no_show')),
    video_room_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    payment_method VARCHAR(20) CHECK (payment_method IN ('paystack', 'cinetpay')) NOT NULL,
    transaction_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_gateway_response JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'gif', 'sticker')),
    file_url TEXT,
    gif_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('appointment', 'payment', 'consultation', 'system')) NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Reports Table
CREATE TABLE medical_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    ai_prediction_confirmed BOOLEAN,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_predictions_child_id ON predictions(child_id);
CREATE INDEX idx_predictions_parent_id ON predictions(parent_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_parent_id ON appointments(parent_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read access to doctor profiles" ON user_profiles FOR SELECT USING (role = 'doctor');

-- RLS Policies for children
CREATE POLICY "Parents can manage their children" ON children FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "Doctors can view children during appointments" ON children FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.child_id = children.id 
        AND appointments.doctor_id = auth.uid()
    )
);

-- RLS Policies for diseases and symptoms (public read)
CREATE POLICY "Public read access to diseases" ON diseases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access to symptoms" ON symptoms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access to disease_symptoms" ON disease_symptoms FOR SELECT TO authenticated USING (true);

-- RLS Policies for predictions
CREATE POLICY "Parents can manage their predictions" ON predictions FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "Doctors can view predictions for their appointments" ON predictions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM appointments 
        WHERE appointments.prediction_id = predictions.id 
        AND appointments.doctor_id = auth.uid()
    )
);

-- RLS Policies for doctors
CREATE POLICY "Public read access to verified doctors" ON doctors FOR SELECT USING (verified = true);
CREATE POLICY "Doctors can update their own profile" ON doctors FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for appointments
CREATE POLICY "Parents can manage their appointments" ON appointments FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "Doctors can manage their appointments" ON appointments FOR ALL USING (auth.uid() = doctor_id);

-- RLS Policies for payments
CREATE POLICY "Parents can view their payments" ON payments FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their sent messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for medical reports
CREATE POLICY "Parents can view reports for their children" ON medical_reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM children 
        WHERE children.id = medical_reports.child_id 
        AND children.parent_id = auth.uid()
    )
);
CREATE POLICY "Doctors can manage their reports" ON medical_reports FOR ALL USING (auth.uid() = doctor_id);

-- Insert sample diseases (20+ maladies courantes au Cameroun)
INSERT INTO diseases (name, description, category, severity_level, common_age_range, prevention_methods, natural_treatments, medical_treatments, minsante_approved) VALUES
('Paludisme', 'Maladie parasitaire transmise par les moustiques', 'Parasitaire', 'severe', '0-18 ans', ARRAY['Moustiquaires imprégnées', 'Assainissement', 'Élimination eaux stagnantes']::TEXT[], ARRAY['Artemisia', 'Quinquina']::TEXT[], ARRAY['Artesunate', 'Quinine', 'Coartem']::TEXT[], true),
('Diarrhée aiguë', 'Émission de selles liquides fréquentes', 'Gastro-intestinale', 'moderate', '0-5 ans', ARRAY['Hygiène des mains', 'Eau potable', 'Allaitement maternel']::TEXT[], ARRAY['SRO maison', 'Tisane de goyave']::TEXT[], ARRAY['SRO', 'Zinc', 'Probiotiques']::TEXT[], true),
('Pneumonie', 'Infection des poumons', 'Respiratoire', 'severe', '0-5 ans', ARRAY['Vaccination', 'Allaitement', 'Éviter fumée']::TEXT[], ARRAY['Miel', 'Eucalyptus']::TEXT[], ARRAY['Amoxicilline', 'Azithromycine']::TEXT[], true),
('Rougeole', 'Maladie virale éruptive', 'Virale', 'moderate', '6 mois-5 ans', ARRAY['Vaccination ROR', 'Éviter contact malade']::TEXT[], ARRAY['Vitamine A']::TEXT[], ARRAY['Paracétamol', 'Vitamine A']::TEXT[], true),
('Méningite', 'Inflammation des méninges, urgence médicale', 'Infectieuse', 'critical', '0-18 ans', ARRAY['Vaccination', 'Éviter les rassemblements']::TEXT[], ARRAY[]::TEXT[], ARRAY['Ceftriaxone', 'Pénicilline G']::TEXT[], true),
('Coqueluche', 'Infection respiratoire par Bordetella pertussis', 'Respiratoire', 'severe', '0-2 ans', ARRAY['Vaccination DTC', 'Éviter contact malade']::TEXT[], ARRAY['Miel (>1 an)']::TEXT[], ARRAY['Azithromycine', 'Clarithromycine']::TEXT[], true),
('Dengue', 'Maladie virale transmise par Aedes', 'Virale', 'severe', '0-18 ans', ARRAY['Élimination gîtes larvaires', 'Protection moustiques']::TEXT[], ARRAY['Papaye']::TEXT[], ARRAY['Paracétamol', 'Réhydratation']::TEXT[], true),
('Fièvre typhoïde', 'Infection bactérienne par Salmonella', 'Bactérienne', 'severe', '2-18 ans', ARRAY['Hygiène alimentaire', 'Eau potable', 'Vaccination']::TEXT[], ARRAY[]::TEXT[], ARRAY['Ciprofloxacine', 'Azithromycine']::TEXT[], true),
('Hépatite A', 'Infection virale du foie', 'Virale', 'moderate', '2-18 ans', ARRAY['Hygiène des mains', 'Eau potable', 'Vaccination']::TEXT[], ARRAY['Repos', 'Hydratation']::TEXT[], ARRAY['Repos', 'Paracétamol évité']::TEXT[], true),
('Gastro-entérite', 'Inflammation estomac et intestins', 'Gastro-intestinale', 'mild', '0-18 ans', ARRAY['Hygiène', 'Cuisson aliments']::TEXT[], ARRAY['Riz', 'Banane']::TEXT[], ARRAY['SRO', 'Probiotiques']::TEXT[], true),
('Bronchiolite', 'Infection virale des bronchioles', 'Respiratoire', 'moderate', '0-2 ans', ARRAY['Éviter fumée', 'Hygiène']::TEXT[], ARRAY['Sérum physiologique']::TEXT[], ARRAY['Kinésithérapie', 'Oxygène si besoin']::TEXT[], true),
('Otite moyenne', 'Infection de l''oreille moyenne', 'ORL', 'mild', '6 mois-6 ans', ARRAY['Allaitement', 'Éviter fumée']::TEXT[], ARRAY['Huile d''olive tiède']::TEXT[], ARRAY['Amoxicilline', 'Paracétamol']::TEXT[], true),
('Conjonctivite', 'Inflammation de la conjonctive', 'Ophtalmologique', 'mild', '0-18 ans', ARRAY['Hygiène des mains', 'Éviter contact']::TEXT[], ARRAY['Eau salée']::TEXT[], ARRAY['Collyre antibiotique']::TEXT[], true),
('Varicelle', 'Maladie virale par virus zona', 'Virale', 'mild', '2-10 ans', ARRAY['Vaccination', 'Éviter contact']::TEXT[], ARRAY['Bains d''avoine']::TEXT[], ARRAY['Paracétamol', 'Antihistaminiques']::TEXT[], true),
('Angine', 'Infection de la gorge', 'ORL', 'mild', '2-18 ans', ARRAY['Hygiène', 'Éviter refroidissement']::TEXT[], ARRAY['Miel', 'Citron']::TEXT[], ARRAY['Amoxicilline si bactérienne']::TEXT[], true),
('Impétigo', 'Infection cutanée bactérienne', 'Dermatologique', 'mild', '2-10 ans', ARRAY['Hygiène', 'Éviter grattage']::TEXT[], ARRAY['Miel', 'Aloe vera']::TEXT[], ARRAY['Mupirocine topique']::TEXT[], true),
('Gale', 'Infestation par acarien Sarcoptes', 'Dermatologique', 'mild', '0-18 ans', ARRAY['Hygiène', 'Lavage vêtements']::TEXT[], ARRAY[]::TEXT[], ARRAY['Perméthrine', 'Ivermectine']::TEXT[], true),
('Teigne', 'Infection fongique du cuir chevelu', 'Dermatologique', 'mild', '2-12 ans', ARRAY['Hygiène', 'Éviter partage objets']::TEXT[], ARRAY['Huile de coco']::TEXT[], ARRAY['Griséofulvine', 'Terbinafine']::TEXT[], true),
('Kwashiorkor', 'Malnutrition protéino-énergétique', 'Nutritionnelle', 'severe', '1-5 ans', ARRAY['Allaitement exclusif', 'Diversification']::TEXT[], ARRAY[]::TEXT[], ARRAY['Réhabilitation nutritionnelle']::TEXT[], true),
('Anémie ferriprive', 'Carence en fer', 'Hématologique', 'moderate', '6 mois-18 ans', ARRAY['Aliments riches en fer', 'Vitamine C']::TEXT[], ARRAY['Spiruline', 'Moringa']::TEXT[], ARRAY['Sulfate ferreux', 'Acide folique']::TEXT[], true),
('Rachitisme', 'Carence en vitamine D et calcium', 'Osseuse', 'moderate', '0-5 ans', ARRAY['Exposition soleil', 'Alimentation équilibrée']::TEXT[], ARRAY[]::TEXT[], ARRAY['Vitamine D', 'Calcium']::TEXT[], true),
('Ascariose', 'Infection par vers Ascaris', 'Parasitaire', 'mild', '2-18 ans', ARRAY['Hygiène des mains', 'Légumes lavés']::TEXT[], ARRAY['Ail', 'Graines de papaye']::TEXT[], ARRAY['Albendazole', 'Mébendazole']::TEXT[], true),
('Amibiase', 'Infection par amibes', 'Parasitaire', 'moderate', '2-18 ans', ARRAY['Eau potable', 'Hygiène alimentaire']::TEXT[], ARRAY[]::TEXT[], ARRAY['Métronidazole', 'Tinidazole']::TEXT[], true);

-- Insert sample symptoms
INSERT INTO symptoms (name, description, category, severity_indicators) VALUES
('Fièvre', 'Élévation température corporelle', 'Général', ARRAY['>39°C', 'Persistante >3 jours']::TEXT[]),
('Toux', 'Expulsion forcée air des poumons', 'Respiratoire', ARRAY['Avec sang', 'Persistante >2 semaines']::TEXT[]),
('Vomissements', 'Émission forcée contenu gastrique', 'Digestif', ARRAY['Répétés', 'Avec sang']::TEXT[]),
('Diarrhée', 'Selles liquides fréquentes', 'Digestif', ARRAY['>10 selles/jour', 'Avec sang']::TEXT[]),
('Maux de tête', 'Douleur crânienne', 'Neurologique', ARRAY['Intense', 'Avec vomissements']::TEXT[]),
('Éruption cutanée', 'Lésions sur la peau', 'Dermatologique', ARRAY['Généralisée', 'Avec fièvre']::TEXT[]),
('Difficulté respiratoire', 'Gêne pour respirer', 'Respiratoire', ARRAY['Au repos', 'Cyanose']::TEXT[]),
('Perte d''appétit', 'Diminution envie de manger', 'Général', ARRAY['Totale', '>1 semaine']::TEXT[]),
('Fatigue', 'Sensation épuisement', 'Général', ARRAY['Extrême', 'Incapacité jouer']::TEXT[]),
('Douleur abdominale', 'Mal au ventre', 'Digestif', ARRAY['Intense', 'Localisée']::TEXT[]),
('Convulsions', 'Contractions musculaires involontaires', 'Neurologique', ARRAY['Répétées', 'Avec perte conscience']::TEXT[]),
('Déshydratation', 'Perte excessive liquides', 'Général', ARRAY['Pli cutané', 'Yeux enfoncés']::TEXT[]),
('Jaunisse', 'Coloration jaune peau et yeux', 'Hépatique', ARRAY['Généralisée', 'Urines foncées']::TEXT[]),
('Ganglions gonflés', 'Augmentation taille ganglions', 'Général', ARRAY['Multiples', 'Durs']::TEXT[]),
('Saignement nez', 'Épistaxis', 'ORL', ARRAY['Répété', 'Abondant']::TEXT[]),
('Démangeaisons', 'Sensation prurigineuse', 'Dermatologique', ARRAY['Intense', 'Généralisée']::TEXT[]),
('Douleur oreille', 'Otalgie', 'ORL', ARRAY['Intense', 'Avec écoulement']::TEXT[]),
('Yeux rouges', 'Conjonctive irritée', 'Ophtalmologique', ARRAY['Avec douleur', 'Pus']::TEXT[]),
('Perte de poids', 'Amaigrissement', 'Général', ARRAY['Rapide', '>10% poids']::TEXT[]),
('Somnolence', 'Envie de dormir excessive', 'Neurologique', ARRAY['Permanente', 'Difficile réveiller']::TEXT[]);

-- Insert some disease-symptom relationships
INSERT INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, 0.9
FROM diseases d, symptoms s
WHERE d.name = 'Paludisme' AND s.name IN ('Fièvre', 'Maux de tête', 'Vomissements', 'Fatigue');

INSERT INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, 0.8
FROM diseases d, symptoms s
WHERE d.name = 'Diarrhée aiguë' AND s.name IN ('Diarrhée', 'Vomissements', 'Déshydratation', 'Douleur abdominale');

INSERT INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, 0.9
FROM diseases d, symptoms s
WHERE d.name = 'Pneumonie' AND s.name IN ('Fièvre', 'Toux', 'Difficulté respiratoire', 'Fatigue');

INSERT INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, 0.8
FROM diseases d, symptoms s
WHERE d.name = 'Rougeole' AND s.name IN ('Fièvre', 'Éruption cutanée', 'Toux', 'Yeux rouges');

INSERT INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, 1.0
FROM diseases d, symptoms s
WHERE d.name = 'Méningite' AND s.name IN ('Fièvre', 'Maux de tête', 'Convulsions', 'Somnolence');
