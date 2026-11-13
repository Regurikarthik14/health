import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  Stethoscope,
  Brain,
  FileText
} from 'lucide-react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
  onOpenSOS: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigate,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left selection:bg-white/20 selection:text-white">
      
      {/* Hero / Vision */}
      <div className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-xs font-mono text-[#C0C0C0]">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Our Promise to You</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          "Your Health. Your Choice. Your Care."
        </h1>
        <p className="text-base sm:text-lg text-[#929292] leading-relaxed">
          urCure is an easy-to-use healthcare service created in Abu Dhabi, United Arab Emirates. 
          We believe seeing a doctor should be simple, fair, and private. You choose the doctor you want to see, pick a time that works for you, and check how you are feeling without any complicated words or surprise costs.
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pillar 1 */}
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222222] space-y-4 hover:border-white/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">You Choose Your Own Doctor</h3>
          <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
            Many hospitals assign a doctor you have never seen before. On urCure, you are in charge: look through certified doctors, check their experience and prices, and pick the doctor you feel most comfortable talking to.
          </p>
          <div className="pt-2 text-xs font-mono text-[#C0C0C0]">
            ✓ Certified by Abu Dhabi Health Authority
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222222] space-y-4 hover:border-white/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Simple Self-Checks for Peace of Mind</h3>
          <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
            We use easy, 2-minute questions to help you see if you are carrying too much stress, sadness, or worry. It helps you notice how you feel early so you can rest and get support before it becomes overwhelming.
          </p>
          <div className="pt-2 text-xs font-mono text-[#C0C0C0]">
            ✓ Friendly, Helpful Personal Advice
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222222] space-y-4 hover:border-white/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Notes Stay 100% Private</h3>
          <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
            Your health records are completely private. Only your doctor can see your notes. We never sell your information, and we never share anything with your employers or insurance salespeople.
          </p>
          <div className="pt-2 text-xs font-mono text-[#C0C0C0]">
            ✓ Strict UAE Patient Privacy Protection
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222222] space-y-4 hover:border-white/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">24/7 Free Emergency Support</h3>
          <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
            If you ever feel unsafe or need urgent help, you never have to wait for an appointment. Free emergency hotlines are always available with 1 tap: Police (999), Ambulance (998), and Estijaba (800 1717).
          </p>
          <div className="pt-2 text-xs font-mono text-[#C0C0C0]">
            ✓ 24/7 Free Helpline Calls
          </div>
        </div>

      </div>

      {/* Clinical Disclaimer Section */}
      <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] space-y-4">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <FileText className="w-4 h-4 text-[#C0C0C0]" />
          <span>Important Note About Our Quizzes & AI Helper</span>
        </div>
        <p className="text-xs text-[#929292] leading-relaxed">
          The mood self-checks and AI helper on urCure are made to help you understand your feelings and prepare for visits. 
          They give helpful advice, but they do not replace a visit with a licensed human doctor. If you feel sick or need medical treatment, please talk directly with a certified doctor. In an emergency, always call 999 immediately.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button
          onClick={() => onNavigate('doctors')}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Find a Doctor</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('wellbeing')}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-xs font-semibold text-white bg-[#111111] border border-[#2a2a2a] hover:border-white/40 transition-all cursor-pointer"
        >
          <Brain className="w-4 h-4" />
          <span>Check How You Feel</span>
        </button>
      </div>

    </div>
  );
};
