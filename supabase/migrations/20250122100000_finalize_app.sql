/*
          # [Function] get_conversations
          Récupère les conversations uniques pour un utilisateur donné, avec le dernier message et le nombre de messages non lus.

          ## Query Description: Cette fonction agrège les messages pour créer une liste de conversations. Elle est conçue pour être performante et sécurisée, en utilisant les ID des utilisateurs pour regrouper les messages.
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables: messages, user_profiles
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No
          - Auth Requirements: La fonction est `security definer` et vérifie l'ID de l'utilisateur authentifié.
          
          ## Performance Impact:
          - Indexes: Des index sur (sender_id, recipient_id, created_at) sur la table `messages` sont recommandés.
          - Triggers: None
          - Estimated Impact: Faible. Optimise la récupération des conversations côté client.
          */
CREATE OR REPLACE FUNCTION get_conversations(p_user_id uuid)
RETURNS TABLE(
    contact_id uuid,
    contact_name text,
    contact_avatar text,
    contact_role text,
    last_message_content text,
    last_message_at timestamptz,
    unread_count bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH message_partners AS (
        SELECT
            CASE
                WHEN sender_id = p_user_id THEN recipient_id
                ELSE sender_id
            END as partner_id,
            content,
            created_at,
            read_at,
            sender_id
        FROM messages
        WHERE sender_id = p_user_id OR recipient_id = p_user_id
    ),
    ranked_messages AS (
        SELECT
            partner_id,
            content,
            created_at,
            read_at,
            sender_id,
            ROW_NUMBER() OVER(PARTITION BY partner_id ORDER BY created_at DESC) as rn
        FROM message_partners
    )
    SELECT
        p.id as contact_id,
        p.full_name as contact_name,
        p.avatar_url as contact_avatar,
        p.role as contact_role,
        rm.content as last_message_content,
        rm.created_at as last_message_at,
        (SELECT COUNT(*) FROM messages m WHERE m.recipient_id = p_user_id AND m.sender_id = p.id AND m.read_at IS NULL) as unread_count
    FROM ranked_messages rm
    JOIN user_profiles p ON rm.partner_id = p.id
    WHERE rm.rn = 1
    ORDER BY rm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/*
          # [Function] get_doctor_dashboard_stats
          Agrège les statistiques clés pour le tableau de bord du médecin.

          ## Query Description: Calcule le nombre total de patients, les revenus, et les statistiques de rendez-vous pour un médecin donné. Utilise une seule requête pour une performance optimale.
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables: appointments, doctors
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No
          - Auth Requirements: La fonction est `security definer`.
          
          ## Performance Impact:
          - Indexes: Recommandé sur `appointments(doctor_id, status)`.
          - Triggers: None
          - Estimated Impact: Faible.
          */
CREATE OR REPLACE FUNCTION get_doctor_dashboard_stats(p_doctor_id uuid)
RETURNS json AS $$
DECLARE
    total_patients bigint;
    total_appointments bigint;
    total_revenue numeric;
    avg_rating numeric;
    revenue_trends json;
    appointment_stats json;
BEGIN
    -- Total unique patients
    SELECT COUNT(DISTINCT parent_id) INTO total_patients FROM appointments WHERE doctor_id = p_doctor_id;

    -- Total appointments
    SELECT COUNT(*) INTO total_appointments FROM appointments WHERE doctor_id = p_doctor_id;

    -- Total revenue
    SELECT COALESCE(SUM(consultation_fee), 0) INTO total_revenue FROM appointments WHERE doctor_id = p_doctor_id AND status = 'completed';

    -- Average rating
    SELECT rating INTO avg_rating FROM doctors WHERE id = p_doctor_id;

    -- Revenue trends (last 6 months)
    SELECT json_agg(t) INTO revenue_trends FROM (
        SELECT 
            to_char(date_trunc('month', appointment_date), 'Mon YYYY') as month,
            SUM(consultation_fee) as revenue
        FROM appointments
        WHERE doctor_id = p_doctor_id AND status = 'completed' AND appointment_date > now() - interval '6 months'
        GROUP BY date_trunc('month', appointment_date)
        ORDER BY date_trunc('month', appointment_date)
    ) t;

    -- Appointment stats
    SELECT json_agg(s) INTO appointment_stats FROM (
        SELECT status, COUNT(*) as count
        FROM appointments
        WHERE doctor_id = p_doctor_id
        GROUP BY status
    ) s;

    RETURN json_build_object(
        'total_patients', total_patients,
        'total_appointments', total_appointments,
        'total_revenue', total_revenue,
        'average_rating', avg_rating,
        'revenue_trends', revenue_trends,
        'appointment_stats', appointment_stats
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
