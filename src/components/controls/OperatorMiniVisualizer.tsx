import React, { useRef, useEffect } from 'react';

interface OperatorMiniVisualizerProps {
  paramKey: string;
  currentValue: number;
}

export const OperatorMiniVisualizer: React.FC<OperatorMiniVisualizerProps> = ({
  paramKey,
  currentValue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Subtle axes
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      const k = paramKey.toLowerCase();

      // 1. Slope (m)
      if (k === 'm') {
        const slope = currentValue;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const span = width * 0.45;
        ctx.moveTo(cx - span, cy + slope * span * 0.4);
        ctx.lineTo(cx + span, cy - slope * span * 0.4);
        ctx.stroke();

        // Traveling particle up/down slope
        const p = (t * 0.8) % 1;
        const px = cx - span + span * 2 * p;
        const py = cy + slope * span * 0.4 - slope * span * 0.8 * p;
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Y-Intercept (b)
      else if (k === 'b') {
        const offset = Math.min(height * 0.4, Math.max(-height * 0.4, currentValue * 6));
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, cy - offset);
        ctx.lineTo(width - 10, cy - offset);
        ctx.stroke();

        // Glowing intercept node
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy - offset, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Parabola curvature (a)
      else if (k === 'a') {
        const aScale = currentValue * 40;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        for (let x = -cx + 10; x <= cx - 10; x += 3) {
          const y = (aScale * Math.pow(x / (cx * 0.6), 2));
          if (x === -cx + 10) ctx.moveTo(cx + x, cy - y);
          else ctx.lineTo(cx + x, cy - y);
        }
        ctx.stroke();
      }

      // 4. Parabola vertex horizontal shift (h)
      else if (k === 'h') {
        const hShift = Math.min(cx * 0.7, Math.max(-cx * 0.7, currentValue * 8));
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx + hShift, 4);
        ctx.lineTo(cx + hShift, height - 4);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -25; x <= 25; x += 2) {
          const y = -0.05 * Math.pow(x, 2) + 12;
          if (x === -25) ctx.moveTo(cx + hShift + x, cy - y);
          else ctx.lineTo(cx + hShift + x, cy - y);
        }
        ctx.stroke();
      }

      // 5. Parabola vertex altitude (k)
      else if (k === 'k') {
        const kShift = Math.min(cy * 0.7, Math.max(-cy * 0.7, currentValue * 6));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -25; x <= 25; x += 2) {
          const y = -0.05 * Math.pow(x, 2);
          if (x === -25) ctx.moveTo(cx + x, cy - kShift - y);
          else ctx.lineTo(cx + x, cy - kShift - y);
        }
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy - kShift, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Frequency (omega, freq)
      else if (k.includes('freq') || k.includes('omega')) {
        const freq = Math.max(0.5, Math.min(15, currentValue));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const y = Math.sin((x / width) * freq * Math.PI * 2 - t * 3) * (height * 0.32);
          if (x === 0) ctx.moveTo(x, cy - y);
          else ctx.lineTo(x, cy - y);
        }
        ctx.stroke();
      }

      // 7. Amplitude (A, amplitude)
      else if (k.includes('amp') || k === 'a') {
        const amp = Math.min(height * 0.42, Math.max(3, currentValue * 8));
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const y = Math.sin((x / width) * 4 * Math.PI - t * 2) * amp;
          if (x === 0) ctx.moveTo(x, cy - y);
          else ctx.lineTo(x, cy - y);
        }
        ctx.stroke();
      }

      // 8. Phase (phi, delta, phase)
      else if (k.includes('phase') || k.includes('phi') || k.includes('delta')) {
        const phi = currentValue;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const y = Math.sin((x / width) * 4 * Math.PI + phi) * (height * 0.32);
          if (x === 0) ctx.moveTo(x, cy - y);
          else ctx.lineTo(x, cy - y);
        }
        ctx.stroke();

        // Phase marker
        ctx.strokeStyle = '#fb7185';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cx, 4);
        ctx.lineTo(cx, height - 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Default: Dynamic vector / oscillation line
      else {
        const val = Math.sin(t * 2) * 15 + currentValue * 5;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, cy - val);
        ctx.lineTo(width - 15, cy + val);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [paramKey, currentValue]);

  return (
    <div className="w-full h-[52px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <span className="absolute bottom-1 right-2 text-[8.5px] font-mono text-slate-500 uppercase tracking-widest">
        Live Response
      </span>
    </div>
  );
};
