import json
import uuid
import hashlib
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import db, User, Patient, Doctor, Appointment, AuditLog, HealthBlock, HealthBlockEvent
from services.symptom_diagnosis_engine import diagnosis_engine, BODY_AREAS

health_block_bp = Blueprint('health_blocks', __name__)

def generate_sha256(data_str: str) -> str:
    return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

@health_block_bp.route('/body-areas', methods=['GET'])
def get_body_areas():
    """Returns the anatomical body areas and symptoms metadata."""
    return jsonify({
        'body_areas': list(BODY_AREAS.values())
    }), 200


@health_block_bp.route('/triage', methods=['POST'])
def analyze_symptoms_and_recommend_specialist():
    """
    Public or authenticated triage endpoint:
    Takes body area, symptoms, and trouble description;
    Analyzes using sajjadhadi/disease-diagnosis-dataset taxonomy;
    Returns probable diagnoses, recommended specialist, and matching urCure doctors.
    """
    data = request.get_json() or {}
    body_area = data.get('body_area', '').strip()
    primary_symptoms = data.get('primary_symptoms', [])
    trouble_description = data.get('trouble_description', '').strip()
    pain_scale = int(data.get('pain_scale', 5))
    severity = data.get('severity', 'moderate')

    if not body_area and not primary_symptoms and not trouble_description:
        return jsonify({'error': 'Please provide the body area or symptoms.'}), 400

    # Run symptom diagnosis engine
    analysis = diagnosis_engine.analyze_health_trouble(
        body_area=body_area,
        primary_symptoms=primary_symptoms,
        trouble_description=trouble_description,
        pain_scale=pain_scale,
        severity=severity
    )

    # Search for matching doctors in database
    specialist_query = analysis['recommended_specialist']
    # Extract root specialist keywords (e.g. "Cardiologist", "Neurologist", "Psychiatrist")
    search_keyword = specialist_query.split()[0] if specialist_query else ""
    if ' ' in specialist_query and 'Specialist' in specialist_query:
        parts = specialist_query.split()
        if len(parts) > 1:
            search_keyword = parts[1]

    matching_doctors = Doctor.query.filter(
        db.or_(
            Doctor.specialization.ilike(f"%{search_keyword}%"),
            Doctor.specialization.ilike(f"%{analysis['recommended_specialist']}%")
        )
    ).all()

    # If no exact match, fallback to general/all verified doctors
    if not matching_doctors:
        matching_doctors = Doctor.query.limit(4).all()

    return jsonify({
        'analysis': analysis,
        'matching_doctors': [d.to_dict() for d in matching_doctors]
    }), 200


