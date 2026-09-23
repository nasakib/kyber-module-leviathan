import React from 'react';
import { LevelId, GameLevel } from '../types/game';
import { ShieldCheck, Lock, Sparkles, BookOpen } from 'lucide-react';

interface LevelSelectProps {
  levels: GameLevel[];
  activeLevel: LevelId;
  onSelectLevel: (levelId: LevelId) => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  activeLevel,
  onSelectLevel,
}) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wider">
              STEM CURRICULUM PROGRESSION
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> MASTER MATH & PHYSICS TO BEAT LEVIATHAN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {levels.map((lvl) => {
            const isActive = lvl.id === activeLevel;
            const isUnlocked = lvl.unlocked;

            return (
              <button
                key={lvl.id}
                onClick={() => isUnlocked && onSelectLevel(lvl.id)}
                disabled={!isUnlocked}
                className={`flex flex-col p-2 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10'
                    : isUnlocked
                    ? 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold text-cyan-400">
                    STAGE 0{lvl.id}
                  </span>
                  {isUnlocked ? (
                    <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-emerald-400'}`} />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                <div className="text-xs font-bold truncate leading-tight">
                  {lvl.title}
                </div>
                <div className="text-[9px] text-amber-400 font-semibold truncate mb-1">
                  {lvl.category}
                </div>
                <div className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed">
                  {lvl.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
