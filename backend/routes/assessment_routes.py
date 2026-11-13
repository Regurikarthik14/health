from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Assessment, AssessmentResult, Patient, User, CrisisEvent, Notification

assessment_bp = Blueprint('assessments', __name__)

VALIDATED_INSTRUMENTS = {
    'PHQ-9': {
        'title': 'Mood & Feelings Check',
        'subtitle': 'A simple 9-question check to understand your mood and energy over the last 2 weeks.',
        'max_score': 27,
        'options': [
            {'label': 'Not at all', 'score': 0},
            {'label': 'Several days', 'score': 1},
            {'label': 'More than half the days', 'score': 2},
            {'label': 'Nearly every day', 'score': 3}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Have you had little interest or joy in doing things you normally enjoy?'},
            {'id': 'q2', 'text': 'Have you felt down, sad, or hopeless?'},
            {'id': 'q3', 'text': 'Have you had trouble falling or staying asleep, or sleeping too much?'},
            {'id': 'q4', 'text': 'Have you felt tired or had very little energy?'},
            {'id': 'q5', 'text': 'Have you had poor appetite, or felt like eating too much?'},
            {'id': 'q6', 'text': 'Have you felt bad about yourself, or felt like you let yourself or your family down?'},
            {'id': 'q7', 'text': 'Have you had trouble focusing on things, like reading or watching TV?'},
            {'id': 'q8', 'text': 'Have you been moving or speaking unusually slowly, or been too restless to sit still?'},
            {'id': 'q9', 'text': 'Have you had thoughts of hurting yourself, or wished you would not wake up?'}
        ]
    },
    'GAD-7': {
        'title': 'Anxiety & Worry Check',
        'subtitle': 'A simple 7-question check to understand feeling nervous or worried.',
        'max_score': 21,
        'options': [
            {'label': 'Not at all', 'score': 0},
            {'label': 'Several days', 'score': 1},
            {'label': 'More than half the days', 'score': 2},
            {'label': 'Nearly every day', 'score': 3}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Have you felt nervous, anxious, or on edge?'},
            {'id': 'q2', 'text': 'Have you been unable to stop or control your worrying?'},
            {'id': 'q3', 'text': 'Have you been worrying too much about different things?'},
            {'id': 'q4', 'text': 'Have you had trouble relaxing?'},
            {'id': 'q5', 'text': 'Have you been so restless that it was hard to sit still?'},
            {'id': 'q6', 'text': 'Have you gotten annoyed or upset easily?'},
            {'id': 'q7', 'text': 'Have you felt afraid that something bad might happen?'}
        ]
    },
    'PSS-10': {
        'title': 'Stress Check',
        'subtitle': 'A simple 10-question check to understand how much stress you have felt recently.',
        'max_score': 40,
        'options': [
            {'label': 'Never', 'score': 0},
            {'label': 'Almost Never', 'score': 1},
            {'label': 'Sometimes', 'score': 2},
            {'label': 'Fairly Often', 'score': 3},
            {'label': 'Very Often', 'score': 4}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Been upset because something happened that you did not expect?'},
            {'id': 'q2', 'text': 'Felt that you were unable to control important things in your life?'},
            {'id': 'q3', 'text': 'Felt nervous or stressed?'},
            {'id': 'q4', 'text': 'Felt confident about your ability to handle your personal problems?'},
            {'id': 'q5', 'text': 'Felt that things were going well for you?'},
            {'id': 'q6', 'text': 'Found that you could not handle everything you had to do?'},
            {'id': 'q7', 'text': 'Been able to handle small daily annoyances calmly?'},
            {'id': 'q8', 'text': 'Felt that you were on top of things?'},
            {'id': 'q9', 'text': 'Been angry because things happened that you could not control?'},
            {'id': 'q10', 'text': 'Felt that difficulties were piling up so high you could not handle them?'}
        ]
    },
    'WHO-5': {
        'title': 'Wellbeing Check',
        'subtitle': 'A quick 5-question check to see how happy and rested you feel.',
        'max_score': 25,
        'options': [
            {'label': 'At no time', 'score': 0},
            {'label': 'Some of the time', 'score': 1},
            {'label': 'Less than half the time', 'score': 2},
            {'label': 'More than half the time', 'score': 3},
            {'label': 'Most of the time', 'score': 4},
            {'label': 'All of the time', 'score': 5}
        ],
        'questions': [
            {'id': 'q1', 'text': 'I have felt cheerful and in good spirits.'},
            {'id': 'q2', 'text': 'I have felt calm and relaxed.'},
            {'id': 'q3', 'text': 'I have felt active and energetic.'},
            {'id': 'q4', 'text': 'I woke up feeling fresh and rested.'},
            {'id': 'q5', 'text': 'My daily life has been filled with things that interest me.'}
        ]
    }
}

