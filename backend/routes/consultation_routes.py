from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Consultation, Appointment, FollowUp, ClinicalRecord, User, Notification, AuditLog
from mongo_service import mongo_service

consultation_bp = Blueprint('consultations', __name__)

@consultation_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_consultation_details(appointment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Allow patient or doctor associated with appointment, or admin
    is_patient = user.patient_profile and appointment.patient_id == user.patient_profile.id
    is_doctor = user.doctor_profile and appointment.doctor_id == user.doctor_profile.id
    is_admin = user.role == 'admin'

    if not (is_patient or is_doctor or is_admin):
        return jsonify({'error': 'Unauthorized to view consultation room.'}), 403

    consultation = Consultation.query.filter_by(appointment_id=appointment_id).first()
    follow_ups = FollowUp.query.filter_by(consultation_id=consultation.id).all() if consultation else []

    return jsonify({
        'appointment': appointment.to_dict(),
        'consultation': consultation.to_dict() if consultation else None,
        'follow_ups': [f.to_dict() for f in follow_ups],
        'telehealth_room_id': f"urcure-room-{appointment.booking_reference}",
        'patient_info': {
            'name': appointment.patient.user.full_name,
            'blood_group': appointment.patient.blood_group,
            'emergency_contact': appointment.patient.emergency_contact_phone,
            'medical_notes': appointment.patient.medical_notes
        } if is_doctor or is_admin else None
    }), 200


@consultation_bp.route('/<int:appointment_id>/complete', methods=['POST'])
@jwt_required()
def complete_consultation(appointment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Only doctor or admin can submit clinical notes and mark completed
    if not (user.doctor_profile and appointment.doctor_id == user.doctor_profile.id) and user.role != 'admin':
        return jsonify({'error': 'Only the assigned healthcare professional can finalize consultations.'}), 403

    data = request.get_json() or {}
    diagnosis_notes = data.get('diagnosis_notes', '')
    recommendations = data.get('recommendations', '')
    prescription_summary = data.get('prescription_summary', '')
    follow_up_needed = data.get('follow_up_needed', False)
    follow_up_date = data.get('follow_up_date')

    consultation = Consultation.query.filter_by(appointment_id=appointment_id).first()
    if not consultation:
        consultation = Consultation(
            appointment_id=appointment_id,
            doctor_id=appointment.doctor_id,
            patient_id=appointment.patient_id,
            consultation_date=appointment.appointment_date,
            duration_minutes=appointment.duration_minutes,
            consultation_mode=appointment.consultation_mode
        )
        db.session.add(consultation)

    consultation.status = 'completed'
    consultation.diagnosis_notes = diagnosis_notes
    consultation.recommendations = recommendations
    consultation.prescription_summary = prescription_summary
    consultation.follow_up_needed = follow_up_needed
    consultation.follow_up_date = follow_up_date

    appointment.status = 'completed'
    db.session.flush()

    # Create FollowUp entry if scheduled
    if follow_up_needed and follow_up_date:
        follow_up = FollowUp(
            consultation_id=consultation.id,
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            scheduled_date=follow_up_date,
            instructions=data.get('follow_up_instructions', 'Review progress and response to care plan.'),
            status='scheduled'
        )
        db.session.add(follow_up)

        # Notify patient
        notif = Notification(
            user_id=appointment.patient.user_id,
            title='Follow-up Consultation Recommended',
            message=f"Dr. {appointment.doctor.user.full_name} has scheduled a follow-up check-in for {follow_up_date}.",
            notification_type='appointment',
            action_link='/appointments'
        )
        db.session.add(notif)

    # Save to Clinical Records
    clinical_rec = ClinicalRecord(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        record_type='consultation_note',
        title=f"Consultation Summary - Dr. {appointment.doctor.user.full_name}",
        details=f"Recommendations: {recommendations}\nPrescription: {prescription_summary}"
    )
    db.session.add(clinical_rec)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action='COMPLETE_CONSULTATION',
        resource='Consultation',
        details=f"Doctor finalized consultation for appointment {appointment.booking_reference}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)

    db.session.commit()

    # Sync to MongoDB Atlas for cloud persistence
    mongo_service.save_consultation(consultation.to_dict())
    mongo_service.save_clinical_record(clinical_rec.to_dict())
    mongo_service.save_appointment(appointment.to_dict())
    mongo_service.log_audit(user.id, 'COMPLETE_CONSULTATION', 'Consultation', f"Doctor finalized consultation for appointment {appointment.booking_reference}", request.remote_addr or '127.0.0.1')

    return jsonify({
        'message': 'Consultation finalized and clinical record logged.',
        'consultation': consultation.to_dict(),
        'appointment': appointment.to_dict()
    }), 200


@consultation_bp.route('/records', methods=['GET'])
@jwt_required()
def get_clinical_records():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'records': []}), 404

    if user.patient_profile:
        records = ClinicalRecord.query.filter_by(patient_id=user.patient_profile.id)\
            .order_by(ClinicalRecord.created_at.desc()).all()
        result = [r.to_dict() for r in records]

        # Check MongoDB Atlas fallback if local list is empty
        if not result:
            mongo_records = mongo_service.get_patient_clinical_records(user.patient_profile.id)
            if mongo_records:
                result = mongo_records

        return jsonify({'records': result}), 200
    elif user.doctor_profile:
        records = ClinicalRecord.query.filter_by(doctor_id=user.doctor_profile.id)\
            .order_by(ClinicalRecord.created_at.desc()).all()
        return jsonify({'records': [r.to_dict() for r in records]}), 200
    else:
        return jsonify({'records': []}), 200


@consultation_bp.route('/records', methods=['POST'])
@jwt_required()
def add_clinical_record():
    """Allows verified doctor to add a clinical note, diagnosis, or prescription for a patient."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or not user.doctor_profile:
        return jsonify({'error': 'Only licensed medical providers can issue clinical notes.'}), 403

    if not user.doctor_profile.is_verified:
        return jsonify({'error': 'Your medical profile is pending verification. Please contact administration.'}), 403

    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    title = data.get('title', 'Clinical Visit Note')
    details = data.get('details', '')
    record_type = data.get('record_type', 'consultation_note')

    if not patient_id or not details:
        return jsonify({'error': 'Patient ID and note details are required.'}), 400

    clinical_rec = ClinicalRecord(
        patient_id=patient_id,
        doctor_id=user.doctor_profile.id,
        record_type=record_type,
        title=f"{title} • Dr. {user.full_name}",
        details=details
    )
    db.session.add(clinical_rec)

    audit = AuditLog(
        user_id=user.id,
        action='ADD_CLINICAL_RECORD',
        resource='ClinicalRecord',
        details=f"Doctor added {record_type} for patient {patient_id}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    # Sync to MongoDB Atlas
    mongo_service.save_clinical_record(clinical_rec.to_dict())
    mongo_service.log_audit(user.id, 'ADD_CLINICAL_RECORD', 'ClinicalRecord', f"Doctor added {record_type} for patient {patient_id}", request.remote_addr or '127.0.0.1')

    return jsonify({
        'message': 'Clinical note saved successfully.',
        'record': clinical_rec.to_dict()
    }), 201
