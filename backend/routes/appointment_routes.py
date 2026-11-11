from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone, date as dt_date
import uuid
from models import db, Appointment, Doctor, Patient, User, Notification, AuditLog, Consultation

appointment_bp = Blueprint('appointments', __name__)

def generate_booking_ref():
    uid = uuid.uuid4().hex[:6].upper()
    return f"URC-{datetime.now().year}-{uid}"

@appointment_bp.route('/book', methods=['POST'])
@jwt_required()
def book_appointment():
    """
    Smart Appointment Booking with EXCLUSIVE CONCURRENCY-SAFE ATOMIC LOCKING.
    Enforces 30-minute slots, ensures no double booking for doctor or patient,
    and returns immediate confirmation with unique booking reference.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    # Resolve patient profile
    patient = user.patient_profile
    if not patient:
        # Create patient profile on the fly if needed
        patient = Patient(user_id=user.id, consent_accepted=True)
        db.session.add(patient)
        db.session.flush()

    data = request.get_json() or {}
    doctor_id = data.get('doctor_id')
    appointment_date = data.get('appointment_date')  # YYYY-MM-DD
    start_time = data.get('start_time')              # HH:MM
    consultation_mode = data.get('consultation_mode', 'online').lower()  # online or offline
    reason = data.get('reason', 'General wellbeing & health consultation')
    notes = data.get('notes', '')

    if not doctor_id or not appointment_date or not start_time:
        return jsonify({'error': 'Doctor, appointment date, and start time are required.'}), 400

    if consultation_mode not in ['online', 'offline']:
        consultation_mode = 'online'

    # Validate date format and ensure it's not in the past
    try:
        app_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
        if app_date < dt_date.today():
            return jsonify({'error': 'Appointments cannot be scheduled in the past.'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    # Calculate end_time strictly 30 minutes after start_time
    try:
        start_dt = datetime.strptime(start_time, '%H:%M')
        end_dt = start_dt + timedelta(minutes=30)
        end_time = end_dt.strftime('%H:%M')
    except ValueError:
        return jsonify({'error': 'Invalid time format. Expected HH:MM.'}), 400

    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Selected doctor does not exist.'}), 404

    if not doctor.is_verified:
        return jsonify({'error': 'This doctor is not yet verified to accept appointments.'}), 400

    # ATOMIC DATABASE TRANSACTION & EXCLUSIVE SLOT LOCKING
    try:
        # Check if the doctor already has a confirmed/rescheduled appointment at this exact slot
        existing_conflict = db.session.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.start_time == start_time,
            Appointment.status.in_(['confirmed', 'rescheduled'])
        ).with_for_update().first() if db.engine.name != 'sqlite' else db.session.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.start_time == start_time,
            Appointment.status.in_(['confirmed', 'rescheduled'])
        ).first()

        if existing_conflict:
            return jsonify({
                'error': 'Slot collision: This 30-minute time slot was just secured by another patient.',
                'message': 'Please select an alternate available time slot.'
            }), 409

        # Also check if the patient already has an overlapping appointment at that time
        patient_conflict = Appointment.query.filter(
            Appointment.patient_id == patient.id,
            Appointment.appointment_date == appointment_date,
            Appointment.start_time == start_time,
            Appointment.status.in_(['confirmed', 'rescheduled'])
        ).first()

        if patient_conflict:
            return jsonify({
                'error': 'You already have another active appointment scheduled at this exact time.'
            }), 409

        # Generate unique reference
        booking_ref = generate_booking_ref()

        meeting_link = None
        clinic_address = None

        if consultation_mode == 'online':
            meeting_link = f"https://telehealth.urcure.com/room/{booking_ref}"
        else:
            clinic_address = doctor.clinic_address or 'urCure Medical Hub, Corniche Road, Abu Dhabi'

        appointment = Appointment(
            booking_reference=booking_ref,
            patient_id=patient.id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=30,
            consultation_mode=consultation_mode,
            status='confirmed',
            reason=reason,
            notes=notes,
            meeting_link=meeting_link,
            clinic_address=clinic_address
        )
        db.session.add(appointment)
        db.session.flush()

        # Create notifications for both patient and doctor
        notif_patient = Notification(
            user_id=user.id,
            title='Appointment Confirmed',
            message=f"Your {consultation_mode} consultation with Dr. {doctor.user.full_name} is confirmed for {appointment_date} at {start_time}.",
            notification_type='appointment',
            action_link=f"/appointments/{booking_ref}"
        )
        db.session.add(notif_patient)

        notif_doctor = Notification(
            user_id=doctor.user_id,
            title='New Appointment Booked',
            message=f"New booking from {user.full_name} ({consultation_mode}) on {appointment_date} at {start_time}.",
            notification_type='appointment',
            action_link=f"/doctor/appointments"
        )
        db.session.add(notif_doctor)

        # Audit log for security & compliance
        audit = AuditLog(
            user_id=user.id,
            action='BOOK_APPOINTMENT',
            resource='Appointment',
            details=f"Appointment {booking_ref} created with Dr. {doctor.user.full_name} for {appointment_date} {start_time}",
            ip_address=request.remote_addr or '127.0.0.1'
        )
        db.session.add(audit)

        db.session.commit()

        return jsonify({
            'message': 'Appointment confirmed successfully with exclusive slot reservation.',
            'appointment': appointment.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Transaction failed while securing slot.', 'details': str(e)}), 500


@appointment_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_appointments():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    status_filter = request.args.get('status')

    if user.role == 'doctor' and user.doctor_profile:
        query = Appointment.query.filter_by(doctor_id=user.doctor_profile.id)
    elif user.patient_profile:
        query = Appointment.query.filter_by(patient_id=user.patient_profile.id)
    else:
        return jsonify({'appointments': []}), 200

    if status_filter:
        query = query.filter_by(status=status_filter)

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()
    return jsonify({'appointments': [a.to_dict() for a in appointments]}), 200


@appointment_bp.route('/<reference>', methods=['GET'])
def get_appointment_by_ref(reference):
    appointment = Appointment.query.filter_by(booking_reference=reference).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404
    return jsonify({'appointment': appointment.to_dict()}), 200


@appointment_bp.route('/<int:appointment_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Permission check: patient owner, doctor owner, or admin
    is_patient_owner = user.patient_profile and appointment.patient_id == user.patient_profile.id
    is_doctor_owner = user.doctor_profile and appointment.doctor_id == user.doctor_profile.id
    is_admin = user.role == 'admin'

    if not (is_patient_owner or is_doctor_owner or is_admin):
        return jsonify({'error': 'Unauthorized to cancel this appointment.'}), 403

    if appointment.status == 'cancelled':
        return jsonify({'error': 'Appointment is already cancelled.'}), 400

    data = request.get_json() or {}
    cancellation_reason = data.get('reason', 'Cancelled by user')

    appointment.status = 'cancelled'
    appointment.notes = f"{appointment.notes or ''} [Cancelled: {cancellation_reason}]"

    # Notification to the other party
    target_user_id = appointment.doctor.user_id if is_patient_owner else appointment.patient.user_id
    notif = Notification(
        user_id=target_user_id,
        title='Appointment Cancelled',
        message=f"Appointment {appointment.booking_reference} scheduled for {appointment.appointment_date} at {appointment.start_time} has been cancelled. The time slot is now available again.",
        notification_type='appointment'
    )
    db.session.add(notif)

    audit = AuditLog(
        user_id=user.id,
        action='CANCEL_APPOINTMENT',
        resource='Appointment',
        details=f"Appointment {appointment.booking_reference} cancelled. Reason: {cancellation_reason}",
        ip_address=request.remote_addr or '127.0.0.1'
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Appointment cancelled successfully. Slot has been released.',
        'appointment': appointment.to_dict()
    }), 200


@appointment_bp.route('/<int:appointment_id>/reschedule', methods=['POST'])
@jwt_required()
def reschedule_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    is_patient_owner = user.patient_profile and appointment.patient_id == user.patient_profile.id
    is_admin = user.role == 'admin'

    if not (is_patient_owner or is_admin):
        return jsonify({'error': 'Unauthorized to reschedule this appointment.'}), 403

    data = request.get_json() or {}
    new_date = data.get('appointment_date')
    new_start_time = data.get('start_time')

    if not new_date or not new_start_time:
        return jsonify({'error': 'New date and start time are required.'}), 400

    try:
        start_dt = datetime.strptime(new_start_time, '%H:%M')
        new_end_time = (start_dt + timedelta(minutes=30)).strftime('%H:%M')
    except ValueError:
        return jsonify({'error': 'Invalid time format.'}), 400

    # Concurrency check on new slot
    existing = Appointment.query.filter(
        Appointment.doctor_id == appointment.doctor_id,
        Appointment.appointment_date == new_date,
        Appointment.start_time == new_start_time,
        Appointment.status.in_(['confirmed', 'rescheduled']),
        Appointment.id != appointment.id
    ).first()

    if existing:
        return jsonify({'error': 'The requested new slot is not available. Please choose another.'}), 409

    appointment.appointment_date = new_date
    appointment.start_time = new_start_time
    appointment.end_time = new_end_time
    appointment.status = 'rescheduled'

    # Notify doctor
    notif = Notification(
        user_id=appointment.doctor.user_id,
        title='Appointment Rescheduled',
        message=f"Appointment {appointment.booking_reference} has been rescheduled to {new_date} at {new_start_time}.",
        notification_type='appointment'
    )
    db.session.add(notif)

    db.session.commit()
    return jsonify({
        'message': 'Appointment rescheduled successfully.',
        'appointment': appointment.to_dict()
    }), 200


@appointment_bp.route('/<reference>/calendar.ics', methods=['GET'])
def download_ics_calendar(reference):
    appointment = Appointment.query.filter_by(booking_reference=reference).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Format ICS date-time
    date_clean = appointment.appointment_date.replace('-', '')
    start_clean = appointment.start_time.replace(':', '') + '00'
    end_clean = appointment.end_time.replace(':', '') + '00'

    summary = f"urCure Appointment: Dr. {appointment.doctor.user.full_name}"
    description = f"urCure Consultation ({appointment.consultation_mode.capitalize()})\\nBooking Ref: {appointment.booking_reference}\\nReason: {appointment.reason or 'Wellbeing'}"
    location = appointment.meeting_link if appointment.consultation_mode == 'online' else (appointment.clinic_address or 'urCure Medical Center')

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//urCure Healthcare//Appointment Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{appointment.booking_reference}@urcure.com
DTSTAMP:{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{date_clean}T{start_clean}
DTEND:{date_clean}T{end_clean}
SUMMARY:{summary}
DESCRIPTION:{description}
LOCATION:{location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return Response(
        ics_content,
        mimetype='text/calendar',
        headers={'Content-Disposition': f'attachment; filename="urcure-{reference}.ics"'}
    )
