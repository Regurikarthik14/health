import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Video, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Globe,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import type { Doctor } from '../../types';
import { DoctorProfileModal } from './DoctorProfileModal';

interface DoctorDiscoveryProps {
  onSelectDoctorForBooking: (doctor: Doctor) => void;
}

export const DoctorDiscovery: React.FC<DoctorDiscoveryProps> = ({
  onSelectDoctorForBooking
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & filter states
  const [searchName, setSearchName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [mode, setMode] = useState('');
  const [maxFee, setMaxFee] = useState<number>(300);
  const [language, setLanguage] = useState('');

  // Selected doctor for viewing profile
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors({
        name: searchName,
        specialization,
        mode,
        max_fee: maxFee,
        language
      });
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchName, specialization, mode, maxFee, language]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-xs font-mono text-[#C0C0C0]">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Department of Health (DoH) Licensed Specialists</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Discover Your Preferred Doctor
        </h1>
        <p className="text-sm sm:text-base text-[#929292] max-w-2xl">
          On urCure, you possess complete freedom of choice. Browse certified clinicians, compare verified credentials, and book direct 30-minute appointments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search doctors by name or clinical keywords..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111111] border border-[#292929] text-sm text-white placeholder-[#555] focus:outline-none focus:border-white/50"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Specialization */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#777777] uppercase">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
            >
              <option value="">All Specializations</option>
              <option value="Psychiatrist">Consultant Psychiatrist</option>
              <option value="Neuropsychologist">Clinical Neuropsychologist</option>
              <option value="Integrative">Integrative Physician</option>
              <option value="Adolescent">Child & Adolescent Psychologist</option>
            </select>
          </div>

          {/* Consultation Mode */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#777777] uppercase">Consultation Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
            >
              <option value="">Online & In-Person</option>
              <option value="online">Online Video Only</option>
              <option value="offline">In-Person Clinic Only</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#777777] uppercase">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
            >
              <option value="">Any Language</option>
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Fee Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#777777]">
              <span>Max Fee:</span>
              <span className="text-white font-bold">AED {maxFee}</span>
            </div>
            <input
              type="range"
              min="100"
              max="350"
              step="10"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-white bg-[#111111] mt-1"
            />
          </div>

        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#777777]">
          <span>Found {doctors.length} verified practitioners</span>
          <button
            onClick={() => {
              setSearchName('');
              setSpecialization('');
              setMode('');
              setMaxFee(300);
              setLanguage('');
            }}
            className="hover:text-white"
          >
            Reset Filters
          </button>
        </div>

      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#777777]">
          <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-white" />
          <span>Searching verified provider network...</span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-3">
          <p className="text-sm text-white">No doctors match your selected criteria.</p>
          <p className="text-xs text-[#777777]">Try widening your fee filter or clearing search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] hover:border-[#C0C0C0]/50 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                
                {/* Doctor Headshot & Badges */}
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.photo_url}
                    alt={doctor.full_name}
                    className="w-16 h-16 rounded-xl object-cover grayscale contrast-125 border border-[#292929] group-hover:border-white/40 transition-all"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {doctor.full_name}
                      </h3>
                      <span title="DoH Verified">
                        <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs text-[#929292] truncate">{doctor.specialization}</p>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-[#C0C0C0] mt-1">
                      <span>{doctor.experience_years} Yrs</span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5">
                        <Star className="w-3 h-3 text-white fill-white" />
                        <span>{doctor.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-[#929292] line-clamp-2 leading-relaxed">
                  {doctor.bio}
                </p>

                {/* Details Pills */}
                <div className="space-y-2 text-xs font-mono text-[#777777] border-t border-[#1F1F1F] pt-3">
                  <div className="flex items-center space-x-2 text-[#929292]">
                    <MapPin className="w-3.5 h-3.5 text-[#777]" />
                    <span className="truncate">{doctor.clinic_name}, {doctor.clinic_city}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[#929292]">
                    <Globe className="w-3.5 h-3.5 text-[#777]" />
                    <span className="truncate">
                      {Array.isArray(doctor.languages) ? doctor.languages.join(', ') : doctor.languages}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-white">
                    <Video className="w-3.5 h-3.5 text-[#C0C0C0]" />
                    <span>Online & Offline Available</span>
                  </div>
                </div>

                {/* Fee display */}
                <div className="flex items-center justify-between py-2 border-y border-[#292929] text-xs font-mono">
                  <span className="text-[#777777]">Consultation Fee:</span>
                  <span className="text-white font-bold">AED {doctor.consultation_fee} / 30m</span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewingDoctor(doctor)}
                  className="py-2.5 rounded-lg text-xs font-semibold text-white bg-[#111111] border border-[#292929] hover:border-white/40 transition-all text-center"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDoctorForBooking(doctor)}
                  className="py-2.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all text-center"
                >
                  Book 30-Min
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      <DoctorProfileModal
        doctor={viewingDoctor}
        isOpen={!!viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        onBookAppointment={(doc) => {
          setViewingDoctor(null);
          onSelectDoctorForBooking(doc);
        }}
      />

    </div>
  );
};
