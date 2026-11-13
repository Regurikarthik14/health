import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AssessmentModule } from './components/assessment/AssessmentModule';
import { DoctorDiscovery } from './components/doctors/DoctorDiscovery';
import { AIAssistant } from './components/ai/AIAssistant';
import { PatientDashboard } from './components/dashboard/PatientDashboard';
import { DoctorDashboard } from './components/doctor-portal/DoctorDashboard';
import { DoctorGatewayPage } from './components/doctor-portal/DoctorGatewayPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { EmergencyModal } from './components/emergency/EmergencyModal';
import { TelehealthRoom } from './components/telehealth/TelehealthRoom';
import { ServicesView } from './components/services/ServicesView';
import { AboutView } from './components/about/AboutView';
import { SubpageHeader } from './components/navigation/SubpageHeader';
import { QuickFeatureDock } from './components/navigation/QuickFeatureDock';
import type { Doctor, Appointment } from './types';

const MainApp: React.FC = () => {
  const { user, isDoctor, isAdmin } = useAuth();

  // Check if initial URL points to the private Doctor Portal
  const checkIsDoctorUrl = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.includes('/doctor') ||
      path.includes('/provider') ||
      hash.includes('doctor') ||
      hash.includes('provider') ||
      search.includes('doctor') ||
      search.includes('portal=doctor')
    );
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    return checkIsDoctorUrl() ? 'doctor-gateway' : 'landing';
  });

  // Listen to browser URL changes (forward/back button, deep link)
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsDoctorUrl()) {
        setCurrentView('doctor-gateway');
      } else if (currentView === 'doctor-gateway') {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentView]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'doctor-gateway') {
      window.history.pushState(null, '', '/doctor');
    } else if (window.location.pathname.includes('/doctor') || window.location.hash.includes('doctor')) {
      window.history.pushState(null, '', '/');
    }
  };

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register_patient' | 'register_doctor'>('login');
  const [authPortalMode, setAuthPortalMode] = useState<'patient' | 'doctor'>('patient');
  
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  const [telehealthOpen, setTelehealthOpen] = useState<boolean>(false);
  const [activeTelehealthApp, setActiveTelehealthApp] = useState<Appointment | null>(null);

  const handleOpenAuth = (
    tab: 'login' | 'register_patient' | 'register_doctor' = 'login',
    portalMode: 'patient' | 'doctor' = tab === 'register_doctor' ? 'doctor' : 'patient'
  ) => {
    setAuthInitialTab(tab);
    setAuthPortalMode(portalMode);
    setAuthModalOpen(true);
  };

  const handleSelectDoctorForBooking = (doctor: Doctor) => {
    setBookingDoctor(doctor);
    setBookingModalOpen(true);
  };

  const handleDoctorIdBooking = (doctorId: number) => {
    setBookingDoctor(null);
    setBookingModalOpen(true);
  };

  const handleBookingComplete = (app: Appointment) => {
    setActiveTelehealthApp(app);
  };

  // 1. ISOLATED PRIVATE DOCTOR PORTAL
  // When visited via private link (/doctor, /doctor-portal), renders completely separate gateway/dashboard
  if (currentView === 'doctor-gateway') {
    return (
      <DoctorGatewayPage
        onNavigateHome={() => handleNavigate('landing')}
      />
    );
  }

  // 2. PUBLIC PATIENT PORTAL
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-white/20 selection:text-white pb-16">
      {/* Top Systematic Navbar / Taskbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenSOS={() => setEmergencyModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onOpenSOS={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentView === 'about' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="About urCure & How We Help"
              category="About Us"
              onNavigate={handleNavigate}
            />
            <AboutView
              onNavigate={handleNavigate}
              onOpenSOS={() => setEmergencyModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'services' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Our Healthcare Services"
              category="Services"
              onNavigate={handleNavigate}
            />
            <ServicesView
              onNavigate={handleNavigate}
              onOpenBooking={() => {
                setBookingDoctor(null);
                setBookingModalOpen(true);
              }}
              onOpenSOS={() => setEmergencyModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'wellbeing' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Quick Mood & Wellbeing Check"
              category="Self Check"
              onNavigate={handleNavigate}
            />
            <AssessmentModule
              onOpenSOS={() => setEmergencyModalOpen(true)}
              onNavigateDoctors={() => handleNavigate('doctors')}
            />
          </div>
        )}

        {currentView === 'doctors' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Find Doctors & Book an Appointment"
              category="Doctors"
              onNavigate={handleNavigate}
            />
            <DoctorDiscovery
              onSelectDoctorForBooking={handleSelectDoctorForBooking}
            />
          </div>
        )}

        {currentView === 'ai' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="AI Health Helper & Calm Breathing"
              category="AI Helper"
              onNavigate={handleNavigate}
            />
            <AIAssistant
              onOpenSOS={() => setEmergencyModalOpen(true)}
              onSelectDoctorForBooking={handleDoctorIdBooking}
            />
          </div>
        )}

        {currentView === 'emergency' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Abu Dhabi & UAE Emergency Numbers"
              category="Emergency Help"
              onNavigate={handleNavigate}
            />
            <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-8">
              <div className="p-8 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl space-y-4">
                <span className="text-xs font-mono uppercase text-[#C0C0C0]">24/7 Immediate Help</span>
                <h2 className="text-3xl font-bold text-white">Abu Dhabi & UAE Emergency Help</h2>
                <p className="text-sm text-[#929292] leading-relaxed">
                  If you or someone near you is in immediate danger or needs urgent help, do not wait for an appointment. 
                  Call these free numbers right now for instant human help.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <a href="tel:999" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Police Emergency</div>
                      <div className="text-xs text-[#888]">Immediate danger or life threat</div>
                    </div>
                    <span className="font-mono text-white font-extrabold text-lg">999</span>
                  </a>
                  <a href="tel:998" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Ambulance</div>
                      <div className="text-xs text-[#888]">Urgent medical injury or accident</div>
                    </div>
                    <span className="font-mono text-white font-extrabold text-lg">998</span>
                  </a>
                  <a href="tel:8001717" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Estijaba Health Helpline</div>
                      <div className="text-xs text-[#888]">24/7 urgent medical helpline</div>
                    </div>
                    <span className="font-mono text-white font-extrabold text-lg">800 1717</span>
                  </a>
                  <a href="tel:8004673" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Mental Health HOPE Line</div>
                      <div className="text-xs text-[#888]">Free, private emotional support</div>
                    </div>
                    <span className="font-mono text-white font-extrabold text-lg">800-4673</span>
                  </a>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setEmergencyModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer"
                  >
                    Open Emergency Numbers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'patient-dashboard' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="My Appointments & Health Notes"
              category="My Account"
              onNavigate={handleNavigate}
            />
            <PatientDashboard
              onNavigateTab={(tab) => handleNavigate(tab)}
              onOpenBooking={() => { setBookingDoctor(null); setBookingModalOpen(true); }}
              onOpenSOS={() => setEmergencyModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'doctor-dashboard' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Doctor Schedule & Patient Visits"
              category="Doctor Portal"
              onNavigate={handleNavigate}
            />
            <DoctorDashboard />
          </div>
        )}

        {currentView === 'admin-dashboard' && (
          <div>
            <SubpageHeader
              currentView={currentView}
              title="Doctor Verification & Platform Safety"
              category="Manager Portal"
              onNavigate={handleNavigate}
            />
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Floating Quick Feature Dock / Systematic Action Bar */}
      <QuickFeatureDock
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSOS={() => setEmergencyModalOpen(true)}
        onOpenBooking={() => {
          setBookingDoctor(null);
          setBookingModalOpen(true);
        }}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        portalMode={authPortalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (isDoctor) handleNavigate('doctor-dashboard');
          else if (isAdmin) handleNavigate('admin-dashboard');
          else handleNavigate('patient-dashboard');
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        preselectedDoctor={bookingDoctor}
        onClose={() => setBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      <TelehealthRoom
        isOpen={telehealthOpen}
        appointment={activeTelehealthApp}
        onClose={() => setTelehealthOpen(false)}
        userRole={isDoctor ? 'doctor' : 'patient'}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