@health_block_bp.route('', methods=['POST'])
@jwt_required()
def create_health_block():
    """
    Creates a new separate Personal Health Block for a specific patient problem.
    Tracks this problem from Start to End with a cryptographic hash ledger.
    """
    current_user_id = int(get_jwt_identity())
    patient = Patient.query.filter_by(user_id=current_user_id).first()

    if not patient:
        return jsonify({'error': 'Only registered patients can create personal health blocks.'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    body_area = data.get('body_area', '').strip()
    primary_symptoms = data.get('primary_symptoms', [])
    trouble_description = data.get('trouble_description', '').strip()
    pain_scale = int(data.get('pain_scale', 5))
    onset_date = data.get('onset_date', '').strip() or datetime.now(timezone.utc).strftime('%Y-%m-%d')
    severity = data.get('severity', 'moderate')

    if not title:
        title = f"{body_area or 'Health Issue'}: {primary_symptoms[0] if primary_symptoms else 'Symptom Case'}"

    # Analyze if not provided
    recognized_dx = data.get('recognized_diagnosis')
    possible_dx = data.get('possible_diagnoses')
    recommended_specialist = data.get('recommended_specialist')
    specialist_reason = data.get('specialist_reason')
    urgency_level = data.get('urgency_level', 'routine')

    if not recommended_specialist or not recognized_dx:
        analysis = diagnosis_engine.analyze_health_trouble(
            body_area=body_area,
            primary_symptoms=primary_symptoms,
            trouble_description=trouble_description,
            pain_scale=pain_scale,
            severity=severity
        )
        recognized_dx = recognized_dx or analysis['recognized_diagnosis']
        possible_dx = possible_dx or analysis['differential_diagnoses']
        recommended_specialist = recommended_specialist or analysis['recommended_specialist']
        specialist_reason = specialist_reason or analysis['specialist_reason']
        urgency_level = analysis['urgency_level']

    # Generate unique cryptographic reference and genesis hash
    unique_suffix = uuid.uuid4().hex[:8].upper()
    block_ref = f"HB-{datetime.now(timezone.utc).year}-{unique_suffix}"
    
    timestamp_str = datetime.now(timezone.utc).isoformat()
    genesis_seed = f"{patient.id}:{block_ref}:{title}:{body_area}:{timestamp_str}"
    genesis_hash = generate_sha256(genesis_seed)

    block = HealthBlock(
        block_reference=block_ref,
        patient_id=patient.id,
        title=title,
        body_area=body_area,
        primary_symptoms=json.dumps(primary_symptoms) if isinstance(primary_symptoms, list) else str(primary_symptoms),
        trouble_description=trouble_description,
        pain_scale=pain_scale,
        onset_date=onset_date,
        severity=severity,
        status='active',
        recognized_diagnosis=recognized_dx,
        possible_diagnoses=json.dumps(possible_dx) if isinstance(possible_dx, list) else str(possible_dx or ''),
        recommended_specialist=recommended_specialist,
        specialist_reason=specialist_reason,
        urgency_level=urgency_level,
        assigned_doctor_id=data.get('assigned_doctor_id'),
        genesis_hash=genesis_hash,
        current_block_hash=genesis_hash
    )
    db.session.add(block)
    db.session.flush()

    # Initial Genesis Event (START of health block)
    init_event_seed = f"{block.id}:intake_start:{genesis_hash}:{timestamp_str}"
    init_event_hash = generate_sha256(init_event_seed)

    start_event = HealthBlockEvent(
        health_block_id=block.id,
        event_type='intake_start',
        author_role='patient',
        author_id=patient.user_id,
        author_name=patient.user.full_name,
        title='Health Block Initiated (Problem Reported)',
        description=f"Patient logged trouble in {body_area}. Initial symptoms: {', '.join(primary_symptoms) if isinstance(primary_symptoms, list) else primary_symptoms}. Pain scale: {pain_scale}/10.",
        pain_level_recorded=pain_scale,
        data_payload=json.dumps({
            'body_area': body_area,
            'primary_symptoms': primary_symptoms,
            'trouble_description': trouble_description,
            'recognized_diagnosis': recognized_dx,
            'recommended_specialist': recommended_specialist
        }),
        event_hash=init_event_hash
    )
    db.session.add(start_event)

    # Triage Analysis Event
    triage_event_seed = f"{block.id}:triage_result:{init_event_hash}:{timestamp_str}"
    triage_event_hash = generate_sha256(triage_event_seed)
    
    triage_event = HealthBlockEvent(
        health_block_id=block.id,
        event_type='triage_result',
        author_role='ai_triage',
        author_name='urCure Clinical Triage AI',
        title=f"Clinical Recognition: {recognized_dx}",
        description=f"Automated evaluation recommended specialist: {recommended_specialist}. {specialist_reason}",
        data_payload=json.dumps({
            'recommended_specialist': recommended_specialist,
            'urgency_level': urgency_level,
            'dataset_source': 'sajjadhadi/disease-diagnosis-dataset'
        }),
        event_hash=triage_event_hash
    )
    db.session.add(triage_event)

    # Update block's current hash to latest event
    block.current_block_hash = triage_event_hash

    # Security Audit Log
    audit = AuditLog(
        user_id=current_user_id,
        action='CREATE_HEALTH_BLOCK',
        resource='HealthBlock',
        details=f"Created Personal Health Block {block_ref} for {body_area}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Personal Health Block initialized successfully.',
        'block': block.to_dict()
    }), 201


@health_block_bp.route('', methods=['GET'])
@jwt_required()
def get_my_health_blocks():
    """
    Retrieves all personal health blocks for the authenticated user.
    Maintains strong multi-tenant security:
    - Patients see ONLY their own blocks.
    - Doctors see ONLY blocks where they are the assigned doctor.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    status_filter = request.args.get('status')  # 'active', 'resolved', 'all'

    if user.role == 'patient':
        patient = user.patient_profile
        if not patient:
            return jsonify({'health_blocks': []}), 200

        query = HealthBlock.query.filter_by(patient_id=patient.id)
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
        blocks = query.order_by(HealthBlock.created_at.desc()).all()

    elif user.role == 'doctor':
        doctor = user.doctor_profile
        if not doctor:
            return jsonify({'health_blocks': []}), 200

        query = HealthBlock.query.filter_by(assigned_doctor_id=doctor.id)
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
        blocks = query.order_by(HealthBlock.created_at.desc()).all()

    elif user.role == 'admin':
        query = HealthBlock.query
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
        blocks = query.order_by(HealthBlock.created_at.desc()).limit(100).all()

    else:
        return jsonify({'health_blocks': []}), 200

    return jsonify({
        'health_blocks': [b.to_dict() for b in blocks],
        'total': len(blocks)
    }), 200


@health_block_bp.route('/<identifier>', methods=['GET'])
@jwt_required()
def get_health_block_detail(identifier):
    """
    Retrieves full details and timeline ledger for a specific health block.
    Strictly verifies ownership and authorization.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    # Locate by ID or block_reference
    block = None
    if identifier.isdigit():
        block = HealthBlock.query.get(int(identifier))
    if not block:
        block = HealthBlock.query.filter_by(block_reference=identifier).first()

    if not block:
        return jsonify({'error': 'Health block not found.'}), 404

    # Security check
    is_owner = user.role == 'patient' and user.patient_profile and block.patient_id == user.patient_profile.id
    is_assigned_doc = user.role == 'doctor' and user.doctor_profile and block.assigned_doctor_id == user.doctor_profile.id
    is_admin = user.role == 'admin'

    if not (is_owner or is_assigned_doc or is_admin):
        return jsonify({'error': 'Access denied. You do not have permission to view this personal health block.'}), 403

    events = HealthBlockEvent.query.filter_by(health_block_id=block.id).order_by(HealthBlockEvent.created_at.asc()).all()

    return jsonify({
        'block': block.to_dict(),
        'events': [e.to_dict() for e in events]
    }), 200


@health_block_bp.route('/<identifier>/timeline', methods=['POST'])
@jwt_required()
def add_timeline_event(identifier):
    """
    Appends a new chronological update to the problem's health block.
    Computes a cryptographic hash linked to the previous block state.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    block = None
    if identifier.isdigit():
        block = HealthBlock.query.get(int(identifier))
    if not block:
        block = HealthBlock.query.filter_by(block_reference=identifier).first()

    if not block:
        return jsonify({'error': 'Health block not found.'}), 404

    is_owner = user.role == 'patient' and user.patient_profile and block.patient_id == user.patient_profile.id
    is_assigned_doc = user.role == 'doctor' and user.doctor_profile and block.assigned_doctor_id == user.doctor_profile.id
    is_admin = user.role == 'admin'

    if not (is_owner or is_assigned_doc or is_admin):
        return jsonify({'error': 'Unauthorized to add entries to this health block.'}), 403

    data = request.get_json() or {}
    event_type = data.get('event_type', 'symptom_update')
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    pain_level = data.get('pain_level_recorded')
    data_payload = data.get('data_payload', {})

    if not title or not description:
        return jsonify({'error': 'Title and description are required for the timeline entry.'}), 400

    timestamp_str = datetime.now(timezone.utc).isoformat()
    event_seed = f"{block.id}:{event_type}:{block.current_block_hash}:{timestamp_str}"
    event_hash = generate_sha256(event_seed)

    event = HealthBlockEvent(
        health_block_id=block.id,
        event_type=event_type,
        author_role=user.role,
        author_id=user.id,
        author_name=user.full_name,
        title=title,
        description=description,
        pain_level_recorded=pain_level,
        data_payload=json.dumps(data_payload) if isinstance(data_payload, dict) else str(data_payload),
        event_hash=event_hash
    )
    db.session.add(event)

    # Update current block hash
    block.current_block_hash = event_hash
    if pain_level is not None:
        block.pain_scale = pain_level

    db.session.commit()

    return jsonify({
        'message': 'Timeline event added to health block.',
        'event': event.to_dict(),
        'current_block_hash': block.current_block_hash
    }), 201


@health_block_bp.route('/<identifier>/resolve', methods=['PATCH'])
@jwt_required()
def resolve_health_block(identifier):
    """
    Marks the health problem as RESOLVED (the final END milestone of the health block).
    Seals the problem ledger block with resolution notes and timestamp.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    block = None
    if identifier.isdigit():
        block = HealthBlock.query.get(int(identifier))
    if not block:
        block = HealthBlock.query.filter_by(block_reference=identifier).first()

    if not block:
        return jsonify({'error': 'Health block not found.'}), 404

    is_owner = user.role == 'patient' and user.patient_profile and block.patient_id == user.patient_profile.id
    is_assigned_doc = user.role == 'doctor' and user.doctor_profile and block.assigned_doctor_id == user.doctor_profile.id
    is_admin = user.role == 'admin'

    if not (is_owner or is_assigned_doc or is_admin):
        return jsonify({'error': 'Unauthorized to resolve this health block.'}), 403

    data = request.get_json() or {}
    resolution_summary = data.get('resolution_summary', 'Problem successfully resolved and treated.').strip()

    timestamp_now = datetime.now(timezone.utc)
    block.status = 'resolved'
    block.resolved_at = timestamp_now
    block.resolution_summary = resolution_summary
    block.resolved_by = f"{user.full_name} ({user.role.capitalize()})"

    # Add final resolution event
    res_seed = f"{block.id}:resolution:{block.current_block_hash}:{timestamp_now.isoformat()}"
    res_hash = generate_sha256(res_seed)

    res_event = HealthBlockEvent(
        health_block_id=block.id,
        event_type='resolution',
        author_role=user.role,
        author_id=user.id,
        author_name=user.full_name,
        title='Health Block Closed: Problem Resolved',
        description=resolution_summary,
        event_hash=res_hash
    )
    db.session.add(res_event)
    block.current_block_hash = res_hash

    # Security audit
    audit = AuditLog(
        user_id=current_user_id,
        action='RESOLVE_HEALTH_BLOCK',
        resource='HealthBlock',
        details=f"Health Block {block.block_reference} marked as RESOLVED by {user.full_name}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Health Block marked as resolved successfully.',
        'block': block.to_dict()
    }), 200


