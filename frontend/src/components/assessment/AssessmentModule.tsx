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
import { api } from '../../services/api';
import type { Assessment, AssessmentInstrument } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Clean native SVG Mood Trend Chart (zero external dependencies)
const MoodTrendChart: React.FC<{
  data: { date: string; score: number; max?: number }[];
}> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const width = 500;
  const height = 150;
  const paddingLeft = 32;
  const paddingRight = 24;
  const paddingTop = 16;
  const paddingBottom = 28;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const scores = data.map(d => d.score);
  const maxScore = Math.max(...scores, 15);
  const minScore = 0;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartW;
    const y = paddingTop + (1 - (d.score - minScore) / (maxScore - minScore || 1)) * chartH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${paddingLeft},${paddingTop + chartH} ${polylinePoints} ${paddingLeft + chartW},${paddingTop + chartH}`;

  return (
    <div className="relative w-full h-44 select-none pt-2">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartMoodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + ratio * chartH;
          const scoreVal = Math.round(maxScore - ratio * maxScore);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartW}
                y2={y}
                stroke="#222222"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#666666"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                {scoreVal}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <polygon points={areaPoints} fill="url(#chartMoodGradient)" />

        {/* Line */}
        <polyline
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Data points & hover triggers */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5.5 : 3.5}
              fill="#050505"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* X-axis date */}
            <text
              x={p.x}
              y={height - 8}
              fill="#666666"
              fontSize="9"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-[#111111] border border-[#333333] px-2.5 py-1 rounded-md text-[11px] font-mono text-white shadow-xl z-20"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 6}%`,
          }}
        >
          <div className="font-semibold text-white">{points[hoveredIndex].score} points</div>
          <div className="text-[9px] text-[#888888]">{points[hoveredIndex].date}</div>
        </div>
      )}
    </div>
  );
};

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
          <span>Quick & Private Self-Check</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Check How You Feel Today
        </h1>
        <p className="text-sm sm:text-base text-[#929292] max-w-2xl">
          Answer a few quick questions to see how your mood, stress, and anxiety have been over the past two weeks. 
          This is for your own awareness and advice, not a medical diagnosis.
        </p>
      </div>

      {/* Main Grid: Active Assessment on Left, Trends & Mood on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Assessment Wizard */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Instrument Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#111111] rounded-xl border border-[#292929]">
            {[
              { id: 'PHQ-9', label: 'Mood' },
              { id: 'GAD-7', label: 'Anxiety' },
              { id: 'PSS-10', label: 'Stress' },
              { id: 'WHO-5', label: 'Wellbeing' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setSelectedType(item.id); resetAssessment(); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedType === item.id
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#929292] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Assessment Container */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#292929] shadow-2xl relative">
            
            {loading ? (
              <div className="py-20 text-center text-xs font-mono text-[#777777]">
                Loading your questions...
              </div>
            ) : latestResult ? (
              /* RESULTS DISPLAY */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#777777]">Your Results</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {selectedType === 'PHQ-9' ? 'Mood Check' : selectedType === 'GAD-7' ? 'Anxiety Check' : selectedType === 'PSS-10' ? 'Stress Check' : 'Wellbeing Check'} Summary
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 text-white border border-white/20">
                    Level: {latestResult.assessment?.severity_level}
                  </span>
                </div>

                {/* Score Banner */}
                <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white font-mono">
                      {latestResult.assessment?.score} <span className="text-base text-[#777777]">/ {latestResult.assessment?.max_score}</span>
                    </div>
                    <p className="text-xs text-[#929292] mt-1 font-mono">
                      Overall Score: {latestResult.assessment?.percentage}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#929292] block">Result:</span>
                    <span className="text-sm font-semibold uppercase text-white font-mono">
                      {latestResult.assessment?.severity_level}
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#C0C0C0]">What this means</h4>
                  <p className="text-sm text-[#F5F5F5] leading-relaxed bg-[#111111] p-4 rounded-xl border border-[#292929]">
                    {latestResult.assessment?.interpretation}
                  </p>
                </div>

                {/* Personalized Guidance */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#C0C0C0]">Helpful Self-Care Steps</h4>
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
                      <span>Immediate Support Helpline</span>
                    </div>
                    <p className="text-xs text-[#E0E0E0] leading-relaxed">
                      Your answers show you might be going through a tough time right now. 
                      You do not have to carry this alone. Free, friendly human support is available 24/7 on the Estijaba hotline (800 1717).
                    </p>
                    <button
                      onClick={onOpenSOS}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-[#EAEAEA] cursor-pointer"
                    >
                      Call Emergency Hotlines
                    </button>
                  </div>
                )}

                {/* Mandatory Disclaimer */}
                <p className="text-[11px] text-[#666666] font-mono leading-relaxed p-3 rounded-lg bg-[#050505] border border-[#1A1A1A]">
                  <strong>Please Note:</strong> This quiz gives advice and information only. It is not a doctor's diagnosis. If you feel unwell, please speak with a certified doctor.
                </p>

                {/* Next actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={onNavigateDoctors}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Talk to a Doctor About This</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetAssessment}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-white bg-[#111111] border border-[#292929] hover:border-white/30 cursor-pointer"
                  >
                    Take Quiz Again
                  </button>
                </div>

              </div>
            ) : questions.length > 0 ? (
              /* ACTIVE QUESTION STEP */
              <div className="space-y-6">
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-[#777777]">
                    <span>
                      {selectedType === 'PHQ-9' ? 'Mood Check' : selectedType === 'GAD-7' ? 'Anxiety Check' : selectedType === 'PSS-10' ? 'Stress Check' : 'Wellbeing Check'}
                    </span>
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
                    Over the last 2 weeks, how often have you felt:
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
                        className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black font-semibold border-white shadow-lg'
                            : 'bg-[#111111] border-[#292929] text-[#929292] hover:text-white hover:border-white/30'
                        }`}
                      >
                        <span>{opt.label}</span>
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
                    className="px-4 py-2 rounded-lg text-xs font-mono text-[#929292] hover:text-white disabled:opacity-30 flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={!answers[questions[currentStep]?.id] || submitting}
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] disabled:opacity-40 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>
                      {submitting ? 'Checking score...' : currentStep === totalQuestions - 1 ? 'See Results' : 'Next'}
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
                <h4 className="text-sm font-semibold text-white">Daily Mood & Sleep</h4>
              </div>
              <span className="text-[11px] font-mono text-[#777777]">Today</span>
            </div>

            <form onSubmit={handleMoodSubmit} className="space-y-4">
              
              {/* Mood 1-5 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#929292]">
                  <span>How is your mood? (1 is low, 5 is great):</span>
                  <span className="text-white font-mono font-bold">{dailyMood} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDailyMood(lvl)}
                      className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
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
                  <span>Your energy level:</span>
                  <span className="text-white font-mono font-bold">{dailyEnergy} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDailyEnergy(lvl)}
                      className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
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
                  <span>Hours slept last night:</span>
                  <span className="text-white font-mono font-bold">{dailySleep} hrs</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={dailySleep}
                  onChange={(e) => setDailySleep(Number(e.target.value))}
                  className="w-full accent-white bg-[#111111] cursor-pointer"
                />
              </div>

              {/* Note */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Optional note: How are you feeling today?"
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#292929] text-xs text-white placeholder-[#555]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-[#EAEAEA] transition-all cursor-pointer"
              >
                {moodSubmitted ? '✓ Saved!' : 'Save Today\'s Mood'}
              </button>
            </form>
          </div>

          {/* Historical Trend Chart */}
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#292929] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <h4 className="text-sm font-semibold text-white">Your Mood Over Time</h4>
              </div>
              <span className="text-[11px] font-mono text-[#777777]">History</span>
            </div>

            {chartData.length > 1 ? (
              <MoodTrendChart data={chartData} />
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#777777] bg-[#111111] rounded-xl border border-[#222]">
                Take the check 2 or more times to see your mood chart here.
              </div>
            )}

            <div className="pt-2 text-[11px] font-mono text-[#777777] flex justify-between">
              <span>Lower score = calmer mood</span>
              <span className="text-white">100% Private</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
