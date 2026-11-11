from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient')  # 'patient', 'doctor', 'admin'
    phone = db.Column(db.String(30), nullable=True)
    preferred_language = db.Column(db.String(50), default='English')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    patient_profile = db.relationship('Patient', backref='user', uselist=False, cascade='all, delete-orphan')
    doctor_profile = db.relationship('Doctor', backref='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic')
    audit_logs = db.relationship('AuditLog', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'phone': self.phone,
            'preferred_language': self.preferred_language,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'patient_id': self.patient_profile.id if self.patient_profile else None,
            'doctor_id': self.doctor_profile.id if self.doctor_profile else None,
            'is_doctor_verified': self.doctor_profile.is_verified if self.doctor_profile else False,
        }


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    date_of_birth = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    blood_group = db.Column(db.String(10), nullable=True)
    emergency_contact_name = db.Column(db.String(120), nullable=True)
    emergency_contact_phone = db.Column(db.String(30), nullable=True)
    medical_notes = db.Column(db.Text, nullable=True)
    consent_accepted = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    appointments = db.relationship('Appointment', backref='patient', lazy='dynamic')
    assessments = db.relationship('Assessment', backref='patient', lazy='dynamic')
    consent_records = db.relationship('ConsentRecord', backref='patient', lazy='dynamic')
    clinical_records = db.relationship('ClinicalRecord', backref='patient', lazy='dynamic')
    follow_ups = db.relationship('FollowUp', backref='patient', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else '',
            'email': self.user.email if self.user else '',
            'phone': self.user.phone if self.user else '',
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'medical_notes': self.medical_notes,
            'consent_accepted': self.consent_accepted,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    specialization = db.Column(db.String(100), nullable=False)
    qualifications = db.Column(db.String(200), nullable=False)
    license_number = db.Column(db.String(100), nullable=False, unique=True)
    experience_years = db.Column(db.Integer, default=5)
    consultation_fee = db.Column(db.Float, default=150.0)
    clinic_name = db.Column(db.String(150), default='urCure Medical Center')
    clinic_address = db.Column(db.String(255), default='Corniche Road, Abu Dhabi, UAE')
    clinic_city = db.Column(db.String(100), default='Abu Dhabi')
    clinic_lat = db.Column(db.Float, default=24.4539)
    clinic_lng = db.Column(db.Float, default=54.3773)
    consultation_modes = db.Column(db.String(50), default='online,offline')  # comma separated
    bio = db.Column(db.Text, nullable=True)
    languages = db.Column(db.String(150), default='English, Arabic')
    photo_url = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=4.9)
    review_count = db.Column(db.Integer, default=12)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    credentials = db.relationship('DoctorCredential', backref='doctor', lazy='dynamic', cascade='all, delete-orphan')
    availabilities = db.relationship('DoctorAvailability', backref='doctor', lazy='dynamic', cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='doctor', lazy='dynamic')
    consultations = db.relationship('Consultation', backref='doctor', lazy='dynamic')

    def to_dict(self):
        modes = [m.strip() for m in self.consultation_modes.split(',') if m.strip()]
        langs = [l.strip() for l in self.languages.split(',') if l.strip()]
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else '',
            'email': self.user.email if self.user else '',
            'specialization': self.specialization,
            'qualifications': self.qualifications,
            'license_number': self.license_number,
            'experience_years': self.experience_years,
            'consultation_fee': self.consultation_fee,
            'clinic_name': self.clinic_name,
            'clinic_address': self.clinic_address,
            'clinic_city': self.clinic_city,
            'clinic_lat': self.clinic_lat,
            'clinic_lng': self.clinic_lng,
            'consultation_modes': modes,
            'bio': self.bio,
            'languages': langs,
            'photo_url': self.photo_url or f"https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
            'is_verified': self.is_verified,
            'rating': self.rating,
            'review_count': self.review_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DoctorCredential(db.Model):
    __tablename__ = 'doctor_credentials'

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)  # Medical License, Degree, Board Certification
    document_number = db.Column(db.String(100), nullable=False)
    issuing_authority = db.Column(db.String(150), default='Department of Health Abu Dhabi (DoH)')
    issue_date = db.Column(db.String(20), nullable=True)
    expiry_date = db.Column(db.String(20), nullable=True)
    verification_status = db.Column(db.String(30), default='verified')  # 'pending', 'verified', 'rejected'
    verified_at = db.Column(db.DateTime, nullable=True)
    verified_by = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'document_type': self.document_type,
            'document_number': self.document_number,
            'issuing_authority': self.issuing_authority,
            'issue_date': self.issue_date,
            'expiry_date': self.expiry_date,
            'verification_status': self.verification_status,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'verified_by': self.verified_by
        }


