import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { UrCureLogo } from './common/UrCureLogo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (
    initialTab?: 'login' | 'register_patient' | 'register_doctor',
    portalMode?: 'patient' | 'doctor'
  ) => void;
  onOpenSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, logout, isDoctor, isAdmin } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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

  const getPortalLabel = () => {
    if (isDoctor) return 'Doctor Portal';
    if (isAdmin) return 'Admin Portal';
    return 'Patient Portal';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-2xl border-b border-[#1c1c1c] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Left: urCure Brand Logo (where 'rcure' sits inside 'u') */}
          <UrCureLogo
            size="md"
            onClick={() => onNavigate('landing')}
          />

          {/* 2. Center: INTENTIONALLY EMPTY (Navigation is housed in the bottom taskbar) */}
          <div className="hidden lg:block"></div>

          {/* 3. Right: Only Sign In / Account Option */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#111111] border border-[#282828] hover:border-white/50 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-[11px] font-bold text-white">
                    {user.full_name ? user.full_name[0] : 'U'}
                  </div>
                  <span className="font-semibold">{user.full_name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#C0C0C0]">
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#777]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0E0E0E] border border-[#2a2a2a] shadow-2xl p-2 z-50 backdrop-blur-2xl">
                    <div className="px-3 py-2 border-b border-[#222]">
                      <div className="text-xs font-semibold text-white">{user.full_name}</div>
                      <div className="text-[11px] text-[#777] font-mono truncate">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate(getPortalView());
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                        <span>Go to {getPortalLabel()}</span>
                      </button>
                    </div>
                    <div className="pt-1 border-t border-[#222]">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#999] hover:text-white hover:bg-white/5 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-[#777]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login', 'patient')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#111111] border border-[#2a2a2a] hover:border-white/50 hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm"
                  title="Patient Sign In"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
