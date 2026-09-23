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
} from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  onSelectMode: (mode: AppMode) => void;
  onToggleAudio: () => void;
  onOpenDrawer: () => void;
  onOpenInstructions: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  onSelectMode,
  onToggleAudio,
  onOpenDrawer,
  onOpenInstructions,
}) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
      {/* Top Mode Navigation Switcher Tabs */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mr-1">
            APP MODE:
          </span>

          <button
            onClick={() => onSelectMode('academy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
              gameState.appMode === 'academy'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md glow-cyan'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>THE ACADEMY (COURSE)</span>
          </button>

          <button
            onClick={() => onSelectMode('solver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
              gameState.appMode === 'solver'
                ? 'bg-amber-950 border-amber-400 text-amber-300 shadow-md glow-amber'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>SOLVER LAB (CALCULATOR)</span>
          </button>

          <button
            onClick={() => onSelectMode('boss')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
              gameState.appMode === 'boss'
                ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-md glow-rose'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            <span>LEVIATHAN ENCOUNTER</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Explanatory Drawer Button */}
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>WHY THIS WORKS</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            onClick={onToggleAudio}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-400 transition"
          >
            {gameState.audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Telemetry Bar for Boss Mode */}
      {gameState.appMode === 'boss' && (
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
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 rounded-sm"
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
      )}
    </div>
  );
};
