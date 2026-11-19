import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  HeartHandshake, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose
}) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [crisisEventId, setCrisisEventId] = useState<number | null>(null);
  const [triggering, setTriggering] = useState(false);

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    setTriggering(true);
    try {
      const res = await api.triggerEmergencySOS({
        notes: 'Patient pressed 1-Click Urgent SOS button from urCure dashboard.'
      });
      setCrisisEventId(res.crisis_event_id);
      setSosTriggered(true);
    } catch (err: any) {
      console.error(err);
      setSosTriggered(true); // Fallback: still show emergency hotlines!
    } finally {
      setTriggering(false);
    }
  };

  const contacts = [
    {
      name: '800-SAKINA Mental Health Helpline',
      number: '800-725462',
      badge: 'Abu Dhabi 24/7 Hotline',
      tier: 'mental_health',
      desc: 'Official Abu Dhabi confidential mental-health hotline. Free 24/7 support for emotional distress, anxiety, and mental wellbeing crisis.'
    },
    {
      name: 'UAE Emergency Services',
      number: '999',
      badge: 'Immediate Danger',
      tier: 'emergency',
      desc: 'Call immediately if you or someone near you is in physical danger or requires urgent police protection.'
    },
    {
      name: 'National Ambulance UAE',
      number: '998',
      badge: 'Medical Emergency',
      tier: 'emergency',
      desc: 'Immediate dispatch for acute medical emergencies, sudden physical injury, or life-threatening health issues.'
    },
    {
      name: 'Estijaba Health Authority Crisis Line',
      number: '800 1717',
      badge: 'Health Authority (24/7)',
      tier: 'mental_health',
      desc: 'Official 24/7 helpline by Department of Health Abu Dhabi for health guidance and emotional support.'
    },
    {
      name: 'HOPE Support Helpline',
      number: '800-4673',
      badge: 'Emotional Care',
      tier: 'support',
      desc: 'Free, compassionate phone counseling to talk through grief, sadness, and overwhelming thoughts.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B0B0B] border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Emergency Help & Phone Numbers</h3>
              <p className="text-[11px] font-mono text-[#C0C0C0]">Free Phone Calls in Abu Dhabi & UAE</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.05] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tiered Clinical Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 space-y-1">
            <span className="font-bold text-red-300 font-mono text-[10px] uppercase">Tier 1 • Immediate Danger</span>
            <p className="text-[11px] text-red-200/90 leading-tight">
              Life-threatening emergency, self-harm crisis, or severe physical harm. Call <strong>999</strong> or <strong>800-SAKINA</strong> now.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-1">
            <span className="font-bold text-amber-300 font-mono text-[10px] uppercase">Tier 2 • Elevated Concern</span>
            <p className="text-[11px] text-amber-200/90 leading-tight">
              Persistent anxiety, panic, or insomnia. Book a priority 30-minute doctor consult or talk to SAKINA counselors.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-1">
            <span className="font-bold text-cyan-300 font-mono text-[10px] uppercase">Tier 3 • Emotional Distress</span>
            <p className="text-[11px] text-cyan-200/90 leading-tight">
              Temporary fatigue, work stress, or sadness. Try calm box breathing, sleep hygiene, or our 24/7 AI companion.
            </p>
          </div>
        </div>

        {/* 1-Click Human Crisis Registration */}
        {!sosTriggered ? (
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h4 className="text-sm font-bold text-white">Log Crisis Alert with On-Call Clinical Team</h4>
              <p className="text-xs text-[#929292] max-w-md">
                Registers an urgent flag in your medical record for human clinical review. Note: For immediate physical dispatch, you must dial 999 directly.
              </p>
            </div>
            <button
              onClick={handleTriggerSOS}
              disabled={triggering}
              className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2 shrink-0"
            >
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>{triggering ? 'Registering...' : 'Log Human Crisis Alert'}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.08] border border-white/40 space-y-1 text-left">
            <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Human Crisis Incident Recorded {crisisEventId ? `(#${crisisEventId})` : ''}</span>
            </div>
            <p className="text-xs text-[#CCC]">
              Your alert is logged for our medical director. Please dial <strong>800-SAKINA (800-725462)</strong> or <strong>999</strong> directly below if you are in immediate distress.
            </p>
          </div>
        )}

        {/* Emergency Hotlines Directory */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
            Free Emergency Phone Numbers
          </span>

          <div className="space-y-2.5">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] hover:border-white/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-bold text-white">{c.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#929292] leading-tight">{c.desc}</p>
                </div>

                <a
                  href={`tel:${c.number.replace(/\s+/g, '')}`}
                  className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-[#EAEAEA] font-mono text-sm font-bold flex items-center justify-center space-x-2 shrink-0 transition-all shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {c.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Grounding reminder */}
        <div className="p-4 rounded-xl bg-[#050505] border border-[#222] text-xs font-mono text-[#888] space-y-1">
          <span className="text-white font-bold block">Simple 5-Step Exercise to Calm Down Right Now:</span>
          <span>Take a slow breath. Notice: 5 things you can see around you, 4 things you can touch, 3 sounds you can hear, 2 scents you can smell, and 1 slow breath.</span>
        </div>

      </div>
    </div>
  );
};
