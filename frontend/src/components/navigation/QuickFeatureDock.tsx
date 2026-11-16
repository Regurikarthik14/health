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
  Activity,
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
  onOpenAuth?: (tab?: 'login' | 'register_patient' | 'register_doctor', portalMode?: 'patient' | 'doctor') => void;
}

export const QuickFeatureDock: React.FC<QuickFeatureDockProps> = ({
  currentView,
  onNavigate,
  onOpenSOS,
  onOpenBooking: _onOpenBooking,
  onOpenAuth
}) => {
  const { user, isDoctor, isAdmin, logout } = useAuth();
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
    { id: 'symptom-guide', label: 'Body Guide', icon: Activity },
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

        {/* User Account / Role Menu */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-[#141414] border border-[#2b2b2b] text-[#A0A0A0] hover:text-white hover:border-white/30 transition-all cursor-pointer whitespace-nowrap"
            title="Account Menu"
          >
            <UserCheck className="w-3.5 h-3.5 text-white" />
            <span className="capitalize hidden md:inline font-semibold">{user ? user.role : 'Account'}</span>
            <ChevronDown className="w-3 h-3 text-[#666]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-[#0E0E0E] border border-[#2a2a2a] shadow-2xl p-2 z-50 backdrop-blur-2xl">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 border-b border-[#222222]">
                    <div className="text-xs font-bold text-white truncate">{user.full_name}</div>
                    <div className="text-[11px] font-mono text-[#777] truncate">{user.email}</div>
                    <div className="mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white border border-white/20">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onNavigate(getPortalView());
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center space-x-2 text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                    <span>Go to My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setRoleMenuOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center space-x-2 text-red-400 hover:bg-red-950/40 transition-all cursor-pointer font-medium"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#777] border-b border-[#222]">
                    Sign In or Register
                  </div>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      if (onOpenAuth) onOpenAuth('login', 'patient');
                      else onNavigate('landing');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-white">Patient Portal</div>
                    <div className="text-[11px] text-[#777]">Sign in, book visits, track blocks</div>
                  </button>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onNavigate('doctor-gateway');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-white">Doctor Gateway</div>
                    <div className="text-[11px] text-[#777]">Doctor login & registration</div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
