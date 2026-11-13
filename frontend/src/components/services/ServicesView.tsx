import React from 'react';
import { 
  Clock, 
  Brain, 
  Bot, 
  Video, 
  MapPin, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  Lock, 
  HeartHandshake, 
  Activity, 
  Sparkles,
  FileText
} from 'lucide-react';

interface ServicesViewProps {
  onNavigate: (view: string) => void;
  onOpenBooking: () => void;
  onOpenSOS: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onNavigate,
  onOpenSOS
}) => {
  const serviceCategories = [
    {
      category: '1. Meeting with a Doctor',
      tag: 'Certified Doctors',
      description: 'Find trusted doctors in Abu Dhabi and book a private visit with no waiting in line.',
      services: [
        {
          title: 'Private 30-Minute Appointments',
          desc: 'Pick any time that works for you. That 30-minute time slot is reserved 100% just for you and your doctor.',
          icon: Clock,
          ctaText: 'Find Doctors & Book',
          action: () => onNavigate('doctors'),
          badge: 'Guaranteed Time'
        },
        {
          title: 'Online Video Calls with Doctors',
          desc: 'Talk with your doctor from home using a safe, private video call right on your phone or laptop.',
          icon: Video,
          ctaText: 'See Available Doctors',
          action: () => onNavigate('doctors'),
          badge: 'From Home'
        },
        {
          title: 'In-Person Clinic Visits',
          desc: 'Visit a clean, licensed clinic in Abu Dhabi. We provide clear addresses, map directions, and fast check-in.',
          icon: MapPin,
          ctaText: 'See Clinic Locations',
          action: () => onNavigate('doctors'),
          badge: 'Abu Dhabi'
        }
      ]
    },
    {
      category: '2. Check How You Are Feeling',
      tag: 'Easy Quizzes',
      description: 'Simple 2-minute questions to help you see how your mood, energy, and stress have been.',
      services: [
        {
          title: 'Quick Mood Check',
          desc: 'Answer a few simple questions to see if you have low mood or sadness, and get gentle steps to feel better.',
          icon: Brain,
          ctaText: 'Start Mood Check',
          action: () => onNavigate('wellbeing'),
          badge: 'Takes 2 Mins'
        },
        {
          title: 'Worry & Stress Check',
          desc: 'Check if you have too much anxiety, worry, or daily pressure before it becomes too heavy to handle.',
          icon: Activity,
          ctaText: 'Check Your Stress',
          action: () => onNavigate('wellbeing'),
          badge: 'Stress Test'
        },
        {
          title: 'Daily Mood & Sleep Tracker',
          desc: 'Save how you feel each day with a simple 1-to-5 star rating and see your progress over weeks.',
          icon: Sparkles,
          ctaText: 'Save Today\'s Mood',
          action: () => onNavigate('wellbeing'),
          badge: 'Daily Tracker'
        }
      ]
    },
    {
      category: '3. Friendly AI Helper & Relaxation',
      tag: 'Always Open',
      description: 'Free, friendly assistance to answer your questions and help you calm down when stressed.',
      services: [
        {
          title: 'urCure AI Health Helper',
          desc: 'A friendly helper ready to answer questions about health terms, prepare for doctor visits, or just listen.',
          icon: Bot,
          ctaText: 'Talk with AI Helper',
          action: () => onNavigate('ai'),
          badge: 'Free 24/7'
        },
        {
          title: 'Calm Breathing Exercise',
          desc: 'Follow a gentle circle that shows you when to breathe in, hold, and breathe out to quickly calm your mind.',
          icon: HeartHandshake,
          ctaText: 'Start Breathing Exercise',
          action: () => onNavigate('ai'),
          badge: 'Calming'
        },
        {
          title: 'Doctor Match Helper',
          desc: 'Tell the AI helper what you are feeling, and it will recommend the best kind of doctor to help you.',
          icon: ShieldCheck,
          ctaText: 'Find Matching Doctor',
          action: () => onNavigate('ai'),
          badge: 'Quick Match'
        }
      ]
    },
    {
      category: '4. Immediate Emergency Help & Privacy',
      tag: 'Safe & Private',
      description: 'Direct phone numbers to free emergency services, plus strict privacy for your records.',
      services: [
        {
          title: 'Free 24/7 Emergency Numbers',
          desc: 'Direct phone numbers for Abu Dhabi Police (999), Ambulance (998), and Estijaba Helpline (800 1717).',
          icon: PhoneCall,
          ctaText: 'See Emergency Numbers',
          action: onOpenSOS,
          badge: 'Toll-Free'
        },
        {
          title: 'Your Notes Stay Private',
          desc: 'Only you and your doctor can see your health notes. Never shared with employers or companies.',
          icon: Lock,
          ctaText: 'Read Privacy Rules',
          action: () => onNavigate('about'),
          badge: '100% Private'
        },
        {
          title: 'Clear & Honest Records',
          desc: 'Keep track of all your past appointments, doctor advice, and receipts in one simple place.',
          icon: FileText,
          ctaText: 'Learn More',
          action: () => onNavigate('about'),
          badge: 'Protected'
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left selection:bg-white/20 selection:text-white">
      
      {/* Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-xs font-mono text-[#C0C0C0]">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>How We Help You</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Everything You Need For Your Health & Mind
        </h1>
        <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
          urCure makes taking care of your health easy: talk to verified doctors, take quick 2-minute mood checks, practice calm breathing, and get emergency help whenever you need it.
        </p>
      </div>

      {/* Systematic Service Categories */}
      <div className="space-y-14">
        {serviceCategories.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#222222] gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {group.category}
                </h2>
                <p className="text-xs text-[#888888] mt-1">{group.description}</p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#111111] border border-[#2a2a2a] text-[#C0C0C0] self-start sm:self-auto">
                {group.tag}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {group.services.map((srv, srvIdx) => {
                const Icon = srv.icon;
                return (
                  <div 
                    key={srvIdx}
                    className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#222222] hover:border-white/30 transition-all flex flex-col justify-between space-y-6 group shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#161616] text-[#A0A0A0] border border-[#2a2a2a]">
                          {srv.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {srv.title}
                      </h3>

                      <p className="text-xs text-[#929292] leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>

                    <button
                      onClick={srv.action}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white hover:text-black text-white border border-white/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>{srv.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* Quick Launch Bottom Callout */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to Speak with a Doctor?</h3>
          <p className="text-xs sm:text-sm text-[#929292]">Browse certified doctors in Abu Dhabi and pick a 30-minute time that fits your day.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('doctors')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Find a Doctor
          </button>
          <button
            onClick={() => onNavigate('wellbeing')}
            className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#161616] border border-[#333] hover:border-white transition-all cursor-pointer"
          >
            Check Mood
          </button>
        </div>
      </div>

    </div>
  );
};
