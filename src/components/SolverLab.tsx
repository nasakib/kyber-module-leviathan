import React from 'react';
import { Matrix2D, Vector2D, SolverStep, SolverPreset } from '../types/game';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface SolverLabProps {
  matrix: Matrix2D;
  target: Vector2D;
  steps: SolverStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onMatrixChange: (newMatrix: Matrix2D) => void;
  onTargetChange: (newTarget: Vector2D) => void;
  onStepIndexChange: (index: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onLoadPreset: (preset: SolverPreset) => void;
}

const PRESETS: SolverPreset[] = [
  {
    id: 'preset-a',
    name: 'Preset A: Orthogonal Grid',
    description: 'Perfect 90° basis [100,0], [0,100]. Easy lattice reduction.',
    matrix: { b1: { x: 100, y: 0 }, b2: { x: 0, y: 100 } },
    target: { x: 150, y: 80 },
  },
  {
    id: 'preset-b',
    name: 'Preset B: Skewed Bad Basis',
    description: 'Skinny, obtuse angle basis [200, 195], [195, 190]. Triggers LLL Swaps.',
    matrix: { b1: { x: 200, y: 195 }, b2: { x: 195, y: 190 } },
    target: { x: 210, y: 180 },
  },
  {
    id: 'preset-c',
    name: 'Preset C: Kyber Toy Challenge',
    description: 'Noisy target vector hidden in sheared lattice. Test Babai CVP.',
    matrix: { b1: { x: 180, y: 40 }, b2: { x: 170, y: 190 } },
    target: { x: 240, y: 110 },
  },
];

export const SolverLab: React.FC<SolverLabProps> = ({
  matrix,
  target,
  steps,
  currentStepIndex,
  isPlaying,
  playbackSpeed,
  onMatrixChange,
  onTargetChange,
  onStepIndexChange,
  onTogglePlay,
  onSpeedChange,
  onLoadPreset,
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* 1. Matrix Input & Quick Presets Panel */}
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 backdrop-blur shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              LATTICE SOLVER LAB INPUTS
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Gram-Schmidt • LLL • Babai CVP
          </span>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onLoadPreset(p)}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-400 text-left transition group"
            >
              <div className="text-[11px] font-bold text-cyan-300 group-hover:text-cyan-200">
                {p.name}
              </div>
              <div className="text-[9.5px] text-slate-400 line-clamp-1">{p.description}</div>
            </button>
          ))}
        </div>

        {/* Custom Matrix Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-2.5 rounded border border-slate-800">
          {/* Basis Vector b1 */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-cyan-400 text-[11px]">b₁ Vector (x₁, y₁):</span>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={matrix.b1.x}
                onChange={(e) =>
                  onMatrixChange({ ...matrix, b1: { ...matrix.b1, x: Number(e.target.value) } })
                }
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-cyan-300 font-bold"
              />
              <input
                type="number"
                value={matrix.b1.y}
                onChange={(e) =>
                  onMatrixChange({ ...matrix, b1: { ...matrix.b1, y: Number(e.target.value) } })
                }
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-cyan-300 font-bold"
              />
            </div>
          </div>

          {/* Basis Vector b2 */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-amber-400 text-[11px]">b₂ Vector (x₂, y₂):</span>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={matrix.b2.x}
                onChange={(e) =>
                  onMatrixChange({ ...matrix, b2: { ...matrix.b2, x: Number(e.target.value) } })
                }
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-amber-300 font-bold"
              />
              <input
                type="number"
                value={matrix.b2.y}
                onChange={(e) =>
                  onMatrixChange({ ...matrix, b2: { ...matrix.b2, y: Number(e.target.value) } })
                }
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-amber-300 font-bold"
              />
            </div>
          </div>

          {/* Target Vector t */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-rose-400 text-[11px]">Target t (tₓ, tᵧ):</span>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={target.x}
                onChange={(e) => onTargetChange({ ...target, x: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-rose-300 font-bold"
              />
              <input
                type="number"
                value={target.y}
                onChange={(e) => onTargetChange({ ...target, y: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-rose-300 font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrub Bar Controls */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStepIndexChange(0)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStepIndexChange(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => onStepIndexChange(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Slider */}
        <div className="flex-1 flex flex-col gap-1 max-w-md">
          <div className="flex justify-between text-[11px] font-bold text-cyan-300">
            <span>STEP {currentStepIndex + 1} OF {steps.length}: {currentStep?.title}</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStepIndex}
            onChange={(e) => onStepIndexChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Playback Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] text-slate-400">SPEED:</span>
          {[0.25, 0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                playbackSpeed === s
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 3. Step Telemetry Card */}
      {currentStep && (
        <div className="bg-slate-900/95 border border-emerald-500/40 rounded-lg p-3 backdrop-blur shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Zap className="w-4 h-4 text-emerald-400" />
              ALGORITHMIC TELEMETRY
            </span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              FORMULA: {currentStep.formula}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-semibold">
            {currentStep.explanation}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-400">Projection μ₂₁:</span>
              <div className="font-bold text-cyan-300">{currentStep.mu.toFixed(3)}</div>
            </div>
            <div>
              <span className="text-slate-400">||b₁*||² Norm:</span>
              <div className="font-bold text-emerald-300">{currentStep.b1StarNormSq.toFixed(1)}</div>
            </div>
            <div>
              <span className="text-slate-400">||b₂*||² Norm:</span>
              <div className="font-bold text-amber-300">{currentStep.b2StarNormSq.toFixed(1)}</div>
            </div>
            <div>
              <span className="text-slate-400">Lovász Status:</span>
              <div className={`font-bold flex items-center gap-1 ${currentStep.lovaszSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentStep.lovaszSatisfied ? <CheckCircle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                {currentStep.lovaszSatisfied ? 'REDUCED' : 'SKEWED'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
