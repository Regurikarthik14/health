from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime, timezone
from models import db, User, Patient, Doctor, DoctorCredential, ConsentRecord, AuditLog

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register/patient', methods=['POST'])
def register_patient():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    preferred_language = data.get('preferred_language', 'English')
    consent_accepted = data.get('consent_accepted', True)

    if not email or not password or not full_name:
        return jsonify({'error': 'Email, password, and full name are required.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    user = User(
        email=email,
        full_name=full_name,
        role='patient',
        phone=phone,
        preferred_language=preferred_language
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    patient = Patient(
        user_id=user.id,
        date_of_birth=data.get('date_of_birth'),
        gender=data.get('gender'),
        blood_group=data.get('blood_group'),
        emergency_contact_name=data.get('emergency_contact_name'),
        emergency_contact_phone=data.get('emergency_contact_phone'),
        medical_notes=data.get('medical_notes'),
        consent_accepted=consent_accepted
    )
    db.session.add(patient)

    if consent_accepted:
        consent = ConsentRecord(
            patient_id=patient.id,
            consent_type='general_health_and_privacy',
            agreed=True,
            ip_address=request.remote_addr or '127.0.0.1'
        )
        db.session.add(consent)

    audit = AuditLog(
        user_id=user.id,
        action='REGISTER',
        resource='Patient',
        details=f"Patient account created for {email}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email, 'name': user.full_name},
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        'message': 'Patient registered successfully.',
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/register/doctor', methods=['POST'])
def register_doctor():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    specialization = data.get('specialization', '').strip()
    qualifications = data.get('qualifications', '').strip()
    license_number = data.get('license_number', '').strip()
    phone = data.get('phone', '').strip()

    if not email or not password or not full_name or not specialization or not license_number:
        return jsonify({'error': 'Required doctor credentials missing.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    if Doctor.query.filter_by(license_number=license_number).first():
        return jsonify({'error': 'A doctor with this medical license number already exists.'}), 409

    user = User(
        email=email,
        full_name=full_name,
        role='doctor',
        phone=phone,
        preferred_language=data.get('preferred_language', 'English')
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    doctor = Doctor(
        user_id=user.id,
        specialization=specialization,
        qualifications=qualifications,
        license_number=license_number,
        experience_years=int(data.get('experience_years', 5)),
        consultation_fee=float(data.get('consultation_fee', 150.0)),
        clinic_name=data.get('clinic_name', 'urCure Specialist Clinic'),
        clinic_address=data.get('clinic_address', 'Corniche Road, Abu Dhabi, UAE'),
        clinic_city=data.get('clinic_city', 'Abu Dhabi'),
        consultation_modes=data.get('consultation_modes', 'online,offline'),
        bio=data.get('bio', 'Dedicated healthcare professional providing comprehensive wellbeing support.'),
        languages=data.get('languages', 'English, Arabic'),
        photo_url=data.get('photo_url', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'),
        is_verified=False  # Must be approved by admin before receiving bookings
    )
    db.session.add(doctor)
    db.session.flush()

    # Add initial pending credential document
    credential = DoctorCredential(
        doctor_id=doctor.id,
        document_type='DoH Medical License',
        document_number=license_number,
        issuing_authority=data.get('issuing_authority', 'Department of Health Abu Dhabi (DoH)'),
        verification_status='pending'
    )
    db.session.add(credential)

    audit = AuditLog(
        user_id=user.id,
        action='REGISTER_DOCTOR',
        resource='Doctor',
        details=f"Doctor registration submitted for {email} (Pending verification)",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email, 'name': user.full_name},
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        'message': 'Doctor registration submitted. Profile is pending verification.',
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account has been deactivated. Please contact support.'}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email, 'name': user.full_name},
        expires_delta=timedelta(days=7)
    )

    audit = AuditLog(
        user_id=user.id,
        action='LOGIN',
        resource='Auth',
        details=f"User {email} logged in successfully",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    profile_data = user.to_dict()
    if user.role == 'patient' and user.patient_profile:
        profile_data['patient_details'] = user.patient_profile.to_dict()
    elif user.role == 'doctor' and user.doctor_profile:
        profile_data['doctor_details'] = user.doctor_profile.to_dict()

    return jsonify({'user': profile_data}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'preferred_language' in data:
        user.preferred_language = data['preferred_language'].strip()

    if user.role == 'patient' and user.patient_profile:
        p = user.patient_profile
        if 'blood_group' in data: p.blood_group = data['blood_group']
        if 'emergency_contact_name' in data: p.emergency_contact_name = data['emergency_contact_name']
        if 'emergency_contact_phone' in data: p.emergency_contact_phone = data['emergency_contact_phone']
        if 'medical_notes' in data: p.medical_notes = data['medical_notes']
    elif user.role == 'doctor' and user.doctor_profile:
        d = user.doctor_profile
        if 'bio' in data: d.bio = data['bio']
        if 'consultation_fee' in data: d.consultation_fee = float(data['consultation_fee'])
        if 'clinic_name' in data: d.clinic_name = data['clinic_name']
        if 'clinic_address' in data: d.clinic_address = data['clinic_address']
        if 'clinic_city' in data: d.clinic_city = data['clinic_city']
        if 'languages' in data: d.languages = data['languages']

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully.', 'user': user.to_dict()}), 200
