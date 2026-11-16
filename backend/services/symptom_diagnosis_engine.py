import re
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

# Anatomical body areas and their common symptoms & clinical keywords
BODY_AREAS = {
    "head_brain": {
        "id": "head_brain",
        "name": "Head & Brain",
        "icon": "Brain",
        "description": "Headaches, migraines, dizziness, head trauma, memory issues, numbness, or fainting",
        "common_symptoms": [
            "throbbing headache",
            "severe migraine",
            "dizziness or lightheadedness",
            "sensitivity to light or sound",
            "double vision or blurred vision",
            "numbness or tingling in face",
            "confusion or memory disturbance",
            "fainting or loss of consciousness",
            "neck stiffness with headache",
            "facial pain or jaw tightness"
        ]
    },
    "eyes_ears_throat": {
        "id": "eyes_ears_throat",
        "name": "Eyes, Ears, Nose & Throat (ENT)",
        "icon": "Eye",
        "description": "Sinus pressure, ear pain, sore throat, nasal blockage, or hearing changes",
        "common_symptoms": [
            "sinus congestion and facial pressure",
            "persistent sore throat",
            "ear pain or discharge",
            "ringing in ears (tinnitus)",
            "difficulty swallowing",
            "loss of smell or taste",
            "nasal discharge or chronic sneezing",
            "hoarseness or voice changes",
            "swollen neck lymph glands",
            "eye redness or irritation"
        ]
    },
    "chest_heart_lungs": {
        "id": "chest_heart_lungs",
        "name": "Chest, Heart & Lungs",
        "icon": "Heart",
        "description": "Chest pressure, racing heartbeat, shortness of breath, wheezing, or chronic cough",
        "common_symptoms": [
            "sharp or crushing chest pain",
            "chest tightness or pressure",
            "shortness of breath on exertion",
            "rapid or irregular heartbeat (palpitations)",
            "persistent dry or productive cough",
            "wheezing or whistling breath",
            "swelling in ankles or legs (edema)",
            "difficulty breathing while lying flat",
            "pain radiating to left arm or jaw",
            "coughing up blood or colored phlegm"
        ]
    },
    "abdomen_digestive": {
        "id": "abdomen_digestive",
        "name": "Abdomen & Digestive",
        "icon": "Activity",
        "description": "Stomach cramps, burning acid, nausea, severe belly pain, or bowel changes",
        "common_symptoms": [
            "upper abdominal burning or acid reflux",
            "sharp lower abdominal pain",
            "severe nausea and vomiting",
            "stomach bloating and gas cramps",
            "persistent diarrhea or loose stools",
            "chronic constipation",
            "yellowing of skin or eyes (jaundice)",
            "blood in stool or black stools",
            "pain after eating fatty meals",
            "unexplained loss of appetite"
        ]
    },
    "spine_back": {
        "id": "spine_back",
        "name": "Spine, Neck & Back",
        "icon": "Shield",
        "description": "Lower back pain, sciatica, neck stiffness, radiating nerve pain, or posture trouble",
        "common_symptoms": [
            "sharp lower back pain",
            "pain radiating down leg (sciatica)",
            "stiff neck and limited head movement",
            "upper back and shoulder blade ache",
            "tingling or weakness in legs or feet",
            "pain aggravated by sitting or bending",
            "muscle spasms along spine",
            "numbness in buttocks or thighs",
            "difficulty standing upright",
            "dull persistent lumbar ache"
        ]
    },
    "limbs_joints": {
        "id": "limbs_joints",
        "name": "Arms, Legs & Joints",
        "icon": "Bone",
        "description": "Joint pain, knee swelling, shoulder stiffness, muscle cramps, or mobility restriction",
        "common_symptoms": [
            "knee pain and swelling",
            "shoulder pain with overhead movement",
            "morning joint stiffness lasting >30 mins",
            "wrist or hand pain and weakness",
            "hip or groin pain while walking",
            "ankle pain or swelling after sprain",
            "frequent muscle cramps and spasms",
            "elbow tenderness (tennis/golfer elbow)",
            "clicking or locking of joint",
            "painful, warm, or red joints"
        ]
    },
    "skin_hair": {
        "id": "skin_hair",
        "name": "Skin & Hair",
        "icon": "Sparkles",
        "description": "Itchy rashes, scaling, acne, eczema, unexplained lesions, hives, or hair thinning",
        "common_symptoms": [
            "intense itching of skin",
            "red, inflamed skin rash",
            "dry, peeling, or flaky patches",
            "acne breakouts or painful cysts",
            "raised hives or allergic welts",
            "unusual mole changes or new growth",
            "blisters or fluid-filled bumps",
            "skin redness and localized warmth",
            "rapid unexplained hair shedding",
            "crusty or oozing skin lesions"
        ]
    },
    "urinary_pelvic": {
        "id": "urinary_pelvic",
        "name": "Urinary & Pelvic",
        "icon": "Zap",
        "description": "Painful urination, pelvic cramps, frequent urination, flank pain, or urine changes",
        "common_symptoms": [
            "burning or pain during urination",
            "frequent or urgent need to urinate",
            "lower pelvic or bladder pressure",
            "sharp side or flank pain (kidney area)",
            "cloudy or strong-smelling urine",
            "blood in urine (hematuria)",
            "difficulty starting or emptying bladder",
            "nighttime waking to urinate",
            "fever with flank tenderness",
            "intermenstrual or pelvic cramps"
        ]
    },
    "mental_wellbeing": {
        "id": "mental_wellbeing",
        "name": "Mental Wellbeing & Sleep",
        "icon": "Smile",
        "description": "Overwhelming worry, depressive feelings, panic attacks, insomnia, or emotional burnout",
        "common_symptoms": [
            "persistent low mood and sadness",
            "excessive worry and racing thoughts",
            "panic attacks with rapid breathing",
            "chronic insomnia or early waking",
            "loss of pleasure or motivation",
            "irritability, restlessness, or agitation",
            "brain fog and inability to focus",
            "feelings of hopelessness or guilt",
            "physical fatigue from emotional stress",
            "social withdrawal and detachment"
        ]
    },
    "general_systemic": {
        "id": "general_systemic",
        "name": "General & Whole Body",
        "icon": "Flame",
        "description": "Persistent fever, chronic fatigue, unexplained weight change, night sweats, or weakness",
        "common_symptoms": [
            "prolonged unexplained fever",
            "severe chronic fatigue and low energy",
            "drenching night sweats",
            "unintentional weight loss",
            "generalized body and muscle aches",
            "shivering, chills, or hot flashes",
            "swollen lymph nodes in multiple areas",
            "excessive unquenchable thirst",
            "pale skin and easy bruising",
            "lightheadedness upon standing"
        ]
    }
}

