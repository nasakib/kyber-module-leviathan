import React, { useState } from 'react';
import { HelpCircle, ArrowRight, ArrowLeft, Check, Sparkles, Zap } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onEnableFlowMode: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onClose,
  onEnableFlowMode,
}) => {
  const [page, setPage] = useState<number>(1);
  const totalPages = 4;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono animate-fadeIn">
      <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              AGENT TRAINING MANUAL ({page}/{totalPages})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Page Content */}
        {page === 1 && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
            <div className="bg-cyan-950/60 border border-cyan-800 p-2.5 rounded-lg flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">WELCOME AGENT!</span> Your mission is to master STEM principles (Algebra, Geometry, Calculus, Physics) to reduce the 768-dimensional lattice of the Kyber Leviathan.
              </div>
            </div>

            <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mt-1">
              KEYBOARD CONTROLS & WEAPON ARSENAL
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-800">[1]</span>
                <div>
                  <div className="font-bold text-slate-200">Anchor Lock</div>
                  <div className="text-[10px] text-slate-400">Locks target vector to origin</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-800">[2]</span>
                <div>
                  <div className="font-bold text-slate-200">Parry Blade</div>
                  <div className="text-[10px] text-slate-400">Time inside green ring!</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="font-bold text-amber-400 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-800">[3]</span>
                <div>
                  <div className="font-bold text-slate-200">Power Cannon</div>
                  <div className="text-[10px] text-slate-400">Heavy blast scaled by β slider</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="font-bold text-purple-400 px-1.5 py-0.5 rounded bg-slate-900 border border-purple-800">[4]</span>
                <div>
                  <div className="font-bold text-slate-200">Grid Visor</div>
                  <div className="text-[10px] text-slate-400">Toggles 90° reference lines</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 sm:col-span-2">
                <span className="font-bold text-blue-400 px-1.5 py-0.5 rounded bg-slate-900 border border-blue-800">[5]</span>
                <div>
                  <div className="font-bold text-slate-200">Heat Coolant</div>
                  <div className="text-[10px] text-slate-400">Flushes 40% memory processing heat buffer</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
            <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              STAGE 1: ALGEBRA & VECTOR PHYSICS
            </h3>

            <p>
              In 2D physics space, vectors represent magnitude and direction (e.g. displacement, velocity, net force).
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-cyan-400 font-bold">Vector Addition:</span>
                <span>F_net = F₁ + F₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400 font-bold">Pythagorean Magnitude:</span>
                <span>|F| = √(x² + y²)</span>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                💡 Tip: Combine forces tip-to-tail to reach the target equilibrium coordinate.
              </div>
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
            <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              STAGE 2 & 3: GEOMETRY, CALCULUS & OPTIMIZATION
            </h3>

            <div className="space-y-2">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
                <span className="font-bold text-cyan-400">Matrix Field Transformations: </span>
                Basis vectors (b₁, b₂) form a grid. The determinant <code className="text-amber-300">det(A)</code> measures area scaling!
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
                <span className="font-bold text-emerald-400">Calculus & Potential Energy: </span>
                Gradient vectors <code className="text-emerald-300 font-bold">∇V = dV/dx</code> point towards energy increase. Moving opposite minimizes system energy!
              </div>
            </div>
          </div>
        )}

        {page === 4 && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
            <h3 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
              STAGE 4: POST-QUANTUM CRYPTANALYSIS BOSS STRATEGY
            </h3>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Phase 1 (100%-75% HP): Lock vectors using Anchor Lock [1].</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phase 2 (75%-40% HP): Time Parry Blade [2] inside the GREEN ring.</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Phase 3 (40%-10% HP): Blast Power Cannon [3], flush heat with [5].</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <Check className="w-3.5 h-3.5 text-rose-400" />
                <span>Phase 4 (10%-0% HP): CLICK the blinking target reticle to win!</span>
              </div>
            </div>

            <button
              onClick={() => {
                onEnableFlowMode();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg font-mono flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-xs mt-1"
            >
              <Zap className="w-4 h-4" /> START WITH GUIDED FLOW MODE (AUTONOMOUS ASSIST)
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  page === i + 1 ? 'bg-cyan-400 w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {page < totalPages ? (
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              NEXT <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
            >
              READY TO PLAY!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
