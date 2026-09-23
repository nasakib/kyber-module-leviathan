import { LevelDefinition, LevelMasteryStatus } from '../types/game';
import { Trophy, Star, ArrowRight, RotateCcw, BookOpen, ShieldCheck, Zap, Award } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 text-center space-y-5">
        {/* Trophy Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
          <Trophy className="w-8 h-8" />
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

        {/* Stars Awarded */}
        <div className="flex items-center justify-center space-x-2 py-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-xl border transition-all ${
                starIdx <= stars
                  ? 'bg-amber-950/50 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/20 scale-110'
                  : 'bg-slate-950 border-slate-800 text-slate-700'
              }`}
            >
              <Star className="w-6 h-6 fill-current" />
            </div>
          ))}
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
