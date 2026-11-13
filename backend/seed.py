import os
from datetime import datetime, timedelta, timezone, date as dt_date
from models import (
    db, User, Patient, Doctor, DoctorCredential, DoctorAvailability,
    Appointment, Assessment, AssessmentResult, ConsentRecord, Consultation,
    ClinicalRecord, Referral, FollowUp, CrisisEvent, Notification, AuditLog
)

def seed_database(app):
    with app.app_context():
        db.create_all()

        # Check if already seeded
        if User.query.filter_by(email='admin@urcure.com').first():
            print("Database already seeded.")
            return

        print("Seeding urCure database with initial healthcare dataset...")

        # 1. Admin User
        admin_user = User(
            email='admin@urcure.com',
            full_name='Dr. Sarah Al-Hashimi (Director)',
            role='admin',
            phone='+971 2 555 0100',
            preferred_language='English'
        )
        admin_user.set_password('AdminPass123!')
        db.session.add(admin_user)
        db.session.flush()

        # 2. Patient User
        patient_user = User(
            email='patient@urcure.com',
            full_name='Zayn Al-Mansoor',
            role='patient',
            phone='+971 50 123 4567',
            preferred_language='English'
        )
        patient_user.set_password('PatientPass123!')
        db.session.add(patient_user)
        db.session.flush()

        patient_profile = Patient(
            user_id=patient_user.id,
            date_of_birth='1994-06-15',
            gender='Male',
            blood_group='O+',
            emergency_contact_name='Mariam Al-Mansoor',
            emergency_contact_phone='+971 50 987 6543',
            medical_notes='Occasional work-related anxiety and episodic sleep disruption. No known drug allergies.',
            consent_accepted=True
        )
        db.session.add(patient_profile)
        db.session.flush()

        # Consent record for patient
        consent = ConsentRecord(
            patient_id=patient_profile.id,
            consent_type='telehealth_and_wellbeing_data_consent',
            agreed=True,
            ip_address='127.0.0.1'
        )
        db.session.add(consent)

        # 3. Doctors (Prompt explicitly references Dr. Sharma and other specialists)
        doctors_data = [
            {
                'email': 'dr.sharma@urcure.com',
                'name': 'Dr. Priya Sharma',
                'specialization': 'Consultant Psychiatrist',
                'qualifications': 'MBBS, MD (Psychiatry), MRCPsych (UK)',
                'license': 'DOH-MD-2018-8472',
                'exp': 14,
                'fee': 220.0,
                'clinic': 'urCure Neuro-Wellbeing Center',
                'address': 'Al Maryah Island, Abu Dhabi, UAE',
                'city': 'Abu Dhabi',
                'lat': 24.5028,
                'lng': 54.3917,
                'modes': 'online,offline',
                'bio': 'Specialist in adult mood disorders, cognitive behavioral resilience, and psychopharmacology with over 14 years clinical leadership.',
                'languages': 'English, Hindi, Arabic',
                'photo': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
                'verified': True,
                'rating': 4.96,
                'reviews': 84
            },
            {
                'email': 'dr.tariq@urcure.com',
                'name': 'Dr. Tariq Al-Nuaimi',
                'specialization': 'Clinical Neuropsychologist',
                'qualifications': 'Ph.D. Neuropsychology (McGill), DOH Licensed Specialist',
                'license': 'DOH-PSY-2020-3190',
                'exp': 11,
                'fee': 180.0,
                'clinic': 'Corniche Mind & Health Institute',
                'address': 'Corniche Road West, Abu Dhabi, UAE',
                'city': 'Abu Dhabi',
                'lat': 24.4686,
                'lng': 54.3312,
                'modes': 'online,offline',
                'bio': 'Expert in stress neurobiology, executive burn-out, executive cognitive therapy, and trauma-informed recovery.',
                'languages': 'Arabic, English, French',
                'photo': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
                'verified': True,
                'rating': 4.92,
                'reviews': 62
            },
            {
                'email': 'dr.chen@urcure.com',
                'name': 'Dr. Elena Chen',
                'specialization': 'Integrative Behavioral Physician',
                'qualifications': 'MD (Internal Medicine), Fellowship in Lifestyle & Mental Health',
                'license': 'DOH-GP-2019-9941',
                'exp': 9,
                'fee': 160.0,
                'clinic': 'urCure Lifestyle & Health Clinic',
                'address': 'Sheikh Zayed Street, Abu Dhabi, UAE',
                'city': 'Abu Dhabi',
                'lat': 24.4756,
                'lng': 54.3644,
                'modes': 'online,offline',
                'bio': 'Focuses on the physiological intersections of gut-brain axis, endocrine stress hormones, insomnia, and vitality.',
                'languages': 'English, Mandarin',
                'photo': 'https://images.unsplash.com/photo-1594824813590-72120045053f?w=400&auto=format&fit=crop&q=80',
                'verified': True,
                'rating': 4.88,
                'reviews': 47
            },
            {
                'email': 'dr.layla@urcure.com',
                'name': 'Dr. Layla Mansour',
                'specialization': 'Child & Adolescent Psychologist',
                'qualifications': 'Psy.D., Board Certified Clinical Child Psychologist',
                'license': 'DOH-PSY-2021-4412',
                'exp': 8,
                'fee': 175.0,
                'clinic': 'Family Wellbeing Pavillion',
                'address': 'Khalifa City, Abu Dhabi, UAE',
                'city': 'Abu Dhabi',
                'lat': 24.4258,
                'lng': 54.5828,
                'modes': 'online,offline',
                'bio': 'Passionate about adolescent anxiety, developmental transitions, and positive behavioral parenting interventions.',
                'languages': 'Arabic, English',
                'photo': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&auto=format&fit=crop&q=80',
                'verified': True,
                'rating': 4.95,
                'reviews': 38
            },
            # Pending doctor to demonstrate admin verification workflow
            {
                'email': 'dr.khalid@urcure.com',
                'name': 'Dr. Khalid Al-Zaabi',
                'specialization': 'Consultant Neurologist',
                'qualifications': 'MBBS, FRCP (Edin), Specialist in Sleep & Migraine',
                'license': 'DOH-PENDING-2026-004',
                'exp': 16,
                'fee': 250.0,
                'clinic': 'Al Reem Specialty Health',
                'address': 'Al Reem Island, Abu Dhabi, UAE',
                'city': 'Abu Dhabi',
                'lat': 24.4988,
                'lng': 54.4072,
                'modes': 'online,offline',
                'bio': 'Neurological evaluations for chronic headache, sleep architecture disruptions, and chronic autonomic fatigue.',
                'languages': 'Arabic, English',
                'photo': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
                'verified': False, # Pending!
                'rating': 4.80,
                'reviews': 5
            }
        ]

        created_doctors = []
        for d in doctors_data:
            doc_user = User(
                email=d['email'],
                full_name=d['name'],
                role='doctor',
                phone='+971 2 400 9000',
                preferred_language='English'
            )
            doc_user.set_password('DoctorPass123!')
            db.session.add(doc_user)
            db.session.flush()

            doc_profile = Doctor(
                user_id=doc_user.id,
                specialization=d['specialization'],
                qualifications=d['qualifications'],
                license_number=d['license'],
                experience_years=d['exp'],
                consultation_fee=d['fee'],
                clinic_name=d['clinic'],
                clinic_address=d['address'],
                clinic_city=d['city'],
                clinic_lat=d['lat'],
                clinic_lng=d['lng'],
                consultation_modes=d['modes'],
                bio=d['bio'],
                languages=d['languages'],
                photo_url=d['photo'],
                is_verified=d['verified'],
                rating=d['rating'],
                review_count=d['reviews']
            )
            db.session.add(doc_profile)
            db.session.flush()
            created_doctors.append(doc_profile)

            # Add credential
            cred = DoctorCredential(
                doctor_id=doc_profile.id,
                document_type='DoH Medical Practice License',
                document_number=d['license'],
                issuing_authority='Department of Health Abu Dhabi',
                verification_status='verified' if d['verified'] else 'pending',
                verified_at=datetime.now(timezone.utc) if d['verified'] else None,
                verified_by='admin@urcure.com' if d['verified'] else None
            )
            db.session.add(cred)

            # Add standard working schedule (Monday - Friday, 09:00 - 17:00, lunch 13:00 - 14:00)
            for day in range(0, 5):
                avail = DoctorAvailability(
                    doctor_id=doc_profile.id,
                    day_of_week=day,
                    start_time='09:00',
                    end_time='17:00',
                    break_start='13:00',
                    break_end='14:00',
                    slot_duration_minutes=30,
                    is_active=True
                )
                db.session.add(avail)

        # 4. Seed sample appointments (illustrating the prompt's example: Dr. Sharma schedule with booked & available slots)
        dr_sharma = created_doctors[0]
        today_str = dt_date.today().isoformat()
        tomorrow_str = (dt_date.today() + timedelta(days=1)).isoformat()

        # Prompt example slots: 09:00-09:30 booked, 09:30-10:00 booked, 11:00-11:30 booked
        app1 = Appointment(
            booking_reference='URC-2026-A1090',
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            appointment_date=today_str,
            start_time='09:00',
            end_time='09:30',
            duration_minutes=30,
            consultation_mode='online',
            status='confirmed',
            reason='Follow-up on sleep hygiene and stress regulation',
            meeting_link='https://telehealth.urcure.com/room/URC-2026-A1090'
        )
        db.session.add(app1)

        app2 = Appointment(
            booking_reference='URC-2026-B1093',
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            appointment_date=today_str,
            start_time='09:30',
            end_time='10:00',
            duration_minutes=30,
            consultation_mode='offline',
            status='confirmed',
            reason='Initial psychiatric wellness evaluation',
            clinic_address='Al Maryah Island, Abu Dhabi, UAE'
        )
        db.session.add(app2)

        app3 = Appointment(
            booking_reference='URC-2026-C1100',
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            appointment_date=today_str,
            start_time='11:00',
            end_time='11:30',
            duration_minutes=30,
            consultation_mode='online',
            status='confirmed',
            reason='Midday check-in on anxiety coping techniques',
            meeting_link='https://telehealth.urcure.com/room/URC-2026-C1100'
        )
        db.session.add(app3)

        # Tomorrow sample upcoming appointment with Dr. Tariq
        dr_tariq = created_doctors[1]
        app_tomorrow = Appointment(
            booking_reference='URC-2026-T2045',
            patient_id=patient_profile.id,
            doctor_id=dr_tariq.id,
            appointment_date=tomorrow_str,
            start_time='14:00',
            end_time='14:30',
            duration_minutes=30,
            consultation_mode='online',
            status='confirmed',
            reason='Cognitive resilience consultation',
            meeting_link='https://telehealth.urcure.com/room/URC-2026-T2045'
        )
        db.session.add(app_tomorrow)

        # 5. Past completed consultation
        past_date = (dt_date.today() - timedelta(days=7)).isoformat()
        app_past = Appointment(
            booking_reference='URC-2026-P0812',
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            appointment_date=past_date,
            start_time='10:00',
            end_time='10:30',
            duration_minutes=30,
            consultation_mode='online',
            status='completed',
            reason='Routine wellbeing review',
            meeting_link='https://telehealth.urcure.com/room/URC-2026-P0812'
        )
        db.session.add(app_past)
        db.session.flush()

        consultation = Consultation(
            appointment_id=app_past.id,
            doctor_id=dr_sharma.id,
            patient_id=patient_profile.id,
            consultation_date=past_date,
            duration_minutes=30,
            consultation_mode='online',
            status='completed',
            diagnosis_notes='Sub-clinical stress with mild transient sleep latency delay. Good overall emotional regulation and insight.',
            recommendations='Maintain morning sunlight exposure, continue box breathing 2x daily, limit caffeine after 2:00 PM.',
            prescription_summary='No pharmacotherapy indicated. Behavioral lifestyle modifications recommended.',
            follow_up_needed=True,
            follow_up_date=today_str
        )
        db.session.add(consultation)
        db.session.flush()

        # Follow up record
        follow_up = FollowUp(
            consultation_id=consultation.id,
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            scheduled_date=today_str,
            instructions='Review 2-week sleep journal and daytime energy patterns.',
            reminder_sent=True,
            completed=False,
            status='scheduled'
        )
        db.session.add(follow_up)

        # Clinical record
        clin_rec = ClinicalRecord(
            patient_id=patient_profile.id,
            doctor_id=dr_sharma.id,
            record_type='consultation_note',
            title='Initial Behavioral Health Consultation Note',
            details='Patient demonstrated proactive attitude toward wellbeing. Sleep latency improved with digital curfew.'
        )
        db.session.add(clin_rec)

        # 6. Past Assessments for Patient
        assess1 = Assessment(
            patient_id=patient_profile.id,
            assessment_type='PHQ-9',
            score=6,
            max_score=27,
            severity_level='mild',
            interpretation='Mild mood fluctuations detected. You may be experiencing situational fatigue or mild stress.',
            recommendations='• Incorporate brief mindfulness pauses or 4-7-8 breathing exercises.\n• Prioritize restorative hobbies and schedule non-screen downtime.',
            completed_at=datetime.now(timezone.utc) - timedelta(days=14)
        )
        db.session.add(assess1)

        assess2 = Assessment(
            patient_id=patient_profile.id,
            assessment_type='GAD-7',
            score=5,
            max_score=21,
            severity_level='mild',
            interpretation='Mild anxiety symptoms present. Occasional restlessness or worry.',
            recommendations='• Reduce caffeine and late-evening stimulant consumption.\n• Try guided progressive muscle relaxation via urCure AI.',
            completed_at=datetime.now(timezone.utc) - timedelta(days=7)
        )
        db.session.add(assess2)

        assess3 = Assessment(
            patient_id=patient_profile.id,
            assessment_type='PHQ-9',
            score=3,
            max_score=27,
            severity_level='minimal',
            interpretation='Minimal depressive symptoms indicated. Your responses reflect baseline healthy emotional resilience.',
            recommendations='• Maintain regular sleep hygiene.\n• Engage in 20-30 minutes of daily physical movement.',
            completed_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.session.add(assess3)

        # 7. Sample Mood check-ins
        for i in range(7, 0, -1):
            m_date = datetime.now(timezone.utc) - timedelta(days=i)
            mood_entry = Assessment(
                patient_id=patient_profile.id,
                assessment_type='MOOD_CHECKIN',
                score=4 if i % 2 == 0 else 3,
                max_score=5,
                severity_level='minimal' if i % 2 == 0 else 'mild',
                interpretation=f"Daily mood check-in: Mood {4 if i % 2 == 0 else 3}/5, Energy 4/5, Sleep 7.5h.",
                recommendations="Logged healthy daily reflection.",
                completed_at=m_date
            )
            db.session.add(mood_entry)

        # 8. Notifications
        notif1 = Notification(
            user_id=patient_user.id,
            title='Upcoming Visit Today',
            message=f"Reminder: You have an online video visit with Dr. Priya Sharma at 09:00 AM.",
            notification_type='appointment',
            action_link='/appointments/URC-2026-A1090'
        )
        notif2 = Notification(
            user_id=patient_user.id,
            title='Mood Score Improved',
            message='Your latest mood check score improved from 6 (Mild) to 3 (Minimal). Great progress!',
            notification_type='assessment',
            action_link='/wellbeing'
        )
        db.session.add(notif1)
        db.session.add(notif2)

        # 9. Audit Log
        audit1 = AuditLog(
            user_id=admin_user.id,
            action='SYSTEM_INITIALIZED',
            resource='System',
            details='urCure platform core dataset and verified provider network initialized.',
            ip_address='127.0.0.1'
        )
        db.session.add(audit1)

        db.session.commit()
        print("Database successfully seeded with realistic healthcare and provider data!")
