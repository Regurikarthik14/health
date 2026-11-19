import os
import logging
from datetime import datetime, timezone
from models import (
    db, User, Patient, Doctor, DoctorCredential, DoctorAvailability,
    Appointment, Assessment, AssessmentResult, ConsentRecord, Consultation,
    ClinicalRecord, Referral, FollowUp, CrisisEvent, Notification, AuditLog
)
from mongo_service import mongo_service

logger = logging.getLogger(__name__)

def seed_database(app):
    """
    Initializes and seeds the database with verified primary accounts
    (Admin, Verified Sample Doctor, and Verified Sample Patient)
    so credentials work consistently across both local development and Vercel serverless cold starts.
    """
    with app.app_context():
        # Connect to MongoDB Atlas
        try:
            mongo_service.connect()
        except Exception as e:
            logger.warning(f"MongoDB connect deferred: {e}")

        db.create_all()

        # ---------------------------------------------------------
        # 1. ENSURE SYSTEM ADMIN ACCOUNT EXISTS
        # ---------------------------------------------------------
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@urcure.com')
        admin_user = User.query.filter_by(email=admin_email).first()
        if not admin_user:
            print("Initializing secure Platform Administrator account...")
            admin_user = User(
                email=admin_email,
                full_name='urCure Medical Director & Compliance',
                role='admin',
                phone='+971 2 555 0100',
                preferred_language='English'
            )
            admin_user.set_password(os.environ.get('ADMIN_PASSWORD', 'AdminPass123!'))
            db.session.add(admin_user)
            db.session.commit()
            try:
                mongo_service.save_user(admin_user.to_dict())
            except Exception:
                pass
            print("Platform Administrator created.")

        # ---------------------------------------------------------
        # 2. ENSURE VERIFIED SAMPLE DOCTOR ACCOUNTS EXIST
        # ---------------------------------------------------------
        doctor_accounts = [
            {
                'email': 'doctor@urcure.com',
                'password': 'DoctorPass123!',
                'name': 'Dr. Tariq Al-Nuaimi',
                'specialization': 'Consultant Clinical Neuropsychologist',
                'qualifications': 'MBBS, MD Neuropsychiatry, MRCPsych (UK)',
                'license': 'DOH-MD-2026-T882',
                'clinic': 'Abu Dhabi Specialized Medical Center',
                'address': 'Corniche Road, Abu Dhabi, UAE',
                'fee': 250.0
            },
            {
                'email': 'dr.sharma@urcure.com',
                'password': 'DoctorPass123!',
                'name': 'Dr. Priya Sharma',
                'specialization': 'Consultant Clinical Psychologist',
                'qualifications': 'PhD Clinical Psychology, MPhil, Licensed DHA/DoH',
                'license': 'DOH-MD-2026-S104',
                'clinic': 'Abu Dhabi Wellbeing & Mental Health Center',
                'address': 'Al Bateen Area, Abu Dhabi, UAE',
                'fee': 200.0
            }
        ]

        for d_info in doctor_accounts:
            existing_doc_user = User.query.filter_by(email=d_info['email']).first()
            if not existing_doc_user:
                print(f"Creating verified doctor account: {d_info['email']}...")
                doc_user = User(
                    email=d_info['email'],
                    full_name=d_info['name'],
                    role='doctor',
                    phone='+971 2 678 9012',
                    preferred_language='English'
                )
                doc_user.set_password(d_info['password'])
                db.session.add(doc_user)
                db.session.flush()

                doctor = Doctor(
                    user_id=doc_user.id,
                    specialization=d_info['specialization'],
                    qualifications=d_info['qualifications'],
                    license_number=d_info['license'],
                    experience_years=12,
                    consultation_fee=d_info['fee'],
                    clinic_name=d_info['clinic'],
                    clinic_address=d_info['address'],
                    clinic_city='Abu Dhabi',
                    consultation_modes='online,offline',
                    bio='DOH-licensed specialist providing evidence-based mental wellbeing consultations, stepped care coordination, and cognitive behavioral support.',
                    languages='English, Arabic',
                    is_verified=True,
                    rating=4.95,
                    review_count=38
                )
                db.session.add(doctor)
                db.session.flush()

                # Add verified credential record
                cred = DoctorCredential(
                    doctor_id=doctor.id,
                    document_type='DoH Consultant License',
                    document_number=d_info['license'],
                    issuing_authority='Department of Health Abu Dhabi (DoH)',
                    verification_status='verified',
                    verified_by='Medical Director (admin@urcure.com)',
                    verified_at=datetime.now(timezone.utc)
                )
                db.session.add(cred)

                # Add standard practice availability: Monday through Friday (0 to 4) 09:00 - 17:00
                for day_idx in range(5):
                    avail = DoctorAvailability(
                        doctor_id=doctor.id,
                        day_of_week=day_idx,
                        start_time='09:00',
                        end_time='17:00',
                        break_start='13:00',
                        break_end='14:00',
                        slot_duration_minutes=30,
                        is_active=True
                    )
                    db.session.add(avail)

                db.session.commit()
                try:
                    mongo_service.save_user(doc_user.to_dict())
                except Exception:
                    pass
                print(f"Doctor {d_info['email']} created and verified.")
            else:
                # Ensure doctor is marked verified
                if existing_doc_user.doctor_profile and not existing_doc_user.doctor_profile.is_verified:
                    existing_doc_user.doctor_profile.is_verified = True
                    db.session.commit()

        # ---------------------------------------------------------
        # 3. ENSURE SAMPLE PATIENT ACCOUNT EXISTS
        # ---------------------------------------------------------
        patient_email = 'patient@urcure.com'
        existing_patient_user = User.query.filter_by(email=patient_email).first()
        if not existing_patient_user:
            print(f"Creating verified patient account: {patient_email}...")
            patient_user = User(
                email=patient_email,
                full_name='Zayn Al-Mansoor',
                role='patient',
                phone='+971 50 849 2011',
                preferred_language='English'
            )
            patient_user.set_password('PatientPass123!')
            db.session.add(patient_user)
            db.session.flush()

            patient = Patient(
                user_id=patient_user.id,
                date_of_birth='1994-06-15',
                gender='Male',
                blood_group='O+',
                emergency_contact_name='Fatima Al-Mansoor',
                emergency_contact_phone='+971 50 112 3456',
                medical_notes='No known drug allergies. Active participant in stepped care mental wellbeing program.',
                consent_accepted=True
            )
            db.session.add(patient)
            db.session.commit()
            try:
                mongo_service.save_user(patient_user.to_dict())
            except Exception:
                pass
            print(f"Patient {patient_email} created.")

        print("urCure Database seeded successfully with verified test accounts.")
