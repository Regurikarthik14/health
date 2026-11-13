import React from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Brain, 
  Bot, 
  Layers, 
  ShieldAlert, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SubpageHeaderProps {
  currentView: string;
  title: string;
  category: string;
  onNavigate: (view: string) => void;
  onOpenSOS?: () => void;
}

export const SubpageHeader: React.FC<SubpageHeaderProps> = ({
  currentView,
  title,
  category,
  onNavigate,
  onOpenSOS
}) => {
  const quickLinks = [
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'wellbeing', label: 'Check Mood', icon: Brain },
    { id: 'ai', label: 'AI Helper', icon: Bot },
    { id: 'services', label: 'Services', icon: Layers },
  ];

  return (
    <div className="w-full border-b border-[#222222] bg-[#080808]/70 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Breadcrumbs & Back */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[#999999] hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
          
          <span className="font-mono text-[#777] uppercase text-[10px]">{category}</span>
          
          <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
          
          <span className="font-medium text-white">{title}</span>
        </div>

        {/* Right: Quick Jump Feature Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-[#666] hidden md:inline mr-1">Switch:</span>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isCurrent = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-white/15 text-white font-medium border border-white/20'
                    : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

