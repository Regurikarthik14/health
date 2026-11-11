import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Stethoscope, 
  Brain, 
  Video, 
  MapPin, 
  AlertCircle, 
  Sparkles, 
  CalendarCheck, 
  UserCheck, 
  HeartHandshake, 
  FileText,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { ObsidianOrbCanvas } from './ObsidianOrbCanvas';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (tab?: 'login' | 'register_patient' | 'register_doctor') => void;
  onOpenSOS: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenSOS,
}) => {
  return (
    <div className="w-full bg-[#050505] text-[#F5F5F5] overflow-hidden selection:bg-white/20 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        {/* Subtle monochrome ambient backlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Pill tag */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#292929]">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#C0C0C0]">
                Next-Gen Mental Wellbeing Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Healthcare That <br />
              <span className="metallic-text">Understands You.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#929292] font-normal leading-relaxed max-w-2xl">
              Recognize changes in your wellbeing early, discover trusted doctors, and access personalized healthcare with <strong className="text-white font-medium">urCure</strong>.
            </p>

            {/* Tagline Callout */}
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#777777]">
              "Your Health. Your Choice. Your Care."
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => onNavigate('wellbeing')}
                className="flex items-center justify-center space-x-2 px-7 py-4 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <Brain className="w-4 h-4 text-black" />
                <span>Explore Your Wellbeing</span>
                <ArrowRight className="w-4 h-4 text-black ml-1" />
              </button>

              <button
                onClick={() => onNavigate('doctors')}
                className="flex items-center justify-center space-x-2 px-7 py-4 rounded-xl text-sm font-semibold text-[#F5F5F5] bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#C0C0C0]" />
                <span>Find Your Doctor</span>
              </button>
            </div>

            {/* Trust Badges in pure monochrome */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#292929]/80">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">30-Min</div>
                <div className="text-xs text-[#929292]">Exclusive Slot Locking</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-[#929292]">Patient Doctor Choice</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">24/7</div>
                <div className="text-xs text-[#929292]">Human Crisis Escalation</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Obsidian Orb & Floating Glass HUD */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* The interactive animated Canvas */}
            <div className="w-full h-full relative">
              <ObsidianOrbCanvas />
              
              {/* Floating Glass Card 1: 30-min Lock confirmation */}
              <div className="absolute -top-4 -left-4 sm:top-6 sm:left-2 p-3.5 rounded-xl bg-[#0B0B0B]/90 backdrop-blur-xl border border-[#292929] shadow-2xl space-y-1 max-w-[210px] hidden sm:block animate-pulse-glow">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C0C0C0]">Atomic Concurrency</span>
                </div>
                <p className="text-xs text-white font-medium">Slot URC-2026-A1090 Locked Exclusively</p>
              </div>

              {/* Floating Glass Card 2: Validated AI Assessment */}
              <div className="absolute -bottom-4 -right-2 sm:bottom-6 sm:right-2 p-3.5 rounded-xl bg-[#0B0B0B]/90 backdrop-blur-xl border border-[#292929] shadow-2xl space-y-1 max-w-[220px] hidden sm:block">
                <div className="flex items-center space-x-2 text-white">
                  <Brain className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C0C0C0]">Validated PHQ-9</span>
                </div>
                <p className="text-xs text-[#F5F5F5]">Early change recognition with zero diagnostic intrusion</p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 2. ABOUT URCURE */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/40">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Brand Vision</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              A New Standard for Mental Wellbeing & Healthcare.
            </h2>
            <p className="text-[#929292] text-base sm:text-lg leading-relaxed">
              Traditional healthcare often leaves patients feeling powerless, navigating opaque waiting lists without agency over who treats them. 
              <strong> urCure</strong> restores complete patient autonomy through instant provider selection, verified medical credentials, and evidence-based early recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Early Recognition</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                Standardized, validated screening instruments allow you to detect cognitive, emotional, and stress patterns before they escalate into acute distress.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Patient-Preferred Doctors</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                You possess complete freedom to browse doctors, inspect verified Abu Dhabi Health Authority credentials, check real reviews, and choose your own clinician.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Uncompromising Privacy</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                Your wellbeing records are confidential. Identifiable clinical evaluations are strictly restricted to your treating doctor and never shared with employers or unauthorized parties.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 3. HOW IT WORKS */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">The Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">How urCure Operates</h2>
            <p className="text-sm text-[#929292]">A seamless, four-stage loop designed for safety, precision, and patient dignity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">01 / RECOGNIZE</span>
              <h4 className="text-lg font-semibold text-white">Validated Screening</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Take confidential PHQ-9, GAD-7, or PSS-10 assessments to evaluate mood, tension, and stress levels.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">02 / DISCOVER</span>
              <h4 className="text-lg font-semibold text-white">Doctor Discovery</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Filter verified specialists by specialization, language, consultation fee, and consultation modes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">03 / SECURE</span>
              <h4 className="text-lg font-semibold text-white">30-Min Instant Lock</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Choose an available slot. Atomic database transactions lock the slot exclusively with zero double bookings.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">04 / SUSTAIN</span>
              <h4 className="text-lg font-semibold text-white">Continuous Care</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Engage via encrypted video or clinic check-in. Receive doctor recommendations and automated follow-up reminders.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 4. AI WELLBEING ASSESSMENT PREVIEW */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Self-Evaluation Engine</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Clinically Validated Instruments. No Diagnostic Intrusion.
            </h2>
            <p className="text-[#929292] text-sm sm:text-base leading-relaxed">
              urCure integrates world-recognized psychometric screenings (PHQ-9 for mood, GAD-7 for anxiety, PSS-10 for perceived pressure, and WHO-5 for wellbeing vitality).
            </p>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-[#C0C0C0]" />
                <span>Strict Clinical Safety Boundaries</span>
              </div>
              <p className="text-xs text-[#929292] leading-relaxed">
                AI and automated screenings never independently diagnose illnesses or prescribe medication. All outputs are strictly educational guidance and symptom trends to facilitate human clinical care.
              </p>
            </div>

            <button
              onClick={() => onNavigate('wellbeing')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer"
            >
              <span>Take a Screening Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-6">
            {/* Assessment UI Mockup */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
                <div>
                  <h4 className="text-base font-semibold text-white">PHQ-9 Wellbeing Screening</h4>
                  <span className="text-xs text-[#929292]">Question 2 of 9</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-white/[0.05] border border-white/10 text-white">
                  Validated
                </span>
              </div>

              <p className="text-sm text-white font-medium">
                "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?"
              </p>

              <div className="grid grid-cols-2 gap-3">
                {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                      idx === 1
                        ? 'bg-white/[0.08] border-white/40 text-white'
                        : 'bg-[#0B0B0B] border-[#292929] text-[#929292] hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#777777] font-mono">
                <span>Progress: 22%</span>
                <span className="text-white">Confidential & Encrypted</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 5. FIND YOUR DOCTOR SHOWCASE */}
      <section id="doctors" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Autonomous Choice</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Verified Healthcare Specialists</h2>
              <p className="text-sm text-[#929292] max-w-xl">
                Browse verified practitioners licensed by the Department of Health (DoH) Abu Dhabi. Complete transparency in fees, credentials, and languages.
              </p>
            </div>

            <button
              onClick={() => onNavigate('doctors')}
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-white hover:text-[#C0C0C0] transition-colors"
            >
              <span>View All Doctors Directory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Doctors Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Dr. Sharma */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Priya Sharma"
                    className="w-16 h-16 rounded-xl object-cover grayscale contrast-125 border border-[#292929]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-base font-semibold text-white">Dr. Priya Sharma</h4>
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-[#929292]">Consultant Psychiatrist</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      14 Yrs Exp • 4.96 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Specialist in adult mood disorders, cognitive behavioral resilience, and psychopharmacology.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Consultation Fee:</span>
                  <span className="text-white font-semibold">AED 220 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Slot
              </button>
            </div>

            {/* Card 2: Dr. Tariq */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Tariq Al-Nuaimi"
                    className="w-16 h-16 rounded-xl object-cover grayscale contrast-125 border border-[#292929]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-base font-semibold text-white">Dr. Tariq Al-Nuaimi</h4>
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-[#929292]">Clinical Neuropsychologist</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      11 Yrs Exp • 4.92 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Expert in stress neurobiology, executive burn-out, and trauma-informed cognitive recovery.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Consultation Fee:</span>
                  <span className="text-white font-semibold">AED 180 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Slot
              </button>
            </div>

            {/* Card 3: Dr. Elena Chen */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1594824813590-72120045053f?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Elena Chen"
                    className="w-16 h-16 rounded-xl object-cover grayscale contrast-125 border border-[#292929]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-base font-semibold text-white">Dr. Elena Chen</h4>
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-[#929292]">Integrative Physician</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      9 Yrs Exp • 4.88 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Physiological intersections of gut-brain axis, endocrine stress hormones, and insomnia.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Consultation Fee:</span>
                  <span className="text-white font-semibold">AED 160 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Slot
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* 6. SMART APPOINTMENT BOOKING SYSTEM SHOWCASE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Engineering Integrity</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Exclusive 30-Minute Atomic Slot Locking.
            </h2>
            <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
              No overlapping appointments, no phantom confirmations. urCure uses database transactions with concurrency-safe locking to reserve your preferred 30-minute consultation slot exclusively.
            </p>
          </div>

          {/* Schedule Demonstration Table (Matching prompt's Dr. Sharma example) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#292929] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292929]">
              <div>
                <span className="text-xs font-mono uppercase text-[#777777]">Live Schedule Simulation</span>
                <h4 className="text-base font-semibold text-white">Dr. Priya Sharma • Working Hours: 09:00 AM – 01:00 PM</h4>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white/[0.1] border border-white/30" />
                  <span className="text-white">Available</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1A1A1A] border border-[#333]" />
                  <span className="text-[#777777]">Booked (Exclusive Lock)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { time: '09:00 – 09:30', status: 'Booked', action: 'Locked' },
                { time: '09:30 – 10:00', status: 'Booked', action: 'Locked' },
                { time: '10:00 – 10:30', status: 'Available', action: 'Select' },
                { time: '10:30 – 11:00', status: 'Available', action: 'Select' },
                { time: '11:00 – 11:30', status: 'Booked', action: 'Locked' },
                { time: '11:30 – 12:00', status: 'Available', action: 'Select' },
              ].map((slot, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (slot.status === 'Available') onNavigate('doctors');
                  }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    slot.status === 'Available'
                      ? 'bg-white/[0.04] border-white/20 hover:border-white hover:bg-white/10 cursor-pointer'
                      : 'bg-[#0B0B0B] border-[#222222] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-2 text-[#C0C0C0]" />
                  <p className="text-xs font-mono text-white font-medium">{slot.time}</p>
                  <div className="mt-2 text-[10px] uppercase font-mono tracking-wider">
                    {slot.status === 'Available' ? (
                      <span className="text-white font-bold">Select Slot</span>
                    ) : (
                      <span className="text-[#666666]">Reserved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#777777] font-mono">
              * If two users attempt simultaneous reservation, database serializable transactions grant the slot to the first request while returning a graceful conflict notification to the other.
            </p>
          </div>

        </div>
      </section>


      {/* 7. ONLINE AND OFFLINE CONSULTATION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Dual Care Modalities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Online Video & In-Person Clinic Visits
            </h2>
            <p className="text-sm text-[#929292]">
              Choose the consultation medium that matches your comfort, location, and clinical requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Online */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Online Telehealth Consultation</h3>
                  <p className="text-xs text-[#929292]">Encrypted peer-to-peer browser video</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#929292]">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Instant 1-click room access with unique booking reference</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Real-time duration countdown and consultation summary notes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Automated follow-up scheduling and care recommendations</span>
                </li>
              </ul>
            </div>

            {/* Offline */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">In-Person Clinic Visits</h3>
                  <p className="text-xs text-[#929292]">Abu Dhabi medical centers & clinics</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#929292]">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Precise clinic addresses, GPS coordinates, and arrival instructions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Digital check-in confirmation upon arrival</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Full confidentiality in clinical intake procedures</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>


      {/* 8. PRIVACY AND SECURITY */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Compliance & Integrity</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Sovereign Health Data Privacy
            </h2>
            <p className="text-sm text-[#929292]">
              Designed in alignment with UAE health data protection guidelines and international standards for patient medical confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <Lock className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">End-to-End Encryption</h4>
              <p className="text-xs text-[#929292]">Encrypted data in transit and at rest with robust key isolation.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Strict Role Separation</h4>
              <p className="text-xs text-[#929292]">Administrators cannot view private patient clinical diagnosis records.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <HeartHandshake className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Zero Employer Tracking</h4>
              <p className="text-xs text-[#929292]">Patient wellbeing data is never monetized or exposed to employers.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <FileText className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Comprehensive Audit Logs</h4>
              <p className="text-xs text-[#929292]">Immutable logging of authentication, scheduling, and consent events.</p>
            </div>
          </div>

        </div>
      </section>


      {/* 9. EMERGENCY SUPPORT CALLOUT */}
      <section id="emergency" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>24/7 Human Emergency Escalation</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                In Acute Distress? Immediate Human Care is Here.
              </h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                A patient in immediate danger must never be made to wait for an ordinary appointment. 
                Our platform provides direct connection to Abu Dhabi & UAE emergency hotlines and crisis responders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onOpenSOS}
                className="px-6 py-4 rounded-xl text-sm font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-black" />
                <span>Open Emergency Support</span>
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* 10. FOOTER */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#929292]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-[#111111] border border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">urCure</span>
              </div>
              <p className="text-xs leading-relaxed text-[#777777]">
                "Your Health. Your Choice. Your Care."
              </p>
              <p className="text-xs text-[#777777]">
                A pure obsidian monochrome healthcare platform empowering patient autonomy, validated wellbeing recognition, and instant 30-minute bookings.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Platform</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onNavigate('wellbeing')} className="hover:text-white transition-colors">Wellbeing Assessment</button></li>
                <li><button onClick={() => onNavigate('doctors')} className="hover:text-white transition-colors">Doctor Discovery</button></li>
                <li><button onClick={() => onNavigate('patient-dashboard')} className="hover:text-white transition-colors">Patient Portal</button></li>
                <li><button onClick={() => onNavigate('doctor-dashboard')} className="hover:text-white transition-colors">Doctor Portal</button></li>
                <li><button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors">Admin Governance</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">UAE Emergency Hotlines</h5>
              <ul className="space-y-2 text-xs font-mono">
                <li className="text-[#C0C0C0]">Police: 999</li>
                <li className="text-[#C0C0C0]">Ambulance: 998</li>
                <li className="text-[#C0C0C0]">DoH Estijaba: 800 1717</li>
                <li className="text-[#C0C0C0]">Mental Health HOPE: 800-4673</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Clinical Disclaimer</h5>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                urCure screening instruments and AI assistant tools provide educational support and do not constitute independent medical diagnoses. Treatment decisions remain strictly under licensed medical professionals.
              </p>
            </div>

          </div>

          <div className="pt-8 border-t border-[#292929] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666]">
            <span>© {new Date().getFullYear()} urCure Health Systems. All rights reserved. Abu Dhabi, United Arab Emirates.</span>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Charter</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">DoH Compliance</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
