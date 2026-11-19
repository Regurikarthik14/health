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
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${user ? user.full_name.split(' ')[0] : 'there'}! I am **urCure AI**, your dedicated wellbeing companion.\n\nI can help explain assessment results, guide you through interactive box breathing (4-4-4-4), explain Abu Dhabi stepped-care pathways, or help you prepare questions for your healthcare professional.\n\n*(Clinical Safeguard: I am an AI wellbeing companion, not a licensed clinician. I do not diagnose conditions or prescribe medications. In an emergency, certified human support via 800-SAKINA and 999 is always available).*`,
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

    // Immediate Client-Side Safety Intercept for Crisis Disclosures
    const lower = text.toLowerCase();
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 'انتحار', 'أموت', 'اذي نفسي'];
    if (crisisKeywords.some(k => lower.includes(k))) {
      setTimeout(() => {
        const crisisMsg: ChatMessage = {
          id: `crisis-${Date.now()}`,
          sender: 'ai',
          text: lang === 'ar' 
            ? 'نحن نهتم بسلامتك بشدة. كذكاء اصطناعي، لا يمكنني تقديم رعاية طارئة، ولكن هناك دعم بشري مجاني وسري متاح لك في أبوظبي والإمارات الآن:'
            : 'Your safety is our absolute priority. As an AI, I cannot provide emergency care, but compassionate, human support in Abu Dhabi and the UAE is available right now:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'emergency_escalation',
          crisisContacts: [
            { name: '800-SAKINA (800-725462) Abu Dhabi Mental Health', number: '800725462', badge: 'Toll-Free 24/7' },
            { name: 'UAE Emergency Police', number: '999', badge: 'Emergency' },
            { name: 'National Ambulance', number: '998', badge: 'Medical SOS' },
            { name: 'Estijaba Crisis Line (Abu Dhabi)', number: '8001717', badge: 'Toll-Free' }
          ]
        };
        setMessages(prev => [...prev, crisisMsg]);
        setLoading(false);
        onOpenSOS();
      }, 500);
      return;
    }

    try {
      const res = await api.chatWithAI(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || (lang === 'ar' ? 'أنا هنا لمساعدتك في عافيتك النفسية.' : 'I am here to assist with your wellbeing.'),
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
        text: lang === 'ar' 
          ? 'أواجه صعوبة في الاتصال حالياً. يرجى المحاولة بعد لحظات.' 
          : 'I am having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPromptsEn = [
    'Show me a calm breathing exercise',
    'Explain my mood assessment results',
    'Help me prepare questions for my doctor',
    'Explain Abu Dhabi stepped-care pathways'
  ];

  const quickPromptsAr = [
    'ابدأ تمرين التنفس الهادئ (4-4-4-4)',
    'اشرح لي نتائج فحص الحالة المزاجية',
    'كيف أجهز أسئلة لموعد الطبيب؟',
    'اشرح مستويات الرعاية المتدرجة في أبوظبي'
  ];

  const quickPrompts = lang === 'ar' ? quickPromptsAr : quickPromptsEn;

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
              <h2 className="text-xl font-bold text-white tracking-tight">urCure AI Helper</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white">
                Friendly Helper
              </span>
            </div>
            <p className="text-xs text-[#929292]">Friendly answers, calm breathing exercises, and doctor advice</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg bg-[#141414] border border-[#2b2b2b] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                lang === 'en' ? 'bg-white text-black font-bold' : 'text-[#888] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                lang === 'ar' ? 'bg-white text-black font-bold' : 'text-[#888] hover:text-white'
              }`}
            >
              العربية
            </button>
          </div>

          {/* SOS shortcut */}
          <button
            onClick={onOpenSOS}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase bg-red-950/70 border border-red-700 text-red-200 hover:bg-red-900 transition-all flex items-center space-x-1.5 cursor-pointer shadow"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>800-SAKINA / 999</span>
          </button>
        </div>
      </div>

      {/* Interactive Box Breathing Visualizer (When active) */}
      {breathingActive && (
        <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl relative flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-between w-full pb-2 border-b border-[#222]">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#C0C0C0]">
              <Wind className="w-4 h-4 text-white" />
              <span>Calm Breathing Exercise (4-4-4-4)</span>
            </div>
            <button
              onClick={() => setBreathingActive(false)}
              className="text-xs text-[#777] hover:text-white font-mono cursor-pointer"
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
                {breathPhase === 'Inhale' ? 'Breathe In' : breathPhase === 'Hold' ? 'Hold' : breathPhase === 'Exhale' ? 'Breathe Out' : 'Rest'}
              </span>
              <div className="text-4xl font-extrabold text-white font-mono">
                {breathCount}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#929292] font-mono text-center max-w-md">
            Breathe slowly with the circle. Inhale, hold, and breathe out to quickly calm your body and mind.
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
                    Doctors Who Can Help:
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
                          <div className="text-[10px] font-mono text-[#C0C0C0]">AED {doc.fee} / 30 mins</div>
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
                    <span>24/7 Free Emergency Phone Numbers (Abu Dhabi & UAE)</span>
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
            <span>urCure AI is typing...</span>
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
          placeholder={lang === 'ar' ? "اكتب سؤالك هنا (مثل: 'أشعر بالتوتر'، 'اشرح لي مستويات الدعم')..." : "Ask a question (e.g. 'I feel stressed', 'Explain stepped care', 'Help prepare for my doctor')..."}
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
        {lang === 'ar' 
          ? 'مساعد ذكاء اصطناعي داعم للعافية. لا يقدم تشخيصات طبية ولا يحل محل الأطباء المرخصين. في حالات الطوارئ، اتصل بـ 800-SAKINA أو 999.' 
          : 'Decision-support AI companion. Does not diagnose or replace licensed medical care. In emergencies, call 800-SAKINA or 999 immediately.'}
      </p>

    </div>
  );
};
