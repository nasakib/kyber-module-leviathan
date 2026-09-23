import React from 'react';
import { GameState, AppMode } from '../types/game';
import {
  Shield,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  HelpCircle,
  BookOpen,
  Sliders,
  Crosshair,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  onSelectMode: (mode: AppMode) => void;
  onToggleAudio: () => void;
  onOpenDrawer: () => void;
  onOpenInstructions: () => void;
  onTouchMoveLane?: (direction: 'left' | 'right') => void;
  onTouchJump?: () => void;
  onTouchSlide?: () => void;
  onTouchFire?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  onSelectMode,
  onToggleAudio,
  onOpenDrawer,
  onOpenInstructions,
  onTouchMoveLane,
  onTouchJump,
  onTouchSlide,
  onTouchFire,
}) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
      {/* Top Mode Navigation Switcher Tabs */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
            APP MODE:
          </span>

          <button
            onClick={() => onSelectMode('academy')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition min-h-[44px] min-w-[44px] ${
              gameState.appMode === 'academy'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md glow-cyan'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>THE ACADEMY (COURSE)</span>
          </button>

          <button
            onClick={() => onSelectMode('solver')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition min-h-[44px] min-w-[44px] ${
              gameState.appMode === 'solver'
                ? 'bg-amber-950 border-amber-400 text-amber-300 shadow-md glow-amber'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>SOLVER LAB (CALCULATOR)</span>
          </button>

          <button
            onClick={() => onSelectMode('boss')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition min-h-[44px] min-w-[44px] ${
              gameState.appMode === 'boss'
                ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-md glow-rose'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4 text-rose-400" />
            <span>LEVIATHAN ENCOUNTER</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Explanatory Drawer Button */}
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 transition min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">WHY THIS WORKS</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">HOW TO PLAY</span>
          </button>

          <button
            onClick={onToggleAudio}
            className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-400 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Toggle Audio"
          >
            {gameState.audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Telemetry & Virtual Touch Controls Bar for Boss Mode */}
      {gameState.appMode === 'boss' && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  KYBER LEVIATHAN ENTROPY
                </span>
                <span className="text-cyan-300">
                  {Math.max(0, Math.round(gameState.bossHp))} / {gameState.maxBossHp} DIM
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded border border-cyan-900/50 p-0.5 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-sm"
                  style={{ width: `${Math.max(0, (gameState.bossHp / gameState.maxBossHp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  SHIP SHIELD INTEGRITY
                </span>
                <span className="text-emerald-300">
                  {Math.max(0, Math.round(gameState.playerHp))} / {gameState.maxPlayerHp} HP
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded border border-emerald-900/50 p-0.5 relative overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-sm ${
                    gameState.playerHp < 30 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  }`}
                  style={{ width: `${Math.max(0, (gameState.playerHp / gameState.maxPlayerHp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  RUNNER DISTANCE & SCORE
                </span>
                <span className="text-amber-300 font-bold">{Math.round(gameState.score)} PTS</span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded border border-amber-900/50 p-0.5 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-200 rounded-sm"
                  style={{ width: `${Math.min(100, (gameState.distance % 1000) / 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Virtual Touch D-Pad & Action Cluster for Mobile / Touch Devices */}
          <div className="bg-slate-950/85 border border-slate-800 p-2 rounded-lg flex items-center justify-between gap-3 shadow-2xl backdrop-blur">
            {/* D-Pad Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTouchMoveLane && onTouchMoveLane('left')}
                className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition"
                title="Move Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => onTouchMoveLane && onTouchMoveLane('right')}
                className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition"
                title="Move Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onTouchJump}
                className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 hover:border-emerald-400 text-emerald-300 flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition"
                title="Hyper-Jump"
              >
                <ArrowUp className="w-5 h-5" />
              </button>

              <button
                onClick={onTouchSlide}
                className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition"
                title="Slide / Duck"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent FIRE Blaster Button */}
            <button
              onClick={onTouchFire}
              className="px-6 h-12 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-950/50 active:scale-95 transition"
              title="Fire Blaster"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>FIRE [SPACE]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
