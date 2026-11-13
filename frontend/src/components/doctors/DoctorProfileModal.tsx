import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Award, 
  Globe, 
  FileCheck, 
  Star,
  ArrowRight
} from 'lucide-react';
import type { Doctor } from '../../types';
import { api } from '../../services/api';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookAppointment
}) => {
  const [profileData, setProfileData] = useState<Doctor | null>(doctor);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && doctor) {
      setLoading(true);
      api.getDoctorProfile(doctor.id)
        .then(res => setProfileData(res.doctor))
        .catch(() => setProfileData(doctor))
        .finally(() => setLoading(false));
    }
  }, [isOpen, doctor]);

  if (!isOpen || !profileData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B0B0B] border border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#292929]">
          <div className="flex items-center space-x-4">
            <img
              src={profileData.photo_url}
              alt={profileData.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover grayscale contrast-125 border border-[#333]"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">{profileData.full_name}</h3>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[#929292] mt-0.5">{profileData.specialization}</p>
              <div className="flex items-center space-x-3 text-xs font-mono text-[#C0C0C0] mt-1.5">
                <span>{profileData.experience_years} Years Experience</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span>{profileData.rating} ({profileData.review_count} reviews)</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[#777777]">About This Doctor</span>
          <p className="text-xs sm:text-sm text-[#F5F5F5] leading-relaxed bg-[#111111] p-4 rounded-xl border border-[#292929]">
            {profileData.bio}
          </p>
        </div>

        {/* Verified Credentials */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[#777777]">Official Doctor License</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#292929] space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-white font-medium">
                <FileCheck className="w-4 h-4 text-[#C0C0C0]" />
                <span>Doctor License Number:</span>
              </div>
              <p className="text-xs font-mono text-[#C0C0C0] pl-5">{profileData.license_number}</p>
              <p className="text-[10px] text-[#777777] pl-5">Certified by Abu Dhabi Health Authority</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#292929] space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-white font-medium">
                <Award className="w-4 h-4 text-[#C0C0C0]" />
                <span>Degrees & Training:</span>
              </div>
              <p className="text-xs text-[#C0C0C0] pl-5 line-clamp-2">{profileData.qualifications}</p>
            </div>
          </div>
        </div>

        {/* Clinic & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#111111] border border-[#292929] space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-white font-medium">
              <MapPin className="w-4 h-4 text-[#C0C0C0]" />
              <span>Clinic Office:</span>
            </div>
            <p className="text-[#C0C0C0] pl-5">{profileData.clinic_name}</p>
            <p className="text-[#777777] pl-5 text-[11px]">{profileData.clinic_address}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111111] border border-[#292929] space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-white font-medium">
              <Globe className="w-4 h-4 text-[#C0C0C0]" />
              <span>Languages Spoken:</span>
            </div>
            <p className="text-[#C0C0C0] pl-5">
              {Array.isArray(profileData.languages) ? profileData.languages.join(', ') : profileData.languages}
            </p>
            <div className="flex items-center space-x-2 pl-5 pt-1 text-[11px] text-[#777777]">
              <span>Online Video</span>
              <span>•</span>
              <span>In-Person</span>
            </div>
          </div>
        </div>

        {/* Fee & Book CTA */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#777777] uppercase">Fee for 30-Minute Visit</span>
            <div className="text-xl font-bold text-white font-mono">
              AED {profileData.consultation_fee}
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookAppointment(profileData);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all flex items-center justify-center space-x-2"
          >
            <span>Book a 30-Minute Visit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
