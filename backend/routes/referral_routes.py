import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Patient, Doctor, Referral, Notification, AuditLog, Assessment
from mongo_service import mongo_service

referral_bp = Blueprint('referrals', __name__)

@referral_bp.route('', methods=['POST'])
@jwt_required()
def create_referral():
    """
    Creates a new closed-loop referral with patient informed consent.
    Can be initiated by a patient (self-referral in stepped-care) or a referring doctor.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    specialization_needed = data.get('specialization_needed', 'General Mental Health Support').strip()
    reason = data.get('reason', '').strip()
    urgency = data.get('urgency', 'routine')  # 'routine', 'urgent', 'immediate'
    stepped_care_level = int(data.get('stepped_care_level', 4))
    referred_to_doctor_id = data.get('referred_to_doctor_id')
    provider_name = data.get('provider_name', '').strip()
    patient_consent = bool(data.get('patient_consent', True))

    if not reason:
        return jsonify({'error': 'Clinical reason or referral notes are required.'}), 400

    # Determine patient
    if user.role == 'patient':
        patient = user.patient_profile
        if not patient:
            patient = Patient(user_id=user.id, consent_accepted=True)
            db.session.add(patient)
            db.session.flush()
        referring_doctor_id = None
    elif user.role == 'doctor':
        patient_id = data.get('patient_id')
        if not patient_id:
            return jsonify({'error': 'Patient ID is required when doctor initiates referral.'}), 400
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found.'}), 404
        referring_doctor_id = user.doctor_profile.id if user.doctor_profile else None
    else:
        patient_id = data.get('patient_id')
        patient = Patient.query.get(patient_id) if patient_id else None
        if not patient:
            return jsonify({'error': 'Valid patient required.'}), 400
        referring_doctor_id = None

    # Generate unique referral code
    short_code = uuid.uuid4().hex[:6].upper()
    referral_code = f"REF-2026-{short_code}"

    referral = Referral(
        referral_code=referral_code,
        patient_id=patient.id,
        referring_doctor_id=referring_doctor_id,
        referred_to_doctor_id=referred_to_doctor_id,
        stepped_care_level=stepped_care_level,
        provider_name=provider_name,
        specialization_needed=specialization_needed,
        urgency=urgency,
        reason=reason,
        patient_consent=patient_consent,
        status='submitted'
    )
    db.session.add(referral)
    db.session.flush()

    # Create audit log
    audit = AuditLog(
        user_id=user.id,
        action='CREATE_REFERRAL',
        resource='Referral',
        details=f"Referral {referral_code} initiated for patient {patient.id} to {specialization_needed}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)

    # Notify doctor if specified
    if referred_to_doctor_id:
        doc = Doctor.query.get(referred_to_doctor_id)
        if doc and doc.user:
            notif = Notification(
                user_id=doc.user.id,
                title='New Clinical Referral Received',
                message=f"New {urgency} referral for {specialization_needed} ({referral_code}). Please review and schedule.",
                notification_type='appointment',
                action_link='/doctor'
            )
            db.session.add(notif)

    db.session.commit()

    # Sync to MongoDB Atlas
    mongo_service.save_referral(referral.to_dict()) if hasattr(mongo_service, 'save_referral') else None

    return jsonify({
        'message': 'Referral submitted successfully to clinical care coordination queue.',
        'referral': referral.to_dict()
    }), 201


@referral_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_referrals():
    """Returns the patient's referral history and care coordination tracking."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.patient_profile:
        return jsonify({'referrals': []}), 200

    referrals = Referral.query.filter_by(patient_id=user.patient_profile.id)\
        .order_by(Referral.created_at.desc()).all()

    return jsonify({
        'referrals': [r.to_dict() for r in referrals]
    }), 200


