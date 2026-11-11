import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AssessmentModule } from './components/assessment/AssessmentModule';
import { DoctorDiscovery } from './components/doctors/DoctorDiscovery';
import { AIAssistant } from './components/ai/AIAssistant';
import { PatientDashboard } from './components/dashboard/PatientDashboard';
import { DoctorDashboard } from './components/doctor-portal/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { EmergencyModal } from './components/emergency/EmergencyModal';
import { TelehealthRoom } from './components/telehealth/TelehealthRoom';
import type { Doctor, Appointment } from './types';

const MainApp: React.FC = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register_patient' | 'register_doctor'>('login');
  
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  const [telehealthOpen, setTelehealthOpen] = useState<boolean>(false);
  const [activeTelehealthApp, setActiveTelehealthApp] = useState<Appointment | null>(null);

  const handleOpenAuth = (tab: 'login' | 'register_patient' | 'register_doctor' = 'login') => {
    setAuthInitialTab(tab);
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

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={handleOpenAuth}
        onOpenSOS={() => setEmergencyModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onOpenAuth={handleOpenAuth}
            onOpenSOS={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentView === 'about' && (
          <div className="max-w-5xl mx-auto px-4 py-16 text-left space-y-8">
            <span className="text-xs font-mono uppercase text-[#777]">About urCure</span>
            <h1 className="text-4xl font-bold text-white">"Your Health. Your Choice. Your Care."</h1>
            <p className="text-[#929292] leading-relaxed text-base">
              urCure is an AI-powered mental wellbeing and healthcare platform designed to empower individuals to recognize subtle shifts in psychological health early, choose their preferred healthcare providers with complete autonomy, and secure exclusive 30-minute appointments without double-booking or uncertainty.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-2">
                <h3 className="text-lg font-semibold text-white">Patient Autonomy First</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Patients have absolute agency in exploring and choosing their doctors based on verified Department of Health Abu Dhabi (DoH) credentials, experience, and fee transparency.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-2">
                <h3 className="text-lg font-semibold text-white">Clinical Safety Guardrails</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  AI screenings provide longitudinal symptom tracking and educational recommendations. Diagnostic judgments and prescription treatments are strictly reserved for licensed human clinicians.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setCurrentView('doctors')}
                className="px-6 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA]"
              >
                Find Doctors Now
              </button>
            </div>
          </div>
        )}

        {currentView === 'services' && (
          <div className="max-w-5xl mx-auto px-4 py-16 text-left space-y-8">
            <span className="text-xs font-mono uppercase text-[#777]">Our Core Services</span>
            <h1 className="text-4xl font-bold text-white">Comprehensive Wellbeing Architecture</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-3">
                <h3 className="text-base font-bold text-white">Validated Psychometric Screening</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Standardized PHQ-9, GAD-7, and PSS-10 evaluations with longitudinal trend charting and safe non-diagnostic guidance.
                </p>
                <button onClick={() => setCurrentView('wellbeing')} className="text-xs font-semibold text-white hover:underline">
                  Launch Assessment →
                </button>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-3">
                <h3 className="text-base font-bold text-white">Exclusive 30-Minute Booking</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Concurrency-safe database transactions ensuring your reserved 30-minute consultation slot is locked atomically.
                </p>
                <button onClick={() => { setBookingDoctor(null); setBookingModalOpen(true); }} className="text-xs font-semibold text-white hover:underline">
                  Book Appointment →
                </button>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-3">
                <h3 className="text-base font-bold text-white">Encrypted Telehealth Consultation</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Browser-based encrypted P2P video consultation with clinical notes recording and direct calendar export (.ICS).
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-3">
                <h3 className="text-base font-bold text-white">24/7 Human Emergency Escalation</h3>
                <p className="text-xs text-[#929292] leading-relaxed">
                  Direct connection to Abu Dhabi Police (999), Ambulance (998), and DoH Estijaba Crisis Hub (800 1717).
                </p>
                <button onClick={() => setEmergencyModalOpen(true)} className="text-xs font-semibold text-white hover:underline">
                  View Hotlines →
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'wellbeing' && (
          <AssessmentModule
            onOpenSOS={() => setEmergencyModalOpen(true)}
            onNavigateDoctors={() => setCurrentView('doctors')}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorDiscovery
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
          />
        )}

        {currentView === 'ai' && (
          <AIAssistant
            onOpenSOS={() => setEmergencyModalOpen(true)}
            onSelectDoctorForBooking={handleDoctorIdBooking}
          />
        )}

        {currentView === 'emergency' && (
          <div className="max-w-4xl mx-auto px-4 py-16 text-left space-y-8">
            <div className="p-8 rounded-2xl bg-[#0E0E0E] border border-white/20 shadow-2xl space-y-4">
              <span className="text-xs font-mono uppercase text-[#C0C0C0]">Independent Emergency Module</span>
              <h2 className="text-3xl font-bold text-white">Abu Dhabi & UAE Crisis Support</h2>
              <p className="text-sm text-[#929292] leading-relaxed">
                If you or someone near you is in immediate physical or psychological danger, do not wait for an ordinary consultation. 
                Immediate, toll-free 24/7 human crisis intervention is available.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <a href="tel:999" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Police Emergency</div>
                    <div className="text-xs text-[#888]">Life threat & physical danger</div>
                  </div>
                  <span className="font-mono text-white font-extrabold text-lg">999</span>
                </a>
                <a href="tel:998" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">National Ambulance</div>
                    <div className="text-xs text-[#888]">Paramedic trauma dispatch</div>
                  </div>
                  <span className="font-mono text-white font-extrabold text-lg">998</span>
                </a>
                <a href="tel:8001717" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">DoH Estijaba Crisis Line</div>
                    <div className="text-xs text-[#888]">Urgent Abu Dhabi clinical triage</div>
                  </div>
                  <span className="font-mono text-white font-extrabold text-lg">800 1717</span>
                </a>
                <a href="tel:8004673" className="p-4 rounded-xl bg-black border border-white/20 hover:border-white transition-all flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Mental Health HOPE Line</div>
                    <div className="text-xs text-[#888]">Confidential psychological first-aid</div>
                  </div>
                  <span className="font-mono text-white font-extrabold text-lg">800-4673</span>
                </a>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setEmergencyModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA]"
                >
                  Trigger 1-Click SOS Protocol
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'patient-dashboard' && (
          <PatientDashboard
            onNavigateTab={(tab) => setCurrentView(tab)}
            onOpenBooking={() => { setBookingDoctor(null); setBookingModalOpen(true); }}
            onOpenSOS={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentView === 'doctor-dashboard' && (
          <DoctorDashboard />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard />
        )}
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (isDoctor) setCurrentView('doctor-dashboard');
          else if (isAdmin) setCurrentView('admin-dashboard');
          else setCurrentView('patient-dashboard');
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
