import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Stethoscope, ArrowRight, Lock, Mail, Phone, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register_patient' | 'register_doctor';
  portalMode?: 'patient' | 'doctor';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  portalMode = 'patient',
  onSuccess
}) => {
  const { login, registerPatient, registerDoctor } = useAuth();
  const [currentPortal, setCurrentPortal] = useState<'patient' | 'doctor'>(
    portalMode || (initialTab === 'register_doctor' ? 'doctor' : 'patient')
  );
  const [tab, setTab] = useState<'login' | 'register_patient' | 'register_doctor'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync portal mode when opened or props change
  React.useEffect(() => {
    if (isOpen) {
      const targetPortal = portalMode || (initialTab === 'register_doctor' ? 'doctor' : 'patient');
      setCurrentPortal(targetPortal);
      if (targetPortal === 'doctor') {
        setTab(initialTab === 'register_doctor' ? 'register_doctor' : 'login');
      } else {
        setTab(initialTab === 'register_patient' ? 'register_patient' : 'login');
      }
      setError(null);
    }
  }, [isOpen, portalMode, initialTab]);

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Patient registration form
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('+971 50 ');
  const [pPassword, setPPassword] = useState('');
  const [pLanguage, setPLanguage] = useState('English');
  const [pDob, setPDob] = useState('1995-04-12');
  const [pGender, setPGender] = useState('Male');
  const [pBlood, setPBlood] = useState('A+');
  const [pEmergencyName, setPEmergencyName] = useState('');
  const [pEmergencyPhone, setPEmergencyPhone] = useState('');
  const [pConsent, setPConsent] = useState(true);

  // Doctor registration form
  const [dName, setDName] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dPhone, setDPhone] = useState('+971 2 ');
  const [dPassword, setDPassword] = useState('');
  const [dSpec, setDSpec] = useState('Consultant Psychiatrist');
  const [dQual, setDQual] = useState('MBBS, MD Psychiatry, MRCPsych');
  const [dLicense, setDLicense] = useState('DOH-MD-2026-');
  const [dExp, setDExp] = useState(8);
  const [dFee, setDFee] = useState(200);
  const [dClinic, setDClinic] = useState('Abu Dhabi Neuro Care Clinic');
  const [dAddress, setDAddress] = useState('Corniche Road, Abu Dhabi');
  const [dModes, setDModes] = useState('online,offline');
  const [dNotice, setDNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerPatient({
        full_name: pName,
        email: pEmail,
        phone: pPhone,
        password: pPassword,
        preferred_language: pLanguage,
        date_of_birth: pDob,
        gender: pGender,
        blood_group: pBlood,
        emergency_contact_name: pEmergencyName,
        emergency_contact_phone: pEmergencyPhone,
        consent_accepted: pConsent
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerDoctor({
        full_name: dName,
        email: dEmail,
        phone: dPhone,
        password: dPassword,
        specialization: dSpec,
        qualifications: dQual,
        license_number: dLicense,
        experience_years: dExp,
        consultation_fee: dFee,
        clinic_name: dClinic,
        clinic_address: dAddress,
        consultation_modes: dModes
      });
      setDNotice('Doctor account created! Your details were sent to our team for quick review.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Doctor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'patient' | 'doctor' | 'admin') => {
    if (role === 'patient') {
      setEmail('patient@urcure.com');
      setPassword('PatientPass123!');
    } else if (role === 'doctor') {
      setEmail('dr.sharma@urcure.com');
      setPassword('DoctorPass123!');
    } else {
      setEmail('admin@urcure.com');
      setPassword('AdminPass123!');
    }
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B0B0B] border border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#292929] flex items-center justify-center">
              {currentPortal === 'doctor' ? (
                <Stethoscope className="w-4 h-4 text-white" />
              ) : (
                <UserCheck className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {currentPortal === 'doctor' ? 'urCure Doctor Portal' : 'urCure Patient Portal'}
              </h3>
              <p className="text-[11px] font-mono text-[#777777]">
                {currentPortal === 'doctor' ? 'Verified Healthcare Professionals Only' : 'Safe & Private Patient Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#929292] hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Verification Safety Banner (Only shown in Doctor Portal) */}
        {currentPortal === 'doctor' && (
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/20 text-xs text-[#C0C0C0] space-y-1">
            <div className="flex items-center space-x-1.5 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Doctor Verification Gate</span>
            </div>
            <p className="text-[11px] text-[#929292] leading-relaxed">
              Every doctor account is audited by medical administration against official registers before patient bookings are activated. Patients must use the Patient Portal.
            </p>
          </div>
        )}

        {/* Tab switchers - SEPARATE TABS PER PORTAL */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-xl border border-[#292929]">
          {currentPortal === 'patient' ? (
            <>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                Patient Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register_patient'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'register_patient'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                Create Patient Account
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                Doctor Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register_doctor'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'register_doctor'
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                Apply as a Doctor
              </button>
            </>
          )}
        </div>

        {/* Demo Persona Quick-Fill Strip */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-[#292929] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
            <span>Quick Test Accounts</span>
            <span className="text-[#C0C0C0]">Click to test:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentPortal === 'patient' ? (
              <>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('patient')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-[#111111] border border-[#292929] hover:border-white/40 text-white font-mono"
                >
                  Demo Patient
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-[#111111] border border-[#292929] hover:border-white/40 text-white font-mono"
                >
                  Demo Admin
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fillQuickDemo('doctor')}
                className="col-span-2 px-2.5 py-1.5 rounded-lg text-xs bg-[#111111] border border-[#292929] hover:border-white/40 text-white font-mono"
              >
                Demo Doctor (Dr. Priya Sharma)
              </button>
            )}
          </div>
        </div>

        {/* Error / Notice message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/20 text-xs text-white flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C0C0C0] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {dNotice && (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/30 text-xs text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <span>{dNotice}</span>
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#777777]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-sm text-white placeholder-[#555] focus:outline-none focus:border-white/60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#777777]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-sm text-white placeholder-[#555] focus:outline-none focus:border-white/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : currentPortal === 'doctor' ? 'Sign In as Doctor' : 'Sign In as Patient'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. PATIENT REGISTRATION TAB */}
        {tab === 'register_patient' && (
          <form onSubmit={handlePatientRegister} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Zayn Al-Mansoor"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Phone Number</label>
                <input
                  type="text"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Password *</label>
                <input
                  type="password"
                  required
                  value={pPassword}
                  onChange={(e) => setPPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Language</label>
                <select
                  value={pLanguage}
                  onChange={(e) => setPLanguage(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Gender</label>
                <select
                  value={pGender}
                  onChange={(e) => setPGender(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Blood Group</label>
                <input
                  type="text"
                  value={pBlood}
                  onChange={(e) => setPBlood(e.target.value)}
                  placeholder="O+, A+, etc."
                  className="w-full px-2 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Emergency Contact Name</label>
                <input
                  type="text"
                  value={pEmergencyName}
                  onChange={(e) => setPEmergencyName(e.target.value)}
                  placeholder="e.g. Parent, Spouse, or Friend"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={pEmergencyPhone}
                  onChange={(e) => setPEmergencyPhone(e.target.value)}
                  placeholder="+971 50 987 6543"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="consentCheck"
                checked={pConsent}
                onChange={(e) => setPConsent(e.target.checked)}
                className="mt-1 rounded bg-[#111111] border-[#292929] text-white"
              />
              <label htmlFor="consentCheck" className="text-[11px] text-[#929292] leading-tight">
                I agree to keep my account private and safe. My visits and health notes stay strictly confidential between me and my doctor.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !pConsent}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create My Patient Account'}
            </button>
          </form>
        )}

        {/* 3. DOCTOR REGISTRATION TAB */}
        {tab === 'register_doctor' && (
          <form onSubmit={handleDoctorRegister} className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#C0C0C0]">
              <span className="font-semibold text-white">Doctor Safety Notice:</span> To keep all patients safe, each doctor account is verified by our medical board before patient bookings can start.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Full Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="Dr. Full Name"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Professional Email *</label>
                <input
                  type="email"
                  required
                  value={dEmail}
                  onChange={(e) => setDEmail(e.target.value)}
                  placeholder="doctor@hospital.ae"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Doctor Field *</label>
                <select
                  value={dSpec}
                  onChange={(e) => setDSpec(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                >
                  <option value="Consultant Psychiatrist">Mind & Mood Doctor (Psychiatrist)</option>
                  <option value="Clinical Neuropsychologist">Brain & Memory Doctor (Neuropsychologist)</option>
                  <option value="Child & Adolescent Psychologist">Child & Teen Mood Doctor</option>
                  <option value="Integrative Behavioral Physician">Stress & Wellness Doctor</option>
                  <option value="Consultant Neurologist">Brain & Nerve Doctor (Neurologist)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Doctor License Number *</label>
                <input
                  type="text"
                  required
                  value={dLicense}
                  onChange={(e) => setDLicense(e.target.value)}
                  placeholder="DOH-MD-2026-XXXX"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Degrees & University Training *</label>
                <input
                  type="text"
                  required
                  value={dQual}
                  onChange={(e) => setDQual(e.target.value)}
                  placeholder="MBBS, MD, Fellowships"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Password *</label>
                <input
                  type="password"
                  required
                  value={dPassword}
                  onChange={(e) => setDPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Visit Fee (AED / 30 mins)</label>
                <input
                  type="number"
                  value={dFee}
                  onChange={(e) => setDFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#777777]">Years of Experience</label>
                <input
                  type="number"
                  value={dExp}
                  onChange={(e) => setDExp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#777777]">Clinic Name & City</label>
              <input
                type="text"
                value={dClinic}
                onChange={(e) => setDClinic(e.target.value)}
                placeholder="Clinic name in Abu Dhabi"
                className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Doctor Application'}
            </button>
          </form>
        )}

        {/* Patient Portal Footer Notice */}
        {currentPortal === 'patient' ? (
          <div className="pt-4 text-center text-xs text-[#777777] border-t border-[#1F1F1F]">
            <span>Your personal health information is private and encrypted.</span>
          </div>
        ) : (
          <div className="pt-4 text-center text-xs text-[#777777] border-t border-[#1F1F1F]">
            <span>Medical staff access is monitored and logged in compliance with UAE health regulations.</span>
          </div>
        )}

      </div>
    </div>
  );
};
