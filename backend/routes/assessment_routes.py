from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Assessment, AssessmentResult, Patient, User, CrisisEvent, Notification

assessment_bp = Blueprint('assessments', __name__)

VALIDATED_INSTRUMENTS = {
    'PHQ-9': {
        'title': 'PHQ-9 Mental Wellbeing & Mood Screening',
        'subtitle': 'Validated 9-item scale for understanding changes in mood and energy levels over the last 2 weeks.',
        'max_score': 27,
        'options': [
            {'label': 'Not at all', 'score': 0},
            {'label': 'Several days', 'score': 1},
            {'label': 'More than half the days', 'score': 2},
            {'label': 'Nearly every day', 'score': 3}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Little interest or pleasure in doing things you normally enjoy?'},
            {'id': 'q2', 'text': 'Feeling down, depressed, lethargic, or hopeless?'},
            {'id': 'q3', 'text': 'Trouble falling or staying asleep, or sleeping excessively?'},
            {'id': 'q4', 'text': 'Feeling tired or having little physical and mental energy?'},
            {'id': 'q5', 'text': 'Poor appetite or tendency to overeat?'},
            {'id': 'q6', 'text': 'Feeling bad about yourself, or that you are a failure or let yourself/family down?'},
            {'id': 'q7', 'text': 'Trouble concentrating on things, such as reading documents or watching news?'},
            {'id': 'q8', 'text': 'Moving or speaking noticeably slowly, or being unusually fidgety and restless?'},
            {'id': 'q9', 'text': 'Thoughts that you would be better off not waking up, or thoughts of hurting yourself in any way?'}
        ]
    },
    'GAD-7': {
        'title': 'GAD-7 Anxiety & Nervous Tension Screening',
        'subtitle': 'Validated 7-item scale assessing symptoms of persistent anxiety and worry.',
        'max_score': 21,
        'options': [
            {'label': 'Not at all', 'score': 0},
            {'label': 'Several days', 'score': 1},
            {'label': 'More than half the days', 'score': 2},
            {'label': 'Nearly every day', 'score': 3}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Feeling nervous, anxious, or on edge?'},
            {'id': 'q2', 'text': 'Not being able to stop or control worrying?'},
            {'id': 'q3', 'text': 'Worrying too much about different things?'},
            {'id': 'q4', 'text': 'Trouble relaxing even during downtime?'},
            {'id': 'q5', 'text': 'Being so restless that it is hard to sit still?'},
            {'id': 'q6', 'text': 'Becoming easily annoyed, frustrated, or irritable?'},
            {'id': 'q7', 'text': 'Feeling afraid as if something awful might happen?'}
        ]
    },
    'PSS-10': {
        'title': 'PSS-10 Perceived Stress Assessment',
        'subtitle': 'Global gold-standard measure of the degree to which situations in life are appraised as stressful.',
        'max_score': 40,
        'options': [
            {'label': 'Never', 'score': 0},
            {'label': 'Almost Never', 'score': 1},
            {'label': 'Sometimes', 'score': 2},
            {'label': 'Fairly Often', 'score': 3},
            {'label': 'Very Often', 'score': 4}
        ],
        'questions': [
            {'id': 'q1', 'text': 'Been upset because of something that happened unexpectedly?'},
            {'id': 'q2', 'text': 'Felt that you were unable to control the important things in your life?'},
            {'id': 'q3', 'text': 'Felt nervous and "stressed"? (appraised as high pressure)'},
            {'id': 'q4', 'text': 'Felt confident about your ability to handle your personal problems? (reversed)', 'reversed': True},
            {'id': 'q5', 'text': 'Felt that things were going your way? (reversed)', 'reversed': True},
            {'id': 'q6', 'text': 'Found that you could not cope with all the things that you had to do?'},
            {'id': 'q7', 'text': 'Been able to control irritations in your daily routine? (reversed)', 'reversed': True},
            {'id': 'q8', 'text': 'Felt that you were on top of things? (reversed)', 'reversed': True},
            {'id': 'q9', 'text': 'Been angered because of things that happened outside of your control?'},
            {'id': 'q10', 'text': 'Felt difficulties were piling up so high that you could not overcome them?'}
        ]
    },
    'WHO-5': {
        'title': 'WHO-5 Psychological Wellbeing Index',
        'subtitle': 'World Health Organization indicator measuring positive psychological wellbeing and quality of life.',
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
            {'id': 'q3', 'text': 'I have felt active and vigorous.'},
            {'id': 'q4', 'text': 'I woke up feeling fresh and rested.'},
            {'id': 'q5', 'text': 'My daily life has been filled with things that interest me.'}
        ]
    }
}

