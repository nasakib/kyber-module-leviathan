import React, { useRef, useEffect } from 'react';
import { LevelDefinition } from '../types/game';
import { soundEngine } from '../utils/audio';

interface OscilloscopeCanvasProps {
  level?: LevelDefinition;
  params?: Record<string, number>;
  isFiring?: boolean;
  onSimulationComplete?: (success: boolean, targetsHit: string[]) => void;
  // Direct props fallback
  amplitude?: number;
  frequency?: number; // omega in rad/s
  phase?: number;     // phi in radians
  secondaryWave?: {
    amplitude: number;
    frequency: number;
    phase: number;
  };
  isSuperposition?: boolean;
  targetResonance?: number; // omega_0 for acoustic shatter
  noiseWave?: {
    amplitude: number;
    frequency: number;
    phase?: number;
  };
  isLissajous?: boolean;
  lissajousOmegaY?: number;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  level,
  params = {},
  isFiring = false,
  onSimulationComplete,
  amplitude: propAmp,
  frequency: propFreq,
  phase: propPhase,
  secondaryWave,
  isSuperposition: propSuperposition,
  targetResonance: propResonance,
  noiseWave: propNoise,
  isLissajous: propLissajous,
  lissajousOmegaY: propOmegaY,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(0);

  // Derive parameters from props or level/params
  const amplitude = params.amplitude ?? params.A ?? propAmp ?? 1;
  const frequency = params.frequency ?? params.omega ?? params.omega_x ?? propFreq ?? 1;
  const phase = params.phase ?? params.phi ?? params.delta ?? propPhase ?? 0;
  const lissajousOmegaY = params.omega_y ?? propOmegaY ?? 2;

  const targetResonance = level?.targetFrequency ?? propResonance;
  const noiseWave = level?.noiseWave ?? propNoise;
  const isLissajous = level?.waveMode === 'lissajous' || Boolean(propLissajous);
  const isSuperposition =
    level?.waveMode === 'cancellation' || Boolean(propSuperposition) || Boolean(noiseWave);

  // Procedural audio resonance hum when approaching resonant frequency
  useEffect(() => {
    if (targetResonance !== undefined) {
      const delta = Math.abs(frequency - targetResonance);
      soundEngine.playResonanceHum(delta);
    }
  }, [frequency, targetResonance]);

