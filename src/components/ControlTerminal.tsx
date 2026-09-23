import React, { useState } from 'react';
import { LevelDefinition } from '../types/game';
import { Play, RotateCcw, Lightbulb, Minus, Plus, Target, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { MathView, MathText } from './MathView';
import { EnergyBudgetMeter } from './EnergyBudgetMeter';

interface ControlTerminalProps {
  level: LevelDefinition;
  params: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  onFire: () => void;
  onReset: () => void;
  onAutoCalculate: () => void;
  onOpenHypothesis?: () => void;
  isHypothesisAnswered?: boolean;
  hypothesisCorrect?: boolean;
  isFiring: boolean;
  attempts: number;
  targetsHitCount: number;
  totalTargets: number;
}

export const ControlTerminal: React.FC<ControlTerminalProps> = ({
  level,
  params,
  onParamChange,
  onFire,
  onReset,
  onAutoCalculate,
  onOpenHypothesis,
  isHypothesisAnswered,
  hypothesisCorrect,
  isFiring,
  attempts,
  targetsHitCount,
  totalTargets,
}) => {
  const [showDetailedGuide, setShowDetailedGuide] = useState<boolean>(true);

  // Compute formatted live formula LaTeX string
  const getFormulaDisplay = (): string => {
    if (level.type === 'linear_beam') {
      const m = params.m ?? 1;
      const b = params.b ?? 0;
      const sign = b >= 0 ? '+' : '-';
      return `y = ${m.toFixed(2)}x ${sign} ${Math.abs(b).toFixed(2)}`;
    }
    if (level.type === 'parabolic_arc') {
      const a = params.a ?? -0.2;
      const h = params.h ?? 0;
      const k = params.k ?? 0;
      const hSign = h >= 0 ? '-' : '+';
      const kSign = k >= 0 ? '+' : '-';
      return `y = ${a.toFixed(2)}(x ${hSign} ${Math.abs(h).toFixed(2)})^2 ${kSign} ${Math.abs(k).toFixed(2)}`;
    }
    if (level.type === 'matrix_warp') {
      const a = params.a ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
      const b = params.b ?? (params.theta_deg !== undefined ? -Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const c = params.c ?? (params.theta_deg !== undefined ? Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const d = params.d ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
      const det = a * d - b * c;
      return `M = \\begin{bmatrix} ${a.toFixed(2)} & ${b.toFixed(2)} \\\\ ${c.toFixed(2)} & ${d.toFixed(2)} \\end{bmatrix} \\quad \\det(M) = ${det.toFixed(2)}`;
    }
    if (level.type === 'tangent_blade') {
      const x0 = params.x0 ?? 2;
      const h = params.h ?? 0.05;
      const df = level.calculusDerivative ? level.calculusDerivative(x0) : 2 * x0;
      const fn = level.calculusFunction ? level.calculusFunction(x0) : x0 * x0;
      const slope = h > 0.08 && level.calculusFunction ? (level.calculusFunction(x0 + h) - fn) / h : df;
      return `f'(${x0.toFixed(2)}) = ${slope.toFixed(2)} \\quad \\text{Tangent: } y - ${fn.toFixed(2)} = ${slope.toFixed(2)}(x - ${x0.toFixed(2)})`;
    }
    if (level.type === 'lattice_cvp') {
      if (level.id === 's5_l1') {
        const q = params.q_factor ?? 1;
        return `v_1' = \\begin{bmatrix} 5 \\\\ 1 \\end{bmatrix} - ${q} \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} ${5 - 3 * q} \\\\ ${1 - q} \\end{bmatrix}`;
      }
      const c1 = params.c1 ?? 0;
      const c2 = params.c2 ?? 0;
      return `s = ${c1}\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + ${c2}\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} ${2 * c1 + c2} \\\\ ${c1 + c2} \\end{bmatrix}`;
    }
    return '';
  };

  const handleSliderChange = (key: string, val: number) => {
    soundEngine.playSliderTick();
    onParamChange(key, val);
  };

  const handleNudge = (key: string, delta: number, min: number, max: number, step: number) => {
    soundEngine.playSliderTick();
    const currentVal = params[key] ?? 0;
    const precision = step < 0.1 ? 2 : step < 1 ? 1 : 0;
    const newVal = Math.min(max, Math.max(min, parseFloat((currentVal + delta).toFixed(precision))));
    onParamChange(key, newVal);
  };

  // Evaluate alignment status of a parameter with respect to solution
  const getAlignmentStatus = (key: string) => {
    const currentVal = params[key];
    const targetVal = level.solutionParams[key];
    if (targetVal === undefined || currentVal === undefined) return null;

    const diff = currentVal - targetVal;
    const tolerance = 0.08;

    if (Math.abs(diff) <= tolerance) {
      return { status: 'aligned', label: 'Aligned', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    }
    if (diff < 0) {
      return { status: 'low', label: '▲ Increase', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' };
    }
    return { status: 'high', label: '▼ Decrease', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Top Console Bar: Formula Display & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Operator Synthesis Console
          </span>
          <div className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-slate-800 text-[11px] text-cyan-300 font-mono font-medium">
            {level.code} - {level.title}
          </div>
        </div>

        {/* Live Symbolic Formula Badge with KaTeX */}
        <div className="px-4 py-2 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono text-sm sm:text-base font-semibold shadow-inner flex items-center flex-wrap break-words max-w-full">
          <MathView math={getFormulaDisplay()} />
        </div>

        {/* Telemetry Status */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Targets:</span>
            <span className={`font-bold ${targetsHitCount === totalTargets ? 'text-emerald-400' : 'text-amber-400'}`}>
              {targetsHitCount}/{totalTargets}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Attempts:</span>
            <span className="font-semibold text-slate-200">{attempts}</span>
          </div>

          <button
            onClick={() => setShowDetailedGuide((v) => !v)}
            className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
            title="Toggle Operator Math Guidance"
          >
            <span>{showDetailedGuide ? 'Hide Guidance' : 'Operator Guidance'}</span>
            {showDetailedGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Energy Budget Constraints (Silver Mastery) */}
      {level.energyBudget && (
        <EnergyBudgetMeter budget={level.energyBudget} params={params} />
      )}

      {/* Control Sliders and Fine-Tuning Operators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {level.paramControls.map((ctrl) => {
          const val = params[ctrl.key] ?? ctrl.defaultValue;
          const alignment = getAlignmentStatus(ctrl.key);

          return (
            <div
              key={ctrl.key}
              className={`bg-slate-950/80 border rounded-xl p-3.5 space-y-2.5 transition-all shadow-md ${
                alignment?.status === 'aligned'
                  ? 'border-emerald-500/40 shadow-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Operator Header: Symbol, Title, Nudge Buttons, Numeric Input */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-300 font-bold text-sm bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center shadow-inner">
                    <MathView math={ctrl.symbol} />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {ctrl.label}
                    </div>
                  </div>
                </div>

                {/* Fine-Tuning Controls: [-], Exact Input, [+] */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleNudge(ctrl.key, -ctrl.step, ctrl.min, ctrl.max, ctrl.step)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 active:scale-95"
                    title={`Micro-decrement by ${ctrl.step}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <input
                    type="number"
                    step={ctrl.step}
                    min={ctrl.min}
                    max={ctrl.max}
                    value={val}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        handleSliderChange(ctrl.key, num);
                      }
                    }}
                    className="w-16 px-1.5 py-0.5 text-center font-mono text-xs bg-slate-900 border border-slate-700 rounded text-cyan-300 focus:outline-none focus:border-cyan-400 font-semibold"
                  />

                  <button
                    onClick={() => handleNudge(ctrl.key, ctrl.step, ctrl.min, ctrl.max, ctrl.step)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 active:scale-95"
                    title={`Micro-increment by ${ctrl.step}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Slider Track */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={val}
                  onChange={(e) => handleSliderChange(ctrl.key, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>{ctrl.min}{ctrl.unit ?? ''}</span>
                  {alignment && (
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold flex items-center space-x-1 ${alignment.color}`}>
                      {alignment.status === 'aligned' && <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />}
                      <span>{alignment.label}</span>
                    </span>
                  )}
                  <span>{ctrl.max}{ctrl.unit ?? ''}</span>
                </div>
              </div>

              {/* Mathematical Representation & Why Changing It Meets The Objective */}
              {showDetailedGuide && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                  {/* Mathematical Meaning */}
                  {ctrl.mathMeaning && (
                    <div className="flex items-start space-x-1.5 text-slate-300">
                      <span className="text-cyan-400 font-semibold shrink-0">Math:</span>
                      <div className="text-slate-300">
                        <MathView math={ctrl.mathMeaning} />
                      </div>
                    </div>
                  )}

                  {/* Geometric Transformation Effect */}
                  {ctrl.geometricRole && (
                    <div className="flex items-start space-x-1.5 text-slate-400">
                      <span className="text-slate-500 shrink-0">Geometry:</span>
                      <span>{ctrl.geometricRole}</span>
                    </div>
                  )}

                  {/* Why changing this meets the objective */}
                  {ctrl.objectiveHint && (
                    <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-[10.5px] leading-relaxed">
                      💡 <span className="font-semibold text-cyan-300">Objective Effect:</span>{' '}
                      <MathText text={ctrl.objectiveHint} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
            title="Reset parameters to initial defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (R)</span>
          </button>

          <button
            onClick={onAutoCalculate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-mono transition-colors"
            title="Reveal hint or auto-calculate theoretical solution"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{attempts >= 2 ? 'Auto-Calculate' : 'Review Math / Hint'}</span>
          </button>

          {level.hypothesis && (
            <button
              onClick={onOpenHypothesis}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                isHypothesisAnswered
                  ? hypothesisCorrect
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-300'
              }`}
              title="Hypothesize behavior before firing to win Gold Mastery"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isHypothesisAnswered
                  ? hypothesisCorrect
                    ? '★ Gold Hypothesis Correct'
                    : 'Hypothesis Refuted'
                  : 'Gold Hypothesis (Predict)'}
              </span>
            </button>
          )}
        </div>

        {/* Primary Fire Button */}
        <button
          onClick={onFire}
          disabled={isFiring}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-mono font-bold text-sm tracking-wide shadow-lg transition-all ${
            isFiring
              ? 'bg-amber-500/50 text-amber-100 cursor-not-allowed animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/25 active:scale-95'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${isFiring ? 'animate-spin' : ''}`} />
          <span>{isFiring ? 'SIMULATING BEAM...' : 'TEST TRAJECTORY (SPACE)'}</span>
        </button>
      </div>
    </div>
  );
};
