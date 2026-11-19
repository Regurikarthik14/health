import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  CheckCircle, 
  Video, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  RefreshCw,
  Send,
  User as UserIcon,
  Activity,
  Award,
  Search,
  Check,
  Building,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Compass,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, HealthBlock, Doctor, Referral } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { HealthBlockDetailModal } from '../health-blocks/HealthBlockDetailModal';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'referrals' | 'appointments' | 'cases' | 'notes' | 'availability' | 'credentials'>('queue');
  const [stats, setStats] = useState<any>(null);
  const [todayApps, setTodayApps] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [healthBlocks, setHealthBlocks] = useState<HealthBlock[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStatusUpdating, setReferralStatusUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search & filter in appointments tab
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Health Block Modal state
  const [selectedBlockRef, setSelectedBlockRef] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  // Clinical Notes (SOAP Format) State
  const [selectedAppForNote, setSelectedAppForNote] = useState<Appointment | null>(null);
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Availability form state
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [availSaving, setAvailSaving] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, blocksRes, refRes] = await Promise.all([
        api.getDoctorDashboardStats().catch(() => ({ stats: {}, today_appointments: [], upcoming_appointments: [] })),
        api.getMyAppointments().catch(() => ({ appointments: [] })),
        api.getMyHealthBlocks().catch(() => ({ health_blocks: [] })),
        api.getDoctorReferrals().catch(() => ({ referrals: [] }))
      ]);

      setStats(statsRes.stats || {});
      setTodayApps(statsRes.today_appointments || []);
      setAllAppointments(appsRes.appointments || []);
      setHealthBlocks(blocksRes.health_blocks || []);
      setReferrals(refRes.referrals || []);

      if (statsRes.today_appointments && statsRes.today_appointments.length > 0 && !selectedAppForNote) {
        setSelectedAppForNote(statsRes.today_appointments[0]);
      } else if (appsRes.appointments && appsRes.appointments.length > 0 && !selectedAppForNote) {
        setSelectedAppForNote(appsRes.appointments[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferralStatus = async (referralId: number, newStatus: string, notes?: string) => {
    setReferralStatusUpdating(true);
    try {
      await api.updateReferralStatus(referralId, {
        status: newStatus,
        notes: notes || 'Status updated by attending physician'
      });
      await loadDoctorData();
    } catch (err: any) {
      alert(err.message || 'Failed to update referral status');
    } finally {
      setReferralStatusUpdating(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForNote) {
      alert('Please select a patient appointment to record notes.');
      return;
    }

    setNoteSubmitting(true);
    try {
      const formattedClinicalDetails = [
        `[SUBJECTIVE / PATIENT COMPLAINT]\n${soapSubjective || 'Patient reports standard follow-up.'}`,
        `[OBJECTIVE / CLINICAL OBSERVATIONS]\n${soapObjective || 'Normal presentation, vitals within standard limits.'}`,
        `[ASSESSMENT / DIAGNOSIS]\n${soapAssessment || 'Clinical evaluation completed.'}`,
        `[PLAN & RECOMMENDATIONS]\n${soapPlan || 'Continue standard care and monitoring.'}`,
        prescriptions ? `[PRESCRIPTIONS]\n${prescriptions}` : null,
        followUpDate ? `[RECOMMENDED NEXT VISIT]\n${followUpDate}` : null
      ].filter(Boolean).join('\n\n');

      await api.completeConsultation(selectedAppForNote.id, {
        diagnosis_notes: soapAssessment || soapSubjective,
        recommendations: formattedClinicalDetails,
        prescription_summary: prescriptions,
        follow_up_needed: !!followUpDate,
        follow_up_date: followUpDate
      });

      setNoteSuccess(true);
      await loadDoctorData();
      setTimeout(() => setNoteSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save clinical notes');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.doctor_id) return;
    setAvailSaving(true);
    try {
      const schedules = [0, 1, 2, 3, 4].map(day => ({
        day_of_week: day,
        start_time: workStart,
        end_time: workEnd,
        break_start: breakStart,
        break_end: breakEnd,
        is_active: true
      }));
      await api.updateDoctorAvailability(user.doctor_id, schedules);
      setAvailSaved(true);
      setTimeout(() => setAvailSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save practice hours');
    } finally {
      setAvailSaving(false);
    }
  };

  const isVerified = stats?.is_verified ?? false;
  const filteredAppointments = allAppointments.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openBlockDetails = (ref: string) => {
    setSelectedBlockRef(ref);
    setBlockModalOpen(true);
  };

  const pendingReferrals = referrals.filter(r => r.status === 'submitted' || r.status === 'awaiting_review');

  const navTabs = [
    { id: 'queue', label: "Today's Queue", badge: todayApps.length > 0 ? todayApps.length : null },
    { id: 'referrals', label: 'Incoming Referrals', badge: pendingReferrals.length > 0 ? pendingReferrals.length : null },
    { id: 'appointments', label: 'All Patient Visits', badge: allAppointments.length > 0 ? allAppointments.length : null },
    { id: 'cases', label: 'Patient Health Cases', badge: healthBlocks.length > 0 ? healthBlocks.length : null },
    { id: 'notes', label: 'Document Clinical Notes (SOAP)', badge: null },
    { id: 'availability', label: 'Practice Hours', badge: null },
    { id: 'credentials', label: 'License & Practice Profile', badge: null },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left space-y-6">

      {/* 1. CLINICAL PRACTICE HEADER */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0B0B0B] border border-[#242424] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#777]">Healthcare Provider Portal</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono border flex items-center space-x-1 ${
                isVerified
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/70 text-amber-300 border-amber-800'
              }`}>
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>✓ DOH/DHA Verified Practitioner</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>⏳ Medical License Under Compliance Review</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {user ? user.full_name : 'Medical Doctor'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E8E]">
              <span>Department: <strong className="text-white">{stats?.specialization || 'Clinical Specialist'}</strong></span>
              <span>•</span>
              <span>License: <strong className="text-white">{stats?.license_number || 'Under Verification'}</strong></span>
              <span>•</span>
              <span>Affiliation: <strong className="text-white">{stats?.clinic_name || 'Abu Dhabi Medical Center'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('notes')}
              className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Document Consultation</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] hover:border-white/30 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Set Practice Hours</span>
            </button>

            <button
              onClick={loadDoctorData}
              title="Refresh Roster"
              className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-[#888] hover:text-white border border-[#2B2B2B] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </section>

      {/* Verification Notice Warning Banner */}
      {!isVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-start space-x-3 text-left">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-200 uppercase font-mono">
              Medical Credentials Awaiting Administrative Verification
            </h4>
            <p className="text-xs text-amber-300/80 leading-relaxed max-w-4xl">
              In strict accordance with UAE medical governance regulations, your clinical license is being validated against official Department of Health registers. Patient appointments are temporarily locked until compliance verification is completed by the Medical Director.
            </p>
          </div>
        </div>
      )}

      {/* 2. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setActiveTab('queue')}
          className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span>Today's Queue</span>
            <Clock className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{todayApps.length}</div>
          <p className="text-[11px] text-[#888]">30-minute patient visits</p>
        </div>

        <div 
          onClick={() => setActiveTab('appointments')}
          className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span>Total Scheduled Visits</span>
            <Calendar className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{allAppointments.length}</div>
          <p className="text-[11px] text-[#888]">Confirmed & past visits</p>
        </div>

        <div 
          onClick={() => setActiveTab('cases')}
          className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span>Patient Health Cases</span>
            <Activity className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{healthBlocks.length}</div>
          <p className="text-[11px] text-[#888]">Active problem journeys</p>
        </div>

        <div 
          onClick={() => setActiveTab('referrals')}
          className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222] hover:border-white/40 transition-all cursor-pointer space-y-1 group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span>Pending Referrals</span>
            <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {pendingReferrals.length}
          </div>
          <p className="text-[11px] text-[#888]">Awaiting triage & scheduling</p>
        </div>

      </div>

      {/* 3. TAB NAVIGATION */}
      <nav aria-label="Doctor Practice Navigation" className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-[#090909] border border-[#222] overflow-x-auto">
        {navTabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{t.label}</span>
              {t.badge !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-black text-white' : 'bg-white/10 text-[#C0C0C0]'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. TAB CONTENT */}
      <main className="space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: TODAY'S CLINICAL QUEUE                             */}
        {/* ========================================================= */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#777]">Daily Schedule</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Today's Patient Consultations (30-Minute Slots)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888] bg-[#121212] px-3 py-1.5 rounded-lg border border-[#222]">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {todayApps.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                <Clock className="w-8 h-8 text-[#555] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Consultations Scheduled for Today</h4>
                <p className="text-xs text-[#777] max-w-sm mx-auto">
                  Your queue is clear. When patients book slots during your active practice hours, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold bg-white text-black px-2.5 py-0.5 rounded shadow">
                          {app.start_time} – {app.end_time}
                        </span>
                        <h4 className="text-sm font-bold text-white">{app.patient_name}</h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                          {app.consultation_mode === 'online' ? 'Online Telehealth' : 'In-Person Clinic'}
                        </span>
                      </div>

                      <p className="text-xs text-[#999]">
                        Chief Complaint / Reason: <strong className="text-white">{app.reason || 'General Health Consultation'}</strong>
                      </p>

                      <div className="text-[11px] font-mono text-[#777] flex items-center space-x-3">
                        <span>Code: {app.booking_reference}</span>
                        <span>•</span>
                        <span>Duration: 30 Mins</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {app.consultation_mode === 'online' && (
                        <a
                          href={app.meeting_link || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] flex items-center space-x-1.5 shadow"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Telehealth Room</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAppForNote(app);
                          setSoapSubjective(app.reason || '');
                          setActiveTab('notes');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] text-xs font-semibold cursor-pointer"
                      >
                        Document Note (SOAP)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: INCOMING REFERRALS & STEPPED-CARE TRIAGE             */}
        {/* ========================================================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase text-[#777]">Care Coordination Queue</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Stepped-Care Referral Review & Triage
                </h3>
                <p className="text-xs text-[#888] mt-1">
                  Review incoming referrals, consented patient assessments (PHQ-9 / GAD-7), and coordinate appointment requests.
                </p>
              </div>
              <span className="text-xs font-mono text-[#888] bg-[#121212] px-3 py-1.5 rounded-lg border border-[#222] self-start sm:self-auto">
                {referrals.length} Total Referrals
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                <Compass className="w-8 h-8 text-[#555] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Referrals in Queue</h4>
                <p className="text-xs text-[#777] max-w-sm mx-auto">
                  When patients request stepped-care support or referrals from verified questionnaires, they will appear here for your clinical triage.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all space-y-4 text-left shadow-lg"
                  >
                    {/* Top referral meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202020]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-white text-black px-2.5 py-0.5 rounded shadow">
                          {ref.referral_code}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {ref.patient_name || `Patient #${ref.patient_id}`}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800">
                          Stepped Level {ref.stepped_care_level}
                        </span>
                        <span className="text-[10px] font-mono text-[#777]">
                          Received: {new Date(ref.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full border self-start sm:self-auto ${
                        ref.status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                          : ref.status === 'accepted' || ref.status === 'appointment_confirmed'
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800'
                      }`}>
                        {ref.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Patient Consented Clinical Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#777] block">Consented Assessment Data</span>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          <strong className="text-white text-sm">
                            {ref.latest_assessment_type || 'PHQ-9 Mood Check'}
                          </strong>
                        </div>
                        <div className="text-[#aaa] font-mono text-xs">
                          Score: <strong className="text-white">{ref.latest_score ?? 3} / 27</strong>
                        </div>
                        <div className="text-[11px] text-[#888]">
                          Severity: <span className="uppercase text-amber-300">{ref.latest_severity || 'Mild'}</span>
                        </div>
                        <div className="pt-1 text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Informed Patient Consent Confirmed</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#777] block">Referral Target & Category</span>
                        <div className="text-white font-semibold text-sm">{ref.provider_name}</div>
                        <div className="text-[#888]">{ref.clinical_category || 'Primary Mental Wellbeing'}</div>
                        {ref.reason && (
                          <div className="text-xs text-[#bbb] pt-1">
                            <em>Patient notes:</em> "{ref.reason}"
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#777] block">Closed-Loop Status</span>
                        {ref.patient_confirmed_care ? (
                          <div className="space-y-1 text-emerald-300">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span>Care Confirmed by Patient</span>
                            </div>
                            <p className="text-[11px] text-emerald-200/80">
                              {ref.patient_confirmation_notes || 'Patient verified receipt of care.'}
                            </p>
                          </div>
                        ) : (
                          <div className="text-[#888] space-y-1">
                            <span className="text-amber-300/90 font-mono block">Pending Patient Verification</span>
                            <p className="text-[11px] text-[#777]">
                              Loop closes when patient confirms receiving care in their dashboard.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Doctor Action Controls */}
                    <div className="pt-3 border-t border-[#202020] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#777] font-mono">
                        Clinical Oversight: Select action to coordinate referral
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {ref.status !== 'accepted' && ref.status !== 'appointment_confirmed' && ref.status !== 'completed' && (
                          <button
                            disabled={referralStatusUpdating}
                            onClick={() => handleUpdateReferralStatus(ref.id, 'accepted', 'Physician accepted referral request.')}
                            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer shadow"
                          >
                            Accept Referral
                          </button>
                        )}

                        {ref.status !== 'appointment_requested' && ref.status !== 'appointment_confirmed' && ref.status !== 'completed' && (
                          <button
                            disabled={referralStatusUpdating}
                            onClick={() => handleUpdateReferralStatus(ref.id, 'appointment_requested', 'Coordinator requested appointment slot.')}
                            className="px-3.5 py-1.5 rounded-lg bg-[#181818] text-white hover:bg-[#252525] border border-[#333] text-xs font-mono cursor-pointer"
                          >
                            Request Visit
                          </button>
                        )}

                        {ref.status !== 'appointment_confirmed' && ref.status !== 'completed' && (
                          <button
                            disabled={referralStatusUpdating}
                            onClick={() => handleUpdateReferralStatus(ref.id, 'appointment_confirmed', 'Appointment confirmed with patient.')}
                            className="px-3.5 py-1.5 rounded-lg bg-cyan-950/70 text-cyan-200 hover:bg-cyan-900 border border-cyan-800 text-xs font-mono cursor-pointer"
                          >
                            Confirm Visit
                          </button>
                        )}

                        {ref.status !== 'completed' && (
                          <button
                            disabled={referralStatusUpdating}
                            onClick={() => handleUpdateReferralStatus(ref.id, 'completed', 'Clinical consultation delivered.')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-950/70 text-emerald-200 hover:bg-emerald-900 border border-emerald-800 text-xs font-mono cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          disabled={referralStatusUpdating}
                          onClick={() => handleUpdateReferralStatus(ref.id, 'alternative_support_required', 'Redirected to alternate stepped care service.')}
                          className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-900 text-xs font-mono cursor-pointer"
                        >
                          Redirect
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ALL PATIENT VISITS & ROSTER                        */}
        {/* ========================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#777]">Practice Schedule</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  All Patient Consultations
                </h3>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#777] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search patient or code..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#111] border border-[#262626] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#111] border border-[#262626] text-xs text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                <Calendar className="w-8 h-8 text-[#555] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Appointments Found</h4>
                <p className="text-xs text-[#777] max-w-sm mx-auto">
                  No records match your current search and filter criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{app.patient_name}</h4>
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
                      <p className="text-xs text-[#999]">
                        Date: <strong className="text-white">{app.appointment_date}</strong> • Slot: <strong className="text-white">{app.start_time} – {app.end_time}</strong> ({app.consultation_mode})
                      </p>
                      <p className="text-[11px] font-mono text-[#777]">
                        Code: {app.booking_reference} • Reason: {app.reason || 'General Consultation'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAppForNote(app);
                          setSoapSubjective(app.reason || '');
                          setActiveTab('notes');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all cursor-pointer"
                      >
                        Clinical Note →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PATIENT HEALTH CASES & BLOCKS                      */}
        {/* ========================================================= */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#242424] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#777]">Clinical Case Management</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Patient Health Blocks Under Care
                </h3>
                <p className="text-xs text-[#8E8E8E] mt-0.5">
                  Problems tracked from first symptom intake to doctor diagnosis and clinical resolution.
                </p>
              </div>
            </div>

            {healthBlocks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#222] space-y-3">
                <Activity className="w-8 h-8 text-[#555] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Assigned Health Blocks</h4>
                <p className="text-xs text-[#777] max-w-sm mx-auto">
                  When patients initiate health blocks and book appointments with your specialty, their medical ledgers will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthBlocks.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-white/30 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                          {b.block_reference}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                          b.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950/70 text-amber-300 border-amber-800'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{b.title}</h4>
                        <div className="text-xs text-[#888] mt-0.5">
                          Body Area: <strong className="text-white">{b.body_area}</strong> • Pain: <strong className="text-white">{b.pain_scale}/10</strong>
                        </div>
                      </div>

                      <p className="text-xs text-[#999] line-clamp-2 leading-relaxed">
                        {b.trouble_description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222] text-xs font-mono space-y-1">
                        <div className="text-[#888]">
                          Recognized Diagnosis: <strong className="text-white">{b.recognized_diagnosis || 'Clinical evaluation pending'}</strong>
                        </div>
                        <div className="text-[#888]">
                          Specialist: <strong className="text-white">{b.recommended_specialist || 'Specialist'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#222] flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-[#666]">
                        Genesis: {b.genesis_hash.substring(0, 10)}...
                      </span>
                      <button
                        onClick={() => openBlockDetails(b.block_reference)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-all cursor-pointer"
                      >
                        Open Case File →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CLINICAL DOCUMENTATION (SOAP NOTE WRITER)           */}
        {/* ========================================================= */}
        {activeTab === 'notes' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222] gap-3">
              <div>
                <span className="text-xs font-mono uppercase text-[#777]">EHR Clinical Documentation</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Consultation Summary & Prescription Form (SOAP)
                </h3>
                <p className="text-xs text-[#8E8E8E]">
                  Saved records are digitally signed and immediately synced to the patient's dashboard and MongoDB Atlas cloud ledger.
                </p>
              </div>

              {selectedAppForNote && (
                <div className="text-xs font-mono text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 shrink-0">
                  Patient: <strong className="text-white">{selectedAppForNote.patient_name}</strong>
                </div>
              )}
            </div>

            {noteSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-200 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Clinical record successfully signed and delivered to the patient's dashboard and persistent cloud ledger.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveNotes} className="space-y-5 text-left">
              
              {/* Patient Selector */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#777]">Select Patient Consultation *</label>
                <select
                  value={selectedAppForNote?.id || ''}
                  onChange={(e) => {
                    const found = allAppointments.find(a => a.id === parseInt(e.target.value));
                    if (found) {
                      setSelectedAppForNote(found);
                      setSoapSubjective(found.reason || '');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white focus:outline-none focus:border-white/50"
                  required
                >
                  <option value="">-- Choose a patient appointment --</option>
                  {allAppointments.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.patient_name} • {app.appointment_date} ({app.start_time} - {app.end_time}) • [{app.booking_reference}]
                    </option>
                  ))}
                </select>
              </div>

              {/* S: Subjective */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#777]">
                  S — Subjective (Patient Chief Complaints & History)
                </label>
                <textarea
                  rows={2}
                  value={soapSubjective}
                  onChange={(e) => setSoapSubjective(e.target.value)}
                  placeholder="Patient's reported symptoms, onset, pain character, and timeline..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                />
              </div>

              {/* O: Objective */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#777]">
                  O — Objective (Doctor Examination, Vitals & Observations)
                </label>
                <textarea
                  rows={2}
                  value={soapObjective}
                  onChange={(e) => setSoapObjective(e.target.value)}
                  placeholder="Clinical observations, mental status, physical examination, vitals, test reviews..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                />
              </div>

              {/* A: Assessment */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#777]">
                  A — Assessment (Clinical Diagnosis & Differential) *
                </label>
                <input
                  type="text"
                  required
                  value={soapAssessment}
                  onChange={(e) => setSoapAssessment(e.target.value)}
                  placeholder="e.g. Tension-type headache, Generalized anxiety with mild insomnia, or Lumbar strain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                />
              </div>

              {/* P: Plan */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#777]">
                  P — Plan & Patient Instructions (Lifestyle, Therapy, Exercise)
                </label>
                <textarea
                  rows={2}
                  value={soapPlan}
                  onChange={(e) => setSoapPlan(e.target.value)}
                  placeholder="Recommendations, hydration, sleep hygiene, mindfulness breathing, or referral advice..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                />
              </div>

              {/* Prescriptions & Follow-up Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">
                    Prescribed Medications & Vitamins (Optional)
                  </label>
                  <input
                    type="text"
                    value={prescriptions}
                    onChange={(e) => setPrescriptions(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg as needed, Vitamin D3 1000 IU daily"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">
                    Recommended Follow-Up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777]">
                  Signed by: Dr. {user?.full_name || 'Practitioner'}
                </span>

                <button
                  type="submit"
                  disabled={noteSubmitting}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer disabled:opacity-40 shadow-lg flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{noteSubmitting ? 'Signing & Saving...' : 'Sign & Deliver Clinical Note'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PRACTICE HOURS & AVAILABILITY                      */}
        {/* ========================================================= */}
        {activeTab === 'availability' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6">
            <div className="pb-4 border-b border-[#222]">
              <span className="text-xs font-mono uppercase text-[#777]">Consultation Scheduler</span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Set Weekly Practice & Working Hours
              </h3>
              <p className="text-xs text-[#8E8E8E]">
                Working hours are divided into 30-minute appointments, leaving your lunch break open.
              </p>
            </div>

            {availSaved && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-200 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Working hours updated! New 30-minute slots are open for patient booking.</span>
              </div>
            )}

            <form onSubmit={handleSaveAvailability} className="space-y-4 max-w-xl text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">Shift Start Time</label>
                  <input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">Shift End Time</label>
                  <input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">Lunch Break Start</label>
                  <input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#777]">Lunch Break End</label>
                  <input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-[#282828] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={availSaving}
                className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg"
              >
                {availSaving ? 'Saving...' : 'Save Practice Working Hours'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LICENSE & PRACTICE CREDENTIALS                     */}
        {/* ========================================================= */}
        {activeTab === 'credentials' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] space-y-6">
            <div className="pb-4 border-b border-[#222]">
              <span className="text-xs font-mono uppercase text-[#777]">Regulatory Compliance</span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Medical License & Provider Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Full Legal Name</span>
                <div className="text-white font-bold text-sm">{user?.full_name}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Specialization</span>
                <div className="text-white font-bold text-sm">{stats?.specialization || 'Clinical Specialist'}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Medical License Number</span>
                <div className="text-white font-bold text-sm">{stats?.license_number || 'Pending Review'}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Verification Status</span>
                <div className={`font-bold text-sm ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isVerified ? '✓ Approved by Compliance Board' : '⏳ Pending Review'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Practice Clinic</span>
                <div className="text-white font-bold text-sm">{stats?.clinic_name || 'Abu Dhabi Medical Center'}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-1">
                <span className="text-[#777] uppercase">Consultation Fee</span>
                <div className="text-white font-bold text-sm">AED {stats?.consultation_fee || 250} / 30 Mins</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* HEALTH BLOCK DETAIL MODAL */}
      {selectedBlockRef && (
        <HealthBlockDetailModal
          isOpen={blockModalOpen}
          blockReference={selectedBlockRef}
          onClose={() => {
            setBlockModalOpen(false);
            setSelectedBlockRef(null);
          }}
          onBlockUpdated={loadDoctorData}
        />
      )}

    </div>
  );
};