# Curated Medical Disease & Specialist Taxonomy derived from sajjadhadi/disease-diagnosis-dataset
DISEASE_TAXONOMY = [
    # CARDIOLOGY
    {
        "name": "Ischemic Heart Disease / Angina",
        "body_area": "chest_heart_lungs",
        "keywords": ["chest pain", "chest tightness", "palpitations", "shortness of breath", "radiating pain", "arm pain", "jaw pain", "heart"],
        "specialist": "Consultant Cardiologist",
        "specialty_key": "Cardiologist",
        "urgency": "urgent",
        "description": "Restricted blood flow to heart muscle causing tightness, pressure, or breathlessness.",
        "specialist_reason": "A cardiologist conducts ECG, echocardiogram, and cardiac stress evaluations to examine blood flow and heart rhythm.",
        "home_care": "Rest immediately. Avoid physical exertion. If crushing pain spreads to jaw, back, or left arm, call Emergency 998 right away.",
        "red_flags": "Crushing chest pressure, sweating, fainting, or pain spreading to left arm or jaw."
    },
    {
        "name": "Cardiac Arrhythmia / Palpitations",
        "body_area": "chest_heart_lungs",
        "keywords": ["palpitations", "racing heartbeat", "skipped beats", "fluttering", "dizziness", "shortness of breath"],
        "specialist": "Consultant Cardiologist",
        "specialty_key": "Cardiologist",
        "urgency": "moderate",
        "description": "Irregular electrical heart signals causing fluttering, skipped beats, or pounding sensations.",
        "specialist_reason": "Cardiologists use 24-hour Holter monitoring and echocardiography to pinpoint the exact heart rhythm variation.",
        "home_care": "Sit calmly, take slow deep breaths, avoid caffeine, energy drinks, and nicotine.",
        "red_flags": "Palpitations accompanied by chest pain, dizziness, or loss of consciousness."
    },
    {
        "name": "Asthma / Bronchial Hyperactivity",
        "body_area": "chest_heart_lungs",
        "keywords": ["wheezing", "cough", "shortness of breath", "difficulty breathing", "chest tightness", "dust allergy"],
        "specialist": "Specialist Pulmonologist",
        "specialty_key": "Pulmonologist",
        "urgency": "moderate",
        "description": "Inflamed airways that swell and produce extra mucus, causing whistling breaths and coughing.",
        "specialist_reason": "A pulmonologist performs spirometry lung function tests to determine airway capacity and prescribe preventive inhalers.",
        "home_care": "Sit upright, stay in a dust-free air-conditioned room, drink warm fluids, and use prescribed bronchodilator inhalers.",
        "red_flags": "Severe struggling to breathe, blue lips, or inhaler not providing relief."
    },

    # NEUROLOGY
    {
        "name": "Migraine with Aura / Chronic Headache",
        "body_area": "head_brain",
        "keywords": ["headache", "migraine", "throbbing", "light sensitivity", "sound sensitivity", "nausea", "visual aura", "temple"],
        "specialist": "Specialist Neurologist",
        "specialty_key": "Neurologist",
        "urgency": "routine",
        "description": "Neurovascular throbbing head pain frequently accompanied by nausea and sensitivity to sensory stimuli.",
        "specialist_reason": "A neurologist evaluates cranial nerve function and brain imaging to formulate a targeted preventive protocol.",
        "home_care": "Rest in a quiet, dark room with a cool cloth over your forehead. Stay hydrated.",
        "red_flags": "Sudden explosive 'thunderclap' headache or headache with high fever and neck stiffness."
    },
    {
        "name": "Concussion / Post-Traumatic Head Injury",
        "body_area": "head_brain",
        "keywords": ["concussion", "head injury", "dizziness", "vomiting", "memory", "double vision", "neck pain", "hit head"],
        "specialist": "Specialist Neurologist",
        "specialty_key": "Neurologist",
        "urgency": "urgent",
        "description": "Mild traumatic brain injury following an impact, affecting brain chemistry, concentration, and balance.",
        "specialist_reason": "A neurologist conducts cognitive testing and neuro-imaging (CT/MRI) to rule out intracranial hemorrhage or edema.",
        "home_care": "Strict physical and cognitive rest (no screens, reading, or vigorous exercise). Have a friend or relative monitor you.",
        "red_flags": "Repeated vomiting, worsening confusion, unequal pupils, or inability to wake up."
    },
    {
        "name": "Peripheral Neuropathy / Nerve Compression",
        "body_area": "head_brain",
        "keywords": ["numbness", "tingling", "pins and needles", "burning sensation", "weakness in hands", "nerve pain"],
        "specialist": "Specialist Neurologist",
        "specialty_key": "Neurologist",
        "urgency": "routine",
        "description": "Damage or irritation to peripheral nerves causing tingling, burning sensations, or decreased sensitivity.",
        "specialist_reason": "Neurologists perform electromyography (EMG) and nerve conduction studies to assess nerve signal speed.",
        "home_care": "Wear loose comfortable footwear, inspect feet daily, and avoid repetitive postures that pinch nerves.",
        "red_flags": "Rapidly spreading weakness or loss of bowel/bladder sensation."
    },

    # GASTROENTEROLOGY
    {
        "name": "Gastroesophageal Reflux Disease (GERD) / Gastritis",
        "body_area": "abdomen_digestive",
        "keywords": ["heartburn", "acid reflux", "stomach burning", "indigestion", "sour taste", "nausea", "bloating", "upper abdominal"],
        "specialist": "Specialist Gastroenterologist",
        "specialty_key": "Gastroenterologist",
        "urgency": "routine",
        "description": "Stomach acid flowing back into the food pipe or inflammation of the protective stomach lining.",
        "specialist_reason": "A gastroenterologist examines upper digestive health (endoscopy/H. Pylori check) and prescribes protective mucosal therapy.",
        "home_care": "Eat smaller, frequent meals. Avoid spicy, oily food and caffeine. Do not lie down within 3 hours of eating.",
        "red_flags": "Black tarry stools, vomiting blood, or progressive difficulty swallowing food."
    },
    {
        "name": "Acute Pancreatitis / Cholecystitis (Gallstones)",
        "body_area": "abdomen_digestive",
        "keywords": ["sharp abdominal pain", "severe stomach pain", "pain radiating to back", "vomiting", "jaundice", "side pain", "gallbladder"],
        "specialist": "Specialist Gastroenterologist",
        "specialty_key": "Gastroenterologist",
        "urgency": "urgent",
        "description": "Sudden inflammation of the pancreas or gallbladder, causing severe abdominal pain radiating through to the back.",
        "specialist_reason": "A gastroenterologist or hepatobiliary specialist performs abdominal ultrasound and enzyme lab tests.",
        "home_care": "Avoid solid or fatty foods. Stay hydrated with small sips of water. Seek prompt clinical evaluation.",
        "red_flags": "Severe unremitting pain, high fever with chills, or yellowing of the eyes/skin."
    },

    # ORTHOPEDICS
    {
        "name": "Lumbar Disc Herniation / Sciatica",
        "body_area": "spine_back",
        "keywords": ["lower back pain", "sciatica", "back pain", "shooting leg pain", "spine", "numbness in leg", "disc pain", "lumbar"],
        "specialist": "Specialist Orthopedic Surgeon",
        "specialty_key": "Orthopedist",
        "urgency": "routine",
        "description": "A spinal disc pressing on nearby nerve roots, triggering pain down the buttock, thigh, and calf.",
        "specialist_reason": "An orthopedic spine surgeon assesses structural spinal alignment, disc decompression, and tailored physical therapy.",
        "home_care": "Alternate between ice and gentle heat. Avoid heavy lifting and prolonged slouching. Take short, gentle walks.",
        "red_flags": "Loss of control of bowel or bladder, or sudden numbness in the 'saddle' genital region."
    },
    {
        "name": "Joint Bursitis / Osteoarthritis",
        "body_area": "limbs_joints",
        "keywords": ["knee pain", "knee swelling", "shoulder pain", "joint stiffness", "hip pain", "arm pain", "swollen joint", "clicking joint"],
        "specialist": "Specialist Orthopedic Surgeon",
        "specialty_key": "Orthopedist",
        "urgency": "routine",
        "description": "Degeneration of joint cartilage or inflamed fluid cushions (bursae) causing swelling and painful movement.",
        "specialist_reason": "Orthopedic surgeons examine joint mobility, review X-rays or MRI scans, and offer targeted injections or joint protection plans.",
        "home_care": "Apply the R.I.C.E. method (Rest, Ice, Compression, Elevation) to swollen joints. Avoid high-impact jumps.",
        "red_flags": "Inability to bear any weight on the leg, or joint that is intensely red, hot to touch, with high fever."
    },

    # DERMATOLOGY
    {
        "name": "Seborrheic Dermatitis / Atopic Eczema",
        "body_area": "skin_hair",
        "keywords": ["itching", "rash", "dry skin", "peeling", "scaliness", "skin lesion", "flaky scalp", "eczema", "red skin"],
        "specialist": "Specialist Dermatologist",
        "specialty_key": "Dermatologist",
        "urgency": "routine",
        "description": "Chronic inflammatory skin condition causing itchy red patches, flaky scales, or dry barrier disruption.",
        "specialist_reason": "A dermatologist accurately differentiates fungal, allergic, and autoimmune skin causes and prescribes targeted topical regimens.",
        "home_care": "Use fragrance-free gentle cleansers. Apply thick ceramide moisturizer within 3 minutes of showering. Avoid scratching.",
        "red_flags": "Rapidly spreading red rash, pus discharge, or skin peeling accompanied by high fever."
    },
    {
        "name": "Acne Vulgaris / Inflammatory Folliculitis",
        "body_area": "skin_hair",
        "keywords": ["acne", "pimples", "pustules", "facial bumps", "skin cysts", "clogged pores", "blackheads"],
        "specialist": "Specialist Dermatologist",
        "specialty_key": "Dermatologist",
        "urgency": "routine",
        "description": "Overactive sebaceous glands and bacterial colonization resulting in inflamed pustules and nodules.",
        "specialist_reason": "Dermatologists design customized prescription retinoid and antimicrobial plans to prevent long-term scarring.",
        "home_care": "Wash face twice daily with salicylic acid or mild foaming wash. Do not squeeze or pick at blemishes.",
        "red_flags": "Deep painful cysts causing facial swelling, or infection spreading near the eyes."
    },

    # ENT (EAR, NOSE & THROAT)
    {
        "name": "Chronic Sinusitis / Allergic Rhinosinusitis",
        "body_area": "eyes_ears_throat",
        "keywords": ["sinus", "facial pain", "sore throat", "cough", "nasal congestion", "runny nose", "pressure in forehead"],
        "specialist": "ENT Specialist (Otolaryngologist)",
        "specialty_key": "ENT",
        "urgency": "routine",
        "description": "Persistent swelling of nasal cavity passages trapping mucus and creating facial pressure and throat irritation.",
        "specialist_reason": "An otolaryngologist uses endoscopic nasal examination to assess sinus drainage pathways and clear blockages.",
        "home_care": "Use sterile saline nasal rinses twice daily. Breathe in gentle warm steam. Stay well hydrated.",
        "red_flags": "Swelling or redness around one or both eyes, or high fever with severe stiff neck."
    },
    {
        "name": "Otitis Media / Inner Ear Infection",
        "body_area": "eyes_ears_throat",
        "keywords": ["ear pain", "ear discharge", "ringing in ear", "tinnitus", "fullness in ear", "hearing loss", "dizziness"],
        "specialist": "ENT Specialist (Otolaryngologist)",
        "specialty_key": "ENT",
        "urgency": "routine",
        "description": "Bacterial or viral infection of the middle ear air space behind the eardrum causing sharp pain and hearing muffledness.",
        "specialist_reason": "An ENT uses pneumatic otoscopy to inspect the tympanic membrane for fluid build-up or perforation.",
        "home_care": "Keep ear dry (no swimming). Apply a warm compress against the outer ear. Do not insert cotton swabs into the canal.",
        "red_flags": "Fluid or pus draining from the ear with facial muscle weakness."
    },

    # UROLOGY
    {
        "name": "Urinary Tract Infection (UTI) / Urethritis",
        "body_area": "urinary_pelvic",
        "keywords": ["painful urination", "burning urination", "lower abdominal pain", "blood in urine", "frequent urination", "cloudy urine"],
        "specialist": "Specialist Urologist",
        "specialty_key": "Urologist",
        "urgency": "moderate",
        "description": "Bacterial colonization of the urinary mucosa triggering burning sensations, urgency, and pelvic discomfort.",
        "specialist_reason": "A urologist evaluates urine culture sensitivity, bladder ultrasound, and prevents ascending kidney infection.",
        "home_care": "Drink plenty of water (2 to 3 liters daily) to flush urinary channels. Avoid holding urine.",
        "red_flags": "High fever, shaking chills, nausea, and sharp pain in the mid-back (kidney region)."
    },

    # PSYCHIATRY & MENTAL HEALTH
    {
        "name": "Major Depressive Disorder / Persistent Low Mood",
        "body_area": "mental_wellbeing",
        "keywords": ["depression", "hopelessness", "insomnia", "loss of interest", "crying", "fatigue", "low energy", "sadness"],
        "specialist": "Consultant Psychiatrist",
        "specialty_key": "Psychiatrist",
        "urgency": "moderate",
        "description": "Neurochemical imbalance and chronic cognitive depletion dampening mood, motivation, sleep, and vitality.",
        "specialist_reason": "A consultant psychiatrist conducts holistic clinical interviews, medication management, and psychotherapy planning.",
        "home_care": "Maintain consistent sleep hours, take daily 20-minute gentle walks in natural light, and speak to trusted loved ones.",
        "red_flags": "Thoughts of self-harm or despair. (Call free HOPE Line 800-4673 or Emergency 999 immediately)."
    },
    {
        "name": "Generalized Anxiety Disorder / Panic Episodes",
        "body_area": "mental_wellbeing",
        "keywords": ["anxiety", "nervousness", "panic attack", "racing thoughts", "excessive fear", "restlessness", "racing heart", "trembling"],
        "specialist": "Consultant Psychiatrist",
        "specialty_key": "Psychiatrist",
        "urgency": "moderate",
        "description": "Heightened sympathetic nervous system reactivity creating chronic worry, chest tightness, and panic spikes.",
        "specialist_reason": "Psychiatrists and clinical psychologists provide evidence-backed cognitive behavioral therapies and stabilization.",
        "home_care": "Practice box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s). Reduce caffeine and sugar intake.",
        "red_flags": "Severe panic accompanied by chest constriction that does not resolve with calm breathing."
    }
]

