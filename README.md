# urCure — AI-Powered Mental Wellbeing & Healthcare Platform
> **Tagline:** *"Your Health. Your Choice. Your Care."*

**urCure** is a modern, responsive, full-stack healthcare web application engineered to help individuals recognize changes in their mental wellbeing early, connect with trusted healthcare professionals with complete patient autonomy, book exclusive 30-minute appointments in real time, and receive continuous healthcare support.

---

## 1. Brand Identity & UI/UX Design System

urCure adheres strictly to **PURE OBSIDIAN MONOCHROME GLASSMORPHISM**. It deliberately avoids hospital whites, colorful gradients, and generic UI kits in favor of a sleek, black titanium aesthetic inspired by Apple Pro hardware, luxury automotive interfaces, and futuristic glass cockpits.

### Strict Colour Palette

| Element | Hex / Value | Description |
|---|---|---|
| **Main Background** | `#050505` | Pure deep obsidian void |
| **Secondary Background** | `#0B0B0B` | Layered depth background |
| **Card Background** | `#111111` | Frosted solid glass foundation |
| **Glass Panels** | `rgba(255, 255, 255, 0.035)` | Translucent frosted surfaces with backdrop blur |
| **Borders** | `#292929` | Subtle graphite metallic edge |
| **Primary Text** | `#F5F5F5` | Crisp platinum high contrast |
| **Secondary Text** | `#929292` | Cool grey descriptive text |
| **Highlight** | `#C0C0C0` | Silver titanium metallic accents |
| **Muted Highlight** | `#777777` | Deep graphite metadata badges |

---

## 2. Key Architecture & Differentiating Modules

### 1. Smart Appointment Booking (30-Minute Exclusive Concurrency Locks)
- **Fixed 30-minute consultation intervals** (e.g. 09:00–09:30, 09:30–10:00, etc.).
- **Atomic Database Locks**: Prevents overlapping bookings at the database engine level via serializable transaction isolation.
- **Immediate slot status reflection**: As soon as a patient confirms a slot, it is immediately locked across all active users.
- **Dynamic Slot Releasing**: Valid cancellations automatically release the slot back into the doctor's available calendar.
- **Add to Calendar (.ICS Export)**: Native RFC 5545 `.ics` calendar generator for Apple Calendar, Google Calendar, and Outlook.
- **Dual consultation modes**: Online telehealth (encrypted video room URL) and in-person clinic visits (Abu Dhabi clinic address & check-in).

### 2. Validated AI Wellbeing Assessment
- Integrates gold-standard validated screening instruments:
  - **PHQ-9**: Patient Health Questionnaire for depression and mood shifts (items 1–9, max score 27).
  - **GAD-7**: Generalized Anxiety Disorder screening (7 items, max score 21).
  - **PSS-10**: Perceived Stress Scale (10 items, max score 40).
  - **WHO-5**: World Health Organization psychological wellbeing index.
- **Daily Mood Check-in**: Daily tracker for mood (1–5), energy levels, and sleep hours.
- **Longitudinal Trend Visualizations**: Pure monochrome Recharts line & area graph tracking symptom velocity.
- **Clinical Safety Boundaries**: Educational self-evaluations with an explicit disclaimer that AI does not diagnose illnesses or prescribe medication.
- **Automated Human Escalation**: Flagging critical responses (e.g. PHQ-9 question 9) triggers immediate crisis protocols.

### 3. urCure AI Conversational Assistant
- Identifies itself as AI.
- Stress management guidance and guided cognitive self-help preparation.
- **Interactive Box Breathing Pacer**: Real-time visual 4-4-4-4 autonomic breathing exercise (Inhale 4s, Hold 4s, Exhale 4s, Rest 4s).
- **Intelligent Doctor Matching**: Recommends verified specialists in the platform based on patient symptoms.
- **NLP Crisis Detection**: Detects crisis keywords and immediately presents Abu Dhabi & UAE hotlines while alerting human leads.

### 4. Find Your Doctor (Patient Autonomy)
- Comprehensive doctor discovery directory with search and multi-parameter filters:
  - Specialization, doctor name, fee range, languages, consultation modes (online/offline), experience.
  - Transparent pricing (AED per 30 minutes).
  - Department of Health (DoH) verified credentials and medical practice license numbers.
  - Interactive profile modal with full bio, credentials, clinic location, and direct 30-minute booking triggers.

