import React from 'react';
import { LevelDefinition, AppMode, UserProgressStore } from '../types/game';
import {
  Compass,
  Volume2,
  VolumeX,
  Grid,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  Globe2,
  GraduationCap,
  User,
  Cloud,
  CloudOff,
  Sliders,
  Activity,
} from 'lucide-react';

interface HUDProps {
  currentLevel: LevelDefinition;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  progress: UserProgressStore;
  onOpenLevelSelect: () => void;
  onOpenCurriculum: () => void;
  onOpenCommunity: () => void;
  onOpenClassroom: () => void;
  onOpenAuth: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  hasPrevLevel: boolean;
  hasNextLevel: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isCloudConnected: boolean;
  userDisplayName?: string;
  userRole?: 'student' | 'teacher';
  userTier?: 'cadet' | 'operator' | 'theorist';
  onOpenDiagnostic?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentLevel,
  appMode,
  onToggleAppMode,
  progress,
  onOpenLevelSelect,
  onOpenCurriculum,
  onOpenCommunity,
  onOpenClassroom,
  onOpenAuth,
  onPrevLevel,
  onNextLevel,
  hasPrevLevel,
  hasNextLevel,
  isMuted,
  onToggleMute,
  isCloudConnected,
  userDisplayName,
  userRole,
  userTier = 'cadet',
  onOpenDiagnostic,
}) => {
  // Calculate total stars earned
  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);

  return (
    <header className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Brand & Active Level Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Compass className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                VectorForge
              </h1>
              <span className="text-[9px] text-cyan-400 font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 font-semibold">
                The Coordinate Engine
              </span>
              {onOpenDiagnostic && (
                <button
                  onClick={onOpenDiagnostic}
                  className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] font-mono font-bold tracking-wider transition-colors"
                  title="Calibrate Diagnostic Tier & Sensory Lexicon"
                >
                  <Activity className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                  <span className="text-slate-400">RANK:</span>
                  <span
                    className={
                      userTier === 'theorist'
                        ? 'text-purple-400'
                        : userTier === 'operator'
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }
                  >
                    {userTier.toUpperCase()}
                  </span>
                </button>
              )}
            </div>

            {appMode === 'puzzle' ? (
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span className="text-cyan-300 font-bold">{currentLevel.code}</span>
                <span>•</span>
                <span className="truncate max-w-[180px] sm:max-w-none text-slate-300 font-medium">
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

        {/* Right Tools: Community, Classroom, Auth, Stars, Audio */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          {/* Community Browser Button */}
          <button
            onClick={onOpenCommunity}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Browse Community Levels"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Community</span>
          </button>

          {/* Classroom Portal Button */}
          <button
            onClick={onOpenClassroom}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Classroom Homework & Assignments"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Classroom</span>
          </button>

          {/* Calibrate Sensors / Diagnostic Button */}
          {onOpenDiagnostic && (
            <button
              onClick={onOpenDiagnostic}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Calibrate Sensors & Diagnostic Tier"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Calibrate</span>
            </button>
          )}

          {/* Star Counter */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold shadow-inner">
            <Star className="w-3 h-3 fill-current" />
            <span>{totalStars}</span>
            <span className="text-slate-500 font-normal">/60</span>
          </div>

          {/* Curriculum Drawer Button */}
          {appMode === 'puzzle' && (
            <button
              onClick={onOpenCurriculum}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-colors"
              title="Open Curriculum & Step-by-Step Derivation"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Curriculum</span>
            </button>
          )}

          {/* Mode Switcher: Campaign vs Sandbox */}
          <button
            onClick={() => onToggleAppMode(appMode === 'puzzle' ? 'sandbox' : 'puzzle')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              appMode === 'sandbox'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{appMode === 'sandbox' ? 'Campaign' : 'Sandbox'}</span>
          </button>

          {/* User Account & Cloud Sync Pill */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              userDisplayName
                ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="User Profile & Cloud Sync Settings"
          >
            {isCloudConnected ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-slate-500" />
            )}
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">
              {userDisplayName || 'Sign In'}
            </span>
            {userRole === 'teacher' && (
              <span className="text-[9px] bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">
                Teach
              </span>
            )}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