class DoctorAvailability(db.Model):
    __tablename__ = 'doctor_availability'

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = db.Column(db.String(10), nullable=False)  # "09:00"
    end_time = db.Column(db.String(10), nullable=False)    # "17:00"
    break_start = db.Column(db.String(10), nullable=True)  # "13:00"
    break_end = db.Column(db.String(10), nullable=True)    # "14:00"
    slot_duration_minutes = db.Column(db.Integer, default=30)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'break_start': self.break_start,
            'break_end': self.break_end,
            'slot_duration_minutes': self.slot_duration_minutes,
            'is_active': self.is_active
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(40), unique=True, nullable=False, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    appointment_date = db.Column(db.String(20), nullable=False, index=True)  # YYYY-MM-DD
    start_time = db.Column(db.String(10), nullable=False)  # "09:00"
    end_time = db.Column(db.String(10), nullable=False)    # "09:30"
    duration_minutes = db.Column(db.Integer, default=30)
    consultation_mode = db.Column(db.String(20), default='online')  # 'online' or 'offline'
    status = db.Column(db.String(20), default='confirmed')  # 'confirmed', 'completed', 'cancelled', 'rescheduled'
    reason = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    meeting_link = db.Column(db.String(255), nullable=True)
    clinic_address = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    consultation = db.relationship('Consultation', backref='appointment', uselist=False)

    __table_args__ = (
        # Note: concurrency safety is enforced in atomic transaction check & lock
        db.Index('idx_doctor_slot', 'doctor_id', 'appointment_date', 'start_time'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'booking_reference': self.booking_reference,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient and self.patient.user else 'Unknown',
            'patient_email': self.patient.user.email if self.patient and self.patient.user else '',
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else 'Unknown',
            'doctor_specialization': self.doctor.specialization if self.doctor else '',
            'doctor_photo': self.doctor.photo_url if self.doctor else '',
            'doctor_fee': self.doctor.consultation_fee if self.doctor else 0,
            'appointment_date': self.appointment_date,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'duration_minutes': self.duration_minutes,
            'consultation_mode': self.consultation_mode,
            'status': self.status,
            'reason': self.reason,
            'notes': self.notes,
            'meeting_link': self.meeting_link,
            'clinic_address': self.clinic_address or (self.doctor.clinic_address if self.doctor else ''),
            'clinic_name': self.doctor.clinic_name if self.doctor else '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)  # 'PHQ-9', 'GAD-7', 'PSS-10', 'WHO-5', 'MOOD_CHECKIN'
    score = db.Column(db.Integer, nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    severity_level = db.Column(db.String(50), nullable=False)  # 'minimal', 'mild', 'moderate', 'moderately_severe', 'severe'
    interpretation = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    disclaimer = db.Column(db.Text, default='AI and standardized screenings do not provide a clinical diagnosis. Please consult a licensed professional.')
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    results = db.relationship('AssessmentResult', backref='assessment', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'assessment_type': self.assessment_type,
            'score': self.score,
            'max_score': self.max_score,
            'severity_level': self.severity_level,
            'interpretation': self.interpretation,
            'recommendations': self.recommendations,
            'disclaimer': self.disclaimer,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'percentage': round((self.score / self.max_score) * 100, 1) if self.max_score > 0 else 0
        }


class AssessmentResult(db.Model):
    __tablename__ = 'assessment_results'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.String(50), nullable=False)
    question_text = db.Column(db.String(255), nullable=False)
    selected_option = db.Column(db.String(100), nullable=False)
    score_value = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'assessment_id': self.assessment_id,
            'question_id': self.question_id,
            'question_text': self.question_text,
            'selected_option': self.selected_option,
            'score_value': self.score_value
        }


class ConsentRecord(db.Model):
    __tablename__ = 'consent_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    consent_type = db.Column(db.String(100), nullable=False)  # 'terms_and_conditions', 'privacy_policy', 'telehealth_consent', 'data_processing'
    agreed = db.Column(db.Boolean, default=True)
    ip_address = db.Column(db.String(50), default='127.0.0.1')
    version = db.Column(db.String(20), default='1.0')
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'consent_type': self.consent_type,
            'agreed': self.agreed,
            'ip_address': self.ip_address,
            'version': self.version,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class Consultation(db.Model):
    __tablename__ = 'consultations'

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id', ondelete='CASCADE'), nullable=False, unique=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    consultation_date = db.Column(db.String(20), nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    consultation_mode = db.Column(db.String(20), default='online')
    status = db.Column(db.String(20), default='completed')  # 'in_progress', 'completed'
    diagnosis_notes = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    prescription_summary = db.Column(db.Text, nullable=True)
    follow_up_needed = db.Column(db.Boolean, default=False)
    follow_up_date = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    follow_ups = db.relationship('FollowUp', backref='consultation', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'doctor_id': self.doctor_id,
            'patient_id': self.patient_id,
            'consultation_date': self.consultation_date,
            'duration_minutes': self.duration_minutes,
            'consultation_mode': self.consultation_mode,
            'status': self.status,
            'diagnosis_notes': self.diagnosis_notes,
            'recommendations': self.recommendations,
            'prescription_summary': self.prescription_summary,
            'follow_up_needed': self.follow_up_needed,
            'follow_up_date': self.follow_up_date,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ClinicalRecord(db.Model):
    __tablename__ = 'clinical_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='SET NULL'), nullable=True)
    record_type = db.Column(db.String(50), default='consultation_note')  # 'consultation_note', 'assessment_report', 'prescription', 'lab_summary'
    title = db.Column(db.String(150), nullable=False)
    details = db.Column(db.Text, nullable=False)
    file_attachment = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'record_type': self.record_type,
            'title': self.title,
            'details': self.details,
            'file_attachment': self.file_attachment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Referral(db.Model):
    __tablename__ = 'referrals'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    referring_doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    referred_to_doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='SET NULL'), nullable=True)
    specialization_needed = db.Column(db.String(100), nullable=False)
    urgency = db.Column(db.String(30), default='routine')  # 'routine', 'urgent', 'immediate'
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='pending')  # 'pending', 'accepted', 'completed'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'referring_doctor_id': self.referring_doctor_id,
            'referred_to_doctor_id': self.referred_to_doctor_id,
            'specialization_needed': self.specialization_needed,
            'urgency': self.urgency,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FollowUp(db.Model):
    __tablename__ = 'follow_ups'

    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id', ondelete='SET NULL'), nullable=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    scheduled_date = db.Column(db.String(20), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    reminder_sent = db.Column(db.Boolean, default=False)
    completed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(30), default='scheduled')  # 'scheduled', 'completed', 'overdue'

    def to_dict(self):
        return {
            'id': self.id,
            'consultation_id': self.consultation_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.consultation.appointment.doctor.user.full_name if self.consultation and self.consultation.appointment else 'Doctor',
            'scheduled_date': self.scheduled_date,
            'instructions': self.instructions,
            'reminder_sent': self.reminder_sent,
            'completed': self.completed,
            'status': self.status
        }


class CrisisEvent(db.Model):
    __tablename__ = 'crisis_events'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    trigger_source = db.Column(db.String(50), nullable=False)  # 'assessment', 'chat', 'emergency_button'
    trigger_text = db.Column(db.Text, nullable=True)
    risk_level = db.Column(db.String(30), default='high')  # 'medium', 'high', 'critical'
    action_taken = db.Column(db.Text, nullable=False)
    escalated_to_human = db.Column(db.Boolean, default=True)
    human_agent_id = db.Column(db.String(100), default='On-Call Crisis Clinical Lead')
    resolved = db.Column(db.Boolean, default=False)
    resolution_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trigger_source': self.trigger_source,
            'trigger_text': self.trigger_text,
            'risk_level': self.risk_level,
            'action_taken': self.action_taken,
            'escalated_to_human': self.escalated_to_human,
            'human_agent_id': self.human_agent_id,
            'resolved': self.resolved,
            'resolution_notes': self.resolution_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='appointment')  # 'appointment', 'assessment', 'emergency', 'system'
    is_read = db.Column(db.Boolean, default=False)
    action_link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'action_link': self.action_link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), default='127.0.0.1')
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource': self.resource,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
