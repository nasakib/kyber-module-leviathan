import React from 'react';
import { GameState, Weapon, BossPhase } from '../types/game';
import {
  Anchor,
  Scissors,
  Flame,
  Eye,
  Wind,
  Shield,
  Activity,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  weapons: Weapon[];
  currentPhaseInfo: BossPhase;
  onUseWeapon: (weaponId: Weapon['id']) => void;
  onBetaChange: (newBeta: number) => void;
  onToggleAudio: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  weapons,
  currentPhaseInfo,
  onUseWeapon,
  onBetaChange,
  onToggleAudio,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'anchor':
        return <Anchor className="w-5 h-5" />;
      case 'scissors':
        return <Scissors className="w-5 h-5" />;
      case 'flame':
        return <Flame className="w-5 h-5" />;
      case 'eye':
        return <Eye className="w-5 h-5" />;
      case 'wind':
        return <Wind className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const calculateOps = (beta: number) => {
    // 2^(0.292 * beta) operations formula
    const exponent = 0.292 * beta;
    return `2^${exponent.toFixed(1)} ops`;
  };

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Top Bar: Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 rounded-lg p-3 backdrop-blur shadow-xl">
        {/* Boss Entropy Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              LATTICE ENTROPY (BOSS)
            </span>
            <span className="text-cyan-300">
              {Math.max(0, Math.round(gameState.bossHp))} / {gameState.maxBossHp} DIM
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded border border-cyan-900/50 p-0.5 relative overflow-hidden">
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

        {/* Player Integrity Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              SYSTEM INTEGRITY (PLAYER)
            </span>
            <span className="text-emerald-300">
              {Math.max(0, Math.round(gameState.playerHp))} / {gameState.maxPlayerHp} HP
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded border border-emerald-900/50 p-0.5 relative overflow-hidden">
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
            <span>PARRY ALIGNMENT: {gameState.lovaszThresholdSatisfied ? 'READY (δ=0.75)' : 'SKEWED'}</span>
            <span>{Math.round(gameState.playerHp)}%</span>
          </div>
        </div>

        {/* Memory Heat Gauge */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              SIEVE MEMORY HEAT
            </span>
            <span className={`${gameState.memoryHeat > 80 ? 'text-rose-400 animate-pulse font-bold' : 'text-amber-300'}`}>
              {Math.round(gameState.memoryHeat)}% {gameState.memoryHeat > 80 && '(OVERHEAT)'}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded border border-amber-900/50 p-0.5 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-200 rounded-sm ${
                gameState.memoryHeat > 80
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, gameState.memoryHeat))}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>BLOCK SIZE (β): {gameState.bkzBeta}</span>
            <span>COST: {calculateOps(gameState.bkzBeta)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 backdrop-blur shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Weapon Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 flex-1">
          {weapons.map((w) => {
            const isVisor = w.id === 'visor';
            const isActiveVisor = isVisor && gameState.gramSchmidtVisor;
            const isOnCooldown = w.currentCooldown > 0;

            return (
              <button
                key={w.id}
                onClick={() => onUseWeapon(w.id)}
                disabled={isOnCooldown || gameState.isGameOver}
                className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                  isActiveVisor
                    ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20'
                    : isOnCooldown
                    ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 active:scale-95'
                }`}
              >
                <div className="relative">
                  {getIcon(w.iconName)}
                  {isOnCooldown && (
                    <div
                      className="absolute inset-0 bg-slate-950/80 rounded flex items-center justify-center text-[10px] text-cyan-400 font-bold"
                    >
                      {w.currentCooldown.toFixed(1)}s
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-none">{w.name}</span>
                  <span className="text-[9px] text-slate-400 font-normal mt-0.5">
                    [{w.shortcut}] {w.id === 'bkz' ? `(β=${gameState.bkzBeta})` : ''}
                  </span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-950 border border-slate-700 text-slate-300 text-[10px] rounded shadow-xl z-50 pointer-events-none">
                  <p className="font-semibold text-cyan-400 mb-0.5">{w.name}</p>
                  <p>{w.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* BKZ Beta Slider & Sound Toggle */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-2 rounded-lg shrink-0">
          <div className="flex flex-col gap-1 w-36">
            <div className="flex items-center justify-between text-[10px] font-semibold text-amber-400">
              <span>BKZ BLOCK SIZE (β)</span>
              <span>{gameState.bkzBeta}</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={gameState.bkzBeta}
              onChange={(e) => onBetaChange(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <button
            onClick={onToggleAudio}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-400 transition"
            title="Toggle Audio"
          >
            {gameState.audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
