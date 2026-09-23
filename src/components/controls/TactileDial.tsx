import React, { useRef, useState, useCallback, useEffect } from 'react';
import { soundEngine } from '../../utils/audio';

interface TactileDialProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  jargonTranslation?: { label: string; description: string; symbol: string };
  onChange: (val: number) => void;
  snapToIntegers?: boolean;
}

export const TactileDial: React.FC<TactileDialProps> = ({
  value,
  min,
  max,
  step = 0.1,
  label,
  unit = '',
  jargonTranslation,
  onChange,
  snapToIntegers = false,
}) => {
  const dialRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);
  const lastDetentValRef = useRef<number>(value);

  // Map value to angle (-135deg to +135deg, total 270deg span)
  const range = max - min || 1;
  const clampedVal = Math.min(Math.max(value, min), max);
  const normalized = (clampedVal - min) / range; // 0 to 1
  const angle = -135 + normalized * 270;

  const updateFromDelta = useCallback(
    (deltaY: number) => {
      // 150px drag traverses the full dial range
      const deltaVal = -(deltaY / 150) * range;
      let nextVal = startValRef.current + deltaVal;

      if (snapToIntegers) {
        nextVal = Math.round(nextVal);
      } else {
        const precision = step.toString().split('.')[1]?.length || 0;
        nextVal = Math.round(nextVal / step) * step;
        nextVal = parseFloat(nextVal.toFixed(precision));
      }

      nextVal = Math.min(Math.max(nextVal, min), max);

      // Trigger mechanical click on detent boundary
      if (Math.abs(nextVal - lastDetentValRef.current) >= (snapToIntegers ? 1 : step * 2)) {
        soundEngine.playDetentTick();
        lastDetentValRef.current = nextVal;
      }

      onChange(nextVal);
    },
    [range, min, max, step, snapToIntegers, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    soundEngine.playDetentTick();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startYRef.current = e.touches[0].clientY;
      startValRef.current = value;
      soundEngine.playDetentTick();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateFromDelta(e.clientY - startYRef.current);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      updateFromDelta(e.touches[0].clientY - startYRef.current);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateFromDelta]);

  return (
    <div className="flex flex-col items-center select-none font-mono group">
      {/* Dynamic Jargon Header */}
      <div className="text-center mb-1.5 px-1 max-w-[120px]">
        <span className="text-[11px] font-bold text-slate-200 block truncate group-hover:text-cyan-300 transition-colors">
          {jargonTranslation?.label || label}
        </span>
        {jargonTranslation?.symbol && (
          <span className="text-[9px] text-cyan-400 font-normal block truncate">
            {jargonTranslation.symbol}
          </span>
        )}
      </div>

      {/* Rotary Dial Hardware Chassis */}
      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative w-20 h-20 rounded-full cursor-ns-resize flex items-center justify-center transition-all ${
          isDragging
            ? 'scale-105 shadow-xl shadow-cyan-500/30'
            : 'hover:shadow-lg hover:shadow-cyan-500/10'
        }`}
        style={{
          background: 'radial-gradient(circle, #1e293b 0%, #0f172a 70%, #020617 100%)',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          boxShadow: isDragging
            ? '0 0 15px rgba(34, 211, 238, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
            : 'inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 4px 6px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Circumferential Detent Tick Marks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {[-135, -90, -45, 0, 45, 90, 135].map((tickAngle) => {
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = 50 + 40 * Math.cos(rad);
            const y1 = 50 + 40 * Math.sin(rad);
            const x2 = 50 + 46 * Math.cos(rad);
            const y2 = 50 + 46 * Math.sin(rad);
            return (
              <line
                key={tickAngle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tickAngle === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)'}
                strokeWidth={tickAngle === 0 ? '2' : '1.2'}
              />
            );
          })}
        </svg>

        {/* Rotating Dial Knob Face */}
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 shadow-inner flex items-center justify-center relative transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Indicator Laser Pip / Needle */}
          <div className="absolute top-1.5 w-1 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />

          {/* Center Machined Metal Cap */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-slate-700 to-slate-950 border border-slate-600 flex items-center justify-center" />
        </div>
      </div>

      {/* Numeric Readout Badge */}
      <div className="mt-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-bold text-cyan-300 shadow-inner min-w-[50px] text-center">
        {value.toFixed(snapToIntegers ? 0 : 2)}
        {unit && <span className="text-slate-500 font-normal ml-0.5">{unit}</span>}
      </div>
    </div>
  );
};
