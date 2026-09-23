import React from 'react';
import { LevelDefinition, AppMode, UserProgressStore } from '../types/game';
import { Compass, Volume2, VolumeX, Grid, Sparkles, BookOpen, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface HUDProps {
  currentLevel: LevelDefinition;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  progress: UserProgressStore;
  onOpenLevelSelect: () => void;
  onOpenCurriculum: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  hasPrevLevel: boolean;
  hasNextLevel: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentLevel,
  appMode,
  onToggleAppMode,
  progress,
  onOpenLevelSelect,
  onOpenCurriculum,
  onPrevLevel,
  onNextLevel,
  hasPrevLevel,
  hasNextLevel,
  isMuted,
  onToggleMute,
}) => {
  // Calculate total stars earned
  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);

  return (
    <header className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 py-3 backdrop-blur-md sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Active Level Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Compass className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 font-mono tracking-tight">
                VectorForge
              </h1>
              <span className="text-[10px] text-cyan-400 font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 font-semibold">
                The Coordinate Engine
              </span>
            </div>

            {appMode === 'puzzle' ? (
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span className="text-cyan-300 font-bold">{currentLevel.code}</span>
                <span>•</span>
                <span className="truncate max-w-[200px] sm:max-w-none text-slate-300 font-medium">
                  {currentLevel.title}
                </span>
                <span className="hidden sm:inline text-slate-500">({currentLevel.sectorTitle})</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-amber-400 font-medium">
                Sandbox Studio • Freeform Laboratory
              </div>
            )}
          </div>
        </div>

        {/* Center / Navigation Controls (in puzzle mode) */}
        {appMode === 'puzzle' && (
          <div className="flex items-center space-x-1.5 self-center">
            <button
              onClick={onPrevLevel}
              disabled={!hasPrevLevel}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              title="Previous Level"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLevelSelect}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
              title="Open Sector Map & Level Select"
            >
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sectors & Levels</span>
            </button>

            <button
              onClick={onNextLevel}
              disabled={!hasNextLevel}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              title="Next Level"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Tools: Stars, Curriculum, Sandbox Toggle, Audio */}
        <div className="flex items-center space-x-2.5 justify-end">
          {/* Star Counter */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold shadow-inner">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{totalStars}</span>
            <span className="text-slate-500 font-normal">/60</span>
          </div>

          {/* Curriculum Drawer Button */}
          {appMode === 'puzzle' && (
            <button
              onClick={onOpenCurriculum}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-colors"
              title="Open Curriculum & Step-by-Step Derivation"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Curriculum & Steps</span>
              <span className="sm:hidden">Math</span>
            </button>
          )}

          {/* Mode Switcher: Campaign vs Sandbox */}
          <button
            onClick={() => onToggleAppMode(appMode === 'puzzle' ? 'sandbox' : 'puzzle')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              appMode === 'sandbox'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{appMode === 'sandbox' ? 'Back to Campaign' : 'Sandbox Lab'}</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
