import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldAlert, 
  Wind, 
  Stethoscope, 
  FileText, 
  Bot, 
  User as UserIcon, 
  AlertTriangle,
  Play,
  Square,
  CheckCircle,
  PhoneCall
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AIAssistantProps {
  onOpenSOS: () => void;
  onSelectDoctorForBooking: (doctorId: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: string;
  suggestedDoctors?: any[];
  crisisContacts?: any[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onOpenSOS,
  onSelectDoctorForBooking
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${user ? user.full_name.split(' ')[0] : 'there'}. I am **urCure AI**, your dedicated mental wellbeing assistant.\n\nI can assist you with scientific stress management techniques, guide you through interactive breathing exercises, help you prepare for a medical consultation, or match you with verified specialists on our platform.\n\n*(Notice: I am an AI system and do not formulate clinical diagnoses or prescribe treatments. If in acute crisis, immediate human help is available).*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Breathing pacer state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, breathingActive]);

  // Breathing timer loop
  useEffect(() => {
    if (!breathingActive) return;

    let currentPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Rest' = 'Inhale';
    let currentCount = 4;

    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        if (currentPhase === 'Inhale') currentPhase = 'Hold';
        else if (currentPhase === 'Hold') currentPhase = 'Exhale';
        else if (currentPhase === 'Exhale') currentPhase = 'Rest';
        else currentPhase = 'Inhale';

        currentCount = 4;
      }
      setBreathPhase(currentPhase);
      setBreathCount(currentCount);
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAI(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'I am here to assist with your wellbeing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: res.action,
        suggestedDoctors: res.suggested_doctors,
        crisisContacts: res.crisis_contacts
      };

      setMessages(prev => [...prev, aiMsg]);

      if (res.action === 'breathing_exercise') {
        setBreathingActive(true);
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered an issue connecting to the wellbeing knowledge base. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Guide me through a breathing exercise',
    'I feel overwhelmed by work stress',
    'Recommend a verified psychologist',
    'How should I prepare for my doctor visit?'
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#292929] gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#292929] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">urCure AI Assistant</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white">
                Controlled Healthcare AI
              </span>
            </div>
            <p className="text-xs text-[#929292]">Non-clinical supportive guidance, breathing pacing & provider matching</p>
          </div>
        </div>

        {/* SOS shortcut */}
        <button
          onClick={onOpenSOS}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase bg-black border border-white/20 text-[#F5F5F5] hover:border-white transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Immediate SOS</span>
        </button>
      </div>

      {/* Interactive Box Breathing Visualizer (When active) */}
      {breathingActive && (
        <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl relative flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-between w-full pb-2 border-b border-[#222]">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#C0C0C0]">
              <Wind className="w-4 h-4 text-white" />
              <span>Autonomic Regulation: Box Breathing (4-4-4-4)</span>
            </div>
            <button
              onClick={() => setBreathingActive(false)}
              className="text-xs text-[#777] hover:text-white font-mono"
            >
              Close Exercise
            </button>
          </div>

          {/* Animated Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            <div 
              className={`absolute inset-0 rounded-full border border-white/30 transition-all duration-1000 ${
                breathPhase === 'Inhale' 
                  ? 'scale-110 bg-white/[0.08]' 
                  : breathPhase === 'Hold' 
                  ? 'scale-110 bg-white/[0.12] border-white/60'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 bg-white/[0.04]'
                  : 'scale-90 bg-transparent'
              }`}
            />
            <div className="text-center z-10 space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#929292]">
                {breathPhase}
              </span>
              <div className="text-4xl font-extrabold text-white font-mono">
                {breathCount}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#929292] font-mono text-center max-w-md">
            Slow, equalized respiration signals safety to the amygdala and down-regulates sympathetic nervous activation.
          </p>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="h-[460px] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#777777]">
              <span>{msg.sender === 'user' ? 'You' : 'urCure AI'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line border ${
                msg.sender === 'user'
                  ? 'bg-white text-black font-medium border-white rounded-tr-none'
                  : 'bg-[#111111] text-[#F5F5F5] border-[#292929] rounded-tl-none shadow-md'
              }`}
            >
              {msg.text}

              {/* In-chat Doctor Recommendations */}
              {msg.suggestedDoctors && msg.suggestedDoctors.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#292929] space-y-2">
                  <span className="text-[11px] font-mono text-[#C0C0C0] uppercase block">
                    Recommended Verified Specialists:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.suggestedDoctors.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-lg bg-[#050505] border border-[#292929] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{doc.name}</div>
                          <div className="text-[10px] text-[#888]">{doc.specialization}</div>
                          <div className="text-[10px] font-mono text-[#C0C0C0]">AED {doc.fee} / 30m</div>
                        </div>
                        <button
                          onClick={() => onSelectDoctorForBooking(doc.id)}
                          className="px-2.5 py-1 rounded bg-white text-black text-[11px] font-semibold hover:bg-[#EAEAEA]"
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crisis Hotline Card inside chat */}
              {msg.crisisContacts && (
                <div className="mt-4 pt-3 border-t border-white/20 space-y-3">
                  <div className="flex items-center space-x-1.5 text-white font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 text-white" />
                    <span>24/7 Human Emergency Contacts (Abu Dhabi & UAE)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.crisisContacts.map((c: any, i: number) => (
                      <a
                        key={i}
                        href={`tel:${c.number}`}
                        className="p-2.5 rounded-lg bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="text-white font-medium">{c.name}</div>
                          <div className="text-[10px] text-[#999]">{c.badge}</div>
                        </div>
                        <div className="font-mono text-white font-bold flex items-center space-x-1">
                          <PhoneCall className="w-3 h-3" />
                          <span>{c.number}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#777] p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>urCure AI is processing your query...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#111111] border border-[#292929] hover:border-white/30 text-[#929292] hover:text-white transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask urCure AI about stress regulation, symptoms, or finding a doctor..."
          className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-[#111111] border border-[#292929] text-sm text-white placeholder-[#666] focus:outline-none focus:border-white/50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-2 p-2 rounded-lg bg-white text-black hover:bg-[#EAEAEA] disabled:opacity-30 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-[#666666] font-mono text-center">
        urCure AI complies with clinical safety regulations. Messages are processed confidentially for your personal wellbeing navigation.
      </p>

    </div>
  );
};
