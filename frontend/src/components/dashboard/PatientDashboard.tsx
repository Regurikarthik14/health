import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  Bot, 
  Stethoscope, 
  CalendarPlus, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Video, 
  MapPin, 
  AlertCircle,
  Download,
  CheckCircle,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  Lock,
  Plus,
  ArrowRight,
  Activity,
  Heart,
  ChevronRight,
  Printer,
  Sparkles,
  User as UserIcon,
  HelpCircle,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Assessment, ClinicalRecord, HealthBlock, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { BodyAreaSymptomGuide } from '../health-blocks/BodyAreaSymptomGuide';
import { HealthBlockDetailModal } from '../health-blocks/HealthBlockDetailModal';
import { AIAssistant } from '../ai/AIAssistant';
import { AssessmentModule } from '../assessment/AssessmentModule';

interface PatientDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenSOS: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigateTab,
  onOpenBooking,
  onOpenSOS
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [healthBlocks, setHealthBlocks] = useState<HealthBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [visitFilter, setVisitFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Health Block Modal & Guide states
  const [selectedBlockRef, setSelectedBlockRef] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [showSymptomGuide, setShowSymptomGuide] = useState(false);

  // Clinical Record View Modal
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [appRes, assessRes, recordsRes, blocksRes] = await Promise.all([
        api.getMyAppointments().catch(() => ({ appointments: [] })),
        api.getAssessmentHistory().catch(() => ({ assessments: [] })),
        api.getClinicalRecords().catch(() => ({ records: [] })),
        api.getMyHealthBlocks().catch(() => ({ health_blocks: [] }))
      ]);
      setAppointments(appRes.appointments || []);
      setAssessments(assessRes.assessments || []);
      setClinicalRecords(recordsRes.records || []);
      setHealthBlocks(blocksRes.health_blocks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this visit? Your 30-minute reserved slot will be released.')) return;
    setActionLoading(true);
    try {
      await api.cancelAppointment(appointmentId, 'Patient requested cancellation');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'rescheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const nextVisit = upcomingAppointments[0] || null;

  const latestAssessment = assessments[0];
  const activeHealthBlocks = healthBlocks.filter(b => b.status !== 'resolved' && b.status !== 'closed');
  const resolvedHealthBlocks = healthBlocks.filter(b => b.status === 'resolved' || b.status === 'closed');

  const openBlockDetails = (ref: string) => {
    setSelectedBlockRef(ref);
    setBlockModalOpen(true);
  };

  const patientCode = user ? `URC-PT-${String(user.id).padStart(4, '0')}` : 'URC-PT-0001';

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'health-blocks', label: 'Health Blocks & Symptoms', icon: ShieldCheck, badge: activeHealthBlocks.length > 0 ? activeHealthBlocks.length : null },
    { id: 'appointments', label: 'Visits & Telehealth', icon: Calendar, badge: upcomingAppointments.length > 0 ? upcomingAppointments.length : null },
    { id: 'records', label: 'Doctor Notes & Rx', icon: FileText, badge: clinicalRecords.length > 0 ? clinicalRecords.length : null },
    { id: 'wellbeing', label: 'Mood & Wellbeing', icon: Brain, badge: null },
    { id: 'ai', label: 'AI Health Assistant', icon: Bot, badge: '24/7' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left space-y-6">

      {/* 1. CLINICAL PATIENT PROFILE HEADER CARD */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0B0B0B] border border-[#242424] relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Patient Details */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-black font-bold text-xl flex items-center justify-center shrink-0 shadow-lg font-mono">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'P'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user?.full_name || 'Patient User'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white border border-white/20">
                  {patientCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Medical Ledger</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E8E8E] font-mono">
                <span>{user?.email || 'patient@urcure.com'}</span>
                <span>•</span>
                <span>Phone: {user?.phone || 'Confidential'}</span>
                <span>•</span>
                <span>Language: {user?.preferred_language || 'English'}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveTab('health-blocks');
                setShowSymptomGuide(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Check Body Symptoms</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] hover:border-white/30 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book 30-Min Visit</span>
            </button>

            <button
              onClick={loadDashboardData}
              title="Refresh Patient Records"
              className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-[#888] hover:text-white border border-[#2B2B2B] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </section>

      {/* 2. TAB NAVIGATION BAR */}
      <nav aria-label="Patient Portal Navigation" className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-[#090909] border border-[#222] overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'health-blocks') setShowSymptomGuide(false);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-black text-white' : 'bg-white/10 text-[#C0C0C0]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. TAB CONTENT PANELS */}
      <main className="space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE MEDICAL OVERVIEW                          */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Next Upcoming Appointment Spotlight */}
            {nextVisit && (
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/25 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase text-[#A0A0A0]">Next Scheduled Visit</span>
                  </div>
                  <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    Booking Code: {nextVisit.booking_reference}
                  </span>
                </div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">
                      {nextVisit.doctor_name}
                    </h3>
                    <p className="text-xs text-[#999999]">
                      {nextVisit.doctor_specialization} • {nextVisit.consultation_mode === 'online' ? 'Online Telehealth Video' : 'In-Person Medical Clinic'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white pt-1">
                      <span className="bg-[#1A1A1A] px-2.5 py-1 rounded-lg border border-[#2B2B2B]">
                        📅 {nextVisit.appointment_date}
                      </span>
                      <span className="bg-[#1A1A1A] px-2.5 py-1 rounded-lg border border-[#2B2B2B]">
                        ⏰ {nextVisit.start_time} – {nextVisit.end_time} (30 Mins)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {nextVisit.consultation_mode === 'online' ? (
                      <a
                        href={nextVisit.meeting_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all flex items-center space-x-1.5 shadow-lg"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-mono border border-white/20 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        <span>Clinic Visit</span>
                      </span>
                    )}

                    <a
                      href={`/api/appointments/${nextVisit.booking_reference}/calendar.ics`}
                      download
                      className="px-3.5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] text-xs font-mono transition-all flex items-center space-x-1.5"
                      title="Add to Google / Apple Calendar"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save to Calendar</span>
                    </a>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelAppointment(nextVisit.id)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-950/40 text-[#888] hover:text-red-400 border border-[#222] hover:border-red-900 text-xs font-mono transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metric KPI Cards (4 Column Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric 1 */}
              <div 
                onClick={() => setActiveTab('health-blocks')}
                className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#777]">
                  <span>Active Health Blocks</span>
                  <ShieldCheck className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {activeHealthBlocks.length}
                </div>
                <p className="text-[11px] text-[#888]">Problems under care</p>
              </div>

              {/* Metric 2 */}
              <div 
                onClick={() => setActiveTab('appointments')}
                className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#777]">
                  <span>Scheduled Visits</span>
                  <Clock className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {upcomingAppointments.length}
                </div>
                <p className="text-[11px] text-[#888]">Confirmed 30-min visits</p>
              </div>

              {/* Metric 3 */}
              <div 
                onClick={() => setActiveTab('records')}
                className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#777]">
                  <span>Doctor Notes & Rx</span>
                  <FileText className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {clinicalRecords.length}
                </div>
                <p className="text-[11px] text-[#888]">Consultation reports</p>
              </div>

              {/* Metric 4 */}
              <div 
                onClick={() => setActiveTab('wellbeing')}
                className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#777]">
                  <span>Mood Check Score</span>
                  <Brain className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {latestAssessment ? `${latestAssessment.score} / 27` : '0 / 27'}
                </div>
                <p className="text-[11px] text-[#888]">
                  {latestAssessment ? `Result: ${latestAssessment.severity_level.toUpperCase()}` : 'No quiz taken yet'}
                </p>
              </div>

            </div>

            {/* Split Section: Active Health Blocks & Recent Doctor Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (7 cols): Active Health Blocks */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Active Health Problem Ledger
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('health-blocks')}
                    className="text-xs text-[#AAA] hover:text-white underline cursor-pointer font-mono"
                  >
                    View All ({healthBlocks.length}) →
                  </button>
                </div>

                {activeHealthBlocks.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222] text-center space-y-3">
                    <Activity className="w-8 h-8 text-[#555] mx-auto" />
                    <h4 className="text-sm font-semibold text-white">No Active Health Problems</h4>
                    <p className="text-xs text-[#777] max-w-sm mx-auto">
                      Have pain, stiffness, or worry? Choose the affected body area to find the right specialist and start a private health block.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('health-blocks');
                        setShowSymptomGuide(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start Health Block by Body Area</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeHealthBlocks.slice(0, 3).map((block) => (
                      <div
                        key={block.id}
                        className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                              {block.block_reference}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/70 text-amber-300 border border-amber-800">
                              In Treatment
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#888]">
                            Pain: <strong className="text-white">{block.pain_scale}/10</strong>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{block.title}</h4>
                          <p className="text-xs text-[#888] line-clamp-2 mt-0.5">{block.trouble_description}</p>
                        </div>

                        <div className="pt-2 border-t border-[#202020] flex items-center justify-between text-xs font-mono">
                          <span className="text-[#888]">Area: <strong className="text-white">{block.body_area}</strong></span>
                          <button
                            onClick={() => openBlockDetails(block.block_reference)}
                            className="text-white underline hover:text-[#CCC] cursor-pointer"
                          >
                            Inspect Timeline →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (5 cols): Recent Doctor Notes */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-white" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Recent Doctor Notes
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('records')}
                    className="text-xs text-[#AAA] hover:text-white underline cursor-pointer font-mono"
                  >
                    All Notes ({clinicalRecords.length}) →
                  </button>
                </div>

                {clinicalRecords.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#222] text-center space-y-3">
                    <FileText className="w-8 h-8 text-[#555] mx-auto" />
                    <h4 className="text-sm font-semibold text-white">No Clinical Notes Yet</h4>
                    <p className="text-xs text-[#777] max-w-xs mx-auto">
                      When your doctor completes a consultation or writes medical recommendations, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clinicalRecords.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className="p-4 rounded-xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white truncate">{rec.title}</span>
                          <span className="text-[10px] font-mono text-[#888] shrink-0">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#999] line-clamp-2 leading-relaxed">
                          {rec.details}
                        </p>
                        <span className="text-[10px] font-mono text-[#777] inline-block">
                          Click to view full medical report →
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: HEALTH BLOCKS & BODY AREA SYMPTOMS                  */}
        {/* ========================================================= */}
        {activeTab === 'health-blocks' && (
          <div className="space-y-6">
            
            {/* Health Block Header */}
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase text-[#888]">Cryptographic Problem Ledger</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Personal Health Blocks
                </h2>
                <p className="text-xs text-[#8E8E8E] max-w-xl mt-0.5">
                  Each health problem is tracked in its own isolated block from initial symptoms to doctor diagnosis and final resolution.
                </p>
              </div>

              <button
                onClick={() => setShowSymptomGuide(!showSymptomGuide)}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-2 shrink-0 shadow-lg"
              >
                <Activity className="w-4 h-4" />
                <span>{showSymptomGuide ? 'View My Health Blocks' : '+ Start New Health Block'}</span>
              </button>
            </div>

            {/* Sub-view: Body Area Symptom Guide Wizard */}
            {showSymptomGuide ? (
              <div className="p-6 rounded-2xl bg-[#090909] border border-[#222]">
                <BodyAreaSymptomGuide
                  onSelectDoctorForBooking={() => onOpenBooking()}
                  onOpenAuth={() => {}}
                  onOpenSOS={onOpenSOS}
                  onBlockCreated={(block) => {
                    loadDashboardData();
                    setShowSymptomGuide(false);
                    openBlockDetails(block.block_reference);
                  }}
                />
              </div>
            ) : (
              /* Sub-view: Health Blocks List */
              <div className="space-y-6">
                
                {/* Active Health Blocks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Active Health Problems Under Care ({activeHealthBlocks.length})</span>
                    </h3>
                  </div>

                  {activeHealthBlocks.length === 0 ? (
                    <div className="p-10 rounded-2xl bg-[#0D0D0D] border border-[#222] text-center space-y-3">
                      <p className="text-xs text-[#888]">No active health problems recorded.</p>
                      <button
                        onClick={() => setShowSymptomGuide(true)}
                        className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] cursor-pointer inline-flex items-center space-x-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Start a Health Block by Body Area</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeHealthBlocks.map((b) => (
                        <div
                          key={b.id}
                          className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                                {b.block_reference}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/70 text-amber-300 border border-amber-800">
                                {b.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white">{b.title}</h4>
                              <div className="text-xs text-[#888] mt-0.5">
                                Body Area: <strong className="text-white">{b.body_area}</strong>
                              </div>
                            </div>

                            <p className="text-xs text-[#999] line-clamp-2 leading-relaxed">
                              {b.trouble_description}
                            </p>

                            <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222] text-xs font-mono space-y-1">
                              <div className="text-[#888]">
                                Recognized Diagnosis: <strong className="text-white">{b.recognized_diagnosis || 'Under Evaluation'}</strong>
                              </div>
                              <div className="text-[#888]">
                                Specialist: <strong className="text-white">{b.recommended_specialist || 'General Practitioner'}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#222] flex items-center justify-between text-xs font-mono">
                            <span className="text-[10px] text-[#666]">
                              SHA-256: {b.genesis_hash.substring(0, 12)}...
                            </span>
                            <button
                              onClick={() => openBlockDetails(b.block_reference)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-all cursor-pointer"
                            >
                              Inspect Timeline →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolved & Closed Health Blocks */}
                {resolvedHealthBlocks.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-[#222]">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-mono uppercase font-bold text-white">
                        Resolved & Closed Health Milestones ({resolvedHealthBlocks.length})
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {resolvedHealthBlocks.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-xl bg-[#0D0D0D] border border-emerald-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-xs text-white">{b.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Resolved
                              </span>
                            </div>
                            <p className="text-xs text-[#888]">
                              {b.resolution_summary || 'Treated and recovered successfully.'}
                            </p>
                            <div className="text-[10px] font-mono text-[#666]">
                              Ref: {b.block_reference} • Resolved {b.resolved_at ? new Date(b.resolved_at).toLocaleDateString() : 'Recorded'}
                            </div>
                          </div>

                          <button
                            onClick={() => openBlockDetails(b.block_reference)}
                            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] hover:border-white text-xs text-white font-mono cursor-pointer shrink-0"
                          >
                            Inspect Milestone
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VISITS & TELEHEALTH                                */}
        {/* ========================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#888]">Appointments & Telehealth</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  My Doctor Visits
                </h2>
                <p className="text-xs text-[#8E8E8E]">
                  Guaranteed 30-minute private 1-on-1 consultations with verified medical doctors.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={onOpenBooking}
                  className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Book New Visit</span>
                </button>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVisitFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  visitFilter === 'upcoming'
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#121212] text-[#888] hover:text-white'
                }`}
              >
                Upcoming Visits ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setVisitFilter('past')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  visitFilter === 'past'
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#121212] text-[#888] hover:text-white'
                }`}
              >
                Past Visit History ({pastAppointments.length})
              </button>
              <button
                onClick={() => setVisitFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  visitFilter === 'all'
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#121212] text-[#888] hover:text-white'
                }`}
              >
                All ({appointments.length})
              </button>
            </div>

            {/* List */}
            {(() => {
              const displayList = visitFilter === 'upcoming'
                ? upcomingAppointments
                : visitFilter === 'past'
                ? pastAppointments
                : appointments;

              if (displayList.length === 0) {
                return (
                  <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                    <Calendar className="w-8 h-8 text-[#555] mx-auto" />
                    <h4 className="text-sm font-semibold text-white">No Visits Found</h4>
                    <p className="text-xs text-[#777] max-w-sm mx-auto">
                      {visitFilter === 'upcoming'
                        ? 'You have no upcoming appointments. Click "Book New Visit" to choose a specialist.'
                        : 'No past visit history recorded.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {displayList.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{app.doctor_name}</h4>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            app.status === 'confirmed' || app.status === 'rescheduled'
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                              : app.status === 'completed'
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-red-950/70 text-red-300 border-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#999]">{app.doctor_specialization}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#AAA] pt-1">
                          <span>📅 {app.appointment_date}</span>
                          <span>•</span>
                          <span>⏰ {app.start_time} – {app.end_time}</span>
                          <span>•</span>
                          <span>{app.consultation_mode === 'online' ? 'Online Video' : 'In Clinic'}</span>
                          <span>•</span>
                          <span>Code: {app.booking_reference}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {app.consultation_mode === 'online' && (app.status === 'confirmed' || app.status === 'rescheduled') && (
                          <a
                            href={app.meeting_link || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] flex items-center space-x-1.5 shadow"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Video Call</span>
                          </a>
                        )}

                        <a
                          href={`/api/appointments/${app.booking_reference}/calendar.ics`}
                          download
                          className="px-3 py-2 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] text-xs font-mono flex items-center space-x-1.5"
                          title="Save to Phone / Desktop Calendar"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Calendar</span>
                        </a>

                        {(app.status === 'confirmed' || app.status === 'rescheduled') && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCancelAppointment(app.id)}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-red-950/40 text-[#888] hover:text-red-400 border border-[#222] hover:border-red-900 text-xs font-mono"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DOCTOR NOTES & PRESCRIPTIONS (CLINICAL EHR)         */}
        {/* ========================================================= */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#888]">Electronic Health Records</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Doctor Notes & Prescriptions
                </h2>
                <p className="text-xs text-[#8E8E8E]">
                  Official consultation summaries, doctor observations, medications, and follow-up advice.
                </p>
              </div>

              <div className="text-xs font-mono text-[#777] bg-[#111] px-3 py-1.5 rounded-lg border border-[#222]">
                Total Records: {clinicalRecords.length}
              </div>
            </div>

            {clinicalRecords.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                <FileText className="w-8 h-8 text-[#555] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Clinical Records Found</h4>
                <p className="text-xs text-[#777] max-w-md mx-auto">
                  When a doctor finishes an appointment or documents medical advice for you, the complete clinical summary will be archived here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clinicalRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#282828] space-y-4 hover:border-white/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#222] gap-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-white" />
                        <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-[#888]">
                        Recorded on {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-[#C5C5C5] leading-relaxed whitespace-pre-wrap font-sans bg-[#111111] p-4 rounded-xl border border-[#222]">
                      {rec.details}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-1 text-[#777]">
                      <span>Ref ID: CR-PT-{rec.id}</span>
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="text-white underline hover:text-[#CCC] cursor-pointer"
                      >
                        Print-Friendly Summary →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MOOD & WELLBEING TRACKER                           */}
        {/* ========================================================= */}
        {activeTab === 'wellbeing' && (
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6">
            <AssessmentModule
              onOpenSOS={onOpenSOS}
              onNavigateDoctors={() => onNavigateTab('doctors')}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: 24/7 AI HEALTH ASSISTANT                           */}
        {/* ========================================================= */}
        {activeTab === 'ai' && (
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6">
            <AIAssistant
              onOpenSOS={onOpenSOS}
              onSelectDoctorForBooking={() => onOpenBooking()}
            />
          </div>
        )}

      </main>

      {/* 4. HEALTH BLOCK TIMELINE MODAL */}
      {selectedBlockRef && (
        <HealthBlockDetailModal
          isOpen={blockModalOpen}
          blockReference={selectedBlockRef}
          onClose={() => {
            setBlockModalOpen(false);
            setSelectedBlockRef(null);
          }}
          onBlockUpdated={loadDashboardData}
        />
      )}

      {/* 5. CLINICAL RECORD PRINT / DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#888]">Official Consultation Report</span>
                <h3 className="text-lg font-bold text-white">{selectedRecord.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-xs text-[#888] hover:text-white font-mono cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="text-xs text-white leading-relaxed whitespace-pre-wrap font-sans bg-[#121212] p-5 rounded-xl border border-[#262626]">
              {selectedRecord.details}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#888]">
              <span>Signed & Verified into Patient Medical File</span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs cursor-pointer flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
