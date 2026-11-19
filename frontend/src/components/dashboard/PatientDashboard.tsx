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
  Filter,
  CheckCircle2,
  Compass,
  Sun,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Assessment, ClinicalRecord, HealthBlock, Doctor, Referral, EarlyWarningStatus } from '../../types';
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
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earlyWarning, setEarlyWarning] = useState<EarlyWarningStatus | null>(null);
  const [warningDismissed, setWarningDismissed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Daily Check-In state
  const [dailyFeeling, setDailyFeeling] = useState<string>('Good');
  const [dailyStress, setDailyStress] = useState<string>('Mild');
  const [dailySleepQuality, setDailySleepQuality] = useState<string>('Okay');
  const [dailyEnergyLevel, setDailyEnergyLevel] = useState<string>('Moderate');
  const [dailyWantSupport, setDailyWantSupport] = useState<string>('No, feeling fine');
  const [dailyCheckinSubmitted, setDailyCheckinSubmitted] = useState<boolean>(false);
  const [submittingCheckin, setSubmittingCheckin] = useState<boolean>(false);

  // Closed-loop care confirmation
  const [confirmCareTarget, setConfirmCareTarget] = useState<Referral | null>(null);
  const [confirmCareNotes, setConfirmCareNotes] = useState<string>('');
  const [confirmCareLoading, setConfirmCareLoading] = useState<boolean>(false);

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
      const [appRes, assessRes, recordsRes, blocksRes, refRes, earlyRes] = await Promise.all([
        api.getMyAppointments().catch(() => ({ appointments: [] })),
        api.getAssessmentHistory().catch(() => ({ assessments: [] })),
        api.getClinicalRecords().catch(() => ({ records: [] })),
        api.getMyHealthBlocks().catch(() => ({ health_blocks: [] })),
        api.getMyReferrals().catch(() => ({ referrals: [] })),
        api.getEarlyWarningStatus().catch(() => ({ early_warning: null }))
      ]);
      setAppointments(appRes.appointments || []);
      setAssessments(assessRes.assessments || []);
      setClinicalRecords(recordsRes.records || []);
      setHealthBlocks(blocksRes.health_blocks || []);
      setReferrals(refRes.referrals || []);
      setEarlyWarning(earlyRes.early_warning || null);
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

  const handleDailyCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCheckin(true);
    try {
      const moodMap: Record<string, number> = { 'Struggling': 1, 'Low': 2, 'Okay': 3, 'Good': 4, 'Great': 5 };
      const energyMap: Record<string, number> = { 'Depleted': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Peak': 5 };
      const sleepMap: Record<string, number> = { 'Barely Slept': 3.5, 'Disturbed': 5.5, 'Okay': 7.0, 'Deep & Restful': 8.5 };

      await api.recordMoodCheckin({
        mood_score: moodMap[dailyFeeling] || 4,
        energy_score: energyMap[dailyEnergyLevel] || 3,
        sleep_hours: sleepMap[dailySleepQuality] || 7.0,
        note: `Daily Check-In: Feeling=${dailyFeeling}, Stress=${dailyStress}, Sleep=${dailySleepQuality}, Energy=${dailyEnergyLevel}, Support=${dailyWantSupport}`
      });
      setDailyCheckinSubmitted(true);
      await loadDashboardData();
      setTimeout(() => setDailyCheckinSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleConfirmCareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCareTarget) return;
    setConfirmCareLoading(true);
    try {
      await api.confirmPatientCare(confirmCareTarget.id, {
        confirmed: true,
        notes: confirmCareNotes.trim() || 'Patient confirmed receiving care from the designated provider.'
      });
      setConfirmCareTarget(null);
      setConfirmCareNotes('');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm care.');
    } finally {
      setConfirmCareLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'rescheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const nextVisit = upcomingAppointments[0] || null;

  const latestAssessment = assessments[0];
  const activeHealthBlocks = healthBlocks.filter(b => b.status !== 'resolved' && b.status !== 'closed');
  const resolvedHealthBlocks = healthBlocks.filter(b => b.status === 'resolved' || b.status === 'closed');
  const pendingCareReferrals = referrals.filter(r => !r.patient_confirmed_care);

  const openBlockDetails = (ref: string) => {
    setSelectedBlockRef(ref);
    setBlockModalOpen(true);
  };

  const patientCode = user ? `URC-PT-${String(user.id).padStart(4, '0')}` : 'URC-PT-0001';

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'daily-checkin', label: 'Daily Check-In', icon: Sparkles, badge: dailyCheckinSubmitted ? 'Done' : null },
    { id: 'referrals', label: 'Stepped Referrals', icon: Compass, badge: pendingCareReferrals.length > 0 ? pendingCareReferrals.length : null },
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

            {/* 1. PERSONAL WELLBEING EARLY-WARNING DECISION-SUPPORT */}
            {earlyWarning?.has_warning && !warningDismissed && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/20 to-black border border-purple-500/40 shadow-2xl space-y-4 animate-fade-in text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
                  <div className="flex items-center space-x-2 text-cyan-300">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">
                      Personal Wellbeing Early-Warning Insight
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                      Stepped Care Level {earlyWarning.recommended_care_level} Recommended
                    </span>
                    <button
                      type="button"
                      onClick={() => setWarningDismissed(true)}
                      className="text-xs font-mono text-[#888] hover:text-white cursor-pointer px-2 py-0.5"
                    >
                      Dismiss ✕
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {earlyWarning.explanation}
                  </p>
                  <p className="text-xs text-[#aaa] leading-relaxed">
                    {earlyWarning.suggested_action}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('services')}
                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 shadow"
                  >
                    <span>Explore Stepped Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('daily-checkin')}
                    className="px-3.5 py-2 rounded-xl bg-[#141414] text-white hover:bg-[#202020] text-xs font-mono border border-[#333] cursor-pointer"
                  >
                    Log Today's Check-In
                  </button>
                  <span className="text-[10px] text-[#777] font-mono ml-auto">
                    Comparing against your personal baseline • Not an AI diagnosis
                  </span>
                </div>
              </div>
            )}

            {/* 2. TODAY'S WELLBEING CHECK-IN WIDGET */}
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#202020] gap-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Today's Wellbeing Check-In
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#777]">
                  {dailyCheckinSubmitted ? '✓ Saved for Today' : 'Optional 30-Second Check'}
                </span>
              </div>

              {dailyCheckinSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you! Your daily check-in has been securely saved to your personal baseline.</span>
                </div>
              ) : (
                <form onSubmit={handleDailyCheckinSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Q1: Mood */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#121212] border border-[#222]">
                      <span className="text-[11px] text-[#888] font-mono block">1. How are you feeling?</span>
                      <select
                        value={dailyFeeling}
                        onChange={(e) => setDailyFeeling(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-lg p-2 focus:outline-none text-xs"
                      >
                        <option value="Great">Great (High Energy / Joy)</option>
                        <option value="Good">Good (Balanced)</option>
                        <option value="Okay">Okay (Managing)</option>
                        <option value="Low">Low (Sad or Down)</option>
                        <option value="Struggling">Struggling (Heavy / Overwhelmed)</option>
                      </select>
                    </div>

                    {/* Q2: Stress */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#121212] border border-[#222]">
                      <span className="text-[11px] text-[#888] font-mono block">2. How stressed do you feel?</span>
                      <select
                        value={dailyStress}
                        onChange={(e) => setDailyStress(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-lg p-2 focus:outline-none text-xs"
                      >
                        <option value="None">None (Peaceful)</option>
                        <option value="Mild">Mild (Manageable)</option>
                        <option value="Moderate">Moderate (Noticeable tension)</option>
                        <option value="High">High (Significant pressure)</option>
                      </select>
                    </div>

                    {/* Q3: Sleep */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#121212] border border-[#222]">
                      <span className="text-[11px] text-[#888] font-mono block">3. How was your sleep?</span>
                      <select
                        value={dailySleepQuality}
                        onChange={(e) => setDailySleepQuality(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-lg p-2 focus:outline-none text-xs"
                      >
                        <option value="Deep & Restful">Deep & Restful (8+ hrs)</option>
                        <option value="Okay">Okay (6 - 7 hrs)</option>
                        <option value="Disturbed">Disturbed / Woke up often</option>
                        <option value="Barely Slept">Barely Slept (&lt; 4 hrs)</option>
                      </select>
                    </div>

                    {/* Q4: Energy */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#121212] border border-[#222]">
                      <span className="text-[11px] text-[#888] font-mono block">4. How is your energy?</span>
                      <select
                        value={dailyEnergyLevel}
                        onChange={(e) => setDailyEnergyLevel(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-lg p-2 focus:outline-none text-xs"
                      >
                        <option value="Peak">Peak (Ready for the day)</option>
                        <option value="Moderate">Moderate (Normal)</option>
                        <option value="Low">Low (Tired easily)</option>
                        <option value="Depleted">Depleted (Exhausted)</option>
                      </select>
                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-[#666] font-mono">
                      All questions are optional. Zero microphone, camera, or behavioural tracking.
                    </p>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDailyCheckinSubmitted(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#888] hover:text-white cursor-pointer"
                      >
                        Skip for Today
                      </button>
                      <button
                        type="submit"
                        disabled={submittingCheckin}
                        className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow"
                      >
                        {submittingCheckin ? 'Saving...' : 'Save Check-In'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 3. STEPPED CARE REFERRAL TRACKER */}
            {referrals.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Stepped Care Referral Coordination
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="text-xs font-mono text-[#888] hover:text-white underline cursor-pointer"
                  >
                    View All ({referrals.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {referrals.slice(0, 2).map((ref) => (
                    <div
                      key={ref.id}
                      className="p-4 rounded-xl bg-[#121212] border border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                            {ref.referral_code}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800">
                            Level {ref.stepped_care_level}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#aaa] border border-white/10">
                            Status: {ref.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{ref.provider_name}</h4>
                        {ref.reason && <p className="text-xs text-[#888]">{ref.reason}</p>}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {ref.patient_confirmed_care ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Care Confirmed by You</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmCareTarget(ref);
                              setConfirmCareNotes('');
                            }}
                            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer shadow"
                          >
                            Confirm Care Received
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        {/* TAB 2: DAILY WELLBEING CHECK-IN                           */}
        {/* ========================================================= */}
        {activeTab === 'daily-checkin' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-8 text-left">
            <div className="space-y-2 border-b border-[#202020] pb-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#AAA]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Daily Self-Reflection • Optional & Private</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Daily Wellbeing Check-In
              </h2>
              <p className="text-xs sm:text-sm text-[#888] max-w-2xl leading-relaxed">
                Take 30 seconds to reflect on your energy and stress. This helps our early-warning engine notice subtle changes over time. You are welcome to skip any question.
              </p>
            </div>

            {dailyCheckinSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Daily Check-In Recorded</h3>
                <p className="text-xs text-emerald-200/90 max-w-md mx-auto">
                  Your baseline has been updated. If your stress or sleep patterns change over time, gentle support recommendations will be suggested in your dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            ) : (
              <form onSubmit={handleDailyCheckinSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* 1. Mood */}
                  <div className="p-5 rounded-xl bg-[#121212] border border-[#222] space-y-3">
                    <label className="text-xs font-bold text-white uppercase font-mono block">
                      1. How are you feeling today?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Great', 'Good', 'Okay', 'Low', 'Struggling'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDailyFeeling(opt)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            dailyFeeling === opt
                              ? 'bg-white text-black border-white shadow'
                              : 'bg-[#181818] border-[#292929] text-[#888] hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Stress */}
                  <div className="p-5 rounded-xl bg-[#121212] border border-[#222] space-y-3">
                    <label className="text-xs font-bold text-white uppercase font-mono block">
                      2. How stressed do you feel?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['None', 'Mild', 'Moderate', 'High'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDailyStress(opt)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            dailyStress === opt
                              ? 'bg-white text-black border-white shadow'
                              : 'bg-[#181818] border-[#292929] text-[#888] hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Sleep */}
                  <div className="p-5 rounded-xl bg-[#121212] border border-[#222] space-y-3">
                    <label className="text-xs font-bold text-white uppercase font-mono block">
                      3. How was your sleep last night?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Deep & Restful', 'Okay', 'Disturbed', 'Barely Slept'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDailySleepQuality(opt)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            dailySleepQuality === opt
                              ? 'bg-white text-black border-white shadow'
                              : 'bg-[#181818] border-[#292929] text-[#888] hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Energy */}
                  <div className="p-5 rounded-xl bg-[#121212] border border-[#222] space-y-3">
                    <label className="text-xs font-bold text-white uppercase font-mono block">
                      4. How is your energy level?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Peak', 'Moderate', 'Low', 'Depleted'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDailyEnergyLevel(opt)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            dailyEnergyLevel === opt
                              ? 'bg-white text-black border-white shadow'
                              : 'bg-[#181818] border-[#292929] text-[#888] hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 5. Support Option */}
                <div className="p-5 rounded-xl bg-[#121212] border border-[#222] space-y-3">
                  <label className="text-xs font-bold text-white uppercase font-mono block">
                    5. Would you like support or guidance today?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      'No, feeling fine',
                      'Yes, self-help calming tools',
                      'Yes, speak with a doctor or counselor'
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDailyWantSupport(opt)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          dailyWantSupport === opt
                            ? 'bg-white text-black border-white shadow'
                            : 'bg-[#181818] border-[#292929] text-[#888] hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#202020]">
                  <span className="text-[11px] text-[#666] font-mono">
                    Zero telemetry. Stored securely under your patient medical ledger.
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-[#888] hover:text-white cursor-pointer"
                    >
                      Skip For Now
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCheckin}
                      className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow transition-all"
                    >
                      {submittingCheckin ? 'Saving Check-In...' : 'Save Check-In'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CLOSED-LOOP STEPPED CARE REFERRALS                  */}
        {/* ========================================================= */}
        {activeTab === 'referrals' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#202020] gap-3">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#AAA]">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Closed-Loop Healthcare Coordination</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
                  My Stepped Care Referrals
                </h2>
                <p className="text-xs text-[#888] mt-0.5">
                  Track your referral reviews, scheduled care, and confirm when support has been received.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('services')}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 shadow self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Find New Support Level</span>
              </button>
            </div>

            {referrals.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0D0D0D] border border-[#222] text-center space-y-3">
                <Compass className="w-10 h-10 text-[#555] mx-auto" />
                <h4 className="text-base font-semibold text-white">No Referrals Requested Yet</h4>
                <p className="text-xs text-[#888] max-w-md mx-auto">
                  When you complete a mood check or select a specialist from our Stepped-Care Navigation, your consented referral will appear here for closed-loop coordination.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('services')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <span>Explore Stepped-Care Navigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202020]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                          {ref.referral_code}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-cyan-950/70 text-cyan-300 border border-cyan-800">
                          Stepped Level {ref.stepped_care_level}
                        </span>
                        <span className="text-[10px] font-mono text-[#888]">
                          Requested: {new Date(ref.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                        ref.status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                          : ref.status === 'accepted' || ref.status === 'appointment_confirmed'
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800'
                      }`}>
                        Status: {ref.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#777] block text-[11px]">Provider / Specialist:</span>
                        <strong className="text-white text-sm">{ref.provider_name}</strong>
                        {ref.reason && <p className="text-xs text-[#aaa] mt-1">{ref.reason}</p>}
                      </div>
                      <div>
                        <span className="text-[#777] block text-[11px]">Clinical Category:</span>
                        <span className="text-white">{ref.clinical_category || 'Mental Wellbeing Coordination'}</span>
                        {ref.clinical_notes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-[#aaa]">
                            <span className="text-[10px] uppercase font-mono text-[#777] block">Doctor / Coordinator Notes:</span>
                            {ref.clinical_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Closed-Loop Status & Confirmation Section */}
                    <div className="pt-3 border-t border-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {ref.patient_confirmed_care ? (
                          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-mono">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Closed-Loop Complete: Care confirmed received by patient.</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-300/90 font-mono">
                            Pending patient confirmation of care received.
                          </span>
                        )}
                      </div>

                      <div>
                        {!ref.patient_confirmed_care && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmCareTarget(ref);
                              setConfirmCareNotes('');
                            }}
                            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer shadow"
                          >
                            Confirm Care Received
                          </button>
                        )}
                      </div>
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

      {/* 6. CLOSED-LOOP CARE CONFIRMATION MODAL */}
      {confirmCareTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Closed-Loop Verification</span>
                <h3 className="text-lg font-bold text-white">Confirm Healthcare Received</h3>
              </div>
              <button
                onClick={() => setConfirmCareTarget(null)}
                className="text-xs text-[#888] hover:text-white font-mono cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-[#bbb] leading-relaxed">
              To ensure safety and continuous follow-up, please confirm if you attended your appointment or received care from <strong className="text-white">{confirmCareTarget.provider_name}</strong> ({confirmCareTarget.referral_code}).
            </p>

            <form onSubmit={handleConfirmCareSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888] block">
                  Your feedback or follow-up notes (Optional):
                </label>
                <textarea
                  rows={3}
                  value={confirmCareNotes}
                  onChange={(e) => setConfirmCareNotes(e.target.value)}
                  placeholder="e.g., Attended consultation, discussed care plan, felt well supported..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white transition-all resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800 text-[11px] text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Confirming care closes the coordination loop and records completion in your private health ledger.</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCareTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#888] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmCareLoading}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow transition-all"
                >
                  {confirmCareLoading ? 'Confirming...' : 'Yes, Confirm Care Received'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
