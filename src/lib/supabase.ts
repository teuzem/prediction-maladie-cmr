import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'parent' | 'doctor' | 'admin'
  avatar_url?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  parent_id: string
  name: string
  date_of_birth: string
  gender: 'male' | 'female'
  blood_type?: string
  allergies?: string[]
  medical_history?: string
  vaccination_status: Record<string, any>
  weight?: number
  height?: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Disease {
  id: string
  name: string
  description?: string
  category: string
  severity_level: 'mild' | 'moderate' | 'severe' | 'critical'
  common_age_range?: string
  prevention_methods?: string[]
  natural_treatments?: string[]
  medical_treatments?: string[]
  minsante_approved: boolean
  created_at: string
}

export interface Symptom {
  id: string
  name: string
  description?: string
  category: string
  severity_indicators?: string[]
  created_at: string
}

export interface Prediction {
  id: string
  child_id: string
  parent_id: string
  symptoms_reported: Record<string, any>
  predicted_disease_id?: string
  confidence_score?: number
  additional_info?: Record<string, any>
  medical_report_url?: string
  status: 'pending' | 'completed' | 'confirmed' | 'disputed'
  created_at: string
  disease?: Disease
  child?: Child
}

export interface Doctor {
  id: string
  license_number: string
  specialization: string[]
  experience_years?: number
  consultation_fee: number
  availability_schedule: Record<string, any>
  verified: boolean
  rating?: number
  total_consultations: number
  bio?: string
  education?: string[]
  certifications?: string[]
  languages: string[]
  created_at: string
  profile?: UserProfile
}

export interface Appointment {
  id: string
  parent_id: string
  doctor_id: string
  child_id: string
  prediction_id?: string
  appointment_date: string
  duration_minutes: number
  consultation_fee: number
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'no_show'
  video_room_id?: string
  notes?: string
  created_at: string
  doctor?: Doctor
  child?: Child
  payment?: Payment
}

export interface Payment {
  id: string
  appointment_id: string
  parent_id: string
  amount: number
  currency: string
  payment_method: 'paystack' | 'cinetpay'
  transaction_id?: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_gateway_response?: Record<string, any>
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  appointment_id?: string
  content: string
  message_type: 'text' | 'file' | 'gif' | 'sticker'
  file_url?: string
  gif_url?: string
  read_at?: string
  created_at: string
  sender?: UserProfile
  recipient?: UserProfile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'appointment' | 'payment' | 'consultation' | 'system'
  read: boolean
  action_url?: string
  created_at: string
}
