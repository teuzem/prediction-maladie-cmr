/*
          # [SECURITE] Durcissement des fonctions SQL
          Correction des avertissements de sécurité en définissant un `search_path` explicite pour toutes les fonctions.

          ## Query Description:
          Cette opération modifie les fonctions existantes pour des raisons de sécurité. Elle n'a aucun impact sur les données existantes et est entièrement sûre à exécuter. Elle empêche des attaques potentielles de type "search path hijacking".
          
          ## Metadata:
          - Schema-Category: "Safe"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Fonctions affectées: handle_new_user, update_timestamp, get_parent_dashboard_stats, get_doctor_dashboard_stats.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No
          - Auth Requirements: Admin
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Négligeable. Améliore la prévisibilité de l'exécution des fonctions.
          */

-- Correction pour la fonction handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Correction de sécurité
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::user_role,
    new.raw_user_meta_data->>'phone'
  );

  -- Si le rôle est médecin, créer une entrée dans la table doctors
  IF (new.raw_user_meta_data->>'role')::user_role = 'doctor' THEN
    INSERT INTO public.doctors (id, languages)
    VALUES (new.id, ARRAY['Français', 'Anglais']);
  END IF;
  
  RETURN new;
END;
$$;

-- Correction pour la fonction update_timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = '' -- Correction de sécurité
AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$;

-- Correction pour la fonction get_parent_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_parent_dashboard_stats(p_parent_id uuid)
RETURNS json
LANGUAGE plpgsql
SET search_path = '' -- Correction de sécurité
AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total_children', (SELECT COUNT(*) FROM public.children WHERE parent_id = p_parent_id),
        'total_predictions', (SELECT COUNT(*) FROM public.predictions WHERE parent_id = p_parent_id),
        'total_appointments', (SELECT COUNT(*) FROM public.appointments WHERE parent_id = p_parent_id),
        'pending_appointments', (SELECT COUNT(*) FROM public.appointments WHERE parent_id = p_parent_id AND status = 'scheduled')
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Correction pour la fonction get_doctor_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_doctor_dashboard_stats(p_doctor_id uuid)
RETURNS json
LANGUAGE plpgsql
SET search_path = '' -- Correction de sécurité
AS $$
DECLARE
    stats json;
    unique_patients_count int;
BEGIN
    -- Compter les patients uniques
    SELECT COUNT(DISTINCT parent_id)
    INTO unique_patients_count
    FROM public.appointments
    WHERE doctor_id = p_doctor_id;

    SELECT json_build_object(
        'total_patients', unique_patients_count,
        'total_appointments', (SELECT COUNT(*) FROM public.appointments WHERE doctor_id = p_doctor_id),
        'total_revenue', (SELECT COALESCE(SUM(consultation_fee), 0) FROM public.appointments WHERE doctor_id = p_doctor_id AND status = 'completed'),
        'average_rating', (SELECT rating FROM public.doctors WHERE id = p_doctor_id)
    ) INTO stats;
    
    RETURN stats;
END;
$$;
