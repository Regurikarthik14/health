import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Send,
  X
} from 'lucide-react';
import type { Appointment } from '../../types';

interface TelehealthRoomProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const TelehealthRoom: React.FC<TelehealthRoomProps> = ({
  appointment,
  isOpen,
  onClose,
  userRole = 'patient'
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(1800); // 30 minutes countdown!
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'System',
      text: 'Private video call connected. Ready for your visit.',
      time: '00:00'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: userRole === 'doctor' ? 'Dr. Sharma' : 'Patient',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl">
      <div className="relative w-full max-w-6xl h-[92vh] rounded-2xl bg-[#080808] border border-[#292929] shadow-2xl flex flex-col overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#222] bg-[#0E0E0E]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  urCure Private Video Visit
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white">
                  Private & Secure
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#888]">
                Booking Code: {appointment.booking_reference} • Dr. {appointment.doctor_name} & {appointment.patient_name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 30-Min Session Countdown */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#050505] border border-[#222] font-mono text-xs text-white">
              <Clock className="w-3.5 h-3.5 text-[#C0C0C0]" />
              <span>Time Remaining: {formatTimer(timerSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Stage */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Video Stage */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-[#040404]">
            
            {/* Remote Feed (Doctor or Patient) */}
            <div className="relative w-full h-full max-h-[75vh] rounded-2xl bg-[#0E0E0E] border border-[#222] overflow-hidden flex items-center justify-center shadow-inner">
              <div className="text-center space-y-3 z-10">
                <div className="w-24 h-24 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">
                    {userRole === 'doctor' ? appointment.patient_name[0] : 'Dr'}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {userRole === 'doctor' ? appointment.patient_name : appointment.doctor_name}
                  </h4>
                  <p className="text-xs text-[#888] font-mono">
                    {userRole === 'doctor' ? 'Patient (Connected)' : appointment.doctor_specialization}
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>Call is Active</span>
                </div>
              </div>

              {/* Local Self-View PiP */}
              <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl bg-[#1A1A1A] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                {videoEnabled ? (
                  <div className="text-center">
                    <span className="text-xs font-mono text-[#AAA] block">Self View</span>
                    <span className="text-[10px] text-white">
                      {userRole === 'doctor' ? 'Dr. Sharma' : 'You'}
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-[#666] font-mono">Camera Off</div>
                )}
              </div>
            </div>

            {/* Bottom Call Controls Toolbar */}
            <div className="absolute bottom-6 flex items-center space-x-3 px-6 py-3 rounded-2xl bg-[#0E0E0E]/90 backdrop-blur-xl border border-white/20 shadow-2xl z-20">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-xl border transition-all ${
                  audioEnabled
                    ? 'bg-[#1A1A1A] border-[#333] text-white hover:border-white'
                    : 'bg-white/10 border-white text-white'
                }`}
                title="Toggle Microphone"
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-xl border transition-all ${
                  videoEnabled
                    ? 'bg-[#1A1A1A] border-[#333] text-white hover:border-white'
                    : 'bg-white/10 border-white text-white'
                }`}
                title="Toggle Camera"
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="p-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-white hover:border-white transition-all"
                title="In-call Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] flex items-center space-x-1.5 transition-all shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Visit</span>
              </button>
            </div>

          </div>

          {/* Collapsible In-call Chat Drawer */}
          {chatOpen && (
            <div className="w-80 border-l border-[#222] bg-[#0B0B0B] flex flex-col justify-between p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono">In-Call Chat</h4>
                  <button onClick={() => setChatOpen(false)} className="text-xs text-[#777] hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="space-y-2 h-[60vh] overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#111] border border-[#222] text-xs space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-[#777]">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-white text-xs leading-snug">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="relative pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message to your doctor..."
                  className="w-full pl-3 pr-10 py-2 rounded-lg bg-[#111] border border-[#292929] text-xs text-white placeholder-[#555]"
                />
                <button type="submit" className="absolute right-2 top-3 text-white">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