  // Handle simulation trigger and win conditions
  useEffect(() => {
    if (!isFiring) return;

    const timer = setTimeout(() => {
      let success = false;
      let targetsHit: string[] = [];

      if (targetResonance !== undefined) {
        // Mode 1: Resonance Shatter
        const deltaOmega = Math.abs(frequency - targetResonance);
        if (deltaOmega <= 0.35 && amplitude >= 2.8) {
          success = true;
          targetsHit = ['target_shatter'];
          soundEngine.playResonanceHum(0);
          soundEngine.playTargetHit(1);
        } else {
          soundEngine.playObstacleClang();
        }
      } else if (noiseWave) {
        // Mode 2: Destructive Phase Cancellation
        const aDiff = Math.abs(amplitude - noiseWave.amplitude);
        const wDiff = Math.abs(frequency - noiseWave.frequency);
        const normalizedPhase = Math.abs(phase % (2 * Math.PI));
        const isPi = Math.abs(normalizedPhase - Math.PI) < 0.4 || Math.abs(normalizedPhase - 3.14) < 0.4;

        if (aDiff < 0.5 && wDiff < 0.35 && isPi) {
          success = true;
          targetsHit = ['target_cancel'];
          soundEngine.playTargetHit(1);
        } else {
          soundEngine.playObstacleClang();
        }
      } else if (isLissajous) {
        // Mode 3: Lissajous Portal Knot (3:2 ratio with delta ~ pi/2)
        const ratio = frequency / (lissajousOmegaY || 1);
        const is3to2 = Math.abs(ratio - 1.5) < 0.18;
        const normalizedPhase = Math.abs(phase % Math.PI);
        const isHalfPi = Math.abs(normalizedPhase - 1.57) < 0.4;

        if (is3to2 && isHalfPi) {
          success = true;
          targetsHit = ['portal_1', 'portal_2', 'portal_3'];
          soundEngine.playTargetHit(1);
          soundEngine.playTargetHit(2);
        } else {
          soundEngine.playObstacleClang();
        }
      }

      onSimulationComplete?.(success, targetsHit);
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isFiring,
    frequency,
    amplitude,
    phase,
    targetResonance,
    noiseWave,
    isLissajous,
    lissajousOmegaY,
    onSimulationComplete,
  ]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark oscilloscope cathode phosphor background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      const centerX = width / 2;

      // 1. Oscilloscope Cathode Ray Tube Grid Lines (Greenish Phosphor)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      const gridPx = 40;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center Axes
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      // Scale factor (pixels per amplitude unit)
      const scaleY = height / 14;

      // 2. LISSAJOUS APERTURE MODE
      if (isLissajous) {
        ctx.save();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const lissajousSamples = 300;
        for (let i = 0; i <= lissajousSamples; i++) {
          const theta = (i / lissajousSamples) * Math.PI * 4;
          const lx = centerX + Math.sin(frequency * theta + t * 0.5) * (amplitude * scaleY * 0.7);
          const ly = centerY + Math.sin(lissajousOmegaY * theta + phase) * (amplitude * scaleY * 0.7);
          if (i === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();

        // Target Rings for Lissajous
        [
          { x: centerX - 80, y: centerY - 40 },
          { x: centerX, y: centerY },
          { x: centerX + 80, y: centerY + 40 },
        ].forEach((ring, idx) => {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.font = '10px ui-monospace, monospace';
          ctx.fillText(`Portal ${idx + 1}`, ring.x - 20, ring.y - 18);
        });

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // 3. TARGET NOISE WAVE (for Destructive Phase Cancellation Level)
      if (noiseWave) {
        ctx.save();
        ctx.strokeStyle = '#ef4444'; // Red hostile noise wave
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let px = 0; px <= width; px += 2) {
          const waveX = (px / width) * 12;
          const yNoise = noiseWave.amplitude * Math.sin(noiseWave.frequency * waveX - t * 2);
          const sy = centerY - yNoise * scaleY;
          if (px === 0) ctx.moveTo(px, sy);
          else ctx.lineTo(px, sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 4. PRIMARY USER WAVE y1(t) = A * sin(omega * x + phi)
      ctx.save();
      ctx.strokeStyle = isSuperposition ? '#f59e0b' : '#38bdf8'; // Amber if superposition, else Cyan
      ctx.lineWidth = 2.2;
      ctx.shadowColor = isSuperposition ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let px = 0; px <= width; px += 2) {
        const waveX = (px / width) * 12;
        const y1 = amplitude * Math.sin(frequency * waveX - t * 2 + phase);
        const sy = centerY - y1 * scaleY;
        if (px === 0) ctx.moveTo(px, sy);
        else ctx.lineTo(px, sy);
      }
      ctx.stroke();
      ctx.restore();

      // 5. SECONDARY / NOISE SUPERPOSITION (y_sum = y_user + y_noise or y1 + y2)
      if (noiseWave || (isSuperposition && secondaryWave)) {
        const sAmp = noiseWave ? noiseWave.amplitude : secondaryWave!.amplitude;
        const sFreq = noiseWave ? noiseWave.frequency : secondaryWave!.frequency;
        const sPhase = noiseWave ? 0 : secondaryWave!.phase;

        // Composite Interference Wave y_sum = y1 + y2
        ctx.save();
        ctx.strokeStyle = '#10b981'; // Bright Emerald Green
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();

        for (let px = 0; px <= width; px += 2) {
          const waveX = (px / width) * 12;
          const y1 = amplitude * Math.sin(frequency * waveX - t * 2 + phase);
          const y2 = sAmp * Math.sin(sFreq * waveX - t * 2 + sPhase);
          const ySum = y1 + y2;
          const sy = centerY - ySum * scaleY;
          if (px === 0) ctx.moveTo(px, sy);
          else ctx.lineTo(px, sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 6. ACOUSTIC RESONANCE BARRIER (if targetResonance specified)
      if (targetResonance !== undefined) {
        const deltaOmega = Math.abs(frequency - targetResonance);
        const resonanceAmplitude =
          1.0 / Math.sqrt(Math.pow(frequency * frequency - targetResonance * targetResonance, 2) + 0.2);
        const isShattered = deltaOmega < 0.35 && amplitude >= 2.8;

        // Render crystal barrier at x = 75%
        const barrierX = width * 0.75;
        ctx.save();
        ctx.fillStyle = isShattered ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)';
        ctx.strokeStyle = isShattered ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash(isShattered ? [6, 6] : []);

        const barrierHeight = Math.max(20, height - resonanceAmplitude * 15);
        ctx.strokeRect(barrierX - 8, (height - barrierHeight) / 2, 16, barrierHeight);

        // Status badge
        ctx.fillStyle = isShattered ? '#ef4444' : '#38bdf8';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          isShattered
            ? '⚡ SHATTER THRESHOLD REACHED'
            : `Resonance: ${(resonanceAmplitude * 10).toFixed(1)} dB`,
          barrierX,
          height - 15
        );

        ctx.restore();
      }

      // 7. Top Legend Readout
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `y(t) = ${amplitude.toFixed(2)} sin(${frequency.toFixed(2)}t + ${phase.toFixed(2)} rad)`,
        16,
        22
      );

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    amplitude,
    frequency,
    phase,
    secondaryWave,
    isSuperposition,
    targetResonance,
    noiseWave,
    isLissajous,
    lissajousOmegaY,
  ]);

  return (
    <div className="relative w-full h-[460px] bg-slate-950 overflow-hidden border border-slate-800 rounded-xl shadow-2xl select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-3 right-4 px-2.5 py-1 bg-slate-900/80 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-mono flex items-center space-x-1.5 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>OSCILLOSCOPE PHOSPHOR 60 FPS</span>
      </div>
    </div>
  );
};