@referral_bp.route('/doctor', methods=['GET'])
@jwt_required()
def get_doctor_referrals():
    """Returns the healthcare professional's incoming referral queue."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.doctor_profile:
        return jsonify({'error': 'Doctor profile required.'}), 403

    doc_id = user.doctor_profile.id
    # Referrals assigned to this doctor OR general specialty referrals matching their specialization
    specialization = user.doctor_profile.specialization

    query = Referral.query.filter(
        db.or_(
            Referral.referred_to_doctor_id == doc_id,
            Referral.specialization_needed.ilike(f"%{specialization.split()[0]}%")
        )
    ).order_by(Referral.created_at.desc())

    referrals = query.all()

    # Attach patient's consented assessment history summary for clinical review
    results = []
    for r in referrals:
        r_dict = r.to_dict()
        patient = r.patient
        if patient:
            recent_assessments = Assessment.query.filter_by(patient_id=patient.id)\
                .order_by(Assessment.completed_at.desc()).limit(3).all()
            r_dict['patient_assessment_summary'] = [
                {
                    'type': a.assessment_type,
                    'score': a.score,
                    'max_score': a.max_score,
                    'severity': a.severity_level,
                    'date': a.completed_at.isoformat() if a.completed_at else None
                }
                for a in recent_assessments
            ]
        results.append(r_dict)

    return jsonify({
        'referrals': results,
        'count': len(results)
    }), 200


@referral_bp.route('/<int:referral_id>/status', methods=['PATCH'])
@jwt_required()
def update_referral_status(referral_id):
    """
    Allows doctor or medical administrator to update referral status:
    'submitted', 'awaiting_review', 'accepted', 'appointment_requested',
    'appointment_confirmed', 'follow_up_due', 'completed', 'alternative_support_required'
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    referral = Referral.query.get(referral_id)
    if not referral:
        return jsonify({'error': 'Referral not found.'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    clinical_notes = data.get('clinical_notes')

    valid_statuses = [
        'submitted', 'awaiting_review', 'accepted', 'appointment_requested',
        'appointment_confirmed', 'follow_up_due', 'completed', 'alternative_support_required'
    ]

    if new_status and new_status in valid_statuses:
        referral.status = new_status

    if clinical_notes is not None:
        referral.clinical_notes = clinical_notes

    # Assign doctor if not already assigned
    if user.role == 'doctor' and not referral.referred_to_doctor_id:
        referral.referred_to_doctor_id = user.doctor_profile.id

    # Notify patient of status update
    if referral.patient and referral.patient.user:
        status_label = new_status.replace('_', ' ').title() if new_status else 'Updated'
        notif = Notification(
            user_id=referral.patient.user.id,
            title=f"Referral Status Update: {status_label}",
            message=f"Your care referral ({referral.referral_code}) has been updated to: {status_label}.",
            notification_type='appointment',
            action_link='/dashboard'
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify({
        'message': 'Referral status updated successfully.',
        'referral': referral.to_dict()
    }), 200


@referral_bp.route('/<int:referral_id>/confirm-care', methods=['POST'])
@jwt_required()
def confirm_patient_care(referral_id):
    """
    Closed-loop confirmation: Patient confirms whether they received the referred care,
    preventing any referral from being falsely marked completed without patient validation.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.patient_profile:
        return jsonify({'error': 'Only the patient can confirm receipt of care.'}), 403

    referral = Referral.query.get(referral_id)
    if not referral or referral.patient_id != user.patient_profile.id:
        return jsonify({'error': 'Referral not found or unauthorized.'}), 404

    data = request.get_json() or {}
    support_received = bool(data.get('support_received', True))
    patient_notes = data.get('notes', '')

    referral.patient_confirmed_care = support_received
    referral.patient_confirmation_notes = patient_notes
    if support_received:
        referral.status = 'completed'
    else:
        referral.status = 'alternative_support_required'

    db.session.commit()

    return jsonify({
        'message': 'Care confirmation recorded. Closed-loop referral cycle updated.',
        'referral': referral.to_dict()
    }), 200
