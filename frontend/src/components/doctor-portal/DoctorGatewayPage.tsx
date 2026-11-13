import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Lock, 
  Mail, 
  Phone, 
  Building, 
  Award, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Video,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UrCureLogo } from '../common/UrCureLogo';
import { useAuth } from '../../context/AuthContext';
import { DoctorDashboard } from './DoctorDashboard';

interface DoctorGatewayPageProps {
  onNavigateHome: () => void;
}

export const DoctorGatewayPage: React.FC<DoctorGatewayPageProps> = ({ onNavigateHome }) => {
  const { user, isDoctor, login, registerDoctor, logout } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Doctor Registration Form State
  const [dName, setDName] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dPhone, setDPhone] = useState('+971 2 ');
  const [dPassword, setDPassword] = useState('');
  const [dSpec, setDSpec] = useState('Consultant Psychiatrist');
  const [dQual, setDQual] = useState('MBBS, MD Psychiatry, MRCPsych');
  const [dLicense, setDLicense] = useState('DOH-MD-2026-');
  const [dExp, setDExp] = useState(8);
  const [dFee, setDFee] = useState(250);
  const [dClinic, setDClinic] = useState('Abu Dhabi Specialized Medical Center');
  const [dAddress, setDAddress] = useState('Corniche Road, Abu Dhabi');
  const [dVideoMode, setDVideoMode] = useState(true);
  const [dInPersonMode, setDInPersonMode] = useState(true);
  const [dConfirmCertified, setDConfirmCertified] = useState(false);

  // If already authenticated as a doctor, render the full Doctor Dashboard
  if (user && isDoctor) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Doctor Portal Dedicated Top Header */}
        <header className="sticky top-0 z-40 w-full bg-[#080808]/95 backdrop-blur-2xl border-b border-[#222]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <UrCureLogo size="sm" showTagline={false} onClick={onNavigateHome} />
                <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  DOCTOR WORKSPACE
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-[#888] font-mono">
                  Dr. {user.full_name.replace(/^Dr\.\s*/i, '')}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setTab('signin');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#999] hover:text-white bg-[#151515] border border-[#2a2a2a] hover:border-white/40 cursor-pointer transition-all"
                >
                  Sign Out
                </button>
                <button
                  onClick={onNavigateHome}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#999] hover:text-white hover:bg-white/5 cursor-pointer transition-all flex items-center space-x-1"
                >
                  <span>Patient Website</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          <DoctorDashboard />
        </main>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dConfirmCertified) {
      setError('Please check the box confirming that you hold a valid medical license.');
      return;
    }

    if (!dLicense || dLicense.length < 5) {
      setError('Please provide a valid medical license number (e.g. DOH, DHA, or MOHAP).');
      return;
    }

    const modes = [
      dVideoMode ? 'online' : null,
      dInPersonMode ? 'offline' : null
    ].filter(Boolean).join(',');

    setLoading(true);
    try {
      await registerDoctor({
        full_name: dName.startsWith('Dr.') ? dName : `Dr. ${dName}`,
        email: dEmail,
        phone: dPhone,
        password: dPassword,
        specialization: dSpec,
        qualifications: dQual,
        license_number: dLicense,
        experience_years: Number(dExp),
        consultation_fee: Number(dFee),
        clinic_affiliation: dClinic,
        clinic_address: dAddress,
        consultation_modes: modes || 'online'
      });
      setRegisteredSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Doctor application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      
      {/* Top Header of Private Doctor Portal */}
      <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-2xl border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center space-x-3">
              <UrCureLogo size="md" onClick={onNavigateHome} />
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono uppercase tracking-wider text-white">
                <Lock className="w-3 h-3 text-white" />
                <span>Doctor Portal (Private Access)</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onNavigateHome}
                className="text-xs text-[#888888] hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>Go to Public Patient Site</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Security / Isolation Banner */}
        <div className="mb-8 p-4 rounded-xl bg-[#0c0c0c] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Private Doctor Onboarding & Gateway Link</div>
              <div className="text-[11px] text-[#888888]">
                This link is provided exclusively to licensed physicians and clinical staff. Patients use the public platform link.
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-[#AAAAAA] px-2.5 py-1 rounded bg-black/60 border border-[#222]">
            URL: /doctor
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Doctor Benefits & Strict Regulatory Protocol */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#999999]">
                Clinical Practice Network
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                urCure Doctor Portal
              </h1>
              <p className="text-sm text-[#929292] mt-2 leading-relaxed">
                Connect directly with patients for 30-minute private telehealth or clinic visits. 
                Manage your schedule, conduct high-definition video calls, and document confidential clinical notes.
              </p>
            </div>

            {/* Regulatory Shield Warning */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/20 space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Mandatory Medical License Cross-Verification
                </h3>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">
                To guarantee zero fake doctor profiles, all new physician applications are held in pending status until our medical administrative board cross-checks your registration number with the official health licensing registry (Department of Health Abu Dhabi / DHA / MOHAP).
              </p>
              <div className="pt-2 flex items-center space-x-4 text-[11px] font-mono text-[#C0C0C0]">
                <span>✓ DOH Verification</span>
                <span>✓ Encrypted EHR</span>
                <span>✓ Direct Payouts</span>
              </div>
            </div>

            {/* Doctor Practice Features */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0c0c0c] border border-[#222] flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">HD Telehealth Consulting Room</div>
                  <div className="text-[11px] text-[#777]">Encrypted peer-to-peer video consultations with integrated patient notes.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0c0c0c] border border-[#222] flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Set Your Own Consultation Rates</div>
                  <div className="text-[11px] text-[#777]">Choose your fees, working days, and flexible 30-minute availability slots.</div>
                </div>
              </div>
            </div>

            {/* Quick Helper for Lost Patients */}
            <div className="pt-4 border-t border-[#1c1c1c] text-xs text-[#777]">
              <span>Are you a patient looking to book a doctor? </span>
              <button
                onClick={onNavigateHome}
                className="text-white underline hover:text-[#CCC] cursor-pointer font-medium ml-1"
              >
                Go to the Public Patient Website
              </button>
            </div>
          </div>

          {/* Right Column: Dedicated Doctor Auth Box */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0C0C0C] border border-[#282828] shadow-2xl text-left">
              
              {/* Tab Selector */}
              <div className="flex border-b border-[#222] mb-6">
                <button
                  onClick={() => { setTab('signin'); setError(null); }}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer mr-6 ${
                    tab === 'signin'
                      ? 'text-white border-b-2 border-white'
                      : 'text-[#666] hover:text-[#AAA]'
                  }`}
                >
                  Doctor Sign In
                </button>
                <button
                  onClick={() => { setTab('register'); setError(null); }}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    tab === 'register'
                      ? 'text-white border-b-2 border-white'
                      : 'text-[#666] hover:text-[#AAA]'
                  }`}
                >
                  Apply to Join Network
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Notification after Doctor Application */}
              {registeredSuccess ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center mx-auto text-white">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Doctor Application Submitted</h3>
                  <p className="text-xs text-[#999999] leading-relaxed max-w-md mx-auto">
                    Thank you, <strong className="text-white">{dName}</strong>. Your medical credentials (License <span className="font-mono text-white">{dLicense}</span>) have been received. 
                    Our medical administrator will verify your license with health authorities.
                  </p>
                  <div className="p-3 rounded-xl bg-black border border-[#222] text-[11px] font-mono text-[#AAA]">
                    Status: PENDING_CREDENTIAL_VERIFICATION
                  </div>
                  <button
                    onClick={() => {
                      setRegisteredSuccess(false);
                      setTab('signin');
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer transition-colors"
                  >
                    Proceed to Doctor Sign In
                  </button>
                </div>
              ) : tab === 'signin' ? (
                /* Doctor Sign In Form */
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white">Clinical Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="doctor@hospital.ae"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-[#666]" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white placeholder-[#555] focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Demo Helper */}
                  <div className="p-3 rounded-xl bg-[#050505] border border-[#222] text-[11px] text-[#777] space-y-1">
                    <div className="font-semibold text-white">Sample Verified Doctor Account:</div>
                    <div className="flex justify-between font-mono">
                      <span>dr.fatima@urcure.ae</span>
                      <span>Password: password123</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('dr.fatima@urcure.ae');
                        setLoginPassword('password123');
                      }}
                      className="text-white underline hover:text-[#CCC] cursor-pointer mt-1"
                    >
                      Click to auto-fill sample doctor credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Doctor Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Doctor Application Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Full Name with Title</label>
                      <input
                        type="text"
                        required
                        value={dName}
                        onChange={(e) => setDName(e.target.value)}
                        placeholder="Dr. Sarah Al Mansoori"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Medical Email</label>
                      <input
                        type="email"
                        required
                        value={dEmail}
                        onChange={(e) => setDEmail(e.target.value)}
                        placeholder="sarah.mansoori@clinic.ae"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">License Number (DOH / DHA)</label>
                      <input
                        type="text"
                        required
                        value={dLicense}
                        onChange={(e) => setDLicense(e.target.value)}
                        placeholder="DOH-MD-2026-981"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white font-mono focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Specialty</label>
                      <input
                        type="text"
                        required
                        value={dSpec}
                        onChange={(e) => setDSpec(e.target.value)}
                        placeholder="Consultant Psychiatrist"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Phone</label>
                      <input
                        type="text"
                        required
                        value={dPhone}
                        onChange={(e) => setDPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Password</label>
                      <input
                        type="password"
                        required
                        value={dPassword}
                        onChange={(e) => setDPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white">Degrees & Qualifications</label>
                    <input
                      type="text"
                      required
                      value={dQual}
                      onChange={(e) => setDQual(e.target.value)}
                      placeholder="MBBS, MD Psychiatry, MRCPsych"
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Hospital / Clinic Affiliation</label>
                      <input
                        type="text"
                        required
                        value={dClinic}
                        onChange={(e) => setDClinic(e.target.value)}
                        placeholder="Abu Dhabi Medical Center"
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">30-Min Visit Fee (AED)</label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        required
                        value={dFee}
                        onChange={(e) => setDFee(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#292929] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Consultation Formats */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-white">Consultation Formats Offered</label>
                    <div className="flex space-x-4 text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dVideoMode}
                          onChange={(e) => setDVideoMode(e.target.checked)}
                          className="rounded border-[#444]"
                        />
                        <span>Video Telehealth</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dInPersonMode}
                          onChange={(e) => setDInPersonMode(e.target.checked)}
                          className="rounded border-[#444]"
                        />
                        <span>In-Person Clinic Visit</span>
                      </label>
                    </div>
                  </div>

                  {/* Medical License Declaration */}
                  <div className="pt-2 border-t border-[#222]">
                    <label className="flex items-start space-x-2.5 text-xs text-[#AAA] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dConfirmCertified}
                        onChange={(e) => setDConfirmCertified(e.target.checked)}
                        className="mt-0.5 rounded border-[#444]"
                      />
                      <span>
                        I certify that I am a licensed medical doctor in the UAE or recognized jurisdiction, and I authorize urCure to verify my credentials with health regulatory authorities.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
                  >
                    <span>{loading ? 'Submitting Application...' : 'Submit Doctor Application for Verification'}</span>
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#1c1c1c] text-center text-xs text-[#666]">
        <span>urCure Health — Private Doctor & Medical Practitioner Gateway. Unauthorized access prohibited.</span>
      </footer>

    </div>
  );
};
