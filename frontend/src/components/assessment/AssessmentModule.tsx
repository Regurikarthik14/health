import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  ShieldAlert, 
  Smile, 
  BatteryCharging, 
  Moon, 
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { api } from '../../services/api';
import type { Assessment, AssessmentInstrument } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AssessmentModuleProps {
  onOpenSOS: () => void;
  onNavigateDoctors: () => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({
  onOpenSOS,
  onNavigateDoctors
}) => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Record<string, AssessmentInstrument>>({});
  const [selectedType, setSelectedType] = useState<string>('PHQ-9');
  const [loading, setLoading] = useState<boolean>(true);

  // Questionnaire state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { option: string; score: number }>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<any | null>(null);

  // History & Trends
  const [history, setHistory] = useState<Assessment[]>([]);
  const [dailyMood, setDailyMood] = useState<number>(4);
  const [dailyEnergy, setDailyEnergy] = useState<number>(3);
  const [dailySleep, setDailySleep] = useState<number>(7.5);
  const [moodNote, setMoodNote] = useState<string>('');
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instRes, histRes] = await Promise.all([
        api.getInstruments(),
        api.getAssessmentHistory().catch(() => ({ assessments: [] }))
      ]);
      setInstruments(instRes.instruments || {});
      setHistory(histRes.assessments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentInstrument = instruments[selectedType];
  const questions = currentInstrument?.questions || [];
  const options = currentInstrument?.options || [];
  const totalQuestions = questions.length;

  const handleSelectOption = (qId: string, opt: { label: string; score: number }) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { option: opt.label, score: opt.score }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!currentInstrument) return;
    setSubmitting(true);
    try {
      const payloadAnswers = questions.map(q => {
        const ans = answers[q.id] || { option: currentInstrument.options[0].label, score: 0 };
        return {
          question_id: q.id,
          question_text: q.text,
          selected_option: ans.option,
          score_value: ans.score
        };
      });

      const res = await api.submitAssessment({
        instrument_type: selectedType,
        answers: payloadAnswers
      });

      setLatestResult(res);
      // Reload history to update trend graphs
      const histRes = await api.getAssessmentHistory().catch(() => ({ assessments: [] }));
      setHistory(histRes.assessments || []);

    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordMoodCheckin({
        mood_score: dailyMood,
        energy_score: dailyEnergy,
        sleep_hours: dailySleep,
        note: moodNote
      });
      setMoodSubmitted(true);
      const histRes = await api.getAssessmentHistory().catch(() => ({ assessments: [] }));
      setHistory(histRes.assessments || []);
      setTimeout(() => setMoodSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setCurrentStep(0);
    setLatestResult(null);
  };

  // Prepare chart data for trend analysis
  const chartData = [...history]
    .filter(a => a.assessment_type !== 'MOOD_CHECKIN')
    .reverse()
    .map((a, idx) => ({
      index: idx + 1,
      date: a.completed_at ? a.completed_at.slice(5, 10) : `Check #${idx + 1}`,
      score: a.score,
      max: a.max_score,
      type: a.assessment_type
    }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-xs font-mono text-[#C0C0C0]">
          <Brain className="w-3.5 h-3.5 text-white" />
          <span>Non-Diagnostic Wellbeing Evaluation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Early Wellbeing Assessment
        </h1>
        <p className="text-sm sm:text-base text-[#929292] max-w-2xl">
          Recognize cognitive and emotional shifts early using validated clinical instruments (PHQ-9, GAD-7, PSS-10). 
          Screenings are educational self-evaluations and never replace formal clinical diagnosis.
        </p>
      </div>

      {/* Main Grid: Active Assessment on Left, Trends & Mood on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Assessment Wizard */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Instrument Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#111111] rounded-xl border border-[#292929]">
            {['PHQ-9', 'GAD-7', 'PSS-10', 'WHO-5'].map((type) => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); resetAssessment(); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedType === type
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Assessment Container */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] shadow-2xl relative">
            
            {loading ? (
              <div className="py-20 text-center text-xs font-mono text-[#777777]">
                Loading validated psychometric instruments...
              </div>
            ) : latestResult ? (
              /* RESULTS DISPLAY */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#777777]">Assessment Result</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{selectedType} Evaluation Summary</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 text-white border border-white/20">
                    Severity: {latestResult.assessment?.severity_level}
                  </span>
                </div>

                {/* Score Banner */}
                <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white font-mono">
                      {latestResult.assessment?.score} <span className="text-base text-[#777777]">/ {latestResult.assessment?.max_score}</span>
                    </div>
                    <p className="text-xs text-[#929292] mt-1 font-mono">
                      Calculated Index: {latestResult.assessment?.percentage}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#929292] block">Classification:</span>
                    <span className="text-sm font-semibold uppercase text-white font-mono">
                      {latestResult.assessment?.severity_level}
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#C0C0C0]">Interpretation</h4>
                  <p className="text-sm text-[#F5F5F5] leading-relaxed bg-[#111111] p-4 rounded-xl border border-[#292929]">
                    {latestResult.assessment?.interpretation}
                  </p>
                </div>

                {/* Personalized Guidance */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#C0C0C0]">Personalized Self-Care Guidance</h4>
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#292929] space-y-2 text-xs text-[#929292]">
                    {(latestResult.recommendations || []).map((rec: string, i: number) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-white font-mono">•</span>
                        <span className="text-[#F5F5F5]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Risk Banner if flagged */}
                {latestResult.critical_risk_flag && (
                  <div className="p-5 rounded-xl bg-white/[0.08] border border-white/40 space-y-3">
                    <div className="flex items-center space-x-2 text-white font-semibold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-white" />
                      <span>Immediate Human Support Alert</span>
                    </div>
                    <p className="text-xs text-[#E0E0E0] leading-relaxed">
                      Your responses indicate you may be experiencing distress. 
                      You do not have to carry this alone. Please contact our 24/7 emergency response hub or call Abu Dhabi Estijaba line (800 1717).
                    </p>
                    <button
                      onClick={onOpenSOS}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-[#EAEAEA]"
                    >
                      Open Emergency Support Hub
                    </button>
                  </div>
                )}

                {/* Mandatory Disclaimer */}
                <p className="text-[11px] text-[#666666] font-mono leading-relaxed p-3 rounded-lg bg-[#050505] border border-[#1A1A1A]">
                  <strong>Clinical Safety Notice:</strong> {latestResult.assessment?.disclaimer}
                </p>

                {/* Next actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={onNavigateDoctors}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] flex items-center justify-center space-x-2"
                  >
                    <span>Discuss Results with a Doctor (30m)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetAssessment}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-white bg-[#111111] border border-[#292929] hover:border-white/30"
                  >
                    Retake Assessment
                  </button>
                </div>

              </div>
            ) : questions.length > 0 ? (
              /* ACTIVE QUESTION STEP */
              <div className="space-y-6">
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-[#777777]">
                    <span>{currentInstrument.title}</span>
                    <span className="text-white">Question {currentStep + 1} of {totalQuestions}</span>
                  </div>
                  <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Question */}
                <div className="space-y-2 py-4">
                  <span className="text-xs font-mono uppercase text-[#777777]">
                    In the past 2 weeks:
                  </span>
                  <h3 className="text-lg sm:text-xl font-medium text-white leading-snug">
                    "{questions[currentStep]?.text}"
                  </h3>
                </div>

                {/* Options Grid */}
                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const isSelected = answers[questions[currentStep]?.id]?.option === opt.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(questions[currentStep].id, opt)}
                        className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-white text-black font-semibold border-white shadow-lg'
                            : 'bg-[#111111] border-[#292929] text-[#929292] hover:text-white hover:border-white/30'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`text-[11px] font-mono ${isSelected ? 'text-black' : 'text-[#555]'}`}>
                          Score: +{opt.score}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Nav buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#292929]">
                  <button
                    type="button"
                    disabled={currentStep === 0}
                    onClick={handlePrev}
                    className="px-4 py-2 rounded-lg text-xs font-mono text-[#929292] hover:text-white disabled:opacity-30 flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={!answers[questions[currentStep]?.id] || submitting}
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] disabled:opacity-40 transition-all flex items-center space-x-1.5"
                  >
                    <span>
                      {submitting ? 'Evaluating...' : currentStep === totalQuestions - 1 ? 'Complete Screening' : 'Next Question'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : null}

          </div>

        </div>

        {/* Right Column: Mood Tracker & Historical Trends */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Mood Check-In Widget */}
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
              <div className="flex items-center space-x-2">
                <Smile className="w-4 h-4 text-white" />
                <h4 className="text-sm font-semibold text-white">Daily Mood & Energy Log</h4>
              </div>
              <span className="text-[11px] font-mono text-[#777777]">Today</span>
            </div>

            <form onSubmit={handleMoodSubmit} className="space-y-4">
              
              {/* Mood 1-5 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#929292]">
                  <span>Emotional State:</span>
                  <span className="text-white font-mono font-bold">{dailyMood} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDailyMood(lvl)}
                      className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                        dailyMood === lvl
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-[#111111] border-[#292929] text-[#777] hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy 1-5 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#929292]">
                  <span>Physical Energy:</span>
                  <span className="text-white font-mono font-bold">{dailyEnergy} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDailyEnergy(lvl)}
                      className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                        dailyEnergy === lvl
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-[#111111] border-[#292929] text-[#777] hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Hours */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#929292]">
                  <span>Sleep Last Night:</span>
                  <span className="text-white font-mono font-bold">{dailySleep} hrs</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={dailySleep}
                  onChange={(e) => setDailySleep(Number(e.target.value))}
                  className="w-full accent-white bg-[#111111]"
                />
              </div>

              {/* Note */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Optional journal reflection..."
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white placeholder-[#555]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all"
              >
                {moodSubmitted ? '✓ Mood Check-in Recorded' : 'Record Daily Wellbeing'}
              </button>
            </form>
          </div>

          {/* Historical Trend Chart */}
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <h4 className="text-sm font-semibold text-white">Wellbeing Trend Analysis</h4>
              </div>
              <span className="text-[11px] font-mono text-[#777777]">Symptom Velocity</span>
            </div>

            {chartData.length > 1 ? (
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} domain={[0, 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '11px' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#FFFFFF" 
                      strokeWidth={2} 
                      dot={{ fill: '#050505', stroke: '#FFFFFF', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#FFFFFF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#777777] bg-[#111111] rounded-xl border border-[#222]">
                Complete 2 or more screenings to generate your longitudinal trend chart.
              </div>
            )}

            <div className="pt-2 text-[11px] font-mono text-[#777777] flex justify-between">
              <span>Lower score = greater resilience</span>
              <span className="text-white">Encrypted Logs</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
