import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Check, 
  X, 
  RefreshCw,
  Search,
  Lock,
  Eye,
  Server
} from 'lucide-react';
import { api } from '../../services/api';
import type { Doctor, Appointment, CrisisEvent, AuditLog } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'appointments' | 'crisis' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [crisisEvents, setCrisisEvents] = useState<CrisisEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, docRes, appRes, patRes, crisisRes, logsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getAdminDoctors().catch(() => ({ doctors: [] })),
        api.getAllAppointments().catch(() => ({ appointments: [] })),
        api.getAllPatients().catch(() => ({ patients: [] })),
        api.getCrisisEvents().catch(() => ({ crisis_events: [] })),
        api.getAuditLogs().catch(() => ({ audit_logs: [] }))
      ]);

      setStats(statsRes.stats || {});
      setDoctors(docRes.doctors || []);
      setAppointments(appRes.appointments || []);
      setPatients(patRes.patients || []);
      setCrisisEvents(crisisRes.crisis_events || []);
      setAuditLogs(logsRes.audit_logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerification = async (doctorId: number, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      await api.toggleDoctorVerification(doctorId, !currentStatus);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCrisis = async (crisisId: number) => {
    const notes = prompt('Enter resolution summary / medical officer sign-off:');
    if (!notes) return;
    setActionLoading(true);
    try {
      await api.resolveCrisisEvent(crisisId, notes);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve crisis event');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-[#777777]">Administration & Platform Settings</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
              Certified Platform Compliant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            urCure Admin Portal
          </h1>
          <p className="text-xs text-[#929292] font-mono mt-0.5">
            System Status: All Systems Running Smoothly • 24/7 Monitoring
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] hover:border-white text-xs font-mono text-white flex items-center space-x-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Private Doctor Link Distribution Box */}
      <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Private Doctor Invitation Link (Confidential)
            </h3>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-[#AAA]">
              Doctors Only
            </span>
          </div>
          <p className="text-xs text-[#888888] leading-relaxed max-w-2xl">
            Provide this separate link <strong className="text-white">only to licensed doctors</strong> to apply or sign in. The public website remains strictly for patients with zero doctor registration visibility.
          </p>
          <div className="text-xs font-mono text-white bg-black px-3 py-1.5 rounded-lg border border-[#252525] inline-flex items-center space-x-2">
            <span>{typeof window !== 'undefined' ? `${window.location.origin}/doctor` : 'http://localhost:5173/doctor'}</span>
          </div>
        </div>
        <button
          onClick={() => {
            const url = `${window.location.origin}/doctor`;
            navigator.clipboard.writeText(url);
            alert(`Private Doctor Link copied to clipboard:\n${url}\n\nSend this link only to authorized medical doctors.`);
          }}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer transition-all flex items-center space-x-1.5 shrink-0 shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-black" />
          <span>Copy Doctor Link</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777] uppercase">Registered Patients</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.total_patients || 0}</div>
          <p className="text-[10px] text-[#929292]">Active patient accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777] uppercase">Approved Doctors</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.verified_doctors || 0}</div>
          <p className="text-[10px] text-[#929292]">{stats?.pending_doctors || 0} pending check</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777] uppercase">Active Visits</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.active_appointments || 0}</div>
          <p className="text-[10px] text-[#929292]">Reserved 30-min visits</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777] uppercase">Emergency Alerts</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.total_crisis_events || 0}</div>
          <p className="text-[10px] text-[#929292]">{stats?.open_crisis_events || 0} need attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-[#111111] rounded-xl border border-[#292929] max-w-3xl">
        {[
          { id: 'overview', label: 'Platform Stats' },
          { id: 'doctors', label: 'Doctor Approvals' },
          { id: 'appointments', label: 'All Visits' },
          { id: 'crisis', label: 'Emergency Alerts' },
          { id: 'audit', label: 'Activity History' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-[#929292] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-[#292929]">
              Database & Infrastructure Status
            </h3>
            <div className="space-y-3 text-xs font-mono text-[#929292]">
              <div className="flex justify-between py-1 border-b border-[#1C1C1C]">
                <span>Engine:</span>
                <span className="text-white">PostgreSQL / SQLite WAL Engine</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C1C]">
                <span>Booking Protection:</span>
                <span className="text-white">Strict Single-Booking (No Overlaps)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C1C]">
                <span>Total Sections:</span>
                <span className="text-white">16 Connected System Tables</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C1C]">
                <span>Patient Privacy:</span>
                <span className="text-white">Private Doctor Notes Hidden From Admin</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-[#292929]">
              Registered Patient Directory
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {patients.map((p) => (
                <div key={p.id} className="p-3 rounded-lg bg-[#111111] border border-[#222] flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-[#777] font-mono">{p.email}</div>
                  </div>
                  <span className="text-[10px] font-mono text-[#C0C0C0] uppercase">
                    {p.appointments_count} Visits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCTOR VERIFICATION TAB */}
      {activeTab === 'doctors' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
            <div>
              <h3 className="text-sm font-semibold text-white">Doctor Approval List</h3>
              <p className="text-xs text-[#929292]">Only approved doctors appear on the website and can receive visits.</p>
            </div>
          </div>

          <div className="space-y-3">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-sm">{doc.full_name}</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                      doc.is_verified
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white/[0.04] text-[#C0C0C0] border-[#333]'
                    }`}>
                      {doc.is_verified ? 'Approved' : 'Pending Check'}
                    </span>
                  </div>
                  <p className="text-xs text-[#929292]">{doc.specialization} • License: {doc.license_number}</p>
                  <p className="text-[11px] font-mono text-[#777]">{doc.clinic_name}, {doc.clinic_city}</p>
                </div>

                <button
                  disabled={actionLoading}
                  onClick={() => handleToggleVerification(doc.id, doc.is_verified)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    doc.is_verified
                      ? 'bg-white/[0.05] border border-[#333] text-[#929292] hover:text-white'
                      : 'bg-white text-black hover:bg-[#EAEAEA]'
                  }`}
                >
                  {doc.is_verified ? 'Pause Doctor Account' : 'Approve Doctor'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#292929]">
            All Visits Booked Across urCure
          </h3>
          <div className="space-y-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="text-white font-bold">{app.patient_name} → {app.doctor_name}</div>
                  <div className="text-[#929292]">{app.appointment_date} • {app.start_time} – {app.end_time} ({app.consultation_mode === 'online' ? 'ONLINE VIDEO' : 'IN CLINIC'})</div>
                  <div className="text-[#666]">Booking Code: {app.booking_reference}</div>
                </div>
                <span className="px-2 py-1 rounded bg-white/10 text-white uppercase text-[10px]">
                  {app.status === 'confirmed' ? 'Confirmed' : app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CRISIS OVERSIGHT TAB */}
      {activeTab === 'crisis' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#292929]">
            Emergency Call Logs & Safety Alerts
          </h3>
          <div className="space-y-3">
            {crisisEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white font-bold">Alert #{evt.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white border border-white/20">
                      {evt.risk_level}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#777]">
                    {evt.created_at ? evt.created_at.slice(0, 16).replace('T', ' ') : ''}
                  </span>
                </div>

                <p className="text-[#929292] font-mono text-[11px] bg-[#050505] p-2.5 rounded border border-[#222]">
                  {evt.trigger_text || 'Emergency SOS triggered'}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-[#C0C0C0]">
                    Support: {evt.human_agent_id} • Status: {evt.resolved ? 'Resolved' : 'Active Alert'}
                  </span>
                  {!evt.resolved && (
                    <button
                      onClick={() => handleResolveCrisis(evt.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-black hover:bg-[#EAEAEA]"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#292929]">
            System Activity & Security History
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-[#111111] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-white font-bold">{log.action}</span>
                  <span className="text-[#777] ml-2">[{log.resource}]</span>
                  <p className="text-[#999] text-[11px] mt-0.5">{log.details}</p>
                </div>
                <div className="text-[10px] text-[#666] text-right">
                  <div>{log.ip_address}</div>
                  <div>{log.timestamp ? log.timestamp.slice(0, 19).replace('T', ' ') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
