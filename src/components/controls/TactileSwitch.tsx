import React from 'react';
import { soundEngine } from '../../utils/audio';

interface TactileSwitchProps {
  checked: boolean;
  label: string;
  subLabel?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({
  checked,
  label,
  subLabel,
  onChange,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (disabled) return;
    soundEngine.playSwitchClick();
    onChange(!checked);
  };

  return (
    <div className="flex flex-col items-center select-none font-mono">
      {/* Label */}
      <span className="text-[10px] font-bold text-slate-300 mb-1 text-center truncate max-w-[90px]">
        {label}
      </span>

      {/* Heavy Metal Toggle Switch Housing */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`relative w-10 h-16 rounded-lg border-2 p-1 transition-all flex flex-col justify-between items-center ${
          checked
            ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/20'
            : 'bg-slate-950 border-slate-700 hover:border-slate-600'
        } disabled:opacity-40 cursor-pointer`}
      >
        {/* Status Indicator LED */}
        <div
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            checked
              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
              : 'bg-slate-800'
          }`}
        />

        {/* Mechanical Rocker Switch Lever */}
        <div
          className={`w-7 h-8 rounded bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 border border-slate-400 shadow-lg transform transition-transform duration-150 flex items-center justify-center ${
            checked ? '-translate-y-1 rotate-6' : 'translate-y-1 -rotate-6'
          }`}
        >
          {/* Machine grip ribs */}
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-slate-600 rounded" />
            <div className="w-4 h-0.5 bg-slate-600 rounded" />
          </div>
        </div>

        {/* State Text: ON / OFF */}
        <span className={`text-[8px] font-bold ${checked ? 'text-cyan-400' : 'text-slate-600'}`}>
          {checked ? 'ENGAGED' : 'STANDBY'}
        </span>
      </button>

      {subLabel && (
        <span className="text-[9px] text-slate-500 mt-1 truncate max-w-[80px]">
          {subLabel}
        </span>
      )}
    </div>
  );
};
