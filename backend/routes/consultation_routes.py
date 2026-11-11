from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Consultation, Appointment, FollowUp, ClinicalRecord, User, Notification, AuditLog

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

    if user.patient_profile:
        records = ClinicalRecord.query.filter_by(patient_id=user.patient_profile.id)\
            .order_by(ClinicalRecord.created_at.desc()).all()
        return jsonify({'records': [r.to_dict() for r in records]}), 200
    elif user.doctor_profile:
        records = ClinicalRecord.query.filter_by(doctor_id=user.doctor_profile.id)\
            .order_by(ClinicalRecord.created_at.desc()).all()
        return jsonify({'records': [r.to_dict() for r in records]}), 200
    else:
        return jsonify({'records': []}), 200
