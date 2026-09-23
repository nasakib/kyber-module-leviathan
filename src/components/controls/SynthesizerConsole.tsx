import React from 'react';
import { LevelDefinition } from '../../types/game';
import { useAuth } from '../../context/AuthContext';
import { translateTerm } from '../../utils/jargonDictionary';
import { TactileDial } from './TactileDial';
import { TactileSwitch } from './TactileSwitch';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface SynthesizerConsoleProps {
  level: LevelDefinition;
  params: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  onFire: () => void;
  onReset: () => void;
  isFiring: boolean;
  polarityInverted?: boolean;
  onTogglePolarity?: (val: boolean) => void;
  superpositionEnabled?: boolean;
  onToggleSuperposition?: (val: boolean) => void;
}

export const SynthesizerConsole: React.FC<SynthesizerConsoleProps> = ({
  level,
  params,
  onParamChange,
  onFire,
  onReset,
  isFiring,
  polarityInverted = false,
  onTogglePolarity,
  superpositionEnabled = false,
  onToggleSuperposition,
}) => {
  const { profile } = useAuth();

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl font-mono select-none relative overflow-hidden">
      {/* Rack-mount Screws & Metal Trim */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45" />
      </div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center">
        <div className="w-1 h-0.5 bg-slate-600 -rotate-45" />
      </div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center">
        <div className="w-1 h-0.5 bg-slate-600 -rotate-45" />
      </div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45" />
      </div>

      {/* Top Telemetry & Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs font-bold text-slate-200 tracking-wider">
            ANALOG SYNTHESIZER CONSOLE
          </span>
          <span className="text-[10px] uppercase text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            {profile.tier} Calibration
          </span>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          title="Reset dials to default state (R)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Console Bay: Rotary Dials & Switches */}
      <div className="py-4 flex flex-wrap items-center justify-around gap-6">
        {/* Toggle Switches Column */}
        {(onTogglePolarity || onToggleSuperposition) && (
          <div className="flex items-center space-x-4 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {onTogglePolarity && (
              <TactileSwitch
                checked={polarityInverted}
                label="Invert Polarity"
                subLabel="± Transform"
                onChange={onTogglePolarity}
              />
            )}

            {onToggleSuperposition && (
              <TactileSwitch
                checked={superpositionEnabled}
                label="Harmonic Superposition"
                subLabel="Dual Wave"
                onChange={onToggleSuperposition}
              />
            )}
          </div>
        )}

        {/* Rotary Dials for Parameter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 flex-1">
          {level.paramControls.map((ctrl) => {
            const currentVal = params[ctrl.key] ?? ctrl.defaultValue;
            const jargon = translateTerm(ctrl.key, profile.tier, profile.unlocked_terms);

            return (
              <TactileDial
                key={ctrl.key}
                value={currentVal}
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                label={ctrl.label}
                unit={ctrl.unit}
                jargonTranslation={jargon}
                onChange={(newVal) => onParamChange(ctrl.key, newVal)}
                snapToIntegers={ctrl.step >= 1}
              />
            );
          })}
        </div>

        {/* Big Illuminated Launch / Simulate Trigger */}
        <div className="flex flex-col items-center justify-center pl-2">
          <button
            onClick={onFire}
            disabled={isFiring}
            className={`w-28 h-20 rounded-xl font-bold font-mono text-sm transition-all flex flex-col items-center justify-center space-y-1 shadow-2xl border-2 ${
              isFiring
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 border-cyan-300 shadow-cyan-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isFiring ? (
              <>
                <Zap className="w-5 h-5 animate-spin" />
                <span className="text-[11px] tracking-wider">BEAM ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span className="text-xs tracking-wider">FIRE / TEST</span>
                <span className="text-[9px] opacity-75 font-normal">[SPACE]</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
