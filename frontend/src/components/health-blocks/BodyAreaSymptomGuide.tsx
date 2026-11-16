import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Eye, 
  Heart, 
  Shield, 
  Bone, 
  Sparkles, 
  Zap, 
  Smile, 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Stethoscope, 
  Lock, 
  Calendar, 
  Clock, 
  UserCheck, 
  HelpCircle,
  Plus,
  RefreshCw,
  Sliders,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { BodyArea, SymptomTriageAnalysis, Doctor, HealthBlock } from '../../types';

interface BodyAreaSymptomGuideProps {
  onSelectDoctorForBooking: (doctor: Doctor) => void;
  onOpenAuth: (initialTab?: 'login' | 'register_patient') => void;
  onOpenSOS: () => void;
  onBlockCreated?: (block: HealthBlock) => void;
}

export const BodyAreaSymptomGuide: React.FC<BodyAreaSymptomGuideProps> = ({
  onSelectDoctorForBooking,
  onOpenAuth,
  onOpenSOS,
  onBlockCreated
}) => {
  const { user, isPatient } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bodyAreas, setBodyAreas] = useState<BodyArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<BodyArea | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [troubleDescription, setTroubleDescription] = useState('');
  const [painScale, setPainScale] = useState<number>(5);
  const [troubleDuration, setTroubleDuration] = useState('2-3 days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');

  // Triage Results State
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageAnalysis, setTriageAnalysis] = useState<SymptomTriageAnalysis | null>(null);
  const [matchingDoctors, setMatchingDoctors] = useState<Doctor[]>([]);
  const [triageError, setTriageError] = useState<string | null>(null);

  // Health Block Creation State
  const [savingBlock, setSavingBlock] = useState(false);
  const [createdBlock, setCreatedBlock] = useState<HealthBlock | null>(null);
  const [blockSaveError, setBlockSaveError] = useState<string | null>(null);

  // Load body areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.getBodyAreas();
        if (res && res.body_areas) {
          setBodyAreas(res.body_areas);
        }
      } catch (err) {
        console.error('Failed to load body areas:', err);
      }
    };
    fetchAreas();
  }, []);

  const getAreaIcon = (id: string) => {
    switch (id) {
      case 'head_brain': return <Brain className="w-5 h-5 text-white" />;
      case 'eyes_ears_throat': return <Eye className="w-5 h-5 text-white" />;
      case 'chest_heart_lungs': return <Heart className="w-5 h-5 text-white" />;
      case 'abdomen_digestive': return <Activity className="w-5 h-5 text-white" />;
      case 'spine_back': return <Shield className="w-5 h-5 text-white" />;
      case 'limbs_joints': return <Bone className="w-5 h-5 text-white" />;
      case 'skin_hair': return <Sparkles className="w-5 h-5 text-white" />;
      case 'urinary_pelvic': return <Zap className="w-5 h-5 text-white" />;
      case 'mental_wellbeing': return <Smile className="w-5 h-5 text-white" />;
      default: return <Flame className="w-5 h-5 text-white" />;
    }
  };

  const handleSelectArea = (area: BodyArea) => {
    setSelectedArea(area);
    setSelectedSymptoms([]);
    setStep(2);
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const runTriage = async () => {
    if (!selectedArea) return;
    setTriageLoading(true);
    setTriageError(null);
    try {
      const res = await api.triageSymptoms({
        body_area: selectedArea.name,
        primary_symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : [selectedArea.name],
        trouble_description: troubleDescription,
        pain_scale: painScale,
        severity: severity
      });

      setTriageAnalysis(res.analysis);
      setMatchingDoctors(res.matching_doctors || []);
      setStep(3);
    } catch (err: any) {
      setTriageError(err.message || 'Triage analysis failed. Please try again.');
    } finally {
      setTriageLoading(false);
    }
  };

  const handleCreateHealthBlock = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!isPatient) {
      setBlockSaveError('Health blocks are personal medical ledgers for patients.');
      return;
    }
    if (!selectedArea || !triageAnalysis) return;

    setSavingBlock(true);
    setBlockSaveError(null);
    try {
      const res = await api.createHealthBlock({
        title: `${selectedArea.name}: ${triageAnalysis.recognized_diagnosis}`,
        body_area: selectedArea.name,
        primary_symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : [selectedArea.name],
        trouble_description: troubleDescription,
        pain_scale: painScale,
        severity: severity,
        onset_date: troubleDuration,
        recognized_diagnosis: triageAnalysis.recognized_diagnosis,
        possible_diagnoses: triageAnalysis.differential_diagnoses,
        recommended_specialist: triageAnalysis.recommended_specialist,
        specialist_reason: triageAnalysis.specialist_reason
      });

      setCreatedBlock(res.block);
      if (onBlockCreated) {
        onBlockCreated(res.block);
      }
    } catch (err: any) {
      setBlockSaveError(err.message || 'Could not save personal health block.');
    } finally {
      setSavingBlock(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left">
      
      {/* Feature Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#222222] space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono uppercase tracking-wider text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>AI Body Guide & Personal Health Blocks</span>
            </span>
            <span className="text-[10px] font-mono text-[#777] hidden sm:inline">
              Powered by Disease Diagnosis Dataset
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-[#888]">
            <span className={step >= 1 ? 'text-white font-bold' : ''}>1. Body Area</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-white font-bold' : ''}>2. Symptoms</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-white font-bold' : ''}>3. Specialist & Block</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Where Are You Feeling Trouble?
        </h2>
        <p className="text-xs sm:text-sm text-[#929292] leading-relaxed max-w-2xl">
          Select the part of your body where you feel discomfort. Our clinical diagnosis guide will recognize your symptoms, connect you to the exact medical specialist, and create a private <strong className="text-white">Personal Health Block</strong> to track your recovery from start to finish.
        </p>
      </div>

      {/* STEP 1: Body Area Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Step 1: Choose Affected Body Area
            </h3>
            <span className="text-xs text-[#777] font-mono">10 Anatomical Areas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodyAreas.map((area) => (
              <div
                key={area.id}
                onClick={() => handleSelectArea(area)}
                className="p-5 rounded-2xl bg-[#0E0E0E] border border-[#242424] hover:border-white/50 hover:bg-[#141414] transition-all cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getAreaIcon(area.id)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                    {area.name}
                  </h4>
                  <p className="text-xs text-[#888888] leading-relaxed mt-1 line-clamp-2">
                    {area.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1C1C1C] flex items-center space-x-1.5 text-[11px] text-[#666] font-mono">
                  <span>Common checks:</span>
                  <span className="text-[#999] truncate">{area.common_symptoms[0]}, {area.common_symptoms[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Symptoms & Trouble Details */}
      {step === 2 && selectedArea && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#888] hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Body Area</span>
            </button>
            <span className="text-xs text-white font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              Selected: {selectedArea.name}
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-[#252525] space-y-6 shadow-xl">
            {/* Common Symptoms Selection Chips */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Select What You Are Experiencing (Tap to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedArea.common_symptoms.map((symptom, i) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-white text-black font-semibold shadow-md'
                          : 'bg-[#151515] border border-[#2A2A2A] text-[#CCC] hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 text-black" />}
                      <span>{symptom}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Symptom */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white">Other Symptom (Optional)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSymptom(); } }}
                  placeholder="e.g. sharp stabbing feeling when bending down"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={addCustomSymptom}
                  className="px-4 py-2 rounded-xl bg-[#222] hover:bg-white hover:text-black text-xs font-semibold text-white transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Trouble Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white">
                Describe the Trouble in Your Own Words
              </label>
              <textarea
                rows={3}
                value={troubleDescription}
                onChange={(e) => setTroubleDescription(e.target.value)}
                placeholder="Tell us what you are feeling: when it started, what makes it worse, or any past medical treatments..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-white leading-relaxed placeholder-[#555]"
              />
            </div>

            {/* Pain Scale Slider & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#1C1C1C]">
              {/* Pain Scale */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Discomfort / Pain Level</span>
                  <span className="font-mono text-white font-bold px-2 py-0.5 rounded bg-white/10">
                    {painScale} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painScale}
                  onChange={(e) => setPainScale(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#777] font-mono">
                  <span>1 (Mild)</span>
                  <span>5 (Distracting)</span>
                  <span>8 (Severe)</span>
                  <span>10 (Emergency)</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">How long have you felt this?</label>
                <select
                  value={troubleDuration}
                  onChange={(e) => setTroubleDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Started today">Started today</option>
                  <option value="2-3 days">2 to 3 days</option>
                  <option value="About 1 week">About 1 week</option>
                  <option value="2 to 4 weeks">2 to 4 weeks</option>
                  <option value="More than a month">More than a month (Chronic)</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {triageError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200">
                {triageError}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-[#161616] text-[#AAA] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={runTriage}
                disabled={triageLoading}
                className="px-8 py-3.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {triageLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Diagnosis Engine...</span>
                  </>
                ) : (
                  <>
                    <span>Guide Me to Specialist</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: Triage Results, Specialist Recommendation & Health Block Initialization */}
      {step === 3 && triageAnalysis && (
        <div className="space-y-8">
          
          {/* Top Banner: Emergency Warning if Triggered */}
          {triageAnalysis.is_emergency && (
            <div className="p-5 rounded-2xl bg-red-950/80 border border-red-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Urgent Medical Warning Detected</h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    Your symptoms may indicate an emergency requiring immediate medical care. Please call free UAE Emergency Ambulance immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenSOS}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center space-x-1.5 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5 text-black" />
                <span>Call 998 Ambulance</span>
              </button>
            </div>
          )}

          {/* Specialist Guidance Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-white/20 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">
                  Automated Clinical Guidance
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <Stethoscope className="w-5 h-5 text-white" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Recommended Specialist: {triageAnalysis.recommended_specialist}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#AAA]">Area:</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white">
                  {triageAnalysis.body_area}
                </span>
              </div>
            </div>

            {/* Why this specialist */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Why this specialist is right for your symptoms
              </div>
              <p className="text-xs text-[#C0C0C0] leading-relaxed">
                {triageAnalysis.specialist_reason}
              </p>
            </div>

            {/* Disease Recognition from sajjadhadi/disease-diagnosis-dataset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black border border-[#222] space-y-2">
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-white" />
                  <span>Recognized Health Pattern</span>
                </div>
                <div className="text-base font-bold text-white">
                  {triageAnalysis.recognized_diagnosis}
                </div>
                <p className="text-[11px] text-[#777]">
                  Identified based on clinical symptom correlations from the medical disease diagnosis dataset.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black border border-[#222] space-y-2">
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>Safe Home Care Before Visit</span>
                </div>
                <p className="text-xs text-[#AAA] leading-relaxed">
                  {triageAnalysis.home_care_recommendations}
                </p>
              </div>
            </div>

            {/* Red Flags Alert */}
            <div className="p-3.5 rounded-xl bg-[#111] border border-amber-900/40 text-xs text-amber-200/90 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>When to seek urgent help:</strong> {triageAnalysis.red_flags}
              </div>
            </div>

            {/* Health Block Creation Call-to-Action */}
            <div className="p-5 rounded-2xl bg-[#080808] border border-white/25 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-bold text-white">
                      Start a Personal Health Block for this Problem
                    </h4>
                  </div>
                  <p className="text-xs text-[#888888] leading-relaxed max-w-xl">
                    A dedicated health block will securely store this case from today's symptom report until full resolution. You can log daily progress, link doctor appointments, and maintain an encrypted recovery milestone.
                  </p>
                </div>

                {createdBlock ? (
                  <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/30 text-xs font-mono text-white flex items-center space-x-2 shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Block Created: {createdBlock.block_reference}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateHealthBlock}
                    disabled={savingBlock}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer transition-all shrink-0 flex items-center space-x-1.5 disabled:opacity-50 shadow-md"
                  >
                    {savingBlock ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Initializing Block...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-black" />
                        <span>{user ? 'Initialize Health Block' : 'Sign In & Save Block'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {blockSaveError && (
                <div className="text-xs text-red-300 font-mono">
                  {blockSaveError}
                </div>
              )}
            </div>

          </div>

          {/* Matching Specialist Doctors Available on urCure */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Available {triageAnalysis.recommended_specialist}s on urCure
                </h3>
                <p className="text-xs text-[#888]">
                  Verified medical specialists available for private 30-minute telehealth or clinic visits.
                </p>
              </div>
              <span className="text-xs font-mono text-white">
                {matchingDoctors.length} Specialists Found
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-[#0E0E0E] border border-[#282828] hover:border-white/50 transition-all space-y-4 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={doc.photo_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"}
                        alt={doc.full_name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/20"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{doc.full_name}</h4>
                        <div className="text-xs text-[#AAA]">{doc.specialization}</div>
                        <div className="text-[11px] text-[#777] font-mono">
                          ★ {doc.rating} ({doc.review_count} visits)
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#888] line-clamp-2">
                      {doc.qualifications} • {doc.clinic_name}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#777] uppercase font-mono">Visit Fee</div>
                      <div className="text-sm font-bold text-white font-mono">
                        AED {doc.consultation_fee}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectDoctorForBooking(doc)}
                      className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] cursor-pointer transition-all flex items-center space-x-1"
                    >
                      <span>Book Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset or Change Symptoms Button */}
          <div className="pt-4 text-center">
            <button
              onClick={() => {
                setStep(1);
                setSelectedArea(null);
                setTriageAnalysis(null);
                setCreatedBlock(null);
              }}
              className="text-xs text-[#888] hover:text-white underline cursor-pointer"
            >
              ← Check Another Body Area or Start Over
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
