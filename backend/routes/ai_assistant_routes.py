from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import re
from datetime import datetime, timezone
from models import db, Doctor, User, CrisisEvent, Notification

ai_bp = Blueprint('ai', __name__)

CRISIS_PATTERNS = [
    r'\b(suicid|kill\s+myself|end\s+my\s+life|want\s+to\s+die|harm\s+myself|hanging\s+myself|overdose|cut\s+myself|end\s+it\s+all|can\'?t\s+go\s+on\s+anymore|better\s+off\s+dead)\b',
    r'\b(no\s+reason\s+to\s+live|don\'?t\s+want\s+to\s+wake\s+up|ending\s+everything)\b'
]

def detect_crisis(message: str) -> bool:
    lowered = message.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, lowered):
            return True
    return False

def generate_ai_reply(user_msg: str, user_name: str):
    msg = user_msg.lower()

    # 1. CRISIS ESCALATION
    if detect_crisis(user_msg):
        return {
            'is_crisis': True,
            'reply': (
                f"I hear how much pain you are carrying right now, and I want you to be safe. "
                f"As an AI, I cannot provide crisis care, but compassionate, human help is available right now. "
                f"Please reach out to emergency services immediately, or speak with someone who can support you."
            ),
            'action': 'emergency_escalation',
            'crisis_contacts': [
                {'name': 'UAE Emergency Police', 'number': '999', 'badge': 'Emergency'},
                {'name': 'National Ambulance (UAE)', 'number': '998', 'badge': 'Medical SOS'},
                {'name': 'DoH Estijaba Crisis Line (Abu Dhabi)', 'number': '800 1717', 'badge': 'Toll-Free 24/7'},
                {'name': 'UAE National Mental Health Line', 'number': '800-4673', 'badge': 'Confidential Support'},
                {'name': 'SEHA Healthcare Abu Dhabi', 'number': '800 50', 'badge': 'Hospital System'}
            ]
        }

    # 2. BREATHING EXERCISES & PANIC
    if any(k in msg for k in ['breath', 'panic', 'anxious', 'hyperventilat', 'calm down', 'heart racing', 'stress']):
        return {
            'is_crisis': False,
            'reply': (
                f"I understand you are experiencing elevated stress or anxiety right now. Let's slow your nervous system down together.\n\n"
                f"**Box Breathing Protocol (4-4-4-4):**\n"
                f"1. **Inhale** slowly through your nose for 4 seconds.\n"
                f"2. **Hold** your breath gently for 4 seconds.\n"
                f"3. **Exhale** smoothly through your mouth for 4 seconds.\n"
                f"4. **Hold** lungs empty for 4 seconds.\n\n"
                f"Would you like to activate the interactive visual breathing pacer below?"
            ),
            'action': 'breathing_exercise',
            'exercise_type': 'box_breathing'
        }

    # 3. DOCTOR FINDING & APPOINTMENT ADVICE
    if any(k in msg for k in ['doctor', 'therapist', 'psychiatrist', 'psychologist', 'appointment', 'consultation', 'book', 'specialist']):
        # Find verified doctors to suggest
        specialty = 'Psychiatrist' if 'medication' in msg or 'psychiatrist' in msg else 'Clinical Psychologist'
        doctors = Doctor.query.filter_by(is_verified=True).limit(3).all()
        doc_list = []
        for d in doctors:
            doc_list.append({
                'id': d.id,
                'name': d.user.full_name,
                'specialization': d.specialization,
                'fee': d.consultation_fee,
                'city': d.clinic_city,
                'modes': d.consultation_modes
            })

        return {
            'is_crisis': False,
            'reply': (
                f"On urCure, you have complete autonomy to choose your preferred healthcare practitioner. "
                f"Here are verified specialists available for instant 30-minute bookings (both online video and in-person clinic visits):"
            ),
            'action': 'doctor_recommendation',
            'suggested_doctors': doc_list
        }

    # 4. SLEEP & INSOMNIA
    if any(k in msg for k in ['sleep', 'insomnia', 'tired', 'exhausted', 'can\'t sleep']):
        return {
            'is_crisis': False,
            'reply': (
                f"Sleep quality is intimately tied to mental equilibrium. Here is an evidence-based evening wind-down routine:\n\n"
                f"• **Digital Sunset:** Discontinue screens 45 minutes before bed to allow natural melatonin production.\n"
                f"• **Thermal Drop:** Maintain bedroom temperature around 18-20°C (65-68°F).\n"
                f"• **Cognitive Offloading:** Write down any unfinished tasks on paper to empty working memory.\n"
                f"• **Non-Sleep Deep Rest (NSDR):** Try 10 minutes of gentle abdominal breathing."
            ),
            'action': 'self_help_guide',
            'topic': 'sleep_hygiene'
        }

    # 5. PREPARING FOR CONSULTATION
    if any(k in msg for k in ['prepare', 'what to ask', 'first time', 'nervous about doctor']):
        return {
            'is_crisis': False,
            'reply': (
                f"Meeting with a doctor or psychologist for the first time is a courageous step. Here is a helpful 3-point checklist to bring to your consultation:\n\n"
                f"1. **Core Changes:** When did you first notice changes in your sleep, energy, or mood?\n"
                f"2. **Daily Impact:** In what ways are symptoms affecting your work, relationships, or focus?\n"
                f"3. **Your Goals:** What does meaningful recovery or wellbeing look like to you?\n\n"
                f"Remember, our 30-minute consultations are private, collaborative, and entirely at your pace."
            ),
            'action': 'consultation_prep'
        }

    # DEFAULT COMPASSIONATE ASSISTANT REPLY
    return {
        'is_crisis': False,
        'reply': (
            f"Hello, {user_name}. I am **urCure AI**, your dedicated wellbeing assistant. "
            f"I can guide you through scientifically validated stress reduction practices, help you prepare for clinical consultations, "
            f"explain screening results, or connect you directly with our verified physicians and psychiatrists.\n\n"
            f"*(Please note: As an AI system, I do not diagnose illnesses or prescribe treatments. In an emergency, please use our 24/7 Emergency Escalation.)*\n\n"
            f"How can I support your wellbeing today?"
        ),
        'action': 'general'
    }


@ai_bp.route('/chat', methods=['POST'])
@jwt_required(optional=True)
def ai_chat():
    user_id = get_jwt_identity()
    user_name = "there"
    current_user = None

    if user_id:
        current_user = User.query.get(int(user_id))
        if current_user:
            user_name = current_user.full_name.split()[0]

    data = request.get_json() or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'Message content cannot be empty.'}), 400

    response_data = generate_ai_reply(message, user_name)

    # If crisis flagged, immediately register in CrisisEvent table
    if response_data.get('is_crisis'):
        crisis = CrisisEvent(
            user_id=current_user.id if current_user else None,
            trigger_source='chat',
            trigger_text=message[:500],
            risk_level='critical',
            action_taken='AI triggered crisis protocol. Returned Abu Dhabi/UAE hotlines and human escalation referral.',
            escalated_to_human=True,
            human_agent_id='Abu Dhabi Urgent Wellbeing Escalation Team'
        )
        db.session.add(crisis)
        if current_user:
            notif = Notification(
                user_id=current_user.id,
                title='Urgent Support Reached',
                message='Immediate human crisis resources are available 24/7. Our clinical team has been alerted.',
                notification_type='emergency',
                action_link='/emergency'
            )
            db.session.add(notif)
        db.session.commit()

    return jsonify({
        'sender': 'urCure AI',
        'is_ai': True,
        'disclaimer': 'urCure AI provides supportive educational guidance and cannot replace human clinical care.',
        **response_data
    }), 200
