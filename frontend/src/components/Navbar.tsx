import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  Calendar, 
  Stethoscope, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (initialTab?: 'login' | 'register_patient' | 'register_doctor') => void;
  onOpenSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenSOS
}) => {
  const { user, logout, switchRoleDemo, isPatient, isDoctor, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'doctors', label: 'Find Doctors' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'emergency', label: 'Emergency' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/85 backdrop-blur-xl border-b border-[#292929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#111111] border border-[#292929] group-hover:border-[#C0C0C0]/60 transition-all duration-300">
              <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"></div>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#F5F5F5] flex items-center space-x-1">
                <span>ur</span>
                <span className="text-white font-black">Cure</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>
              </span>
              <p className="text-[10px] tracking-wider uppercase text-[#929292] font-medium hidden sm:block">
                Your Health. Your Choice. Your Care.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 text-sm rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.06] border border-white/10 font-medium'
                      : 'text-[#929292] hover:text-[#F5F5F5] hover:bg-white/[0.02]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Abu Dhabi Crisis SOS Trigger */}
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase bg-black border border-white/20 text-[#F5F5F5] hover:border-white hover:bg-white/10 transition-all shadow-[0_0_12px_rgba(255,255,255,0.05)] cursor-pointer"
              title="24/7 Immediate Emergency Escalation & Hotlines"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </button>

            {/* Demo Role Switcher Badge */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#111111] border border-[#292929] text-[#929292] hover:text-[#F5F5F5] hover:border-[#C0C0C0]/40 flex items-center space-x-1.5"
                title="Switch demo role to explore patient, doctor, or admin portals"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                <span>Role: <strong className="text-white capitalize">{user ? user.role : 'Guest'}</strong></span>
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0B0B] border border-[#292929] shadow-2xl p-2 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#777777] border-b border-[#292929]/60">
                    Switch Persona View
                  </div>
                  <button
                    onClick={() => { switchRoleDemo('patient'); setRoleSwitcherOpen(false); onNavigate('patient-dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F5F5F5] hover:bg-white/[0.05] rounded-lg mt-1 flex items-center justify-between"
                  >
                    <span>Patient (Zayn)</span>
                    {isPatient && <span className="text-[10px] text-[#C0C0C0]">Active</span>}
                  </button>
                  <button
                    onClick={() => { switchRoleDemo('doctor'); setRoleSwitcherOpen(false); onNavigate('doctor-dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F5F5F5] hover:bg-white/[0.05] rounded-lg flex items-center justify-between"
                  >
                    <span>Doctor (Dr. Sharma)</span>
                    {isDoctor && <span className="text-[10px] text-[#C0C0C0]">Active</span>}
                  </button>
                  <button
                    onClick={() => { switchRoleDemo('admin'); setRoleSwitcherOpen(false); onNavigate('admin-dashboard'); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F5F5F5] hover:bg-white/[0.05] rounded-lg flex items-center justify-between"
                  >
                    <span>Admin (Dr. Sarah)</span>
                    {isAdmin && <span className="text-[10px] text-[#C0C0C0]">Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Authenticated vs Guest */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (isDoctor) onNavigate('doctor-dashboard');
                    else if (isAdmin) onNavigate('admin-dashboard');
                    else onNavigate('patient-dashboard');
                  }}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#111111] border border-[#292929] hover:border-[#C0C0C0]/50 text-sm font-medium text-[#F5F5F5] transition-all"
                >
                  <UserIcon className="w-4 h-4 text-[#C0C0C0]" />
                  <span className="hidden sm:inline">{user.full_name.split(' ')[0]}</span>
                </button>
                
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#929292] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-medium text-[#929292] hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth('register_patient')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-[#E0E0E0] transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.04]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#292929] space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg ${
                  currentView === link.id
                    ? 'text-white bg-white/[0.08] font-medium'
                    : 'text-[#929292] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-[#292929]/50 flex flex-col space-y-2 px-2">
              <div className="text-[11px] font-mono text-[#777777] uppercase px-2">
                Quick Role Switcher
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { switchRoleDemo('patient'); setMobileMenuOpen(false); onNavigate('patient-dashboard'); }}
                  className="py-1.5 text-xs text-center rounded bg-[#111] border border-[#292929] text-[#929292]"
                >
                  Patient
                </button>
                <button
                  onClick={() => { switchRoleDemo('doctor'); setMobileMenuOpen(false); onNavigate('doctor-dashboard'); }}
                  className="py-1.5 text-xs text-center rounded bg-[#111] border border-[#292929] text-[#929292]"
                >
                  Doctor
                </button>
                <button
                  onClick={() => { switchRoleDemo('admin'); setMobileMenuOpen(false); onNavigate('admin-dashboard'); }}
                  className="py-1.5 text-xs text-center rounded bg-[#111] border border-[#292929] text-[#929292]"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
