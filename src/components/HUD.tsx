import React from 'react';
import { GameState, BossPhase } from '../types/game';
import {
  Shield,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  HelpCircle,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Navigation,
} from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  currentPhaseInfo: BossPhase;
  onToggleAudio: () => void;
  onToggleFlowMode: () => void;
  onOpenInstructions: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  currentPhaseInfo,
  onToggleAudio,
  onToggleFlowMode,
  onOpenInstructions,
}) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
      {/* 1. On-Screen Arcade Arrow Key Guide & Controls */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-lg p-2.5 backdrop-blur flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-cyan-400">ARCADE CONTROLS:</span>

            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>LANES</span>
            </span>

            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>JUMP</span>
            </span>

            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-1">
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
              <span>SLIDE</span>
            </span>

            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>[SPACE] BLAST</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Flow Mode Toggle */}
          <button
            onClick={onToggleFlowMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border transition ${
              gameState.isFlowMode
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-md glow-emerald'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className={`w-3.5 h-3.5 ${gameState.isFlowMode ? 'text-emerald-400 animate-spin' : ''}`} />
            <span>AUTOPILOT: {gameState.isFlowMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Instructions Modal Button */}
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

      {/* 2. Status Gauges & Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl">
        {/* Boss Entropy Bar */}
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
              style={{
                width: `${Math.max(0, (gameState.bossHp / gameState.maxBossHp) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>PHASE {gameState.bossPhase}: {currentPhaseInfo.name}</span>
            <span>{Math.round((gameState.bossHp / gameState.maxBossHp) * 100)}%</span>
          </div>
        </div>

        {/* Player Shield Integrity */}
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
                gameState.playerHp < 30
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{
                width: `${Math.max(0, (gameState.playerHp / gameState.maxPlayerHp) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>LANE: {gameState.shipLane === -1 ? 'LEFT' : gameState.shipLane === 1 ? 'RIGHT' : 'CENTER'}</span>
            <span>{Math.round(gameState.playerHp)}%</span>
          </div>
        </div>

        {/* Score & Distance Meter */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              RUNNER DISTANCE & SCORE
            </span>
            <span className="text-amber-300 font-bold">
              {Math.round(gameState.score)} PTS
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 rounded border border-amber-900/50 p-0.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-200 rounded-sm"
              style={{
                width: `${Math.min(100, (gameState.distance % 1000) / 10)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>DISTANCE: {Math.round(gameState.distance)} M</span>
            <span>SPEED: {gameState.speed.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
