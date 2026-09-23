import React, { useState, useEffect } from 'react';
import { PlayerTier } from '../utils/jargonDictionary';
import { soundEngine } from '../utils/audio';
import {
  Compass,
  Sparkles,
  ChevronRight,
  Activity,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingDiagnosticProps {
  isOpen?: boolean;
  onComplete: (tier: PlayerTier) => void;
  onClose?: () => void;
  onSkip?: () => void;
}

interface QuestionData {
  id: number;
  category: string;
  prompt: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export const OnboardingDiagnostic: React.FC<OnboardingDiagnosticProps> = ({
  isOpen = true,
  onComplete,
  onClose,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Animation ticker for Harmonic beacon in Q2
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount((c) => (c + 1) % 6);
    }, 333);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const QUESTIONS: QuestionData[] = [
    {
      id: 0,
      category: 'Spatial Slope & Energy Expenditure',
      prompt: 'Which trajectory launch ramp reaches high altitude with optimal mechanical balance (neither stalling out horizontally nor crashing into a vertical cliff)?',
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      visual: (
        <div className="flex items-end justify-center space-x-6 h-28 p-2 bg-slate-950 rounded-xl border border-slate-800">
          {/* Flat Hill */}
          <div className="flex flex-col items-center space-y-1">
            <svg width="64" height="64" className="stroke-slate-500 fill-slate-900/60">
              <path d="M 4 60 L 60 52" strokeWidth="3" />
              <circle cx="60" cy="52" r="3" fill="#64748b" />
            </svg>
            <span className="text-[10px] text-slate-400 font-mono">A: Flat (m = 0.2)</span>
          </div>

          {/* Balanced Climb */}
          <div className="flex flex-col items-center space-y-1">
            <svg width="64" height="64" className="stroke-cyan-400 fill-cyan-950/40">
              <path d="M 4 60 L 56 12" strokeWidth="3.5" />
              <circle cx="56" cy="12" r="4" fill="#22d3ee" />
            </svg>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">B: Balanced (m = 1.2)</span>
          </div>

          {/* Vertical Cliff */}
          <div className="flex flex-col items-center space-y-1">
            <svg width="64" height="64" className="stroke-rose-500 fill-rose-950/40">
              <path d="M 12 60 L 16 4" strokeWidth="3" />
              <circle cx="16" cy="4" r="3" fill="#f43f5e" />
            </svg>
            <span className="text-[10px] text-slate-400 font-mono">C: Cliff (m = 7.0)</span>
          </div>
        </div>
      ),
      options: [
        { id: 'A', label: 'Flat rollout: Slope m = 0.2', isCorrect: false, explanation: 'Requires infinite distance to gain height.' },
        { id: 'B', label: 'Balanced climb: Slope m = 1.2', isCorrect: true, explanation: 'Optimal kinetic angle: balanced rise over run without stalling.' },
        { id: 'C', label: 'Vertical cliff: Slope m = 7.0', isCorrect: false, explanation: 'Impractically steep, requiring infinite vertical propulsion.' },
      ],
    },
    {
      id: 1,
      category: 'Harmonic Rhythm & Temporal Frequency',
      prompt: 'Observe this pulsating coordinate beacon. If it pulses exactly 6 times every 2 seconds, what is its fundamental frequency rate?',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      visual: (
        <div className="flex flex-col items-center justify-center h-28 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  i === pulseCount
                    ? 'bg-amber-400 shadow-lg shadow-amber-400/80 scale-125'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-amber-300 font-mono">
            Elapsed Window: 2.0s • Pulses: 6 cycles
          </span>
        </div>
      ),
      options: [
        { id: 'A', label: '0.33 cycles per second', isCorrect: false, explanation: 'That is period time (2 / 6 = 0.33s), not rate.' },
        { id: 'B', label: '3.0 cycles per second (3 Hz)', isCorrect: true, explanation: 'Rate = 6 cycles / 2 seconds = 3.0 Hz.' },
        { id: 'C', label: '12.0 cycles per second', isCorrect: false, explanation: 'Multiplication error (6 * 2).' },
      ],
    },
    {
      id: 2,
      category: 'Area Preservation & Geometric Shear',
      prompt: 'A rigid square carpet tile is shoved horizontally sideways into a skewed diamond (shear transform). What happens to the interior surface area?',
      icon: <Maximize2 className="w-5 h-5 text-purple-400" />,
      visual: (
        <div className="flex items-center justify-center space-x-8 h-28 bg-slate-950 rounded-xl border border-slate-800">
          {/* Original Square */}
          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 border-2 border-cyan-400 bg-cyan-950/40 rounded flex items-center justify-center font-mono text-xs text-cyan-300">
              1.0 m²
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Original Tile</span>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-600" />

          {/* Sheared Diamond */}
          <div className="flex flex-col items-center space-y-1">
            <div
              className="w-14 h-14 border-2 border-purple-400 bg-purple-950/40 rounded flex items-center justify-center font-mono text-xs text-purple-300"
              style={{ transform: 'skewX(-25deg)' }}
            >
              ?
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Sheared Tile</span>
          </div>
        </div>
      ),
      options: [
        { id: 'A', label: 'The area collapsed to zero', isCorrect: false, explanation: 'The tile still has width and height.' },
        { id: 'B', label: 'The area remained unchanged (det = 1.0)', isCorrect: true, explanation: 'Cavalieri\'s Principle: Base and vertical height are unchanged, so area remains exactly identical.' },
        { id: 'C', label: 'The area doubled', isCorrect: false, explanation: 'Perimeter increased, but area did not.' },
      ],
    },
  ];

  const currentQ = QUESTIONS[currentStep];

  const handleSelectOption = (optId: string) => {
    soundEngine.playDetentTick();
    setSelectedAnswers((prev) => ({ ...prev, [currentStep]: optId }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      soundEngine.playSliderTick();
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      QUESTIONS.forEach((q) => {
        const chosen = selectedAnswers[q.id];
        const opt = q.options.find((o) => o.id === chosen);
        if (opt?.isCorrect) correctCount++;
      });

      let tier: PlayerTier = 'cadet';
      if (correctCount === 2) tier = 'operator';
      else if (correctCount === 3) tier = 'theorist';

      onComplete(tier);
      onClose?.();
    }
  };

  const handleSkip = () => {
    soundEngine.playSliderTick();
    if (onSkip) {
      onSkip();
    } else {
      onComplete('cadet');
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none font-mono">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-lg text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm sm:text-base">
                Pilot Aptitude & Sensor Calibration
              </h2>
              <p className="text-[10px] text-slate-400">
                Zero-jargon visual assessment to adapt vocabulary to your intuition
              </p>
            </div>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Step {currentStep + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Question Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-5 flex-1">
          {/* Category Banner */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            {currentQ.icon}
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              {currentQ.category}
            </span>
          </div>

          {/* Visual Simulation Display */}
          {currentQ.visual}

          {/* Question Prompt */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {currentQ.prompt}
          </p>

          {/* Option Choices */}
          <div className="space-y-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentStep] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span>{opt.label}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip Assessment (Start as Cadet)
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedAnswers[currentStep]}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <span>{currentStep === QUESTIONS.length - 1 ? 'Calibrate Sensor Rank' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
