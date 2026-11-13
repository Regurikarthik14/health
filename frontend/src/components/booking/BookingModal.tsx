import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  CalendarPlus,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import type { Doctor, TimeSlot, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctor?: Doctor | null;
  onBookingComplete?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor = null,
  onBookingComplete
}) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preselectedDoctor);
  const [consultationMode, setConsultationMode] = useState<'online' | 'offline'>('online');
  
  // Date selection (default today or tomorrow)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Slots state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Completed booking state
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Booking fields
  const [reason, setReason] = useState('General check-in and doctor advice');
  const [notes, setNotes] = useState('');

  // Fetch doctors if not provided
  useEffect(() => {
    if (isOpen) {
      if (preselectedDoctor) {
        setSelectedDoctor(preselectedDoctor);
      } else {
        api.getDoctors().then(res => {
          setDoctors(res.doctors);
          if (res.doctors.length > 0 && !selectedDoctor) {
            setSelectedDoctor(res.doctors[0]);
          }
        }).catch(err => console.error(err));
      }
      setConfirmedAppointment(null);
      setBookingError(null);
      setSelectedSlot(null);
    }
  }, [isOpen, preselectedDoctor]);

  // Fetch 30-minute slots whenever doctor or date changes
  const fetchSlots = async () => {
    if (!selectedDoctor) return;
    setLoadingSlots(true);
    setBookingError(null);
    setSelectedSlot(null);
    try {
      const res = await api.getDoctorSlots(selectedDoctor.id, selectedDate);
      setSlots(res.slots || []);
    } catch (err: any) {
      setBookingError(err.message || 'Could not load available doctor times. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await api.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        consultation_mode: consultationMode,
        reason,
        notes
      });

      setConfirmedAppointment(res.appointment);
      if (onBookingComplete) {
        onBookingComplete(res.appointment);
      }

      // Fire celebratory monochrome/silver confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#C0C0C0', '#888888', '#dddddd']
        });
      } catch (e) {
        // Confetti fallback
      }

    } catch (err: any) {
      // Slot collision or error
      setBookingError(err.message || 'This time was just booked by someone else. Please pick another time.');
      // Refresh slots immediately to show new availability
      fetchSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B0B0B] border border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#292929] flex items-center justify-center">
              <CalendarPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Book a 30-Minute Visit</h3>
              <p className="text-[11px] font-mono text-[#777777]">Private 1-on-1 Time Reserved Just For You</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONFIRMATION SCREEN (When booked) */}
        {confirmedAppointment ? (
          <div className="space-y-6 py-2">
            
            <div className="p-6 rounded-2xl bg-[#111111] border border-white/20 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/40 flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#C0C0C0]">
                  Time Reserved Successfully
                </span>
                <h4 className="text-2xl font-bold text-white mt-1">Your Visit is Booked!</h4>
                <p className="text-xs text-[#929292] font-mono mt-0.5">
                  Booking Code: <strong className="text-white">{confirmedAppointment.booking_reference}</strong>
                </p>
              </div>

              {/* Appointment summary details */}
              <div className="p-4 rounded-xl bg-[#050505] border border-[#292929] text-xs font-mono space-y-2 text-left">
                <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                  <span className="text-[#777777]">Doctor:</span>
                  <span className="text-white font-medium">{confirmedAppointment.doctor_name} ({confirmedAppointment.doctor_specialization})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                  <span className="text-[#777777]">Date & Time:</span>
                  <span className="text-white font-semibold">
                    {confirmedAppointment.appointment_date} • {confirmedAppointment.start_time} – {confirmedAppointment.end_time} (30 mins)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                  <span className="text-[#777777]">How You Will Meet:</span>
                  <span className="text-white uppercase font-bold">{confirmedAppointment.consultation_mode === 'online' ? 'Online Video' : 'In-Person Clinic'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                  <span className="text-[#777777]">Status:</span>
                  <span className="text-white uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                    {confirmedAppointment.status === 'confirmed' ? 'Confirmed' : confirmedAppointment.status}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[#777777] block mb-1">
                    {confirmedAppointment.consultation_mode === 'online' ? 'Private Video Call Link:' : 'Clinic Address:'}
                  </span>
                  <p className="text-white font-sans text-xs bg-[#111111] p-2 rounded border border-[#292929] break-all">
                    {confirmedAppointment.consultation_mode === 'online'
                      ? confirmedAppointment.meeting_link
                      : confirmedAppointment.clinic_address}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`/api/appointments/${confirmedAppointment.booking_reference}/calendar.ics`}
                  download
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Save to My Calendar</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#111111] border border-[#292929] hover:border-white/40 transition-all"
                >
                  Done & View My Visits
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* BOOKING WIZARD STEPS */
          <div className="space-y-6">
            
            {/* Step 1: Doctor Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#777777]">1. Choose Your Doctor</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(doctors.length > 0 ? doctors : (selectedDoctor ? [selectedDoctor] : [])).map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/50 shadow-md'
                          : 'bg-[#111111] border-[#292929] hover:border-white/20'
                      }`}
                    >
                      <img
                        src={doc.photo_url}
                        alt={doc.full_name}
                        className="w-12 h-12 rounded-lg object-cover grayscale contrast-125 border border-[#333]"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1">
                          <h4 className="text-xs font-semibold text-white truncate">{doc.full_name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                        </div>
                        <p className="text-[11px] text-[#929292] truncate">{doc.specialization}</p>
                        <p className="text-[10px] font-mono text-[#C0C0C0]">AED {doc.consultation_fee} / 30m</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Consultation Mode & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Consultation Mode */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#777777]">2. How Would You Like to Meet?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationMode('online')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                      consultationMode === 'online'
                        ? 'bg-white text-black font-semibold'
                        : 'bg-[#111111] border-[#292929] text-[#929292] hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs">Online Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationMode('offline')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                      consultationMode === 'offline'
                        ? 'bg-white text-black font-semibold'
                        : 'bg-[#111111] border-[#292929] text-[#929292] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">In-Person Clinic</span>
                  </button>
                </div>
              </div>

              {/* Consultation Date */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#777777]">3. Pick a Date</label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-[#111111] border border-[#292929] text-xs font-mono text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

            </div>

            {/* Step 3: Available 30-Minute Slots Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-[#777777]">
                  4. Choose a 30-Minute Time
                </label>
                <button
                  type="button"
                  onClick={fetchSlots}
                  className="flex items-center space-x-1 text-[11px] font-mono text-[#929292] hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingSlots ? 'animate-spin' : ''}`} />
                  <span>Refresh Times</span>
                </button>
              </div>

              {loadingSlots ? (
                <div className="p-8 text-center text-xs font-mono text-[#777777] bg-[#111111] rounded-xl border border-[#292929]">
                  Checking doctor schedule...
                </div>
              ) : slots.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#929292] bg-[#111111] rounded-xl border border-[#292929]">
                  No open times on this day. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {slots.map((slot, idx) => {
                    const isSelected = selectedSlot === slot.start_time;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!slot.is_available}
                        onClick={() => setSelectedSlot(slot.start_time)}
                        className={`p-2.5 rounded-lg text-xs font-mono border transition-all text-center ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow-lg border-white'
                            : slot.is_available
                            ? 'bg-[#111111] border-[#292929] text-white hover:border-white/50 cursor-pointer'
                            : 'bg-[#0B0B0B] border-[#1C1C1C] text-[#555] cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="font-semibold">{slot.start_time}</div>
                        <div className="text-[10px] uppercase tracking-wider mt-0.5">
                          {slot.status === 'available'
                            ? (isSelected ? 'Selected' : 'Open')
                            : slot.status === 'booked'
                            ? 'Reserved'
                            : slot.status === 'break'
                            ? 'Break'
                            : 'Past'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reason & Notes */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Reason for Visit</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What would you like to talk about with the doctor?"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                />
              </div>
            </div>

            {/* Collision Error Alert */}
            {bookingError && (
              <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/20 text-xs text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#C0C0C0] shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Submit Lock CTA */}
            <button
              type="button"
              disabled={bookingLoading || !selectedDoctor || !selectedSlot}
              onClick={handleBook}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <span>
                {bookingLoading ? 'Saving your time...' : `Book My Visit for ${selectedSlot || 'this time'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-[#666666] font-mono text-center">
              Your 30 minutes are fully reserved for you. Free cancellation anytime up to 4 hours before your visit.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
