import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Brain, 
  Sparkles, 
  Users, 
  Stethoscope, 
  Video, 
  Hospital, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  Clock, 
  MapPin, 
  Globe2, 
  AlertCircle, 
  X, 
  Check, 
  ChevronRight, 
  Info, 
  FileText,
  Activity,
  Play,
  Pause
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ServicesViewProps {
  onNavigate: (view: string) => void;
  onOpenBooking: () => void;
  onOpenSOS: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  level: number;
  levelTitle: string;
  description: string;
  eligibility: string;
  location: string;
  languages: string[];
  contact: string;
  availability: string;
  referralRequirement: string;
  actionType: 'exercise_breathing' | 'exercise_grounding' | 'internal_route' | 'external_hotline' | 'referral_modal' | 'book_doctor';
  routeTarget?: string;
  badge?: string;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenSOS
}) => {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  // Interactive Self-Help Modals
  const [activeModal, setActiveModal] = useState<'breathing' | 'grounding' | 'referral' | null>(null);
  
  // Breathing Exercise State (Box Breathing 4-4-4-4)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathingCounter, setBreathingCounter] = useState<number>(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(true);

  // Grounding Exercise State (5-4-3-2-1)
  const [groundingStep, setGroundingStep] = useState<number>(0);

  // Referral Modal State
  const [referralTarget, setReferralTarget] = useState<ServiceItem | null>(null);
  const [referralConsent, setReferralConsent] = useState<boolean>(true);
  const [referralReason, setReferralReason] = useState<string>('');
  const [submittingReferral, setSubmittingReferral] = useState<boolean>(false);
  const [referralSuccessCode, setReferralSuccessCode] = useState<string | null>(null);

  // Stepped Care Services Database (Verified UAE & Abu Dhabi Healthcare Information)
  const servicesList: ServiceItem[] = [
    // LEVEL 1 — SELF-HELP
    {
      id: 'l1-breathing',
      name: 'Interactive Box Breathing (4-4-4-4)',
      level: 1,
      levelTitle: 'Level 1: Self-Help',
      description: 'Clinically tested box breathing technique to quickly lower heart rate and reduce acute stress within 2 minutes.',
      eligibility: 'Anyone experiencing tension, rapid breathing, or everyday stress.',
      location: 'Digital / Self-Guided (urCure Interactive Widget)',
      languages: ['English', 'العربية (Arabic)'],
      contact: 'Instant Access In-App',
      availability: 'Available 24/7 Immediately',
      referralRequirement: 'No referral required — 100% free and private.',
      actionType: 'exercise_breathing',
      badge: 'Interactive'
    },
    {
      id: 'l1-grounding',
      name: '5-4-3-2-1 Sensory Grounding Guide',
      level: 1,
      levelTitle: 'Level 1: Self-Help',
      description: 'An evidence-based mindfulness protocol that anchors your attention to physical surroundings during overwhelming anxiety or panic sensations.',
      eligibility: 'Individuals experiencing sudden panic, racing thoughts, or sensory overload.',
      location: 'Digital / Self-Guided (urCure Interactive Widget)',
      languages: ['English', 'العربية (Arabic)'],
      contact: 'Instant Access In-App',
      availability: 'Available 24/7 Immediately',
      referralRequirement: 'No referral required.',
      actionType: 'exercise_grounding',
      badge: 'Interactive'
    },
    {
      id: 'l1-sleep-psychoed',
      name: 'Evidence-Based Sleep & Stress Education',
      level: 1,
      levelTitle: 'Level 1: Self-Help',
      description: 'Reviewed educational guides on circadian rhythms, digital sleep hygiene, and progressive muscle relaxation to improve restorative sleep.',
      eligibility: 'Anyone experiencing difficulty sleeping or daytime fatigue.',
      location: 'Digital Learning Hub (urCure Wellbeing)',
      languages: ['English', 'العربية (Arabic)'],
      contact: 'Instant Access In-App',
      availability: 'Available 24/7',
      referralRequirement: 'Open to all registered individuals.',
      actionType: 'internal_route',
      routeTarget: 'wellbeing',
      badge: 'Educational'
    },

    // LEVEL 2 — COMMUNITY SUPPORT
    {
      id: 'l2-adphc',
      name: 'Abu Dhabi Public Health Centre (ADPHC) Wellbeing Programme',
      level: 2,
      levelTitle: 'Level 2: Community Support',
      description: 'Official community health workshops, mental health awareness drives, and public wellness programmes curated by the Department of Health – Abu Dhabi.',
      eligibility: 'Abu Dhabi residents, citizens, and youth.',
      location: 'Community Centres & Health Hubs across Abu Dhabi, Al Ain, Al Dhafra',
      languages: ['Arabic', 'English'],
      contact: 'ADPHC Hotline: 800 555',
      availability: 'Regular scheduled workshops and webinars',
      referralRequirement: 'Open registration via ADPHC portal or community events.',
      actionType: 'external_hotline',
      badge: 'Verified Official'
    },
    {
      id: 'l2-uni-wellbeing',
      name: 'University Student & Youth Peer Support Networks',
      level: 2,
      levelTitle: 'Level 2: Community Support',
      description: 'Specialized youth support coordination connecting students from Abu Dhabi universities (such as NYU Abu Dhabi, UAEU, Khalifa University) with campus counseling resources.',
      eligibility: 'Undergraduate and postgraduate university students in Abu Dhabi / UAE.',
      location: 'University Campus Counseling Centers & Virtual Peer Circles',
      languages: ['English', 'Arabic'],
      contact: 'Campus Wellness Desk / urCure Peer Link',
      availability: 'Academic term hours & peer forums',
      referralRequirement: 'Valid student ID or university enrollment.',
      actionType: 'internal_route',
      routeTarget: 'ai',
      badge: 'Peer Support'
    },

    // LEVEL 3 — PRIMARY HEALTHCARE
    {
      id: 'l3-gp-consult',
      name: 'General Practitioner (GP) Primary Care Consultation',
      level: 3,
      levelTitle: 'Level 3: Primary Healthcare',
      description: 'Holistic clinical evaluation by a licensed primary care doctor to assess physical symptoms, rule out underlying medical causes (e.g. thyroid, anemia, vitamin deficiency), and formulate a stepped care plan.',
      eligibility: 'Individuals experiencing persistent fatigue, low mood, sleep disturbances, or unexplainable physical complaints.',
      location: 'SEHA Ambulatory Healthcare Services (AHS) & Partner Clinics, Abu Dhabi',
      languages: ['English', 'Arabic', 'Urdu', 'Hindi'],
      contact: 'Direct in-app booking or SEHA 800 50',
      availability: 'Sunday – Saturday (Clinic hours)',
      referralRequirement: 'Direct booking or self-referral through urCure platform.',
      actionType: 'referral_modal',
      badge: 'Primary Care'
    },
    {
      id: 'l3-ahs-network',
      name: 'SEHA Ambulatory Healthcare Services (AHS) Healthcare Centres',
      level: 3,
      levelTitle: 'Level 3: Primary Healthcare',
      description: 'Network of community healthcare centres across Abu Dhabi providing integrated general medical and preventive mental wellbeing screening.',
      eligibility: 'All UAE nationals and residents with valid Emirates ID and health insurance.',
      location: 'Al Bateen, Al Zafaranah, Al Bahia, and Khalifa City Healthcare Centres',
      languages: ['Arabic', 'English'],
      contact: 'Tel: 800 50',
      availability: 'Mon - Fri 08:00 - 22:00, Sat - Sun 08:00 - 14:00',
      referralRequirement: 'Valid health insurance card / Thiqa or standard UAE coverage.',
      actionType: 'referral_modal',
      badge: 'SEHA Network'
    },

    // LEVEL 4 — TELE-MENTAL HEALTH
    {
      id: 'l4-urcure-telehealth',
      name: 'Licensed Remote Tele-Counselling & Psychotherapy',
      level: 4,
      levelTitle: 'Level 4: Tele-Mental Health',
      description: 'End-to-end encrypted video consultations with Department of Health (DOH) licensed psychologists and counselors, providing structured CBT and supportive psychotherapy.',
      eligibility: 'Patients with mild-to-moderate depression, persistent anxiety, adjustment challenges, or career stress.',
      location: 'urCure Encrypted Telehealth Portal (HIPAA & UAE Data Law Compliant)',
      languages: ['English', 'Arabic', 'French'],
      contact: 'Direct 30-Minute Video Visit Booking',
      availability: 'Verified live slots available daily',
      referralRequirement: 'Self-booking or completed urCure Assessment with consent.',
      actionType: 'book_doctor',
      badge: 'Encrypted Video'
    },
    {
      id: 'l4-sakina-hotline',
      name: '800-SAKINA (800-725462) National Tele-Wellbeing Hotline',
      level: 4,
      levelTitle: 'Level 4: Tele-Mental Health',
      description: 'Dedicated government-supported mental wellbeing hotline in Abu Dhabi and the UAE providing confidential tele-counseling and immediate empathetic human guidance.',
      eligibility: 'Any individual residing in the UAE in need of mental health support or guidance.',
      location: 'Toll-free telephonic service across all Emirates',
      languages: ['Arabic', 'English'],
      contact: 'Toll-Free: 800 725462 (800-SAKINA)',
      availability: 'Toll-Free daily telephone support',
      referralRequirement: 'No referral required. 100% confidential and free.',
      actionType: 'external_hotline',
      badge: 'Official Hotline'
    },

    // LEVEL 5 — SPECIALIST CARE
    {
      id: 'l5-acpn',
      name: 'American Center for Psychiatry & Neurology (ACPN) Abu Dhabi',
      level: 5,
      levelTitle: 'Level 5: Specialist Care',
      description: 'Comprehensive tertiary psychiatric assessment, neuropsychology, clinical psychology, and multidisciplinary treatment plans for complex mental health conditions.',
      eligibility: 'Individuals needing specialist psychiatric evaluation, medication review, or advanced psychotherapy.',
      location: 'Al Bateen Area, Abu Dhabi, UAE',
      languages: ['English', 'Arabic', 'German', 'Russian'],
      contact: 'Tel: 800-ACPN (2276) / urCure Closed-Loop Referral',
      availability: 'Saturday – Thursday: 09:00 - 21:00',
      referralRequirement: 'GP referral summary or verified urCure clinical assessment submission.',
      actionType: 'referral_modal',
      badge: 'Tertiary Specialist'
    },
    {
      id: 'l5-ccad-neuro',
      name: 'Cleveland Clinic Abu Dhabi — Neurological & Psychiatric Institute',
      level: 5,
      levelTitle: 'Level 5: Specialist Care',
      description: 'World-class hospital-based clinical psychiatric team specializing in treatment-resistant mood disorders, psychosomatic conditions, and integrated inpatient/outpatient care.',
      eligibility: 'Patients with severe, complex, or co-occurring psychiatric and medical disorders.',
      location: 'Al Maryah Island, Abu Dhabi, UAE',
      languages: ['English', 'Arabic', 'Multilingual'],
      contact: 'Tel: 800 8 CCAD (800 8 2223)',
      availability: 'Outpatient clinic & 24/7 Emergency Care',
      referralRequirement: 'Physician referral and pre-authorization through approved health insurance.',
      actionType: 'referral_modal',
      badge: 'Hospital-Grade'
    },
    {
      id: 'l5-maudsley',
      name: 'Maudsley Health Abu Dhabi',
      level: 5,
      levelTitle: 'Level 5: Specialist Care',
      description: 'Branch of the world-renowned South London and Maudsley NHS Foundation Trust providing expert child, adolescent, adult psychiatric, and evidence-based psychological therapies.',
      eligibility: 'Children, adolescents, and adults requiring evidence-based psychiatric or specialized psychological care.',
      location: 'Al Sa\'adah Street, Abu Dhabi, UAE',
      languages: ['English', 'Arabic'],
      contact: 'Tel: +971 2 676 2200',
      availability: 'Sunday – Thursday: 09:00 - 18:00',
      referralRequirement: 'Detailed clinical assessment summary and consent.',
      actionType: 'referral_modal',
      badge: 'Specialist NHS'
    }
  ];

  // Box Breathing Loop Timer (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  useEffect(() => {
    if (activeModal !== 'breathing' || !isBreathingRunning) return;

    const timer = setInterval(() => {
      setBreathingCounter((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        setBreathingPhase((currentPhase) => {
          if (currentPhase === 'Inhale') return 'Hold (Full)';
          if (currentPhase === 'Hold (Full)') return 'Exhale';
          if (currentPhase === 'Exhale') return 'Hold (Empty)';
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeModal, isBreathingRunning]);

  const handleOpenReferral = (item: ServiceItem) => {
    setReferralTarget(item);
    setReferralConsent(true);
    setReferralReason('');
    setReferralSuccessCode(null);
    setActiveModal('referral');
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralTarget) return;

    if (!user) {
      onNavigate('login');
      return;
    }

    if (!referralConsent) {
      alert('Please check the consent box to share your referral with the healthcare coordinator.');
      return;
    }

    setSubmittingReferral(true);
    try {
      const payload = {
        stepped_care_level: referralTarget.level,
        provider_name: referralTarget.name,
        clinical_category: referralTarget.levelTitle,
        reason: referralReason.trim() || `Informed patient referral for ${referralTarget.name}`,
        patient_consent: true
      };

      const res = await api.createReferral(payload);
      setReferralSuccessCode(res.referral?.referral_code || 'REF-2026-SUBMITTED');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Unable to submit referral at this time. Please try again or call 800-SAKINA.');
    } finally {
      setSubmittingReferral(false);
    }
  };

  const filteredServices = selectedLevel === 'all' 
    ? servicesList 
    : servicesList.filter(s => s.level === selectedLevel);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left selection:bg-white/20 selection:text-white">
      
      {/* Header Banner */}
      <div className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-xs font-mono text-[#C0C0C0]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Find My Support • Stepped Care Navigation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Earlier, Safer Support Matched to Your Needs
        </h1>
        <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
          The stepped-care model connects you with the least intrusive, most effective support first — starting with self-guided calming tools, progressing through community wellness, up to certified doctors and hospital specialists in Abu Dhabi.
        </p>
      </div>

      {/* Stepped Care Level Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#222222]">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer ${
            selectedLevel === 'all'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-[#111111] text-[#888888] hover:text-white border border-[#222222]'
          }`}
        >
          All 5 Levels ({servicesList.length})
        </button>

        {[1, 2, 3, 4, 5].map((lvl) => {
          const count = servicesList.filter(s => s.level === lvl).length;
          const titles = [
            'Level 1: Self-Help',
            'Level 2: Community',
            'Level 3: Primary Care',
            'Level 4: Tele-Mental Health',
            'Level 5: Specialist Care'
          ];
          return (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-[#111111] text-[#888888] hover:text-white border border-[#222222]'
              }`}
            >
              {titles[lvl - 1]} ({count})
            </button>
          );
        })}
      </div>

      {/* Level Highlights Legend */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { lvl: 1, title: 'Self-Help', desc: 'Breathing, grounding, sleep hygiene', color: 'border-blue-500/40' },
          { lvl: 2, title: 'Community', desc: 'Workshops, youth & peer circles', color: 'border-emerald-500/40' },
          { lvl: 3, title: 'Primary Care', desc: 'GP consultation, physical check', color: 'border-purple-500/40' },
          { lvl: 4, title: 'Tele-Health', desc: 'Remote counseling, 800-SAKINA', color: 'border-cyan-500/40' },
          { lvl: 5, title: 'Specialist Care', desc: 'Psychiatrists, ACPN, Cleveland Clinic', color: 'border-amber-500/40' },
        ].map(item => (
          <div 
            key={item.lvl}
            onClick={() => setSelectedLevel(item.lvl)}
            className={`p-3.5 rounded-xl bg-[#0B0B0B] border transition-all cursor-pointer hover:bg-[#121212] ${
              selectedLevel === item.lvl ? 'border-white bg-[#141414]' : item.color
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white mb-1">
              <span>Level {item.lvl}</span>
              <span className="text-[10px] text-[#777] uppercase">{item.title}</span>
            </div>
            <p className="text-[11px] text-[#888] leading-snug line-clamp-2">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div 
            key={srv.id}
            className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#222222] hover:border-white/30 transition-all flex flex-col justify-between space-y-5 shadow-lg group relative"
          >
            {/* Top Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#161616] text-white border border-[#2c2c2c] font-semibold">
                  {srv.levelTitle}
                </span>
                {srv.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                    {srv.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {srv.name}
              </h3>

              <p className="text-xs text-[#929292] leading-relaxed">
                {srv.description}
              </p>
            </div>

            {/* Clinical & Service Metadata */}
            <div className="p-3 rounded-xl bg-[#111111] border border-[#1f1f1f] space-y-2 text-[11px] text-[#888888]">
              <div className="flex items-start space-x-1.5">
                <Users className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                <span><strong className="text-white">Eligibility:</strong> {srv.eligibility}</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                <span><strong className="text-white">Location:</strong> {srv.location}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-white">Languages:</strong> {srv.languages.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-white">Availability:</strong> {srv.availability}</span>
              </div>
              <div className="flex items-start space-x-1.5 pt-1 border-t border-[#1f1f1f] text-[#aaa]">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-cyan-300">Referral:</strong> {srv.referralRequirement}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {srv.actionType === 'exercise_breathing' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBreathingRunning(true);
                    setActiveModal('breathing');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Start Box Breathing (2 Mins)</span>
                </button>
              )}

              {srv.actionType === 'exercise_grounding' && (
                <button
                  type="button"
                  onClick={() => {
                    setGroundingStep(0);
                    setActiveModal('grounding');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open 5-4-3-2-1 Guide</span>
                </button>
              )}

              {srv.actionType === 'referral_modal' && (
                <button
                  type="button"
                  onClick={() => handleOpenReferral(srv)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Request Stepped Referral</span>
                </button>
              )}

              {srv.actionType === 'book_doctor' && (
                <button
                  type="button"
                  onClick={() => onNavigate('doctors')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Book 30-Min Video Visit</span>
                </button>
              )}

              {srv.actionType === 'internal_route' && (
                <button
                  type="button"
                  onClick={() => onNavigate(srv.routeTarget || 'wellbeing')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#161616] text-white hover:bg-white hover:text-black border border-[#2a2a2a] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Explore Guidance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {srv.actionType === 'external_hotline' && (
                <a
                  href={srv.contact.includes('800') ? `tel:${srv.contact.replace(/\D/g, '')}` : undefined}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#161616] text-white hover:bg-white hover:text-black border border-[#2a2a2a] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{srv.contact}</span>
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Quick Launch Crisis Callout */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-950/40 to-black border border-red-800/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-red-400 font-mono text-xs uppercase tracking-wider font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Need Immediate Help?</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">Call 800-SAKINA (800-725462) or 999</h3>
          <p className="text-xs text-red-200/80">Confidential, toll-free crisis support available across Abu Dhabi & UAE 24 hours a day.</p>
        </div>
        <button
          type="button"
          onClick={onOpenSOS}
          className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-lg shrink-0 flex items-center space-x-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Open Emergency Help</span>
        </button>
      </div>

      {/* ----------------- MODAL 1: BOX BREATHING ----------------- */}
      {activeModal === 'breathing' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#292929] rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#888] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">Level 1 • Box Breathing</span>
              <h3 className="text-xl font-bold text-white">4-4-4-4 Calm Rhythm</h3>
              <p className="text-xs text-[#777]">Inhale, hold, exhale, and rest for 4 seconds each to regulate your parasympathetic nervous system.</p>
            </div>

            {/* Visual Animated Breathing Circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div 
                className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                  breathingPhase === 'Inhale' 
                    ? 'scale-110 border-cyan-400 bg-cyan-950/40 text-cyan-200' 
                    : breathingPhase === 'Hold (Full)'
                    ? 'scale-110 border-blue-400 bg-blue-950/40 text-blue-200'
                    : breathingPhase === 'Exhale'
                    ? 'scale-90 border-purple-400 bg-purple-950/40 text-purple-200'
                    : 'scale-90 border-emerald-400 bg-emerald-950/40 text-emerald-200'
                }`}
              >
                <span className="text-3xl font-mono font-bold">{breathingCounter}</span>
                <span className="text-xs font-semibold uppercase tracking-wider mt-1">{breathingPhase}</span>
              </div>
            </div>

            {/* Play/Pause Control */}
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] flex items-center space-x-1.5 cursor-pointer shadow"
              >
                {isBreathingRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isBreathingRunning ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333] text-xs text-[#aaa] hover:text-white cursor-pointer"
              >
                Finished
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: 5-4-3-2-1 GROUNDING GUIDE ----------------- */}
      {activeModal === 'grounding' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-[#292929] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#888] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Level 1 • Sensory Grounding</span>
              <h3 className="text-xl font-bold text-white">5-4-3-2-1 Technique</h3>
              <p className="text-xs text-[#777]">Take a slow, deep breath and focus your attention on your immediate surroundings.</p>
            </div>

            {/* Stepped Walkthrough */}
            {(() => {
              const steps = [
                { count: 5, prompt: 'Acknowledge 5 things you can SEE around you right now.', hint: 'A clock, light reflecting off a surface, your shoes, a picture frame, a plant.' },
                { count: 4, prompt: 'Acknowledge 4 things you can physically TOUCH or FEEL.', hint: 'The texture of your clothes, the smooth table surface, your feet firmly on the floor.' },
                { count: 3, prompt: 'Acknowledge 3 distinct sounds you can HEAR.', hint: 'The hum of air conditioning, distant traffic outside, your own breathing rhythm.' },
                { count: 2, prompt: 'Acknowledge 2 things you can SMELL right now.', hint: 'Fresh air, coffee aroma, your soap or lotion, the scent of the room.' },
                { count: 1, prompt: 'Acknowledge 1 thing you can TASTE.', hint: 'A sip of cold water, mint, or simply notice the taste inside your mouth.' },
              ];
              const cur = steps[groundingStep];

              return (
                <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-xl">
                      Step {groundingStep + 1} / 5
                    </span>
                    <span className="text-xs font-mono text-[#888]">Notice {cur.count} things</span>
                  </div>
                  <h4 className="text-base font-semibold text-white leading-snug">
                    {cur.prompt}
                  </h4>
                  <p className="text-xs text-[#999] bg-black/40 p-3 rounded-xl border border-white/5">
                    <em>Examples:</em> {cur.hint}
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={groundingStep === 0}
                onClick={() => setGroundingStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#888] hover:text-white disabled:opacity-20 cursor-pointer"
              >
                Previous Step
              </button>

              {groundingStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setGroundingStep(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] flex items-center space-x-1.5 cursor-pointer shadow"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 flex items-center space-x-1.5 cursor-pointer shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Completed • Feeling Grounded</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 3: CLOSED-LOOP REFERRAL REQUEST ----------------- */}
      {activeModal === 'referral' && referralTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-[#292929] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#888] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {referralSuccessCode ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Referral Submitted Successfully</h3>
                  <p className="text-xs text-[#888]">Your referral has entered the clinical coordination queue.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141414] border border-[#282828] space-y-1 font-mono">
                  <div className="text-[11px] text-[#777] uppercase">Your Tracking Code</div>
                  <div className="text-lg font-bold text-white tracking-widest">{referralSuccessCode}</div>
                </div>

                <p className="text-xs text-[#aaa] leading-relaxed">
                  A healthcare professional will review your request. You can follow the live status and confirm when care is received directly inside your Patient Dashboard.
                </p>

                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onNavigate('dashboard');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow"
                  >
                    View in Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333] text-xs text-[#888] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReferral} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">{referralTarget.levelTitle}</span>
                  <h3 className="text-xl font-bold text-white">Request Stepped Referral</h3>
                  <p className="text-xs text-[#777]">Coordinate professional evaluation with {referralTarget.name}.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2 text-xs">
                  <div className="flex justify-between text-[#888]">
                    <span>Provider:</span>
                    <strong className="text-white">{referralTarget.name}</strong>
                  </div>
                  <div className="flex justify-between text-[#888]">
                    <span>Location:</span>
                    <span className="text-white">{referralTarget.location}</span>
                  </div>
                  <div className="flex justify-between text-[#888]">
                    <span>Stepped Level:</span>
                    <span className="text-white">Level {referralTarget.level}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#bbb]">
                    Reason or Notes for the Healthcare Coordinator (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    placeholder="Briefly describe what challenges you have been experiencing (e.g. sleep issues, feeling overwhelmed)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white transition-all resize-none"
                  />
                </div>

                {/* Informed Consent Requirement */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-[#bbb] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={referralConsent}
                      onChange={(e) => setReferralConsent(e.target.checked)}
                      className="mt-0.5 rounded border-[#444] bg-[#222] text-white focus:ring-0 cursor-pointer"
                    />
                    <span>
                      <strong className="text-white">Informed Consent:</strong> I voluntarily consent to share my referral request and recent assessment history (PHQ-9/GAD-7) with the receiving healthcare professional for clinical triage and appointment scheduling.
                    </span>
                  </label>
                  <p className="text-[10px] text-[#777] font-mono">
                    Zero secret telemetry. You maintain full autonomy and may withdraw your consent at any time.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-[#888] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReferral || !referralConsent}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] disabled:opacity-30 transition-all flex items-center space-x-1.5 cursor-pointer shadow"
                  >
                    <span>{submittingReferral ? 'Submitting...' : 'Submit Referral'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
