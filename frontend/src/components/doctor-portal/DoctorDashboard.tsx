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
  User as UserIcon
} from 'lucide-react';
import { api } from '../../services/api';
import type { Appointment, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'availability' | 'notes'>('queue');
  const [stats, setStats] = useState<any>(null);
  const [todayApps, setTodayApps] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Clinical Notes Recorder State
  const [selectedAppForNote, setSelectedAppForNote] = useState<Appointment | null>(null);
  const [diagNotes, setDiagNotes] = useState('');
  const [recs, setRecs] = useState('');
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
      const [statsRes, appsRes] = await Promise.all([
        api.getDoctorDashboardStats().catch(() => ({ stats: {}, today_appointments: [], upcoming_appointments: [] })),
        api.getMyAppointments().catch(() => ({ appointments: [] }))
      ]);
      setStats(statsRes.stats || {});
      setTodayApps(statsRes.today_appointments || []);
      setAllAppointments(appsRes.appointments || []);
      if (statsRes.today_appointments && statsRes.today_appointments.length > 0 && !selectedAppForNote) {
        setSelectedAppForNote(statsRes.today_appointments[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForNote) return;
    setNoteSubmitting(true);
    try {
      await api.completeConsultation(selectedAppForNote.id, {
        diagnosis_notes: diagNotes,
        recommendations: recs,
        prescription_summary: prescriptions,
        follow_up_needed: !!followUpDate,
        follow_up_date: followUpDate
      });
      setNoteSuccess(true);
      await loadDoctorData();
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit clinical notes');
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
      alert(err.message || 'Failed to save availability');
    } finally {
      setAvailSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-[#777777]">Clinician Portal</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
              {stats?.is_verified ? 'DoH Licensed & Verified' : 'Verification In Review'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            {user ? user.full_name : 'Dr. Priya Sharma'}
          </h1>
          <p className="text-xs text-[#929292] font-mono mt-0.5">
            License: {stats?.license_number || 'DOH-MD-2018-8472'} • Rating: {stats?.rating || 4.96} ★
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('availability')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111111] border border-[#292929] text-white hover:border-white/50"
          >
            Manage Schedule
          </button>
          <button
            onClick={loadDoctorData}
            className="p-2.5 rounded-xl bg-[#111111] border border-[#292929] text-[#929292] hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777777] uppercase">Today's Queue</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{todayApps.length}</div>
          <p className="text-[10px] text-[#929292]">Exclusive 30m slots</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777777] uppercase">Upcoming Bookings</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.upcoming_count || 3}</div>
          <p className="text-[10px] text-[#929292]">Confirmed consultations</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777777] uppercase">Completed Consults</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.completed_count || 12}</div>
          <p className="text-[10px] text-[#929292]">Archived clinical records</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111111] border border-[#292929] space-y-1">
          <span className="text-[11px] font-mono text-[#777777] uppercase">Patient Network</span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats?.total_patients || 18}</div>
          <p className="text-[10px] text-[#929292]">Active care relationships</p>
        </div>
      </div>

      {/* Tab Switchers */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#111111] rounded-xl border border-[#292929] max-w-2xl">
        {[
          { id: 'queue', label: "Today's Queue" },
          { id: 'appointments', label: 'All Bookings' },
          { id: 'notes', label: 'Record Clinical Notes' },
          { id: 'availability', label: 'Working Hours' },
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

      {/* 1. TODAY'S QUEUE TAB */}
      {activeTab === 'queue' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
            <h3 className="text-sm font-semibold text-white">Today's Patient Queue (30-Min Intervals)</h3>
            <span className="text-xs font-mono text-[#777]">{new Date().toLocaleDateString()}</span>
          </div>

          {todayApps.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#777] bg-[#111] rounded-xl border border-[#222]">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">
                        {app.start_time} – {app.end_time}
                      </span>
                      <h4 className="text-sm font-bold text-white">{app.patient_name}</h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#C0C0C0] border border-[#333]">
                        {app.consultation_mode}
                      </span>
                    </div>
                    <p className="text-xs text-[#929292]">Reason: {app.reason || 'Wellbeing check-in'}</p>
                    <p className="text-[11px] font-mono text-[#777]">Booking Ref: {app.booking_reference}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {app.consultation_mode === 'online' ? (
                      <a
                        href={app.meeting_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] flex items-center space-x-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Video Room</span>
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#050505] border border-[#222] text-[#929292]">
                        In-Person Check-In
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedAppForNote(app);
                        setActiveTab('notes');
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#050505] border border-[#292929] hover:border-white/50"
                    >
                      Record Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ALL BOOKINGS TAB */}
      {activeTab === 'appointments' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#292929]">
            Comprehensive Bookings History
          </h3>
          <div className="space-y-3">
            {allAppointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono"
              >
                <div>
                  <div className="text-white font-bold">{app.patient_name}</div>
                  <div className="text-[#929292]">{app.appointment_date} • {app.start_time} – {app.end_time}</div>
                  <div className="text-[#666]">Ref: {app.booking_reference}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded bg-white/10 text-white uppercase text-[10px]">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLINICAL NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-6">
          <div className="pb-3 border-b border-[#292929]">
            <h3 className="text-base font-semibold text-white">Record Clinical Consultation Notes</h3>
            <p className="text-xs text-[#929292]">
              Secure documentation for {selectedAppForNote ? selectedAppForNote.patient_name : 'Consultation'}
            </p>
          </div>

          {noteSuccess && (
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/30 text-xs text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Consultation notes and follow-up recommendation securely committed.</span>
            </div>
          )}

          <form onSubmit={handleSaveNotes} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#777777] uppercase">Diagnostic & Observation Notes</label>
              <textarea
                rows={3}
                required
                value={diagNotes}
                onChange={(e) => setDiagNotes(e.target.value)}
                placeholder="Clinical observations, mental status exam summary, stressors identified..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#777777] uppercase">Care Plan & Recommendations</label>
              <textarea
                rows={2}
                required
                value={recs}
                onChange={(e) => setRecs(e.target.value)}
                placeholder="Behavioral modifications, sleep schedule, grounding interventions..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Prescriptions / Supplements (Optional)</label>
                <input
                  type="text"
                  value={prescriptions}
                  onChange={(e) => setPrescriptions(e.target.value)}
                  placeholder="e.g. Melatonin 3mg, Vitamin D3, or None"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Recommended Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={noteSubmitting}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all disabled:opacity-40"
            >
              {noteSubmitting ? 'Committing...' : 'Finalize Consultation & Commit Record'}
            </button>
          </form>
        </div>
      )}

      {/* 4. AVAILABILITY SETTINGS TAB */}
      {activeTab === 'availability' && (
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-6">
          <div className="pb-3 border-b border-[#292929]">
            <h3 className="text-base font-semibold text-white">Configure Working Hours & 30-Min Slots</h3>
            <p className="text-xs text-[#929292]">
              The system automatically slices working hours into exclusive 30-minute intervals, excluding lunch breaks.
            </p>
          </div>

          {availSaved && (
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/30 text-xs text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Availability schedule updated successfully across all patient calendars.</span>
            </div>
          )}

          <form onSubmit={handleSaveAvailability} className="space-y-4 max-w-xl text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Shift Start Time</label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Shift End Time</label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Lunch Break Start</label>
                <input
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777] uppercase">Lunch Break End</label>
                <input
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={availSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all"
            >
              {availSaving ? 'Updating Slots...' : 'Save 30-Min Schedule'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
