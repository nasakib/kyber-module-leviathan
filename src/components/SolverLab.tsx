import React, { useState } from 'react';
import { Matrix2D, Vector2D, SolverStep, SolverPreset } from '../types/game';
import {
  isCollinear,
  sanitizeCoordinate,
  generateSageMath,
  generateLaTeXMatrix,
} from '../utils/latticeMath';
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
  Share2,
  Copy,
  AlertTriangle,
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex] || steps[0];
  const collinear = isCollinear(matrix);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Copied ${label} to clipboard!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCoordinateChange = (
    vector: 'b1' | 'b2' | 'target',
    axis: 'x' | 'y',
    valueStr: string
  ) => {
    const rawVal = parseFloat(valueStr);
    const sanitized = sanitizeCoordinate(rawVal);

    if (vector === 'b1') {
      onMatrixChange({ ...matrix, b1: { ...matrix.b1, [axis]: sanitized } });
    } else if (vector === 'b2') {
      onMatrixChange({ ...matrix, b2: { ...matrix.b2, [axis]: sanitized } });
    } else {
      onTargetChange({ ...target, [axis]: sanitized });
    }
  };

  return (
    <div className="flex flex-col gap-3 font-mono relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 border border-emerald-400 text-emerald-200 px-4 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Matrix Input & Quick Presets Panel */}
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 backdrop-blur shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              LATTICE SOLVER LAB INPUTS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="text-[11px] font-bold text-cyan-300 bg-cyan-950 hover:bg-cyan-900 px-2.5 py-1 rounded border border-cyan-800 flex items-center gap-1 min-h-[44px] transition"
              title="Export SageMath/Python script or LaTeX matrix"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT</span>
            </button>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gram-Schmidt • LLL • Babai CVP
            </span>
          </div>
        </div>

        {/* Collinear Warning Badge */}
        {collinear && (
          <div className="bg-rose-950/90 border border-rose-500 p-2.5 rounded-lg flex items-center gap-2 text-xs text-rose-200 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Collinear vectors: </span>
              Determinant is 0. Basis does not span a 2D lattice. Adjust coordinates so vectors are linearly independent.
            </div>
          </div>
        )}

        {/* Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onLoadPreset(p)}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-400 text-left transition group min-h-[44px]"
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
                min="-5000"
                max="5000"
                value={matrix.b1.x}
                onChange={(e) => handleCoordinateChange('b1', 'x', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-cyan-300 font-bold min-h-[44px]"
              />
              <input
                type="number"
                min="-5000"
                max="5000"
                value={matrix.b1.y}
                onChange={(e) => handleCoordinateChange('b1', 'y', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-cyan-300 font-bold min-h-[44px]"
              />
            </div>
          </div>

          {/* Basis Vector b2 */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-amber-400 text-[11px]">b₂ Vector (x₂, y₂):</span>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="-5000"
                max="5000"
                value={matrix.b2.x}
                onChange={(e) => handleCoordinateChange('b2', 'x', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-amber-300 font-bold min-h-[44px]"
              />
              <input
                type="number"
                min="-5000"
                max="5000"
                value={matrix.b2.y}
                onChange={(e) => handleCoordinateChange('b2', 'y', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-amber-300 font-bold min-h-[44px]"
              />
            </div>
          </div>

          {/* Target Vector t */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-rose-400 text-[11px]">Target t (tₓ, tᵧ):</span>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="-5000"
                max="5000"
                value={target.x}
                onChange={(e) => handleCoordinateChange('target', 'x', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-rose-300 font-bold min-h-[44px]"
              />
              <input
                type="number"
                min="-5000"
                max="5000"
                value={target.y}
                onChange={(e) => handleCoordinateChange('target', 'y', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1.5 rounded text-rose-300 font-bold min-h-[44px]"
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
            disabled={collinear}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStepIndexChange(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0 || collinear}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            disabled={collinear}
            className="p-2.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => onStepIndexChange(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === steps.length - 1 || collinear}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            max={Math.max(0, steps.length - 1)}
            value={currentStepIndex}
            disabled={collinear}
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
              disabled={collinear}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border min-h-[44px] min-w-[36px] flex items-center justify-center ${
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4" /> EXPORT LATTICE SCRIPT / MATRIX
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
              >
                CLOSE
              </button>
            </div>

            {/* SageMath / Python snippet */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>SageMath / Python Script:</span>
                <button
                  onClick={() => copyToClipboard(generateSageMath(matrix, target), 'SageMath script')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950 px-2 py-1 rounded border border-cyan-800 min-h-[36px]"
                >
                  <Copy className="w-3 h-3" /> COPY SCRIPT
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto whitespace-pre">
                {generateSageMath(matrix, target)}
              </pre>
            </div>

            {/* LaTeX Matrix */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>LaTeX Matrix Syntax:</span>
                <button
                  onClick={() => copyToClipboard(generateLaTeXMatrix(matrix), 'LaTeX matrix')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950 px-2 py-1 rounded border border-amber-800 min-h-[36px]"
                >
                  <Copy className="w-3 h-3" /> COPY LATEX
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-mono overflow-x-auto">
                {generateLaTeXMatrix(matrix)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
