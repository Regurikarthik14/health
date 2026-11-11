from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone, date as dt_date
from models import db, Doctor, DoctorAvailability, DoctorCredential, Appointment, User, Consultation, Patient

doctor_bp = Blueprint('doctors', __name__)

def parse_time_str(t_str):
    parts = t_str.split(':')
    return int(parts[0]), int(parts[1])

def format_time_str(h, m):
    return f"{h:02d}:{m:02d}"

@doctor_bp.route('', methods=['GET'])
def get_doctors():
    specialization = request.args.get('specialization', '').strip()
    name = request.args.get('name', '').strip()
    language = request.args.get('language', '').strip()
    city = request.args.get('city', '').strip()
    mode = request.args.get('mode', '').strip()  # 'online' or 'offline'
    max_fee = request.args.get('max_fee', type=float)
    min_exp = request.args.get('min_exp', type=int)

    # By default, only verified doctors can receive bookings
    query = Doctor.query.filter_by(is_verified=True)

    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    if city:
        query = query.filter(Doctor.clinic_city.ilike(f"%{city}%"))
    if language:
        query = query.filter(Doctor.languages.ilike(f"%{language}%"))
    if mode:
        query = query.filter(Doctor.consultation_modes.ilike(f"%{mode}%"))
    if max_fee is not None:
        query = query.filter(Doctor.consultation_fee <= max_fee)
    if min_exp is not None:
        query = query.filter(Doctor.experience_years >= min_exp)

    doctors = query.all()

    # Filter by doctor name if specified (joining with User table)
    if name:
        doctors = [d for d in doctors if name.lower() in d.user.full_name.lower()]

    result = [d.to_dict() for d in doctors]
    return jsonify({'doctors': result, 'count': len(result)}), 200


@doctor_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor_profile(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found.'}), 404

    data = doctor.to_dict()
    data['credentials'] = [c.to_dict() for c in doctor.credentials.all()]
    data['working_schedule'] = [a.to_dict() for a in doctor.availabilities.all()]
    return jsonify({'doctor': data}), 200


@doctor_bp.route('/<int:doctor_id>/slots', methods=['GET'])
def get_doctor_slots(doctor_id):
    """
    Computes exact 30-minute appointment slots for the doctor on the requested date.
    Strictly checks database for booked appointments, doctor break times, and past slots.
    """
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found.'}), 404

    if not doctor.is_verified:
        return jsonify({'error': 'Doctor is pending verification and cannot accept bookings.'}), 400

    target_date_str = request.args.get('date')
    if not target_date_str:
        target_date_str = dt_date.today().isoformat()

    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    day_of_week = target_date.weekday()  # 0=Monday, 6=Sunday

    # Look up custom availability for this day, or use standard 09:00 - 17:00 schedule
    avail = DoctorAvailability.query.filter_by(
        doctor_id=doctor_id,
        day_of_week=day_of_week,
        is_active=True
    ).first()

    start_h, start_m = 9, 0
    end_h, end_m = 17, 0
    break_start_h, break_start_m = 13, 0
    break_end_h, break_end_m = 14, 0
    slot_duration = 30

    if avail:
        start_h, start_m = parse_time_str(avail.start_time)
        end_h, end_m = parse_time_str(avail.end_time)
        if avail.break_start and avail.break_end:
            break_start_h, break_start_m = parse_time_str(avail.break_start)
            break_end_h, break_end_m = parse_time_str(avail.break_end)
        slot_duration = avail.slot_duration_minutes or 30

    # Retrieve all booked appointments on this date
    booked_appointments = Appointment.query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == target_date_str,
        Appointment.status.in_(['confirmed', 'rescheduled'])
    ).all()

    booked_slot_starts = {app.start_time for app in booked_appointments}

    slots = []
    curr = datetime(target_date.year, target_date.month, target_date.day, start_h, start_m)
    end_time = datetime(target_date.year, target_date.month, target_date.day, end_h, end_m)
    break_start = datetime(target_date.year, target_date.month, target_date.day, break_start_h, break_start_m)
    break_end = datetime(target_date.year, target_date.month, target_date.day, break_end_h, break_end_m)

    now = datetime.now()

    while curr + timedelta(minutes=slot_duration) <= end_time:
        slot_end = curr + timedelta(minutes=slot_duration)
        slot_start_str = curr.strftime('%H:%M')
        slot_end_str = slot_end.strftime('%H:%M')

        # Check if in break
        is_break = (curr >= break_start and curr < break_end)
        # Check if already booked
        is_booked = slot_start_str in booked_slot_starts
        # Check if past slot today
        is_past = (target_date == dt_date.today() and curr < now)

        is_available = (not is_break) and (not is_booked) and (not is_past)

        status_text = 'available'
        if is_booked:
            status_text = 'booked'
        elif is_break:
            status_text = 'break'
        elif is_past:
            status_text = 'past'

        slots.append({
            'start_time': slot_start_str,
            'end_time': slot_end_str,
            'duration_minutes': slot_duration,
            'is_available': is_available,
            'status': status_text
        })

        curr = slot_end

    return jsonify({
        'doctor_id': doctor_id,
        'doctor_name': doctor.user.full_name,
        'date': target_date_str,
        'slot_duration_minutes': slot_duration,
        'slots': slots,
        'total_slots': len(slots),
        'available_slots': sum(1 for s in slots if s['is_available'])
    }), 200


