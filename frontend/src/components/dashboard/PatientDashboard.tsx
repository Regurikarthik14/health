import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  Bot, 
  Stethoscope, 
  CalendarPlus, 
  Calendar, 
  FileText, 
  Bell, 
  ShieldAlert, 
  Settings, 
  ChevronRight, 
  Clock, 
  Video, 
  MapPin, 
  AlertCircle,
  Download,
  CheckCircle,
  RefreshCw,
  XCircle,
  PhoneCall
} from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Assessment, ClinicalRecord, FollowUp } from '../../types';
import { useAuth } from '../../context/AuthContext';

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
  const [loading, setLoading] = useState(true);

  // Cancellation & Rescheduling states
  const [actionLoading, setActionLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [appRes, assessRes, recordsRes] = await Promise.all([
        api.getMyAppointments().catch(() => ({ appointments: [] })),
        api.getAssessmentHistory().catch(() => ({ assessments: [] })),
        api.getClinicalRecords().catch(() => ({ records: [] }))
      ]);
      setAppointments(appRes.appointments || []);
      setAssessments(assessRes.assessments || []);
      setClinicalRecords(recordsRes.records || []);
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
    if (!window.confirm('Are you sure you want to cancel this appointment? Your reserved 30-minute slot will be released.')) return;
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
  const latestAssessment = assessments[0];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wellbeing', label: 'My Wellbeing', icon: Brain },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
    { id: 'book', label: 'Book Appointment', icon: CalendarPlus },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'emergency', label: 'Emergency Support', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'wellbeing') onNavigateTab('wellbeing');
    else if (id === 'ai') onNavigateTab('ai');
    else if (id === 'doctors') onNavigateTab('doctors');
    else if (id === 'book') onOpenBooking();
    else if (id === 'emergency') onOpenSOS();
    else setActiveTab(id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            
            {/* User profile capsule */}
            <div className="flex items-center space-x-3 p-2 bg-[#111111] rounded-xl border border-[#222]">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white text-sm">
                {user ? user.full_name[0] : 'P'}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">{user ? user.full_name : 'Patient User'}</h4>
                <p className="text-[11px] font-mono text-[#888] truncate">{user ? user.email : 'patient@urcure.com'}</p>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-[#929292] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

          </div>
        </aside>


        {/* MAIN DASHBOARD CONTENT */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-[#777777]">Patient Portal</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {user ? user.full_name.split(' ')[0] : 'Zayn'}.
              </h2>
              <p className="text-xs sm:text-sm text-[#929292] max-w-lg">
                Your private health dashboard. Review your 30-minute consultations, monitor longitudinal wellbeing metrics, and access encrypted records.
              </p>
            </div>

            <button
              onClick={onOpenBooking}
              className="px-5 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Metric Statistic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#777777]">
                <span>Upcoming Appointments</span>
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {upcomingAppointments.length}
              </div>
              <p className="text-[11px] text-[#929292]">Exclusive 30-min confirmed slots</p>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#777777]">
                <span>Latest PHQ-9 Score</span>
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {latestAssessment ? `${latestAssessment.score} / 27` : '3 / 27'}
              </div>
              <p className="text-[11px] text-[#929292]">
                Classification: <strong className="text-white uppercase">{latestAssessment ? latestAssessment.severity_level : 'Minimal'}</strong>
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#777777]">
                <span>Clinical Records</span>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {clinicalRecords.length + 1}
              </div>
              <p className="text-[11px] text-[#929292]">Encrypted notes & summaries</p>
            </div>

          </div>

          {/* Upcoming Appointment Spotlight */}
          {upcomingAppointments.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#111111] border border-white/20 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <h3 className="text-sm font-semibold text-white">Next Scheduled Consultation</h3>
                </div>
                <span className="text-xs font-mono text-[#C0C0C0]">
                  Ref: {upcomingAppointments[0].booking_reference}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {upcomingAppointments[0].doctor_name}
                  </h4>
                  <p className="text-xs text-[#929292]">{upcomingAppointments[0].doctor_specialization}</p>
                  <div className="flex items-center space-x-3 text-xs font-mono text-white pt-1">
                    <span>{upcomingAppointments[0].appointment_date}</span>
                    <span>•</span>
                    <span>{upcomingAppointments[0].start_time} – {upcomingAppointments[0].end_time}</span>
                    <span>•</span>
                    <span className="uppercase text-[#C0C0C0]">{upcomingAppointments[0].consultation_mode}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {upcomingAppointments[0].consultation_mode === 'online' ? (
                    <a
                      href={upcomingAppointments[0].meeting_link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] flex items-center space-x-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Telehealth Room</span>
                    </a>
                  ) : (
                    <div className="text-xs font-mono text-[#929292] p-2 bg-[#050505] rounded-lg border border-[#222]">
                      Clinic: {upcomingAppointments[0].clinic_address || 'Abu Dhabi Clinic Hub'}
                    </div>
                  )}

                  <a
                    href={`/api/appointments/${upcomingAppointments[0].booking_reference}/calendar.ics`}
                    download
                    className="p-2.5 rounded-xl bg-[#050505] border border-[#292929] hover:border-white text-white"
                    title="Export .ICS Calendar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Management Tab / Section */}
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
              <div>
                <h3 className="text-base font-semibold text-white">All Booked Appointments</h3>
                <p className="text-xs text-[#929292]">Real-time status, calendar export, and rescheduling</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-1 text-xs font-mono text-[#777] hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#777] bg-[#111] rounded-xl border border-[#222]">
                No appointments booked yet. Click "Book Appointment" to secure your preferred 30-minute slot.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">{app.doctor_name}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          app.status === 'confirmed' || app.status === 'rescheduled'
                            ? 'bg-white/10 text-white border-white/20'
                            : app.status === 'completed'
                            ? 'bg-white/[0.04] text-[#888] border-[#333]'
                            : 'bg-white/[0.02] text-[#555] border-[#222]'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#929292] font-mono">
                        {app.appointment_date} • {app.start_time} – {app.end_time} ({app.consultation_mode.toUpperCase()})
                      </p>
                      <p className="text-[11px] font-mono text-[#777]">Ref: {app.booking_reference}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`/api/appointments/${app.booking_reference}/calendar.ics`}
                        download
                        className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#050505] border border-[#292929] hover:border-white text-white flex items-center space-x-1"
                        title="Download .ICS"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Calendar</span>
                      </a>

                      {(app.status === 'confirmed' || app.status === 'rescheduled') && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCancelAppointment(app.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] border border-[#292929] hover:border-white/50 text-[#929292] hover:text-white"
                        >
                          Cancel Slot
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Health Records Section */}
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white">Private Clinical Records</h3>
              </div>
              <span className="text-[11px] font-mono text-[#777]">Restricted Access</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#292929] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Consultation Summary • Dr. Priya Sharma</span>
                  <span className="text-mono text-[#777]">Nov 2026</span>
                </div>
                <p className="text-xs text-[#929292] leading-relaxed">
                  "Patient demonstrated positive response to cognitive sleep scheduling. Recommendation to maintain morning sunlight exposure and continuing box breathing 2x daily."
                </p>
                <div className="pt-1 text-[11px] font-mono text-[#C0C0C0]">
                  Follow-up: Scheduled • Status: Active
                </div>
              </div>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
};
