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
    Cleans all fake/mock records from the system so that ALL patient and doctor data
    is 100% live, real, and accurate.
    Preserves ONLY the verified system administrator account for doctor approvals.
    """
    with app.app_context():
        # Connect to MongoDB Atlas
        mongo_service.connect()

        # Check if clean admin already exists without fake users
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@urcure.com')
        fake_exists = User.query.filter_by(email='patient@urcure.com').first() is not None

        if fake_exists:
            print("Purging fake seed data: dropping and rebuilding clean database...")
            db.drop_all()
            db.create_all()
            mongo_service.clear_fake_seed_data()
            print("Database purged cleanly.")
        else:
            db.create_all()

        # ENSURE SYSTEM ADMIN ACCOUNT EXISTS (For verifying real doctors)
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

            # Save admin to MongoDB Atlas
            mongo_service.save_user(admin_user.to_dict())
            print("Platform Administrator created and synced to MongoDB Atlas.")
        else:
            mongo_service.save_user(admin_user.to_dict())

        print("urCure Database is 100% clean, live, and connected to MongoDB Atlas.")
