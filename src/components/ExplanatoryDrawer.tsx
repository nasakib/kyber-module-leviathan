import React from 'react';
import { AcademyChapter } from '../types/game';
import { X, Sparkles, BookOpen, Layers, Lightbulb, Activity } from 'lucide-react';

interface ExplanatoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: AcademyChapter;
  interactiveAngle: number;
  onAngleChange: (newAngle: number) => void;
}

export const ExplanatoryDrawer: React.FC<ExplanatoryDrawerProps> = ({
  isOpen,
  onClose,
  chapter,
  interactiveAngle,
  onAngleChange,
}) => {
  if (!isOpen) return null;

  // Calculate invariant fundamental area vs skewed vector length for interactive probe
  const b1Len = 120;
  const rad = (interactiveAngle * Math.PI) / 180;
  const sinAngle = Math.abs(Math.sin(rad)) || 0.05;
  const b2Len = 120 / sinAngle;
  const fundamentalArea = (b1Len * 120).toFixed(0);

  return (
    <div className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-slate-900/95 border-l border-cyan-500/50 shadow-2xl p-4 font-mono z-50 flex flex-col gap-4 backdrop-blur overflow-y-auto animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            EXPLANATORY DRAWER
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Concept Title & Difficulty Tag */}
      {chapter ? (
        <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 w-fit">
            {chapter.difficultyTag}
          </span>
          <h3 className="text-sm font-bold text-cyan-400 leading-tight">
            {chapter.conceptTitle}
          </h3>
          <p className="text-xs text-slate-300 font-semibold mt-1">{chapter.title}: {chapter.subtitle}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 w-fit">
            Cryptographic Insight
          </span>
          <h3 className="text-sm font-bold text-cyan-400">
            Lattice Basis Reduction Geometry
          </h3>
        </div>
      )}

      {/* Physical Analogy */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>PHYSICAL ANALOGY</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {chapter
            ? chapter.physicalAnalogy
            : 'Imagine shearing a cardboard box flat vs keeping it square: the total volume/area enclosed remains identical, but the diagonal length explodes! LLL reduction un-shears the box to find the shortest edges.'}
        </p>
      </div>

      {/* Mathematical Definition */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>MATHEMATICAL FORMULA</span>
        </div>
        <div className="bg-slate-900 p-2 rounded text-emerald-300 font-bold text-[11px] font-mono border border-emerald-950">
          {chapter
            ? chapter.mathDefinition
            : 'det(L) = |b₁ · b₂*| = invariant area'}
        </div>
      </div>

      {/* Interactive Probe: Invariant Determinant vs Skewed Lengths */}
      <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/60 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between font-bold text-cyan-400">
          <span className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-cyan-400" />
            INTERACTIVE PROBE SLIDER
          </span>
          <span className="text-[10px] text-slate-400">θ = {interactiveAngle}°</span>
        </div>
        <p className="text-[10.5px] text-slate-400">
          Drag the basis angle θ to observe how area stays invariant (<code className="text-cyan-300">det L = {fundamentalArea}</code>) while skewed vector length ||b₂|| explodes!
        </p>

        <input
          type="range"
          min="10"
          max="170"
          step="1"
          value={interactiveAngle}
          onChange={(e) => onAngleChange(Number(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer mt-1"
        />

        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900 p-2 rounded border border-slate-800 mt-1">
          <div>
            <span className="text-slate-400">Enclosed Area:</span>
            <div className="font-bold text-emerald-400">{fundamentalArea} px²</div>
          </div>
          <div>
            <span className="text-slate-400">Vector ||b₂|| Length:</span>
            <div className="font-bold text-amber-400">{b2Len.toFixed(1)} px</div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> KYBER MATH ENGINE
        </span>
        <span>AGY-2.0 PEDAGOGICAL ENGINE</span>
      </div>
    </div>
  );
};
