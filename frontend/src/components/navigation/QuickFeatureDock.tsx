import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Stethoscope, 
  Brain, 
  Bot, 
  LayoutDashboard, 
  ShieldAlert, 
  Layers, 
  ShieldCheck,
  UserCheck,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QuickFeatureDockProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSOS: () => void;
  onOpenBooking: () => void;
}

export const QuickFeatureDock: React.FC<QuickFeatureDockProps> = ({
  currentView,
  onNavigate,
  onOpenSOS
}) => {
  const { user, isDoctor, isAdmin, isPatient, switchRoleDemo } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPortalView = () => {
    if (isDoctor) return 'doctor-dashboard';
    if (isAdmin) return 'admin-dashboard';
    return 'patient-dashboard';
  };

  const dockItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
    { id: 'wellbeing', label: 'Check Mood', icon: Brain },
    { id: 'ai', label: 'AI Helper', icon: Bot },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'about', label: 'About Us', icon: ShieldCheck },
  ];

  return (
    <nav 
      aria-label="Main Navigation Taskbar" 
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200"
    >
      <div className="flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-2xl bg-[#090909]/95 border border-white/20 shadow-[0_12px_45px_rgba(0,0,0,0.9)] backdrop-blur-2xl max-w-[95vw] overflow-x-auto">
        
        {/* Core Feature Buttons */}
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'text-white bg-white/15 border border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.12)] font-semibold'
                  : 'text-[#8e8e8e] hover:text-white hover:bg-white/[0.05]'
              }`}
              title={item.label}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8e8e8e]'}`} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}

        {/* Portal Tab (when signed in) */}
        {user && (
          <button
            onClick={() => onNavigate(getPortalView())}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              currentView.includes('dashboard')
                ? 'text-white bg-white/20 border border-white/30 font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                : 'text-[#C0C0C0] hover:text-white hover:bg-white/[0.05]'
            }`}
            title="My Portal Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Portal</span>
          </button>
        )}

        <div className="w-[1px] h-5 bg-[#252525] mx-1"></div>

        {/* Emergency SOS Quick Button */}
        <button
          onClick={onOpenSOS}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-black border border-white/30 text-white hover:bg-white/20 hover:border-white transition-all shadow-[0_0_14px_rgba(255,255,255,0.12)] cursor-pointer whitespace-nowrap group"
          title="24/7 Immediate Abu Dhabi & UAE Emergency Hotlines"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          <span>SOS</span>
        </button>

        {/* Demo Persona Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-mono bg-[#141414] border border-[#2b2b2b] text-[#A0A0A0] hover:text-white hover:border-white/30 transition-all cursor-pointer whitespace-nowrap"
            title="Switch Account"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#888]" />
            <span className="capitalize hidden md:inline">{user ? user.role : 'Guest'}</span>
            <ChevronDown className="w-3 h-3 text-[#666]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-[#0E0E0E] border border-[#2a2a2a] shadow-2xl p-2 z-50 backdrop-blur-2xl">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#777777] border-b border-[#222222] flex items-center justify-between">
                <span>Switch Test Account</span>
                <span className="text-[9px] font-mono text-[#555]">Instant</span>
              </div>
              
              <div className="pt-1.5 space-y-1">
                <button
                  onClick={() => { switchRoleDemo('patient'); setRoleMenuOpen(false); onNavigate('patient-dashboard'); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isPatient ? 'bg-white/15 text-white font-medium' : 'text-[#929292] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Patient (Zayn)</div>
                    <div className="text-[11px] text-[#777]">See visits & mood notes</div>
                  </div>
                  {isPatient && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                <button
                  onClick={() => { switchRoleDemo('doctor'); setRoleMenuOpen(false); onNavigate('doctor-dashboard'); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isDoctor ? 'bg-white/15 text-white font-medium' : 'text-[#929292] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Doctor (Dr. Sharma)</div>
                    <div className="text-[11px] text-[#777]">See patient visits & video calls</div>
                  </div>
                  {isDoctor && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                <button
                  onClick={() => { switchRoleDemo('admin'); setRoleMenuOpen(false); onNavigate('admin-dashboard'); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isAdmin ? 'bg-white/15 text-white font-medium' : 'text-[#929292] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Admin (Dr. Sarah)</div>
                    <div className="text-[11px] text-[#777]">Check doctor licenses & website safety</div>
                  </div>
                  {isAdmin && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
