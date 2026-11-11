export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  patient_id?: number;
  doctor_id?: number;
  is_doctor_verified?: boolean;
  patient_details?: Patient;
  doctor_details?: Doctor;
}

export interface Patient {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  consent_accepted: boolean;
  created_at: string;
}

export interface Doctor {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialization: string;
  qualifications: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
  clinic_name: string;
  clinic_address: string;
  clinic_city: string;
  clinic_lat: number;
  clinic_lng: number;
  consultation_modes: string[];
  bio: string;
  languages: string[];
  photo_url: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  credentials?: DoctorCredential[];
  working_schedule?: DoctorAvailability[];
}

export interface DoctorCredential {
  id: number;
  doctor_id: number;
  document_type: string;
  document_number: string;
  issuing_authority: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'verified' | 'pending' | 'rejected';
  verified_at?: string;
  verified_by?: string;
}

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  status: 'available' | 'booked' | 'break' | 'past';
}

export interface Appointment {
  id: number;
  booking_reference: string;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialization: string;
  doctor_photo: string;
  doctor_fee: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  consultation_mode: 'online' | 'offline';
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason?: string;
  notes?: string;
  meeting_link?: string;
  clinic_address?: string;
  clinic_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  reversed?: boolean;
}

export interface AssessmentOption {
  label: string;
  score: number;
}

export interface AssessmentInstrument {
  title: string;
  subtitle: string;
  max_score: number;
  options: AssessmentOption[];
  questions: AssessmentQuestion[];
}

export interface Assessment {
  id: number;
  patient_id: number;
  assessment_type: string;
  score: number;
  max_score: number;
  severity_level: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe' | 'low' | 'high' | 'healthy';
  interpretation: string;
  recommendations: string;
  disclaimer: string;
  completed_at: string;
  percentage: number;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  doctor_id: number;
  patient_id: number;
  consultation_date: string;
  duration_minutes: number;
  consultation_mode: string;
  status: string;
  diagnosis_notes?: string;
  recommendations?: string;
  prescription_summary?: string;
  follow_up_needed: boolean;
  follow_up_date?: string;
  created_at: string;
}

export interface ClinicalRecord {
  id: number;
  patient_id: number;
  doctor_id?: number;
  record_type: string;
  title: string;
  details: string;
  file_attachment?: string;
  created_at: string;
}

export interface FollowUp {
  id: number;
  consultation_id?: number;
  patient_id: number;
  doctor_id: number;
  doctor_name?: string;
  scheduled_date: string;
  instructions?: string;
  reminder_sent: boolean;
  completed: boolean;
  status: string;
}

export interface CrisisEvent {
  id: number;
  user_id?: number;
  trigger_source: string;
  trigger_text?: string;
  risk_level: string;
  action_taken: string;
  escalated_to_human: boolean;
  human_agent_id: string;
  resolved: boolean;
  resolution_notes?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource: string;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  badge: string;
  availability: string;
  description: string;
}
