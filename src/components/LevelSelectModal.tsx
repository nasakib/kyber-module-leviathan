import React from 'react';
import { LevelDefinition, UserProgressStore } from '../types/game';
import { SECTORS, ALL_LEVELS } from '../data/levels';
import { X, Star, CheckCircle, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelId: string;
  onSelectLevel: (level: LevelDefinition) => void;
  progress: UserProgressStore;
  onResetProgress: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevelId,
  onSelectLevel,
  progress,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const getSectorBorderColor = (color: string) => {
    switch (color) {
      case 'cyan': return 'border-cyan-500/40 text-cyan-400';
      case 'emerald': return 'border-emerald-500/40 text-emerald-400';
      case 'violet': return 'border-violet-500/40 text-violet-400';
      case 'amber': return 'border-amber-500/40 text-amber-400';
      case 'rose': return 'border-rose-500/40 text-rose-400';
      default: return 'border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span>Sector Navigation Map</span>
              <span className="text-xs text-cyan-400 font-normal px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800">
                20 Levels
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              From High School Algebra to Post-Quantum Cryptography
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (window.confirm('Reset all level progress and stars?')) {
                  onResetProgress();
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-slate-400 hover:text-rose-400 text-xs font-mono transition-colors"
              title="Reset progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Progress</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono">
          {SECTORS.map((sector) => {
            const sectorLevels = ALL_LEVELS.filter((l) => l.sectorId === sector.id);

            return (
              <div key={sector.id} className="space-y-3">
                {/* Sector Header */}
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-950 ${getSectorBorderColor(sector.color)}`}>
                    {sector.code}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-200">
                    {sector.title}
                  </h3>
                  <span className="hidden md:inline text-xs text-slate-500 font-normal">
                    — {sector.description}
                  </span>
                </div>

                {/* Level Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sectorLevels.map((lvl) => {
                    const isCurrent = lvl.id === currentLevelId;
                    const lvlProgress = progress[lvl.id] || { completed: false, stars: 0, bestAttempts: 0 };
                    const starsEarned = lvlProgress.stars || 0;

                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          soundEngine.playSliderTick();
                          onSelectLevel(lvl);
                          onClose();
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-28 ${
                          isCurrent
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20'
                            : lvlProgress.completed
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                            : 'bg-slate-950/30 border-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-cyan-400">
                            {lvl.code}
                          </span>

                          {/* Stars Display */}
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= starsEarned
                                    ? 'text-amber-400 fill-current'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {lvl.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {lvl.subtitle}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                          <span>{lvlProgress.completed ? 'Cleared' : 'Pending'}</span>
                          {lvlProgress.completed && (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Click any level to jump immediately</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