@doctor_bp.route('/<int:doctor_id>/availability', methods=['POST'])
@jwt_required()
def update_doctor_availability(doctor_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or (user.role != 'admin' and (not user.doctor_profile or user.doctor_profile.id != doctor_id)):
        return jsonify({'error': 'Unauthorized to edit availability.'}), 403

    data = request.get_json() or {}
    schedule_list = data.get('schedules', [])

    # Replace existing or update
    DoctorAvailability.query.filter_by(doctor_id=doctor_id).delete()

    for item in schedule_list:
        avail = DoctorAvailability(
            doctor_id=doctor_id,
            day_of_week=item.get('day_of_week', 0),
            start_time=item.get('start_time', '09:00'),
            end_time=item.get('end_time', '17:00'),
            break_start=item.get('break_start', '13:00'),
            break_end=item.get('break_end', '14:00'),
            slot_duration_minutes=30,
            is_active=item.get('is_active', True)
        )
        db.session.add(avail)

    db.session.commit()
    return jsonify({'message': 'Availability schedule updated successfully.'}), 200


@doctor_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_doctor_dashboard_stats():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'doctor' or not user.doctor_profile:
        return jsonify({'error': 'Doctor profile required.'}), 403

    doctor_id = user.doctor_profile.id
    today_str = dt_date.today().isoformat()

    all_appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    today_appointments = [a for a in all_appointments if a.appointment_date == today_str and a.status in ['confirmed', 'rescheduled']]
    upcoming = [a for a in all_appointments if a.appointment_date >= today_str and a.status in ['confirmed', 'rescheduled']]
    completed = [a for a in all_appointments if a.status == 'completed']

    patient_ids = {a.patient_id for a in all_appointments}

    return jsonify({
        'stats': {
            'today_count': len(today_appointments),
            'upcoming_count': len(upcoming),
            'completed_count': len(completed),
            'total_patients': len(patient_ids),
            'rating': user.doctor_profile.rating,
            'is_verified': user.doctor_profile.is_verified,
            'license_number': user.doctor_profile.license_number
        },
        'today_appointments': [a.to_dict() for a in sorted(today_appointments, key=lambda x: x.start_time)],
        'upcoming_appointments': [a.to_dict() for a in sorted(upcoming, key=lambda x: (x.appointment_date, x.start_time))[:10]]
    }), 200