def interpret_score(instrument_type, score, max_score, critical_flag=False):
    """
    Computes severity level and personalized non-diagnostic recommendations using beginner-friendly English.
    """
    severity = 'minimal'
    interpretation = ''
    recommendations = []

    if instrument_type == 'PHQ-9':
        if score <= 4:
            severity = 'minimal'
            interpretation = 'You are doing well. Your answers show good emotional health and energy.'
            recommendations = [
                'Keep up your regular sleep habits (7 to 8 hours each night).',
                'Enjoy a 20 to 30 minute walk or light exercise every day.',
                'Stay connected with friends and family.'
            ]
        elif score <= 9:
            severity = 'mild'
            interpretation = 'You might be feeling a little tired or mildly stressed. Taking restful breaks will help.'
            recommendations = [
                'Take short pauses during the day to take slow, deep breaths.',
                'Spend time on hobbies you enjoy away from screens and phones.',
                'Talk things through with a friend or book a quick chat with an urCure doctor.'
            ]
        elif score <= 14:
            severity = 'moderate'
            interpretation = 'You seem to be carrying a noticeable amount of stress or low mood. Talking to a doctor can give you great support.'
            recommendations = [
                'We recommend booking an easy 30-minute visit with a friendly doctor on urCure.',
                'Get some natural morning sunlight and keep a gentle daily routine.',
                'Break big tasks into smaller, easy steps to feel less overwhelmed.'
            ]
        elif score <= 19:
            severity = 'moderately_severe'
            interpretation = 'Your mood feels heavy right now and is affecting your day. We recommend speaking with a doctor soon.'
            recommendations = [
                'Speaking with a healthcare professional is strongly recommended.',
                'Browse our verified doctors to book a private 30-minute video or clinic visit.',
                'Reach out to a family member or friend for supportive company.'
            ]
        else:
            severity = 'severe'
            interpretation = 'You are going through a very tough time. Please reach out to a doctor or emergency helper right away—you do not have to handle this alone.'
            recommendations = [
                'We encourage you to speak with a caring doctor or counselor as soon as possible.',
                'Use our 24/7 emergency help button if you feel unsafe or overwhelmed.',
                'Remember that support is always ready and you are never alone.'
            ]

    elif instrument_type == 'GAD-7':
        if score <= 4:
            severity = 'minimal'
            interpretation = 'Your worry level is low. You are feeling calm, balanced, and peaceful.'
            recommendations = [
                'Keep up your healthy daily habits.',
                'Take slow, deep breaths whenever you feel busy.'
            ]
        elif score <= 9:
            severity = 'mild'
            interpretation = 'You have some mild worry from time to time. Gentle breathing and quiet rest can help.'
            recommendations = [
                'Drink water and cut down on coffee or sodas late in the day.',
                'Try the calm breathing guide with our AI Helper.',
                'Write down your thoughts in a notebook to clear your head.'
            ]
        elif score <= 14:
            severity = 'moderate'
            interpretation = 'You are experiencing frequent worry that might make it hard to focus or sleep. A doctor can help you feel much better.'
            recommendations = [
                'Book a 30-minute visit with an urCure doctor who helps with worry and stress.',
                'Try box breathing (breathe in for 4 seconds, hold for 4, breathe out for 4).',
                'Take breaks from news and social media.'
            ]
        else:
            severity = 'severe'
            interpretation = 'Your anxiety level is high. Please speak with a caring doctor who can help you feel safe and calm.'
            recommendations = [
                'Book a private visit with an urCure doctor today.',
                'Use the 5-4-3-2-1 technique: notice 5 things you can see and 4 things you can touch.',
                'Doctors have simple, proven tools to help you feel peaceful again.'
            ]

    elif instrument_type == 'PSS-10':
        if score <= 13:
            severity = 'low'
            interpretation = 'Your stress level is low. You feel in good control of your daily life.'
            recommendations = ['Keep up your balanced routine and healthy personal boundaries.']
        elif score <= 26:
            severity = 'moderate'
            interpretation = 'You have a moderate amount of stress. Remember to take time for yourself each day.'
            recommendations = [
                'Ask others to help with chores or tasks when possible.',
                'Set aside quiet rest time in your weekly schedule.',
                'Consider a quick check-in visit with an urCure doctor.'
            ]
        else:
            severity = 'high'
            interpretation = 'Your stress level is high. It is important to slow down, ask for help, and talk to a healthcare professional.'
            recommendations = [
                'Speak with an urCure doctor for personal stress relief advice.',
                'Take a few short breaks throughout the day to relax your shoulders and breathe.',
                'Use the urCure AI breathing helper anytime you feel tense.'
            ]

    else:
        # Default WHO-5
        pct = (score / max_score) * 100
        if pct >= 50:
            severity = 'healthy'
            interpretation = f'Good wellbeing score ({pct:.0f}%). You are feeling positive, healthy, and happy.'
            recommendations = ['Keep doing the things that bring you happiness and peace.']
        else:
            severity = 'low'
            interpretation = f'Your wellbeing score is lower than usual ({pct:.0f}%). You may need extra rest and doctor advice.'
            recommendations = [
                'Consider booking a friendly 30-minute talk with an urCure doctor.',
                'Go for a gentle walk in the morning sun and aim for restful sleep.'
            ]

    return severity, interpretation, recommendations


