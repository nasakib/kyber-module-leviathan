import React from 'react';
import { AcademyChapter } from '../types/game';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft, Sparkles, Zap, Award } from 'lucide-react';

export const ACADEMY_CHAPTERS: AcademyChapter[] = [
  {
    id: 1,
    title: 'Chapter 1: Arrows on a Plane',
    subtitle: 'Vectors, Cartesian coordinates, tip-to-tail addition',
    conceptTitle: 'What is a Vector?',
    difficultyTag: 'Beginner Intuition',
    physicalAnalogy: 'Think of a vector like a treasure map step: "Walk 3 paces East, 4 paces North". No matter where you start, the step arrow remains identical!',
    mathDefinition: 'A vector v ∈ ℝ² has direction and magnitude ||v|| = √(x² + y²).',
    microTask: 'Drag the interactive probe angle θ to 90° to make vector b₁ and b₂ orthogonal.',
    targetValue: 90,
    currentValue: 45,
    unit: 'degrees',
  },
  {
    id: 2,
    title: 'Chapter 2: The Infinite Tile',
    subtitle: 'Bases, spanning sets, integer linear combinations',
    conceptTitle: 'Lattice Basis & Spanning Grids',
    difficultyTag: 'Beginner Intuition',
    physicalAnalogy: 'Imagine tiling a bathroom floor with parallelogram tiles: any pair of linearly independent vectors (b₁, b₂) generates an infinite grid of lattice points L(B) = {z₁b₁ + z₂b₂ | z₁,z₂ ∈ ℤ}.',
    mathDefinition: 'L(B) = {B·z | z ∈ ℤ²}, det(L) = |det(B)| is invariant across all bases for the same lattice.',
    microTask: 'Set basis angle θ to 90° to make the fundamental cell tile square.',
    targetValue: 90,
    currentValue: 30,
    unit: 'degrees',
  },
  {
    id: 3,
    title: 'Chapter 3: Good Grid, Bad Grid',
    subtitle: 'Orthogonality, acute vs obtuse bases, vector length explosion',
    conceptTitle: 'Why Skewed Bases Hide Information',
    difficultyTag: 'Intermediate Geometry',
    physicalAnalogy: 'A bad basis is like two nearly-parallel compass needles: a tiny step along one needle causes a massive swing in coordinates! Short, orthogonal bases are easy to solve.',
    mathDefinition: 'Hadamard Ratio H(B) = det(L) / (||b₁|| · ||b₂||). H = 1 is orthogonal (best), H ≈ 0 is bad.',
    microTask: 'Adjust basis angle θ closer to 90° to maximize the Hadamard Orthogonality Ratio.',
    targetValue: 90,
    currentValue: 15,
    unit: 'degrees',
  },
  {
    id: 4,
    title: 'Chapter 4: The Noise in the Room',
    subtitle: 'Learning With Errors (LWE), Gaussian noise, secret error vectors',
    conceptTitle: 'Hiding Secrets in Lattice Noise',
    difficultyTag: 'Cryptographic Insight',
    physicalAnalogy: 'Post-Quantum cryptography (Kyber/ML-KEM) encrypts data by adding a small random noise vector e to a lattice point t = A·s + e. Without a good basis, removing e is impossible!',
    mathDefinition: 'LWE Problem: Given (A, t = A·s + e mod q), find secret vector s or noise e.',
    microTask: 'Set basis angle θ to 90° to isolate the noise vector e from Gaussian background.',
    targetValue: 90,
    currentValue: 60,
    unit: 'degrees',
  },
  {
    id: 5,
    title: 'Chapter 5: The Untangling Engine',
    subtitle: 'Gram-Schmidt decomposition & Lovász reduction condition',
    conceptTitle: 'Gram-Schmidt & LLL Untangling',
    difficultyTag: 'Advanced Optimization',
    physicalAnalogy: 'Gram-Schmidt drops perpendicular shadows to measure how much b₂ sticks out from b₁. LLL uses this shadow to size-reduce and swap vectors until they are as short and square as possible!',
    mathDefinition: 'Lovász Condition: ||bᵢ*||² ≥ (δ - μᵢ,ᵢ₋₁²) ||bᵢ₋₁*||² with δ = 0.75.',
    microTask: 'Set basis angle θ to 90° to satisfy the Lovász threshold condition.',
    targetValue: 90,
    currentValue: 40,
    unit: 'degrees',
  },
];

interface AcademyModeProps {
  currentChapterId: number;
  onSelectChapter: (chapterId: number) => void;
  onOpenDrawer: () => void;
  onCompleteChapter: () => void;
}

export const AcademyMode: React.FC<AcademyModeProps> = ({
  currentChapterId,
  onSelectChapter,
  onOpenDrawer,
  onCompleteChapter,
}) => {
  const chapter = ACADEMY_CHAPTERS.find((c) => c.id === currentChapterId) || ACADEMY_CHAPTERS[0];

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Chapter Selection Tabs */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              THE ACADEMY: FIRST-PRINCIPLES MATH COURSE
            </h3>
          </div>
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition"
          >
            <Sparkles className="w-3 h-3" /> OPEN EXPLANATORY DRAWER
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {ACADEMY_CHAPTERS.map((ch) => {
            const isActive = ch.id === currentChapterId;

            return (
              <button
                key={ch.id}
                onClick={() => onSelectChapter(ch.id)}
                className={`p-2 rounded-lg border text-left transition ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-slate-100 shadow-md'
                    : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-cyan-400">CH. 0{ch.id}</div>
                <div className="text-[11px] font-bold truncate">{ch.title.split(': ')[1]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Study Card */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-lg p-3.5 backdrop-blur shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              {chapter.difficultyTag}
            </span>
            <h2 className="text-sm font-bold text-cyan-400 mt-1">{chapter.title}</h2>
            <p className="text-xs text-slate-300">{chapter.subtitle}</p>
          </div>
          <Award className="w-6 h-6 text-amber-400 shrink-0" />
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> PHYSICAL ANALOGY
          </span>
          <p className="text-slate-200 text-[11px] leading-relaxed">{chapter.physicalAnalogy}</p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> MATHEMATICAL DEFINITION
          </span>
          <p className="text-emerald-300 font-mono text-[11px] font-semibold">{chapter.mathDefinition}</p>
        </div>

        {/* Chapter Micro-Task */}
        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-cyan-400 text-[11px]">CHAPTER TASK: </span>
            <span className="text-slate-200 text-[11px]">{chapter.microTask}</span>
          </div>
          <button
            onClick={onCompleteChapter}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg shrink-0 flex items-center gap-1 text-xs"
          >
            COMPLETE CHAPTER <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chapter Navigation Footer */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={() => onSelectChapter(Math.max(1, currentChapterId - 1))}
            disabled={currentChapterId === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> PREVIOUS CHAPTER
          </button>

          <span className="text-[11px] text-slate-400 font-bold">
            CHAPTER {currentChapterId} OF {ACADEMY_CHAPTERS.length}
          </span>

          <button
            onClick={() => onSelectChapter(Math.min(ACADEMY_CHAPTERS.length, currentChapterId + 1))}
            disabled={currentChapterId === ACADEMY_CHAPTERS.length}
            className="flex items-center gap-1 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
          >
            NEXT CHAPTER <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
