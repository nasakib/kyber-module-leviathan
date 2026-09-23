import React, { useState, useEffect } from 'react';
import { LevelDefinition, LevelMasteryStatus } from '../types/game';
import { Trophy, Star, ArrowRight, RotateCcw, BookOpen, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  level: LevelDefinition;
  stars: number;
  attempts: number;
  masteryStatus?: LevelMasteryStatus;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenCurriculum: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  stars,
  attempts,
  masteryStatus,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenCurriculum,
}) => {
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const [visibleStars, setVisibleStars] = useState<number>(0);

  // Staggered star animation and score counter tween
  useEffect(() => {
    if (!isOpen) {
      setDisplayedScore(0);
      setVisibleStars(0);
      return;
    }

    // Staggered star reveals
    const starTimers: ReturnType<typeof setTimeout>[] = [];
    for (let s = 1; s <= stars; s++) {
      const t = setTimeout(() => {
        setVisibleStars(s);
        soundEngine.playDetentTick();
      }, s * 350);
      starTimers.push(t);
    }

    // Score ticker tween
    const targetScore = masteryStatus?.score || (stars * 1000);
    const duration = 1200;
    const startTime = performance.now();

    let animFrame: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(eased * targetScore));

      if (progress < 1) {
        animFrame = requestAnimationFrame(tick);
      }
    };
    animFrame = requestAnimationFrame(tick);

    return () => {
      starTimers.forEach(clearTimeout);
      cancelAnimationFrame(animFrame);
    };
  }, [isOpen, stars, masteryStatus?.score]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 text-center space-y-5 overflow-hidden">
        {/* Animated Celebration Aura */}
        <div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/15 via-emerald-500/15 to-transparent blur-2xl pointer-events-none animate-spin"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-amber-500/15 via-purple-500/15 to-transparent blur-2xl pointer-events-none animate-spin"
          style={{ animationDuration: '12s' }}
        />

        {/* Trophy Icon with Shimmer */}
        <div className="relative mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-cyan-500/25 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
          <Trophy className="w-8 h-8" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-800/60">
            Sector Target Neutralized
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-mono mt-2">
            Level {level.code} Complete!
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {level.title} — {level.subtitle}
          </p>
        </div>

        {/* Animated Score Readout */}
        <div className="py-1 px-4 bg-slate-950/80 rounded-xl border border-slate-800/80 inline-block font-mono">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mr-2">Calculated Score:</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
            {displayedScore.toLocaleString()} PTS
          </span>
        </div>

        {/* Staggered Stars Awarded */}
        <div className="flex items-center justify-center space-x-2.5 py-1">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= visibleStars;
            return (
              <div
                key={starIdx}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isEarned
                    ? 'bg-amber-950/60 border-amber-400/80 text-amber-400 shadow-lg shadow-amber-500/30 scale-110 rotate-3'
                    : 'bg-slate-950 border-slate-800 text-slate-700 scale-95'
                }`}
              >
                <Star className={`w-6 h-6 fill-current ${isEarned ? 'animate-pulse' : ''}`} />
              </div>
            );
          })}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Resolved in <span className="text-cyan-400 font-bold">{attempts}</span> {attempts === 1 ? 'attempt' : 'attempts'}.
          {stars === 3 && ' Flawless mathematical precision!'}
          {stars === 2 && ' Great calculation efficiency!'}
          {stars === 1 && ' System solved!'}
        </div>

        {/* Tiered Mastery Badges (Bronze, Silver, Gold) */}
        {masteryStatus && (
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div
              className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 ${
                masteryStatus.cleared
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-bold">Bronze</span>
              <span className="text-[9px] text-slate-400">Target Cleared</span>
            </div>

            <div
              className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 ${
                masteryStatus.budgetMet
                  ? 'bg-slate-800/80 border-slate-400/50 text-slate-200 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-300" />
              <span className="font-bold">Silver</span>
              <span className="text-[9px] text-slate-400">Budget Obeyed</span>
            </div>

            <div
              className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 ${
                masteryStatus.hypothesisCorrect
                  ? 'bg-yellow-950/50 border-yellow-500/60 text-yellow-300 shadow-md shadow-yellow-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">Gold</span>
              <span className="text-[9px] text-slate-400">Hypothesis Met</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-2">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl font-mono text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-sm font-bold font-mono text-cyan-300 py-2">
              🎉 Congratulations! You have conquered all sectors of VectorForge!
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center space-x-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry for ⭐⭐⭐</span>
            </button>

            <button
              onClick={onOpenCurriculum}
              className="flex items-center justify-center space-x-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-mono transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Review Math</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