@assessment_bp.route('/instruments', methods=['GET'])
def get_instruments():
    return jsonify({'instruments': VALIDATED_INSTRUMENTS}), 200


@assessment_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_assessment():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    patient = user.patient_profile
    if not patient:
        patient = Patient(user_id=user.id, consent_accepted=True)
        db.session.add(patient)
        db.session.flush()

    data = request.get_json() or {}
    instrument_type = data.get('instrument_type', 'PHQ-9')
    answers = data.get('answers', [])  # list of {question_id, score_value, selected_option, question_text}

    if instrument_type not in VALIDATED_INSTRUMENTS:
        return jsonify({'error': f'Unsupported instrument: {instrument_type}'}), 400

    instrument = VALIDATED_INSTRUMENTS[instrument_type]
    max_score = instrument['max_score']

    total_score = sum(int(a.get('score_value', 0)) for a in answers)
    total_score = min(total_score, max_score)

    # Check for critical triggers (e.g., PHQ-9 question 9)
    critical_risk = False
    for a in answers:
        if a.get('question_id') == 'q9' and int(a.get('score_value', 0)) > 0:
            critical_risk = True
            break

    severity, interpretation, recommendations = interpret_score(instrument_type, total_score, max_score, critical_risk)

    rec_text = "\n".join([f"• {r}" for r in recommendations])
    disclaimer_text = "This wellbeing check is a friendly self-guide. It does not replace a visit or examination by a licensed medical doctor."

    assessment = Assessment(
        patient_id=patient.id,
        assessment_type=instrument_type,
        score=total_score,
        max_score=max_score,
        severity_level=severity,
        interpretation=interpretation,
        recommendations=rec_text,
        disclaimer=disclaimer_text
    )
    db.session.add(assessment)
    db.session.flush()

    # Save detailed answers
    for a in answers:
        result = AssessmentResult(
            assessment_id=assessment.id,
            question_id=a.get('question_id', ''),
            question_text=a.get('question_text', ''),
            selected_option=str(a.get('selected_option', '')),
            score_value=int(a.get('score_value', 0))
        )
        db.session.add(result)

    # If critical risk flagged, create human crisis event and emergency notification
    if critical_risk:
        crisis = CrisisEvent(
            user_id=user.id,
            trigger_source='assessment',
            trigger_text=f"PHQ-9 Item 9 flagged with score {a.get('score_value')} during assessment #{assessment.id}",
            risk_level='critical',
            action_taken='Immediate human crisis escalation initiated. Abu Dhabi & UAE hotlines displayed.',
            escalated_to_human=True,
            human_agent_id='Abu Dhabi Urgent Wellbeing Escalation Team'
        )
        db.session.add(crisis)

        notif = Notification(
            user_id=user.id,
            title='Immediate Support Available',
            message='Your assessment responses indicate you may be experiencing distress. Immediate, confidential 24/7 human crisis support is available.',
            notification_type='emergency',
            action_link='/emergency'
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify({
        'message': 'Assessment recorded successfully.',
        'assessment': assessment.to_dict(),
        'recommendations': recommendations,
        'critical_risk_flag': critical_risk,
        'emergency_notice': {
            'uae_emergency': '999',
            'ambulance': '998',
            'estijaba_crisis_line': '800 1717',
            'national_mental_health': '800-4673'
        } if critical_risk else None
    }), 201


@assessment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_assessment_history():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.patient_profile:
        return jsonify({'assessments': []}), 200

    assessments = Assessment.query.filter_by(patient_id=user.patient_profile.id)\
        .order_by(Assessment.completed_at.desc()).all()

    return jsonify({
        'assessments': [a.to_dict() for a in assessments]
    }), 200


@assessment_bp.route('/mood-checkin', methods=['POST'])
@jwt_required()
def record_mood_checkin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    patient = user.patient_profile
    if not patient:
        patient = Patient(user_id=user.id, consent_accepted=True)
        db.session.add(patient)
        db.session.flush()

    data = request.get_json() or {}
    mood_score = int(data.get('mood_score', 3))      # 1 to 5
    energy_score = int(data.get('energy_score', 3))  # 1 to 5
    sleep_hours = float(data.get('sleep_hours', 7.0))
    note = data.get('note', '')

    severity_mapping = {1: 'severe', 2: 'moderate', 3: 'mild', 4: 'minimal', 5: 'minimal'}
    severity = severity_mapping.get(mood_score, 'mild')

    assessment = Assessment(
        patient_id=patient.id,
        assessment_type='MOOD_CHECKIN',
        score=mood_score,
        max_score=5,
        severity_level=severity,
        interpretation=f"Daily mood check-in: Mood {mood_score}/5, Energy {energy_score}/5, Sleep {sleep_hours}h.",
        recommendations=f"Logged journal note: {note}" if note else "Daily check-in logged."
    )
    db.session.add(assessment)
    db.session.commit()

    return jsonify({'message': 'Mood logged successfully.', 'assessment': assessment.to_dict()}), 201
