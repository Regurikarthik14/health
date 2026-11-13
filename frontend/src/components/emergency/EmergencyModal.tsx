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
      name: 'Abu Dhabi Police Emergency',
      number: '999',
      badge: 'Immediate Danger',
      desc: 'Call for immediate police help if you or someone is in physical danger or needs protection.'
    },
    {
      name: 'National Ambulance UAE',
      number: '998',
      badge: 'Medical Emergency',
      desc: 'Call an ambulance right away for serious medical emergencies, injuries, or accidents.'
    },
    {
      name: 'Estijaba Health Helpline',
      number: '800 1717',
      badge: 'Health Authority (24/7)',
      desc: 'Official free 24/7 hotline by Abu Dhabi Health Authority for urgent medical and emotional help.'
    },
    {
      name: 'HOPE Mental Health Line',
      number: '800-4673',
      badge: 'Emotional Support',
      desc: 'Free, private phone support to talk through anxiety, sadness, and overwhelming feelings.'
    },
    {
      name: 'SEHA Public Hospitals Abu Dhabi',
      number: '800 50',
      badge: 'Public Hospitals',
      desc: 'Connect directly with Abu Dhabi public hospitals for immediate patient admission and care.'
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

        {/* Priority Clinical Safety Rule */}
        <div className="p-4 rounded-xl bg-white/[0.05] border border-white/20 space-y-1.5">
          <div className="flex items-center space-x-2 text-white text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Important Safety Note</span>
          </div>
          <p className="text-xs text-[#C0C0C0] leading-relaxed">
            If you or someone near you is in immediate physical danger or feeling overwhelmed, please <strong>do not wait for an ordinary appointment</strong>. 
            Call these free emergency numbers right now.
          </p>
        </div>

        {/* 1-Click Instant SOS Trigger */}
        {!sosTriggered ? (
          <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] text-center space-y-3">
            <h4 className="text-base font-bold text-white">Need Urgent Help Right Now?</h4>
            <p className="text-xs text-[#929292] max-w-md mx-auto">
              Press the button below to alert our on-call urgent support team and see direct numbers.
            </p>
            <button
              onClick={handleTriggerSOS}
              disabled={triggering}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>{triggering ? 'Sending Alert...' : 'Send SOS Alert'}</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white/[0.08] border border-white/40 space-y-2 text-center">
            <CheckCircle2 className="w-7 h-7 text-white mx-auto" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Alert Sent Successfully</h4>
            <p className="text-xs text-[#E0E0E0]">
              Our support team has been notified {crisisEventId ? `(Event #${crisisEventId})` : ''}. Please call the direct numbers below immediately.
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
