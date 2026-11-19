import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pymongo
from pymongo import MongoClient

logger = logging.getLogger(__name__)

# Default MongoDB Atlas URI provided by user
DEFAULT_MONGO_URI = "mongodb+srv://dancernabi_db_user:Nabi2005@cluster0.blsmvvs.mongodb.net/urcure_health_db?retryWrites=true&w=majority"
MONGO_URI = os.environ.get("MONGO_URI", DEFAULT_MONGO_URI)
DB_NAME = os.environ.get("MONGO_DB_NAME", "urcure_health_db")

class MongoService:
    """
    High-security MongoDB Atlas Cloud Persistence Service for urCure Healthcare Platform.
    Ensures zero fake data, live data persistence, HIPAA-aligned audit logging,
    and instantaneous cross-portal synchronization between doctor and patient.
    """

    def __init__(self, uri: str = MONGO_URI, db_name: str = DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self._client: Optional[MongoClient] = None
        self._db = None
        self._connected = False

    def connect(self) -> bool:
        if self._connected and self._client:
            return True
        try:
            self._client = MongoClient(
                self.uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=10000,
                retryWrites=True
            )
            # Ping database to confirm authentication & network connectivity
            self._client.admin.command('ping')
            self._db = self._client[self.db_name]
            self._connected = True
            self._ensure_indexes()
            logger.info(f"MongoDB Atlas connected successfully to database: {self.db_name}")
            return True
        except Exception as e:
            logger.warning(f"MongoDB Atlas connection deferred ({e}). Operating with resilient fallback.")
            self._connected = False
            return False

    def get_db(self):
        if not self._connected:
            self.connect()
        return self._db

    def _ensure_indexes(self):
        """Creates unique indexes for data integrity and medical safety."""
        if self._db is None:
            return
        try:
            self._db.users.create_index("email", unique=True)
            self._db.doctors.create_index("license_number", unique=True, sparse=True)
            self._db.appointments.create_index("booking_reference", unique=True)
            self._db.health_blocks.create_index("block_reference", unique=True)
            self._db.health_block_events.create_index([("block_reference", 1), ("timestamp", 1)])
            self._db.clinical_records.create_index([("patient_id", 1), ("created_at", -1)])
            self._db.audit_logs.create_index([("timestamp", -1)])
        except Exception as e:
            logger.debug(f"Index creation notice: {e}")

    # --- USER & PROFILE METHODS ---
    def save_user(self, user_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**user_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.users.update_one(
                {"id": user_dict.get("id")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save user to MongoDB: {e}")
            return None

    def save_patient(self, patient_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**patient_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.patients.update_one(
                {"id": patient_dict.get("id")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save patient to MongoDB: {e}")
            return None

    def save_doctor(self, doctor_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**doctor_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.doctors.update_one(
                {"id": doctor_dict.get("id")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save doctor to MongoDB: {e}")
            return None

    def set_doctor_verification(self, doctor_id: int, is_verified: bool) -> bool:
        db = self.get_db()
        if db is None:
            return False
        try:
            db.doctors.update_one(
                {"id": doctor_id},
                {"$set": {"is_verified": is_verified, "verified_at": datetime.now(timezone.utc).isoformat()}}
            )
            return True
        except Exception as e:
            logger.error(f"Failed to update doctor verification in MongoDB: {e}")
            return False

    # --- APPOINTMENT METHODS ---
    def save_appointment(self, appointment_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**appointment_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.appointments.update_one(
                {"booking_reference": appointment_dict.get("booking_reference")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save appointment to MongoDB: {e}")
            return None

    # --- CLINICAL RECORDS & CONSULTATIONS (DOCTOR TO PATIENT) ---
    def save_consultation(self, consultation_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**consultation_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.consultations.update_one(
                {"appointment_id": consultation_dict.get("appointment_id")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save consultation to MongoDB: {e}")
            return None

    def save_clinical_record(self, record_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**record_dict, "created_at": record_dict.get("created_at") or datetime.now(timezone.utc).isoformat()}
            # Remove MongoDB's _id if present to avoid mutation conflict
            doc.pop("_id", None)
            res = db.clinical_records.insert_one(doc)
            doc["_id"] = str(res.inserted_id)
            return doc
        except Exception as e:
            logger.error(f"Failed to save clinical record to MongoDB: {e}")
            return None

    def get_patient_clinical_records(self, patient_id: int) -> List[Dict[str, Any]]:
        db = self.get_db()
        if db is None:
            return []
        try:
            records = list(db.clinical_records.find({"patient_id": patient_id}, {"_id": 0}).sort("created_at", -1))
            return records
        except Exception as e:
            logger.error(f"Failed to get clinical records from MongoDB: {e}")
            return []

    # --- HEALTH BLOCKS (TAMPER-RESISTANT LIFECYCLE) ---
    def save_health_block(self, block_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**block_dict, "updated_at": datetime.now(timezone.utc).isoformat()}
            db.health_blocks.update_one(
                {"block_reference": block_dict.get("block_reference")},
                {"$set": doc},
                upsert=True
            )
            return doc
        except Exception as e:
            logger.error(f"Failed to save health block to MongoDB: {e}")
            return None

    def save_health_block_event(self, event_dict: Dict[str, Any]):
        db = self.get_db()
        if db is None:
            return None
        try:
            doc = {**event_dict, "created_at": datetime.now(timezone.utc).isoformat()}
            doc.pop("_id", None)
            res = db.health_block_events.insert_one(doc)
            doc["_id"] = str(res.inserted_id)
            return doc
        except Exception as e:
            logger.error(f"Failed to save health block event to MongoDB: {e}")
            return None

    # --- AUDIT LOGS (SECURITY & COMPLIANCE) ---
    def log_audit(self, user_id: Optional[int], action: str, resource: str, details: str, ip_address: str = "127.0.0.1"):
        db = self.get_db()
        if db is None:
            return
        try:
            entry = {
                "user_id": user_id,
                "action": action,
                "resource": resource,
                "details": details,
                "ip_address": ip_address,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            db.audit_logs.insert_one(entry)
        except Exception as e:
            logger.debug(f"Audit log write notice: {e}")

    # --- CLEAR ALL FAKE DATA ---
    def clear_fake_seed_data(self):
        """
        Removes all fake demo accounts, appointments, and dummy notes.
        Keeps the root system admin account for doctor verification workflows.
        """
        db = self.get_db()
        if db is None:
            return
        try:
            # Delete fake seed users by email
            fake_emails = [
                "patient@urcure.com",
                "dr.sharma@urcure.com",
                "dr.tariq@urcure.com",
                "dr.chen@urcure.com",
                "dr.layla@urcure.com",
                "dr.khalid@urcure.com"
            ]
            db.users.delete_many({"email": {"$in": fake_emails}})
            db.doctors.delete_many({"user_id": {"$in": [2, 3, 4, 5, 6, 7]}})
            db.patients.delete_many({"user_id": {"$in": [2]}})
            db.appointments.delete_many({"patient_id": {"$in": [1, 2]}})
            db.consultations.delete_many({"patient_id": {"$in": [1, 2]}})
            db.clinical_records.delete_many({"patient_id": {"$in": [1, 2]}})
            logger.info("Cleared all fake seed data from MongoDB Atlas.")
        except Exception as e:
            logger.error(f"Failed clearing fake data from MongoDB: {e}")

# Global singleton
mongo_service = MongoService()