def interpret_score(instrument_type, score, max_score, critical_flag=False):
    """
    Computes clinically calibrated severity level and personalized non-diagnostic recommendations.
    Enforces strict safety rules: AI screening never independently diagnoses.
    """
    severity = 'minimal'
    interpretation = ''
    recommendations = []

    if instrument_type == 'PHQ-9':
        if score <= 4:
            severity = 'minimal'
            interpretation = 'Minimal depressive symptoms indicated. Your responses reflect baseline healthy emotional resilience.'
            recommendations = [
                'Maintain regular sleep hygiene (7-8 hours nightly).',
                'Engage in 20-30 minutes of daily physical movement.',
                'Continue balanced social engagement and proactive stress breaks.'
            ]
        elif score <= 9:
            severity = 'mild'
            interpretation = 'Mild mood fluctuations detected. You may be experiencing situational fatigue or mild stress.'
            recommendations = [
                'Incorporate brief mindfulness pauses or 4-7-8 breathing exercises.',
                'Prioritize restorative hobbies and schedule non-screen downtime.',
                'Consider scheduling a discovery consultation with an urCure wellbeing counselor.'
            ]
        elif score <= 14:
            severity = 'moderate'
            interpretation = 'Moderate symptoms indicated. Noticeable impact on energy, focus, and daily enjoyment is present.'
            recommendations = [
                'We recommend booking an appointment with a verified Psychiatrist or Psychologist on urCure.',
                'Establish a consistent daytime routine with daylight exposure.',
                'Break major tasks into smaller manageable intervals to relieve cognitive load.'
            ]
        elif score <= 19:
            severity = 'moderately_severe'
            interpretation = 'Moderately severe symptoms indicated. Symptoms are likely causing significant disruption to your personal or professional routine.'
            recommendations = [
                'Professional healthcare support is strongly recommended.',
                'Explore our verified doctors directory to book a 30-minute direct consultation.',
                'Reach out to trusted family or mentors for supportive companionship.'
            ]
        else:
            severity = 'severe'
            interpretation = 'Severe distress level detected. Comprehensive healthcare professional evaluation is advised promptly.'
            recommendations = [
                'Immediate consultation with a qualified mental health clinician is advised.',
                'Access our emergency support line if you feel overwhelmed or unsafe.',
                'You do not have to navigate this alone; professional care provides effective pathways forward.'
            ]

    elif instrument_type == 'GAD-7':
        if score <= 4:
            severity = 'minimal'
            interpretation = 'Minimal anxiety symptoms. Healthy nervous system equilibrium.'
            recommendations = [
                'Continue your current positive stress management habits.',
                'Practice deep breathing to maintain autonomic stability.'
            ]
        elif score <= 9:
            severity = 'mild'
            interpretation = 'Mild anxiety symptoms present. Occasional restlessness or worry.'
            recommendations = [
                'Reduce caffeine and late-evening stimulant consumption.',
                'Try guided progressive muscle relaxation via urCure AI.',
                'Keep a structured thought journal to externalize cyclical worries.'
            ]
        elif score <= 14:
            severity = 'moderate'
            interpretation = 'Moderate anxiety symptoms detected. Frequent worry impacting rest and focus.'
            recommendations = [
                'Consult with an urCure clinical psychologist specializing in anxiety.',
                'Practice Box Breathing (4s inhale, 4s hold, 4s exhale, 4s hold) during peak stress.',
                'Limit excessive exposure to sensationalist digital media.'
            ]
        else:
            severity = 'severe'
            interpretation = 'Severe anxiety symptoms indicated. High levels of somatic tension and autonomic overarousal.'
            recommendations = [
                'Schedule a consultation with an urCure specialist doctor promptly.',
                'Ground yourself using sensory cues (5 things you see, 4 you feel, 3 you hear).',
                'Consultation with a professional can provide evidence-based care plans.'
            ]

    elif instrument_type == 'PSS-10':
        if score <= 13:
            severity = 'low'
            interpretation = 'Low perceived stress level. You report feeling adequate control over daily demands.'
            recommendations = ['Continue your balanced lifestyle and protective boundaries.']
        elif score <= 26:
            severity = 'moderate'
            interpretation = 'Moderate perceived stress. You are balancing substantial pressures and may feel occasional strain.'
            recommendations = [
                'Delegate secondary tasks where possible.',
                'Block non-negotiable recovery windows in your weekly calendar.',
                'Explore stress-resilience counseling on urCure.'
            ]
        else:
            severity = 'high'
            interpretation = 'High perceived stress level. Demands are frequently perceived as exceeding current coping resources.'
            recommendations = [
                'Seek guidance from an urCure doctor or wellbeing professional.',
                'Evaluate workloads and introduce structured stress decompression routines.',
                'Utilize the urCure AI breathing assistant for rapid autonomic reset.'
            ]

    else:
        # Default WHO-5
        pct = (score / max_score) * 100
        if pct >= 50:
            severity = 'healthy'
            interpretation = f'Good psychological wellbeing index ({pct:.0f}%). Positive emotional outlook indicated.'
            recommendations = ['Keep cultivating meaningful activities, physical health, and social connection.']
        else:
            severity = 'low'
            interpretation = f'Reduced psychological wellbeing index ({pct:.0f}%). Potential indicator of vitality depletion or low mood.'
            recommendations = [
                'Consider scheduling an exploratory session with an urCure wellbeing specialist.',
                'Incorporate daily walks in natural sunlight and intentional sleep scheduling.'
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
    disclaimer_text = "AI wellbeing screenings are validated educational self-assessments designed for early recognition. They do not formulate clinical diagnoses or replace evaluation by licensed physicians or psychiatrists."

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