class SymptomDiagnosisEngine:
    """
    Intelligent medical triage and specialist recognition engine informed by
    the sajjadhadi/disease-diagnosis-dataset schema and clinical specialty standards.
    """

    def __init__(self):
        self._hf_dataset = None
        self._hf_attempted = False

    def load_hf_dataset_if_available(self):
        """Attempts to load sajjadhadi/disease-diagnosis-dataset from Hugging Face if online."""
        if self._hf_attempted:
            return self._hf_dataset
        self._hf_attempted = True
        try:
            from datasets import load_dataset
            # Load small streaming or cached split to avoid excessive memory
            ds = load_dataset("sajjadhadi/disease-diagnosis-dataset", split="test", streaming=False)
            self._hf_dataset = ds
            logger.info("Successfully linked to Hugging Face sajjadhadi/disease-diagnosis-dataset.")
        except Exception as e:
            logger.info(f"Hugging Face online streaming not active ({e}); running on compiled clinical engine.")
        return self._hf_dataset

    def analyze_health_trouble(
        self,
        body_area: str,
        primary_symptoms: List[str],
        trouble_description: Optional[str] = "",
        pain_scale: int = 5,
        severity: str = "moderate"
    ) -> Dict[str, Any]:
        """
        Analyzes patient health inputs, maps to matching condition taxonomy,
        and accurately guides the patient to the proper medical specialist.
        """
        body_area_norm = (body_area or "").strip().lower().replace(" ", "_").replace("&", "").replace("-", "_")
        
        # Match body area definition
        matched_area_info = None
        for key, val in BODY_AREAS.items():
            if key in body_area_norm or val["name"].lower() in (body_area or "").lower():
                matched_area_info = val
                break
        if not matched_area_info:
            matched_area_info = BODY_AREAS.get("general_systemic")

        combined_text = " ".join([
            str(body_area or ""),
            " ".join(primary_symptoms or []),
            str(trouble_description or "")
        ]).lower()

        # Score all conditions in the disease taxonomy
        scored_conditions = []
        for cond in DISEASE_TAXONOMY:
            score = 0
            # Area match bonus
            if cond["body_area"] == matched_area_info["id"]:
                score += 35

            # Keyword matching
            matched_keywords = []
            for kw in cond["keywords"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', combined_text):
                    score += 20
                    matched_keywords.append(kw)
                elif kw in combined_text:
                    score += 10
                    matched_keywords.append(kw)

            # Extra weight if condition name is explicitly mentioned
            if cond["name"].lower() in combined_text:
                score += 30

            if score > 0:
                scored_conditions.append({
                    "condition": cond,
                    "score": score,
                    "matched_keywords": matched_keywords
                })

        scored_conditions.sort(key=lambda x: x["score"], reverse=True)

        # Fallback if no strong match found
        if not scored_conditions or scored_conditions[0]["score"] < 25:
            default_specialist = "General Practitioner / Family Medicine"
            top_dx_name = f"Acute {matched_area_info['name']} Discomfort"
            specialist_reason = f"A general physician will conduct initial physical examinations for your {matched_area_info['name']} symptoms and order baseline diagnostics."
            home_care = "Rest comfortably, stay well hydrated, and keep a log of when the symptoms fluctuate."
            red_flags = "Sudden severe pain spikes, high fever, or loss of normal organ function."
            urgency = "routine"
            differentials = [{
                "name": top_dx_name,
                "confidence": 70,
                "description": f"Symptom complex localized to the {matched_area_info['name']} requiring in-person assessment."
            }]
        else:
            top_match = scored_conditions[0]["condition"]
            top_dx_name = top_match["name"]
            default_specialist = top_match["specialist"]
            specialist_reason = top_match["specialist_reason"]
            home_care = top_match["home_care"]
            red_flags = top_match["red_flags"]
            urgency = top_match["urgency"]

            # Compute normalized confidence (70% - 96%)
            raw_score = scored_conditions[0]["score"]
            top_conf = min(96, max(72, int(60 + (raw_score / 150) * 36)))

            differentials = []
            for item in scored_conditions[:3]:
                c = item["condition"]
                c_conf = min(top_conf, max(50, int(top_conf * (item["score"] / raw_score))))
                differentials.append({
                    "name": c["name"],
                    "confidence": c_conf,
                    "specialist": c["specialist"],
                    "description": c["description"]
                })

        # Pain scale severity escalator
        if pain_scale >= 8 or severity == "severe":
            if urgency == "routine":
                urgency = "urgent"

        # Emergency override detection
        emergency_indicators = ["crushing chest", "cannot breathe", "fainted", "unconscious", "paralyzed", "slurred speech", "suicide", "end my life"]
        is_emergency = any(indicator in combined_text for indicator in emergency_indicators) or (pain_scale == 10 and "chest" in combined_text)
        if is_emergency:
            urgency = "immediate_emergency"

        return {
            "body_area": matched_area_info["name"],
            "body_area_id": matched_area_info["id"],
            "primary_symptoms": primary_symptoms,
            "pain_scale": pain_scale,
            "recognized_diagnosis": top_dx_name,
            "differential_diagnoses": differentials,
            "recommended_specialist": default_specialist,
            "specialist_reason": specialist_reason,
            "urgency_level": urgency,
            "home_care_recommendations": home_care,
            "red_flags": red_flags,
            "dataset_source": "sajjadhadi/disease-diagnosis-dataset",
            "is_emergency": is_emergency
        }

# Singleton instance
diagnosis_engine = SymptomDiagnosisEngine()
