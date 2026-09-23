import React, { useState, useRef, useEffect } from 'react';
import { HypothesisQuestion, HypothesisOption } from '../types/game';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { MathText } from './MathView';
import { soundEngine } from '../utils/audio';

const HypothesisPreviewCanvas: React.FC<{ selectedOption: HypothesisOption | null }> = ({ selectedOption }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let frameId: number;
    const render = () => {
      animRef.current += 0.03;
      const t = animRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cy = height / 2;
      const cx = width / 2;

      // Target Node
      const targetX = width * 0.78;
      const targetY = height * 0.35;
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Target ring
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 11 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
      ctx.stroke();

      if (!selectedOption) {
        // Scanning radar sweep line
        const scanX = (Math.sin(t) * 0.5 + 0.5) * width;
        const grad = ctx.createLinearGradient(scanX - 40, 0, scanX, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0.25)');
        ctx.fillStyle = grad;
        ctx.fillRect(scanX - 40, 0, 40, height);

        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Select an option below to simulate physical outcome...', 16, cy + 4);
      } else {
        const isCorrect = selectedOption.isCorrect;

        ctx.save();
        ctx.strokeStyle = isCorrect ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.shadowColor = isCorrect ? '#10b981' : '#f43f5e';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(25, cy + 18);

        if (isCorrect) {
          // Bends directly into target
          ctx.quadraticCurveTo(cx, cy + 35, targetX, targetY);
          ctx.stroke();

          // Particle burst at target
          const pulseR = 8 + (t * 20) % 25;
          ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, 1 - ((t * 20) % 25) / 25)})`;
          ctx.beginPath();
          ctx.arc(targetX, targetY, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Veers off-course into barrier or away
          ctx.quadraticCurveTo(cx, cy - 40, width - 20, height - 15);
          ctx.stroke();

          // Error collision spark
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(width - 25, height - 20, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Readout badge
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = isCorrect ? '#34d399' : '#fb7185';
        ctx.fillText(
          isCorrect
            ? '✓ Physical Validation: Hypothesis trajectory satisfies sector boundary conditions'
            : '✗ Refutation Detected: Trajectory violates invariant boundary constraints',
          16,
          height - 12
        );
      }

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [selectedOption]);

  return (
    <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 right-2.5 px-2 py-0.5 bg-slate-900/80 border border-slate-700/60 rounded text-[9px] font-mono text-cyan-400">
        60 FPS PREDICTION SIMULATION
      </div>
    </div>
  );
};

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

        {/* Live Animated Hypothesis Trajectory Simulation */}
        <HypothesisPreviewCanvas selectedOption={selectedOption ?? null} />

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