### 5. Independent Emergency Support Module
- Prominent 1-Click SOS button triggering critical escalation records in the database.
- **Verified UAE & Abu Dhabi Emergency Contacts**:
  - **Abu Dhabi Police**: `999`
  - **National Ambulance UAE**: `998`
  - **DoH Estijaba Crisis Hub (Abu Dhabi)**: `800 1717` (24/7 dedicated clinical triage)
  - **UAE National Mental Health Line (HOPE)**: `800-4673`
  - **SEHA Telehealth Network**: `800 50`

### 6. Doctor Dashboard & Clinical Record Management
- Real-time queue for today's 30-minute appointments.
- 1-click launch of encrypted P2P Telehealth room or in-person check-in.
- Working hours and lunch break configuration that automatically calculates 30-minute slot availability.
- Secure clinical note recording with follow-up scheduling.

### 7. Administrator Governance & Compliance
- DoH verification toggle: Approve or suspend doctor profiles before they can receive bookings.
- System-wide booking management.
- Real-time platform metrics and crisis event resolution workflow.
- Security audit logging (recording user ID, action, resource, IP address, timestamp).
- **Privacy Safeguard**: Administrators are strictly isolated from viewing private patient clinical diagnoses.

---

## 3. Database Schema (16 Entities)

The system supports managed PostgreSQL (production) and SQLite with WAL mode (local development):

1. `users`: Core authentication, hashed passwords, roles (`patient`, `doctor`, `admin`).
2. `patients`: Medical profile, emergency contact, consent acceptance.
3. `doctors`: Specialization, qualifications, license number, consultation fee, clinic details, verification flag.
4. `doctor_credentials`: Licensing documents, issuing authorities, verification timestamps.
5. `doctor_availability`: Working schedules, shift hours, lunch breaks, slot durations (30 min).
6. `appointments`: Booking reference (`URC-2026-XXXX`), atomic slot allocation, status (`confirmed`, `completed`, `cancelled`, `rescheduled`), mode, meeting links.
7. `assessments`: PHQ-9, GAD-7, PSS-10 scores, severity classifications, non-diagnostic guidance, disclaimers.
8. `assessment_results`: Question-level psychometric responses.
9. `consent_records`: Telehealth and data privacy compliance records.
10. `consultations`: Telehealth room sessions, clinical notes, prescriptions, follow-up dates.
11. `clinical_records`: Encrypted medical documentation and consultation notes.
12. `referrals`: Doctor-to-doctor specialization referrals and urgency flags.
13. `follow_ups`: Care reminders and scheduled check-ins.
14. `crisis_events`: Escalation events, trigger sources, on-call human lead assignments, resolutions.
15. `notifications`: Real-time user notifications for bookings, assessments, and emergencies.
16. `audit_logs`: Security and access logs for regulatory compliance.

---

## 4. Pre-Configured Demo Credentials

The application is pre-seeded with realistic healthcare data and accounts for quick evaluation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Patient** | `patient@urcure.com` | `PatientPass123!` | Zayn Al-Mansoor (Sample appointments & mood history) |
| **Doctor** | `dr.sharma@urcure.com` | `DoctorPass123!` | Dr. Priya Sharma (Consultant Psychiatrist, DoH Verified) |
| **Admin** | `admin@urcure.com` | `AdminPass123!` | Dr. Sarah Al-Hashimi (Medical Director & Platform Governance) |

*You can also use the **"Role: [Guest/Patient/Doctor/Admin]"** dropdown in the top navigation bar to seamlessly switch between personas with 1 click.*

---

## 5. Running the Application Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
*Backend runs on `http://127.0.0.1:5000` and automatically seeds the database.*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173` and proxies `/api` calls directly to Flask.*

---

## 6. Environment Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///urcure.db` | PostgreSQL connection string (or SQLite fallback) |
| `JWT_SECRET_KEY` | `urcure_super_secure_obsidian_key_2026_!#*&` | JWT signature secret |
| `PORT` | `5000` | Backend API port |
