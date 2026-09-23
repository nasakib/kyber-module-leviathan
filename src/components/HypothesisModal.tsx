import React, { useState } from 'react';
import { HypothesisQuestion, HypothesisOption } from '../types/game';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { MathText } from './MathView';
import { soundEngine } from '../utils/audio';

interface HypothesisModalProps {
  hypothesis: HypothesisQuestion;
  isOpen: boolean;
  selectedOptionId: string | null;
  onSelectOption: (option: HypothesisOption) => void;
  onClose: () => void;
}

export const HypothesisModal: React.FC<HypothesisModalProps> = ({
  hypothesis,
  isOpen,
  selectedOptionId,
  onSelectOption,
  onClose,
}) => {
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const selectedOption = hypothesis.options.find((opt) => opt.id === selectedOptionId);

  if (!isOpen) return null;

  const handleChoose = (opt: HypothesisOption) => {
    soundEngine.playSliderTick();
    onSelectOption(opt);
    setHasConfirmed(true);
    if (opt.isCorrect) {
      soundEngine.playTargetHit(2);
    } else {
      soundEngine.playObstacleClang();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-wider font-bold text-cyan-300 font-mono">
                Predictive Hypothesis Terminal
              </h2>
              <p className="text-xs text-slate-400">
                Gold Mastery Challenge • {hypothesis.multiplier}x Score Multiplier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xs font-mono px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            Skip [ESC]
          </button>
        </div>

        {/* Prompt with KaTeX math */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm leading-relaxed text-slate-200">
          <div className="text-xs text-cyan-400 font-bold uppercase mb-1.5 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Theoretical Conjecture:</span>
          </div>
          <MathText text={hypothesis.prompt} />
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {hypothesis.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleChoose(option)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-mono flex items-center justify-between ${
                  isSelected
                    ? option.isCorrect
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-emerald-500/20 shadow-md'
                      : 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-rose-500/20 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isSelected
                        ? option.isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </div>
                  <span>
                    <MathText text={option.label} />
                  </span>
                </div>

                {isSelected && (
                  <div>
                    {option.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback explanation if confirmed */}
        {hasConfirmed && selectedOption && (
          <div
            className={`p-3.5 rounded-xl text-xs font-mono leading-relaxed border ${
              selectedOption.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5 mb-1">
              {selectedOption.isCorrect ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hypothesis Validated! (+Gold Mastery)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hypothesis Refuted</span>
                </>
              )}
            </div>
            <MathText text={selectedOption.explanation} />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95"
          >
            <span>Proceed to Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