@health_block_bp.route('/<identifier>/link-appointment', methods=['POST'])
@jwt_required()
def link_appointment_to_block(identifier):
    """
    Links an appointment to this specific health block, automatically assigning the doctor.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    block = None
    if identifier.isdigit():
        block = HealthBlock.query.get(int(identifier))
    if not block:
        block = HealthBlock.query.filter_by(block_reference=identifier).first()

    if not block:
        return jsonify({'error': 'Health block not found.'}), 404

    data = request.get_json() or {}
    appointment_id = data.get('appointment_id')
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    block.appointment_id = appointment.id
    block.assigned_doctor_id = appointment.doctor_id
    block.status = 'under_treatment'

    # Add timeline event
    timestamp_str = datetime.now(timezone.utc).isoformat()
    link_seed = f"{block.id}:doctor_consultation:{block.current_block_hash}:{timestamp_str}"
    link_hash = generate_sha256(link_seed)

    event = HealthBlockEvent(
        health_block_id=block.id,
        event_type='doctor_consultation',
        author_role='system',
        author_name='urCure Booking Engine',
        title=f"Doctor Assigned: {appointment.doctor.user.full_name}",
        description=f"Consultation scheduled for {appointment.appointment_date} at {appointment.start_time} ({appointment.consultation_mode}).",
        data_payload=json.dumps({
            'appointment_id': appointment.id,
            'doctor_id': appointment.doctor_id,
            'doctor_name': appointment.doctor.user.full_name,
            'doctor_specialization': appointment.doctor.specialization,
            'appointment_date': appointment.appointment_date,
            'start_time': appointment.start_time
        }),
        event_hash=link_hash
    )
    db.session.add(event)
    block.current_block_hash = link_hash
    db.session.commit()

    return jsonify({
        'message': 'Appointment linked to health block.',
        'block': block.to_dict()
    }), 200
