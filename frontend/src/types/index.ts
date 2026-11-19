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

export interface BodyArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  common_symptoms: string[];
}

export interface DifferentialDiagnosis {
  name: string;
  confidence: number;
  specialist?: string;
  description: string;
}

export interface SymptomTriageAnalysis {
  body_area: string;
  body_area_id: string;
  primary_symptoms: string[];
  pain_scale: number;
  recognized_diagnosis: string;
  differential_diagnoses: DifferentialDiagnosis[];
  recommended_specialist: string;
  specialist_reason: string;
  urgency_level: 'routine' | 'urgent' | 'immediate_emergency';
  home_care_recommendations: string;
  red_flags: string;
  dataset_source: string;
  is_emergency: boolean;
}

export interface TriageResponse {
  analysis: SymptomTriageAnalysis;
  matching_doctors: Doctor[];
}

export interface HealthBlockEvent {
  id: number;
  health_block_id: number;
  event_type: 'intake_start' | 'triage_result' | 'doctor_consultation' | 'symptom_update' | 'prescription' | 'doctor_note' | 'resolution';
  author_role: 'patient' | 'doctor' | 'ai_triage' | 'system';
  author_id?: number;
  author_name?: string;
  title: string;
  description: string;
  pain_level_recorded?: number;
  data_payload?: any;
  event_hash: string;
  created_at: string;
}

export interface HealthBlock {
  id: number;
  block_reference: string;
  patient_id: number;
  patient_name: string;
  title: string;
  body_area: string;
  primary_symptoms: string[];
  trouble_description?: string;
  pain_scale: number;
  onset_date?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'under_investigation' | 'under_treatment' | 'resolved' | 'closed';
  recognized_diagnosis?: string;
  possible_diagnoses: DifferentialDiagnosis[];
  recommended_specialist: string;
  specialist_reason?: string;
  triage_notes?: string;
  urgency_level: 'routine' | 'urgent' | 'immediate_emergency';
  assigned_doctor_id?: number;
  assigned_doctor_name?: string;
  assigned_doctor_specialization?: string;
  appointment_id?: number;
  resolution_summary?: string;
  resolved_at?: string;
  resolved_by?: string;
  genesis_hash: string;
  current_block_hash: string;
  events_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Referral {
  id: number;
  referral_code: string;
  patient_id: number;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  stepped_care_level: number;
  provider_name: string;
  clinical_category?: string;
  reason?: string;
  latest_assessment_type?: string;
  latest_score?: number;
  latest_severity?: string;
  patient_consent: boolean;
  status: 'submitted' | 'awaiting_review' | 'accepted' | 'appointment_requested' | 'appointment_confirmed' | 'follow_up_due' | 'completed' | 'alternative_support_required';
  patient_confirmed_care: boolean;
  patient_confirmation_notes?: string;
  scheduled_date?: string;
  clinical_notes?: string;
  doctor_id?: number;
  doctor_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface EarlyWarningStatus {
  has_warning: boolean;
  trigger_reason?: string;
  trend_type?: string;
  explanation: string;
  suggested_action: string;
  recommended_care_level: number;
  baseline?: {
    phq9_avg: number;
    gad7_avg: number;
    pss10_avg: number;
    sleep_avg: number;
  };
}
