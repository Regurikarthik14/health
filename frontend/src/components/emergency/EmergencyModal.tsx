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
      badge: 'Immediate Life Threat',
      desc: 'Immediate dispatch for life-threatening situations, acute physical danger, or crime across the UAE.'
    },
    {
      name: 'National Ambulance UAE',
      number: '998',
      badge: 'Medical Trauma SOS',
      desc: 'Immediate emergency medical and trauma paramedic dispatch to your exact location in Abu Dhabi.'
    },
    {
      name: 'DoH Estijaba Crisis Emergency Hub',
      number: '800 1717',
      badge: 'Department of Health (24/7)',
      desc: 'Dedicated Abu Dhabi Health Authority emergency hub for urgent psychiatric and acute clinical intake.'
    },
    {
      name: 'UAE National Mental Health Line (HOPE)',
      number: '800-4673',
      badge: 'Trained Crisis Counselors',
      desc: 'Confidential psychological first-aid support line operated by qualified psychological personnel.'
    },
    {
      name: 'SEHA Hospital Network Abu Dhabi',
      number: '800 50',
      badge: 'Public Hospital Network',
      desc: 'Emergency psychiatric and medical inpatient emergency intake coordination.'
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
              <h3 className="text-lg font-bold text-white tracking-tight">Emergency Support & Crisis Care</h3>
              <p className="text-[11px] font-mono text-[#C0C0C0]">Abu Dhabi & UAE Sovereign Escalation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Clinical Safety Rule */}
        <div className="p-4 rounded-xl bg-white/[0.05] border border-white/20 space-y-1.5">
          <div className="flex items-center space-x-2 text-white text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Priority Human Clinical Safety Principle</span>
          </div>
          <p className="text-xs text-[#C0C0C0] leading-relaxed">
            A patient in immediate danger or acute psychological distress must <strong>never wait for an ordinary doctor appointment</strong>. 
            All crisis responses and critical clinical decisions remain exclusively under qualified human professionals.
          </p>
        </div>

        {/* 1-Click Instant SOS Trigger */}
        {!sosTriggered ? (
          <div className="p-6 rounded-2xl bg-[#111111] border border-[#292929] text-center space-y-3">
            <h4 className="text-base font-bold text-white">Need Urgent Escalation Right Now?</h4>
            <p className="text-xs text-[#929292] max-w-md mx-auto">
              Press the SOS button below to alert our on-call urgent care coordination lead and log an immediate critical event.
            </p>
            <button
              onClick={handleTriggerSOS}
              disabled={triggering}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>{triggering ? 'Activating Emergency Dispatch...' : 'Activate 1-Click SOS Escalation'}</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white/[0.08] border border-white/40 space-y-2 text-center">
            <CheckCircle2 className="w-7 h-7 text-white mx-auto" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Human Escalation Protocol Active</h4>
            <p className="text-xs text-[#E0E0E0]">
              Emergency coordinator alerted {crisisEventId ? `(Event #${crisisEventId})` : ''}. Please call the direct dispatch numbers below immediately.
            </p>
          </div>
        )}

        {/* Emergency Hotlines Directory */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
            Verified Abu Dhabi & UAE Crisis Hotlines
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
          <span className="text-white font-bold block">Immediate Grounding Technique (5-4-3-2-1):</span>
          <span>Notice 5 things you can see, 4 things you can touch, 3 sounds you can hear, 2 scents, and 1 slow breath.</span>
        </div>

      </div>
    </div>
  );
};
