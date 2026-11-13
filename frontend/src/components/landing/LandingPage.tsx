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
  UserCheck, 
  HeartHandshake, 
  FileText,
  ChevronRight,
  PhoneCall,
  Bot
} from 'lucide-react';
import { ObsidianOrbCanvas } from './ObsidianOrbCanvas';
import { UrCureLogo } from '../common/UrCureLogo';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (
    tab?: 'login' | 'register_patient' | 'register_doctor',
    portalMode?: 'patient' | 'doctor'
  ) => void;
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
      <section className="relative min-h-[88vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        {/* Subtle monochrome ambient backlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Pill tag */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#292929]">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#C0C0C0]">
                Simple & Friendly Healthcare
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Healthcare Made <br />
              <span className="metallic-text">Simple For You.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#929292] font-normal leading-relaxed max-w-2xl">
              Check how you feel, choose a certified doctor you like, and book a private 30-minute visit with <strong className="text-white font-medium">urCure</strong>.
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
                <span>Check Your Mood</span>
                <ArrowRight className="w-4 h-4 text-black ml-1" />
              </button>

              <button
                onClick={() => onNavigate('doctors')}
                className="flex items-center justify-center space-x-2 px-7 py-4 rounded-xl text-sm font-semibold text-[#F5F5F5] bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#C0C0C0]" />
                <span>Find a Doctor</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#292929]/80">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">30 Mins</div>
                <div className="text-xs text-[#929292]">Private Doctor Visit</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-[#929292]">You Choose Your Doctor</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">24/7</div>
                <div className="text-xs text-[#929292]">Free Emergency Helpline</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Obsidian Orb & Floating Glass HUD */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full h-full relative">
              <ObsidianOrbCanvas />
              
              {/* Floating Glass Card 1 */}
              <div className="absolute -top-4 -left-4 sm:top-6 sm:left-2 p-3.5 rounded-xl bg-[#0B0B0B]/90 backdrop-blur-xl border border-[#292929] shadow-2xl space-y-1 max-w-[210px] hidden sm:block">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C0C0C0]">Guaranteed Time</span>
                </div>
                <p className="text-xs text-white font-medium">Your 30-min visit is safely locked for you</p>
              </div>

              {/* Floating Glass Card 2 */}
              <div className="absolute -bottom-4 -right-2 sm:bottom-6 sm:right-2 p-3.5 rounded-xl bg-[#0B0B0B]/90 backdrop-blur-xl border border-[#292929] shadow-2xl space-y-1 max-w-[220px] hidden sm:block">
                <div className="flex items-center space-x-2 text-white">
                  <Brain className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C0C0C0]">Quick Mood Quiz</span>
                </div>
                <p className="text-xs text-[#F5F5F5]">Understand how you feel in 2 minutes</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SYSTEMATIC PLATFORM FEATURE HUB */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#080808]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#2a2a2a] text-xs font-mono text-[#C0C0C0]">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>Everything in One Place</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                All Platform Features, In Clear Order.
              </h2>
              <p className="text-xs sm:text-sm text-[#888888] max-w-xl">
                Easy tools to check your mood, find trusted doctors, relax your mind, and get help anytime.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-[#777] hidden sm:inline">Need quick guidance?</span>
              <button
                onClick={() => onNavigate('ai')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-white" />
                <span>Ask AI Helper</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1: Find Doctors & 30-Min Booking */}
            <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#262626] hover:border-white/40 transition-all flex flex-col justify-between space-y-5 text-left group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                    01 • DOCTORS
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Find Doctors & Book</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Browse certified real doctors, pick who you want to see, and book a private 30-minute visit with no waiting in line.
                </p>
                <ul className="text-[11px] text-[#777] space-y-1 font-mono">
                  <li>• Guaranteed 1-on-1 time</li>
                  <li>• Video calls or clinic visits</li>
                  <li>• Save to phone calendar</li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Browse Doctors</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Feature 2: Validated Psychometrics */}
            <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#262626] hover:border-white/40 transition-all flex flex-col justify-between space-y-5 text-left group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                    02 • SELF CHECK
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Quick Mood Check</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Answer a few simple questions to see if you have low mood, worry, or stress, and get gentle advice to feel better.
                </p>
                <ul className="text-[11px] text-[#777] space-y-1 font-mono">
                  <li>• Quick 2-minute questions</li>
                  <li>• See your score over time</li>
                  <li>• Private & helpful advice</li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('wellbeing')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.08] text-white hover:bg-white hover:text-black border border-white/15 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Start Mood Check</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Feature 3: AI Assistant & Box Breathing */}
            <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#262626] hover:border-white/40 transition-all flex flex-col justify-between space-y-5 text-left group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                    03 • AI HELPER
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">AI Helper & Breathing</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Talk with a friendly AI helper anytime, follow a calm breathing exercise to relax, and find the right doctor for your symptoms.
                </p>
                <ul className="text-[11px] text-[#777] space-y-1 font-mono">
                  <li>• Slow breathing exercise to relax</li>
                  <li>• Find the right doctor for you</li>
                  <li>• Friendly answers 24/7</li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('ai')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.08] text-white hover:bg-white hover:text-black border border-white/15 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Talk with AI Helper</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Feature 4: Emergency SOS & Hotlines */}
            <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#262626] hover:border-white/40 transition-all flex flex-col justify-between space-y-5 text-left group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                    04 • EMERGENCY
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Emergency Help Numbers</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  If you need urgent help or feel unsafe, tap SOS to see free emergency phone numbers you can call right away.
                </p>
                <ul className="text-[11px] text-[#777] space-y-1 font-mono">
                  <li>• Real human help day & night</li>
                  <li>• Free phone calls in UAE</li>
                  <li>• Police, ambulance, and hospital</li>
                </ul>
              </div>
              <button
                onClick={onOpenSOS}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.08] text-white hover:bg-white hover:text-black border border-white/15 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>See Emergency Numbers</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT URCURE */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/40">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Our Promise</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Healthcare Made Simple & Fair.
            </h2>
            <p className="text-[#929292] text-base sm:text-lg leading-relaxed">
              Going to the doctor should never feel confusing or stressful. 
              <strong> urCure</strong> gives you complete freedom to pick your own doctor, see clear prices, and check your feelings in complete privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Know How You Feel</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                Simple, quick questions help you notice stress or low mood early, before it becomes too heavy to carry.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">You Choose Your Doctor</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                Browse verified real doctors in Abu Dhabi, see their experience and fees, and pick the person you feel best with.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[#292929] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">100% Private</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                Your medical notes stay strictly between you and your doctor. They are never shared with bosses or employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Simple Steps</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">How urCure Works</h2>
            <p className="text-sm text-[#929292]">Four easy steps to get the care you need.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">STEP 01</span>
              <h4 className="text-lg font-semibold text-white">Quick Check-in</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Answer simple questions to see how your mood, energy, and stress levels have been.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">STEP 02</span>
              <h4 className="text-lg font-semibold text-white">Pick Your Doctor</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Search licensed specialists by language, fee, and whether you prefer video or in-person visits.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">STEP 03</span>
              <h4 className="text-lg font-semibold text-white">Lock Your 30 Mins</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Pick a time slot. It is instantly reserved just for you, with zero double-booking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B0B0B] border border-[#292929] space-y-3 relative group hover:border-[#C0C0C0]/50 transition-all">
              <span className="font-mono text-xs text-[#777777]">STEP 04</span>
              <h4 className="text-lg font-semibold text-white">Feel Better</h4>
              <p className="text-xs text-[#929292] leading-relaxed">
                Join a video call or visit the clinic. Get friendly advice and follow-up reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI WELLBEING ASSESSMENT PREVIEW */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Easy Self-Check</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Simple Questions. Clear & Friendly Advice.
            </h2>
            <p className="text-[#929292] text-sm sm:text-base leading-relaxed">
              urCure helps you understand your feelings with simple 2-minute questions about mood, worry, and stress.
            </p>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-[#C0C0C0]" />
                <span>Safe & Friendly Guidance</span>
              </div>
              <p className="text-xs text-[#929292] leading-relaxed">
                This self-check does not give a medical diagnosis or prescribe medicine. It is a helpful guide to understand your feelings before speaking with a doctor.
              </p>
            </div>

            <button
              onClick={() => onNavigate('wellbeing')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer"
            >
              <span>Take a 2-Minute Mood Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-6">
            {/* Assessment UI Mockup */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
                <div>
                  <h4 className="text-base font-semibold text-white">Simple Mood Check</h4>
                  <span className="text-xs text-[#929292]">Question 2 of 9</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-white/[0.05] border border-white/10 text-white">
                  Easy Quiz
                </span>
              </div>

              <p className="text-sm text-white font-medium">
                "Over the last 2 weeks, how often have you felt down, sad, or like you had little energy?"
              </p>

              <div className="grid grid-cols-2 gap-3">
                {['Not at all', 'A few days', 'More than half the days', 'Nearly every day'].map((opt, idx) => (
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
                <span className="text-white">100% Private</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FIND YOUR DOCTOR SHOWCASE */}
      <section id="doctors" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Certified Doctors</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Real Healthcare Doctors</h2>
              <p className="text-sm text-[#929292] max-w-xl">
                Browse certified doctors licensed in Abu Dhabi. See clear visit fees, languages spoken, and real reviews.
              </p>
            </div>

            <button
              onClick={() => onNavigate('doctors')}
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-white hover:text-[#C0C0C0] transition-colors"
            >
              <span>See All Doctors</span>
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
                    <p className="text-xs text-[#929292]">Mind & Mood Doctor</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      14 Yrs Exp • 4.96 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Helps with sadness, heavy worry, stress, and medications to help you feel your best.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Visit Price:</span>
                  <span className="text-white font-semibold">AED 220 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Visit
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
                    <p className="text-xs text-[#929292]">Stress & Burnout Doctor</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      11 Yrs Exp • 4.92 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Helps with work burnout, panic, heavy tension, and regaining peace of mind.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Visit Price:</span>
                  <span className="text-white font-semibold">AED 180 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Visit
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
                    <p className="text-xs text-[#929292]">Health & Sleep Doctor</p>
                    <span className="inline-block mt-1 text-[11px] font-mono text-[#C0C0C0]">
                      9 Yrs Exp • 4.88 ★
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#929292] line-clamp-2">
                  Helps with poor sleep, tired body feelings, stomach stress, and healthy everyday habits.
                </p>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-[#292929]">
                  <span className="text-[#777777]">Visit Price:</span>
                  <span className="text-white font-semibold">AED 160 / 30 Min</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('doctors')}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black transition-all border border-white/10"
              >
                Book 30-Min Visit
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. SMART APPOINTMENT BOOKING SYSTEM SHOWCASE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">No Waiting In Line</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Guaranteed 30-Minute Private Visits.
            </h2>
            <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
              No double-booking. When you pick a time, that 30-minute slot is reserved 100% just for you and your doctor.
            </p>
          </div>

          {/* Schedule Demonstration Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#292929] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292929]">
              <div>
                <span className="text-xs font-mono uppercase text-[#777777]">Sample Doctor Schedule</span>
                <h4 className="text-base font-semibold text-white">Dr. Priya Sharma • Office Hours: 09:00 AM – 01:00 PM</h4>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white/[0.1] border border-white/30" />
                  <span className="text-white">Available Time</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1A1A1A] border border-[#333]" />
                  <span className="text-[#777777]">Booked (Taken)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { time: '09:00 – 09:30', status: 'Booked' },
                { time: '09:30 – 10:00', status: 'Booked' },
                { time: '10:00 – 10:30', status: 'Available' },
                { time: '10:30 – 11:00', status: 'Available' },
                { time: '11:00 – 11:30', status: 'Booked' },
                { time: '11:30 – 12:00', status: 'Available' },
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
                      <span className="text-white font-bold">Pick This Time</span>
                    ) : (
                      <span className="text-[#666666]">Reserved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#777777] font-mono">
              * The instant you confirm your visit, nobody else can take your time slot.
            </p>
          </div>

        </div>
      </section>

      {/* 8. ONLINE AND OFFLINE CONSULTATION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Two Easy Ways</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Online Video Call or In-Person Clinic Visit
            </h2>
            <p className="text-sm text-[#929292]">
              Choose how you want to meet your doctor. Both options are easy, private, and comfortable.
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
                  <h3 className="text-xl font-semibold text-white">Online Video Call</h3>
                  <p className="text-xs text-[#929292]">Talk directly in your web browser</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#929292]">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Join with 1 click from your phone or laptop</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Clear timer so you know how much time you have</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Get helpful doctor notes and care advice right after</span>
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
                  <h3 className="text-xl font-semibold text-white">In-Person Clinic Visit</h3>
                  <p className="text-xs text-[#929292]">Licensed medical clinics in Abu Dhabi</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#929292]">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Exact clinic address and map directions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Fast and easy check-in when you arrive</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Quiet and private examination rooms</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 9. PRIVACY AND SECURITY */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#0B0B0B]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">Your Privacy</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Your Health Information is 100% Private
            </h2>
            <p className="text-sm text-[#929292]">
              We strictly follow UAE patient privacy rules to keep your information safe and confidential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <Lock className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Fully Encrypted</h4>
              <p className="text-xs text-[#929292]">Your messages and details are locked securely.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Doctor Eyes Only</h4>
              <p className="text-xs text-[#929292]">Only your treating doctor can read your diagnosis notes.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <HeartHandshake className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Never Sold</h4>
              <p className="text-xs text-[#929292]">We never sell your data or show it to employers.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
              <FileText className="w-5 h-5 text-white" />
              <h4 className="text-sm font-semibold text-white">Clear & Honest</h4>
              <p className="text-xs text-[#929292]">Every appointment is safely recorded for your peace of mind.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 10. EMERGENCY SUPPORT CALLOUT */}
      <section id="emergency" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#292929] bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Free 24/7 Phone Numbers</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Need Help Right Now? Friendly Human Help is Here.
              </h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                If you feel unsafe or in pain, please do not wait for an appointment. 
                Call these free numbers right now to speak with trained doctors and emergency staff.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onOpenSOS}
                className="px-6 py-4 rounded-xl text-sm font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-black" />
                <span>See Emergency Phone Numbers</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#929292]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <UrCureLogo 
                size="sm" 
                showTagline={false} 
                onClick={() => onNavigate('landing')} 
              />
              <p className="text-xs leading-relaxed text-[#777777]">
                "Your Health. Your Choice. Your Care."
              </p>
              <p className="text-xs text-[#777777]">
                A simple healthcare platform where you choose your doctor, check your mood, and book private 30-minute visits.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Quick Links</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onNavigate('wellbeing')} className="hover:text-white transition-colors cursor-pointer">Check Mood</button></li>
                <li><button onClick={() => onNavigate('doctors')} className="hover:text-white transition-colors cursor-pointer">Find Doctors</button></li>
                <li><button onClick={() => onNavigate('ai')} className="hover:text-white transition-colors cursor-pointer">AI Helper</button></li>
                <li><button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Our Services</button></li>
                <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Free Emergency Numbers</h5>
              <ul className="space-y-2 text-xs font-mono">
                <li className="text-[#C0C0C0]">Police: 999</li>
                <li className="text-[#C0C0C0]">Ambulance: 998</li>
                <li className="text-[#C0C0C0]">Estijaba Health Helpline: 800 1717</li>
                <li className="text-[#C0C0C0]">HOPE Emotional Support: 800-4673</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Please Note</h5>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Our mood check and AI helper give you friendly personal advice. They do not replace a visit with a real doctor. If you are sick or hurt, please see a certified doctor.
              </p>
            </div>

          </div>

          <div className="pt-8 border-t border-[#292929] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666]">
            <span>© {new Date().getFullYear()} urCure Health. Abu Dhabi, United Arab Emirates.</span>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Terms</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Doctor Standards</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
