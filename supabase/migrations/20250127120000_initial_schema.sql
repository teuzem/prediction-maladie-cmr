/*
# Initial EpicTracker Database Schema
This migration creates the complete database structure for the EpicTracker application including user profiles, children management, medical predictions, appointments, and messaging system.

## Query Description: 
This operation will create the foundational database structure for the EpicTracker application. It includes tables for user management, children profiles, medical predictions, doctor consultations, appointments, payments, and messaging. This is a safe initial setup with no existing data impact.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- user_profiles: User management with role-based access
- children: Child profiles managed by parents
- diseases: Medical conditions database
- symptoms: Symptoms catalog
- predictions: ML prediction results
- doctors: Medical professionals registry
- appointments: Consultation scheduling
- payments: Payment transaction records
- consultations: Medical consultation sessions
- messages: Internal messaging system
- notifications: User notifications

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes
- Auth Requirements: Supabase Auth integration

## Performance Impact:
- Indexes: Added for optimized queries
- Triggers: Profile creation trigger
- Estimated Impact: Minimal for new database
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('parent', 'doctor', 'admin')) DEFAULT 'parent',
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children profiles table
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    blood_type TEXT,
    allergies TEXT[],
    medical_history TEXT,
    vaccination_status JSONB DEFAULT '{}',
    weight DECIMAL,
    height DECIMAL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diseases catalog
CREATE TABLE IF NOT EXISTS public.diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    severity_level TEXT CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')) DEFAULT 'moderate',
    common_age_range TEXT,
    prevention_methods TEXT[],
    natural_treatments TEXT[],
    medical_treatments TEXT[],
    minsante_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptoms catalog
CREATE TABLE IF NOT EXISTS public.symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    severity_indicators TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease-Symptom relationship
CREATE TABLE IF NOT EXISTS public.disease_symptoms (
    disease_id UUID REFERENCES public.diseases(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES public.symptoms(id) ON DELETE CASCADE,
    likelihood_score DECIMAL CHECK (likelihood_score >= 0 AND likelihood_score <= 1),
    PRIMARY KEY (disease_id, symptom_id)
);

-- ML Predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    symptoms_reported JSONB NOT NULL,
    predicted_disease_id UUID REFERENCES public.diseases(id),
    confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    additional_info JSONB,
    medical_report_url TEXT,
    status TEXT CHECK (status IN ('pending', 'completed', 'confirmed', 'disputed')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID REFERENCES public.user_profiles(id) PRIMARY KEY,
    license_number TEXT NOT NULL UNIQUE,
    specialization TEXT[] NOT NULL,
    experience_years INTEGER,
    consultation_fee DECIMAL DEFAULT 3500,
    availability_schedule JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    rating DECIMAL CHECK (rating >= 0 AND rating <= 5),
    total_consultations INTEGER DEFAULT 0,
    bio TEXT,
    education TEXT[],
    certifications TEXT[],
    languages TEXT[] DEFAULT ARRAY['French'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.predictions(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_fee DECIMAL NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    video_room_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'XAF',
    payment_method TEXT CHECK (payment_method IN ('paystack', 'cinetpay')) NOT NULL,
    transaction_id TEXT UNIQUE,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_diagnosis TEXT,
    ai_diagnosis_confirmed BOOLEAN,
    recommended_treatment TEXT,
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_date DATE,
    medical_report_url TEXT,
    prescription JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id),
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'file', 'gif', 'sticker')) DEFAULT 'text',
    file_url TEXT,
    gif_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('appointment', 'payment', 'consultation', 'system')) NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_predictions_child_id ON public.predictions(child_id);
CREATE INDEX IF NOT EXISTS idx_predictions_parent_id ON public.predictions(parent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_parent_id ON public.appointments(parent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children" ON public.children
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can manage own children" ON public.children
    FOR ALL USING (auth.uid() = parent_id);

-- RLS Policies for diseases and symptoms (public read)
CREATE POLICY "Everyone can view diseases" ON public.diseases
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view symptoms" ON public.symptoms
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view disease symptoms" ON public.disease_symptoms
    FOR SELECT USING (true);

-- RLS Policies for predictions
CREATE POLICY "Parents can view own predictions" ON public.predictions
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create predictions" ON public.predictions
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for doctors
CREATE POLICY "Everyone can view verified doctors" ON public.doctors
    FOR SELECT USING (verified = true);

CREATE POLICY "Doctors can update own profile" ON public.doctors
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = doctor_id);

CREATE POLICY "Parents can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Doctors can update their appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = doctor_id);

-- RLS Policies for payments
CREATE POLICY "Parents can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for consultations
CREATE POLICY "Appointment participants can view consultations" ON public.consultations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a 
            WHERE a.id = appointment_id 
            AND (a.parent_id = auth.uid() OR a.doctor_id = auth.uid())
        )
    );

CREATE POLICY "Doctors can create consultations" ON public.consultations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.appointments a 
            WHERE a.id = appointment_id 
            AND a.doctor_id = auth.uid()
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample diseases data
INSERT INTO public.diseases (name, description, category, severity_level, common_age_range, prevention_methods, natural_treatments, medical_treatments, minsante_approved) VALUES
('Paludisme', 'Maladie parasitaire transmise par les moustiques, très fréquente au Cameroun', 'Infectieuse', 'severe', '0-18 ans', ARRAY['Moustiquaires imprégnées', 'Élimination des eaux stagnantes', 'Prophylaxie antipaludique'], ARRAY['Tisane de quinquina', 'Artemisia'], ARRAY['Artéméther-luméfantrine', 'Quinine'], true),
('Diarrhée', 'Émission de selles liquides fréquentes, souvent due à une infection', 'Gastro-intestinale', 'moderate', '0-5 ans', ARRAY['Hygiène des mains', 'Eau potable', 'Aliments bien cuits'], ARRAY['SRO maison (sel, sucre, eau)', 'Riz bouilli'], ARRAY['Solutés de réhydratation orale', 'Zinc'], true),
('Pneumonie', 'Infection des poumons pouvant être grave chez les enfants', 'Respiratoire', 'severe', '0-5 ans', ARRAY['Vaccination', 'Allaitement maternel', 'Éviter la fumée'], ARRAY['Miel et gingembre', 'Inhalation vapeur eucalyptus'], ARRAY['Amoxicilline', 'Ceftriaxone'], true),
('Rougeole', 'Maladie virale hautement contagieuse avec éruption cutanée', 'Virale', 'moderate', '6 mois-15 ans', ARRAY['Vaccination ROR', 'Isolement des malades'], ARRAY['Vitamine A', 'Tisanes fébrifuges'], ARRAY['Traitement symptomatique', 'Vitamine A'], true),
('Méningite', 'Inflammation des méninges, urgence médicale', 'Infectieuse', 'critical', '0-18 ans', ARRAY['Vaccination', 'Éviter les rassemblements'], ARRAY[], ARRAY['Ceftriaxone', 'Pénicilline G'], true);

-- Insert sample symptoms data
INSERT INTO public.symptoms (name, description, category, severity_indicators) VALUES
('Fièvre', 'Élévation de la température corporelle', 'Général', ARRAY['38°C+', 'Frissons', 'Sueurs']),
('Toux', 'Expulsion forcée d''air des poumons', 'Respiratoire', ARRAY['Toux sèche', 'Toux grasse', 'Sang dans les crachats']),
('Diarrhée', 'Selles liquides fréquentes', 'Digestif', ARRAY['Plus de 3 selles/jour', 'Sang dans les selles', 'Déshydratation']),
('Vomissements', 'Rejet du contenu gastrique', 'Digestif', ARRAY['Fréquents', 'Présence de sang', 'Incapacité à garder les liquides']),
('Maux de tête', 'Douleur céphalique', 'Neurologique', ARRAY['Intense', 'Avec raideur de nuque', 'Avec troubles visuels']),
('Éruption cutanée', 'Apparition de lésions sur la peau', 'Dermatologique', ARRAY['Généralisée', 'Avec fièvre', 'Purpurique']),
('Difficultés respiratoires', 'Gêne pour respirer', 'Respiratoire', ARRAY['Essoufflement au repos', 'Cyanose', 'Tirage intercostal']);

-- Link diseases to symptoms
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.9 FROM public.diseases d, public.symptoms s WHERE d.name = 'Paludisme' AND s.name = 'Fièvre';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.7 FROM public.diseases d, public.symptoms s WHERE d.name = 'Paludisme' AND s.name = 'Maux de tête';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.6 FROM public.diseases d, public.symptoms s WHERE d.name = 'Paludisme' AND s.name = 'Vomissements';

INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.95 FROM public.diseases d, public.symptoms s WHERE d.name = 'Diarrhée' AND s.name = 'Diarrhée';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.7 FROM public.diseases d, public.symptoms s WHERE d.name = 'Diarrhée' AND s.name = 'Vomissements';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.6 FROM public.diseases d, public.symptoms s WHERE d.name = 'Diarrhée' AND s.name = 'Fièvre';

INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.9 FROM public.diseases d, public.symptoms s WHERE d.name = 'Pneumonie' AND s.name = 'Toux';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.8 FROM public.diseases d, public.symptoms s WHERE d.name = 'Pneumonie' AND s.name = 'Fièvre';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.7 FROM public.diseases d, public.symptoms s WHERE d.name = 'Pneumonie' AND s.name = 'Difficultés respiratoires';

INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.9 FROM public.diseases d, public.symptoms s WHERE d.name = 'Rougeole' AND s.name = 'Éruption cutanée';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.8 FROM public.diseases d, public.symptoms s WHERE d.name = 'Rougeole' AND s.name = 'Fièvre';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.6 FROM public.diseases d, public.symptoms s WHERE d.name = 'Rougeole' AND s.name = 'Toux';

INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.9 FROM public.diseases d, public.symptoms s WHERE d.name = 'Méningite' AND s.name = 'Maux de tête';
INSERT INTO public.disease_symptoms (disease_id, symptom_id, likelihood_score) 
SELECT d.id, s.id, 0.8 FROM public.diseases d, public.symptoms s WHERE d.name = 'Méningite' AND s.name = 'Fièvre';
