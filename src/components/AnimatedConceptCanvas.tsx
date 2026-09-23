import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface AnimatedConceptCanvasProps {
  topicCategory: string;
  standardName?: string;
  sectorId?: string;
  stepNumber?: number;
  currentParams?: Record<string, number>;
}

export const AnimatedConceptCanvas: React.FC<AnimatedConceptCanvasProps> = ({
  topicCategory,
  standardName = '',
  sectorId = '',
  stepNumber = 1,
  currentParams = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [userScrub, setUserScrub] = useState<number>(0.5); // 0 to 1
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const animTimeRef = useRef<number>(0);

  // Determine category type
  const isLinear =
    topicCategory.toLowerCase().includes('algebra i') ||
    sectorId === 'linear' ||
    standardName.toLowerCase().includes('linear') ||
    standardName.toLowerCase().includes('slope');

  const isParabola =
    topicCategory.toLowerCase().includes('algebra ii') ||
    sectorId === 'parabola' ||
    standardName.toLowerCase().includes('parabola') ||
    standardName.toLowerCase().includes('quadratic');

  const isMatrix =
    topicCategory.toLowerCase().includes('linear algebra') ||
    sectorId === 'matrix' ||
    standardName.toLowerCase().includes('matrix') ||
    standardName.toLowerCase().includes('warp');

  const isCalculus =
    topicCategory.toLowerCase().includes('calculus') ||
    sectorId === 'calculus' ||
    standardName.toLowerCase().includes('tangent') ||
    standardName.toLowerCase().includes('derivative');

  const isLattice =
    topicCategory.toLowerCase().includes('lattice') ||
    topicCategory.toLowerCase().includes('discrete') ||
    sectorId === 'lattice' ||
    standardName.toLowerCase().includes('kyber') ||
    standardName.toLowerCase().includes('cryptograph');

  const isWave =
    topicCategory.toLowerCase().includes('wave') ||
    topicCategory.toLowerCase().includes('trigonometry') ||
    sectorId === 'frequency' ||
    standardName.toLowerCase().includes('oscillator') ||
    standardName.toLowerCase().includes('resonance');

  useEffect(() => {
    let animId: number;

    const render = () => {
      if (isPlaying && !isScrubbing) {
        animTimeRef.current += 0.02 * animSpeed;
      }
      const t = isScrubbing ? userScrub * 10 : animTimeRef.current;
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

      // Deep CAD background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      const gridSpacing = 28;
      for (let x = 0; x <= width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw center axes
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      // ==============================================================
      // 1. LINEAR / SLOPE ANIMATION (Rise / Run Right Triangle & Vector)
      // ==============================================================
      if (isLinear) {
        // Animated slope parameter oscillating between 0.2 and 2.2
        const m = currentParams.m ?? (0.8 + Math.sin(t * 0.8) * 0.7);
        const b = currentParams.b ?? (Math.cos(t * 0.5) * 20);

        const x1 = centerX - 120;
        const y1 = centerY - (m * -60 + b);
        const x2 = centerX + 120;
        const y2 = centerY - (m * 60 + b);

        // Right triangle corner
        const cornerX = x2;
        const cornerY = y1;

        // Draw animated right triangle (Run in Cyan, Rise in Amber)
        ctx.save();
        // Triangle fill
        ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cornerX, cornerY);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();

        // Run (Delta X)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cornerX, cornerY);
        ctx.stroke();

        // Rise (Delta Y)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hypotenuse (Trajectory Beam)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x1 - 40, y1 + m * 40);
        ctx.lineTo(x2 + 40, y2 - m * 40);
        ctx.stroke();
        ctx.restore();

        // Traveling kinetic particle along the slope
        const particleProgress = (t * 0.7) % 1;
        const px = x1 + (x2 - x1) * particleProgress;
        const py = y1 + (y2 - y1) * particleProgress;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Labels
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#22d3ee';
        ctx.fillText(`Δx (Run) = ${(240 / 30).toFixed(1)} units`, (x1 + cornerX) / 2 - 40, y1 + 16);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Δy (Rise) = ${((y1 - y2) / 30).toFixed(1)} units`, cornerX + 10, (cornerY + y2) / 2);

        // Slope formula HUD badge
        ctx.fillStyle = '#10b981';
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillText(`m = Δy / Δx = ${m.toFixed(2)}`, centerX - 60, 28);
      }

      // ==============================================================
      // 2. PARABOLA / KINETICS ANIMATION (Arc, Vertex & Symmetrical Roots)
      // ==============================================================
      else if (isParabola) {
        const a = currentParams.a ?? (-0.008 - Math.abs(Math.sin(t * 0.6)) * 0.006);
        const h = currentParams.h ?? (Math.sin(t * 0.5) * 40);
        const k = currentParams.k ?? 80;

        // Draw parabolic curve y = a*(x-h)^2 + k
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = -width / 2; x <= width / 2; x += 3) {
          const y = a * Math.pow(x - h, 2) + k;
          const canvasX = centerX + x;
          const canvasY = centerY - y;
          if (x === -width / 2) ctx.moveTo(canvasX, canvasY);
          else ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();

        // Vertex Marker (h, k)
        const vertexCanvasX = centerX + h;
        const vertexCanvasY = centerY - k;
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(vertexCanvasX, vertexCanvasY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Vertex pulse ring
        const ringR = 8 + (Math.sin(t * 4) + 1) * 6;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(vertexCanvasX, vertexCanvasY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // Axis of symmetry dashed line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(vertexCanvasX, 10);
        ctx.lineTo(vertexCanvasX, height - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Projectile ball tracing arc
        const progress = ((t * 0.5) % 1) * 2 - 1; // -1 to 1
        const orbX = h + progress * 160;
        const orbY = a * Math.pow(orbX - h, 2) + k;
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(centerX + orbX, centerY - orbY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Labels
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Vertex (h, k) = (${(h / 20).toFixed(1)}, ${(k / 20).toFixed(1)})`, vertexCanvasX + 12, vertexCanvasY - 6);

        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`y = a(x - h)² + k | Curvature a = ${a.toFixed(3)}`, centerX - 110, 28);
      }

      // ==============================================================
      // 3. MATRIX WARP ANIMATION (Unit Square Morphing & Area Det)
      // ==============================================================
      else if (isMatrix) {
        // Morph factor between 0 (Identity) and 1 (Transformed)
        const morph = (Math.sin(t * 0.8) + 1) / 2;

        const targetA = currentParams.a ?? 1.5;
        const targetB = currentParams.b ?? 0.8;
        const targetC = currentParams.c ?? 0.2;
        const targetD = currentParams.d ?? 1.2;

        const a = 1 + (targetA - 1) * morph;
        const b = 0 + targetB * morph;
        const c = 0 + targetC * morph;
        const d = 1 + (targetD - 1) * morph;

        const scale = 70;

        // Vertices of unit square transformed by M:
        // (0,0), (1,0)->(a,c), (1,1)->(a+b, c+d), (0,1)->(b,d)
        const p0 = { x: centerX, y: centerY };
        const p1 = { x: centerX + a * scale, y: centerY - c * scale };
        const p2 = { x: centerX + (a + b) * scale, y: centerY - (c + d) * scale };
        const p3 = { x: centerX + b * scale, y: centerY - d * scale };

        ctx.save();
        // Transformed Area fill
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();

        // Parallelogram border
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Basis vector i-hat (Cyan)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Basis vector j-hat (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
        ctx.restore();

        // Determinant readout
        const det = a * d - b * c;
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`Area det(M) = |ad - bc| = ${det.toFixed(2)}`, centerX - 80, 28);

        ctx.fillStyle = '#22d3ee';
        ctx.fillText(`î' = [${a.toFixed(1)}, ${c.toFixed(1)}]ᵀ`, p1.x + 8, p1.y);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`ĵ' = [${b.toFixed(1)}, ${d.toFixed(1)}]ᵀ`, p3.x + 8, p3.y);
      }

      // ==============================================================
      // 4. CALCULUS / TANGENT BLADE ANIMATION (Secant to Tangent Morph)
      // ==============================================================
      else if (isCalculus) {
        // Curve f(x) = 0.005 * x^2
        const f = (x: number) => 0.004 * Math.pow(x, 2);
        const df = (x: number) => 0.008 * x;

        // Fixed point P
        const x0 = 60;
        const y0 = f(x0);

        // Secant delta h smoothly shrinking from 100 to 2 and back
        const h = 5 + Math.abs(Math.sin(t * 0.8)) * 95;
        const x1 = x0 + h;
        const y1 = f(x1);

        // Secant slope
        const secantSlope = (y1 - y0) / h;
        const tangentSlope = df(x0);

        ctx.save();
        // Draw main curve f(x)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = -width / 2; x <= width / 2; x += 4) {
          const cy = centerY - f(x);
          const cx = centerX + x;
          if (x === -width / 2) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Draw Secant / Tangent line extending across canvas
        const lineSlope = h < 8 ? tangentSlope : secantSlope;
        ctx.strokeStyle = h < 12 ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = h < 12 ? '#10b981' : '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(centerX + x0 - 140, centerY - (y0 - lineSlope * 140));
        ctx.lineTo(centerX + x0 + 140, centerY - (y0 + lineSlope * 140));
        ctx.stroke();

        // Fixed point P (Cyan)
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(centerX + x0, centerY - y0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Moving secant point Q (Amber)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(centerX + x1, centerY - y1, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Readout
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillStyle = h < 12 ? '#10b981' : '#f59e0b';
        ctx.fillText(
          h < 12
            ? `Instantaneous Tangent Blade: f'(${x0}) = ${tangentSlope.toFixed(2)}`
            : `Secant Slope [h = ${(h / 20).toFixed(1)}]: Δy/Δx = ${secantSlope.toFixed(2)}`,
          centerX - 120,
          28
        );
      }

      // ==============================================================
      // 5. LATTICE CRYPTOGRAPHY / KYBER ANIMATION
      // ==============================================================
      else if (isLattice) {
        const spacing = 45;
        ctx.save();
        // Draw discrete 2D grid dots
        for (let x = -4; x <= 4; x++) {
          for (let y = -3; y <= 3; y++) {
            const px = centerX + x * spacing;
            const py = centerY + y * spacing;
            ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // True secret lattice point
        const secretX = centerX + 1 * spacing;
        const secretY = centerY - 1 * spacing;

        // Noisy ciphertext point oscillating with error vector e
        const noiseR = 14 + Math.sin(t * 3) * 6;
        const cipherX = secretX + Math.cos(t * 1.5) * noiseR;
        const cipherY = secretY + Math.sin(t * 1.5) * noiseR;

        // Noise error radius circle
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(secretX, secretY, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Ciphertext payload
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(cipherX, cipherY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Babai reduction snap vector
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cipherX, cipherY);
        ctx.lineTo(secretX, secretY);
        ctx.stroke();

        // Secret point beacon
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(secretX, secretY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`Decrypted Secret Key Point s = [1, 1]ᵀ`, secretX + 12, secretY - 10);

        ctx.fillStyle = '#fb7185';
        ctx.fillText(`Lattice Reduction: Round(t = As + e) ⟶ s`, centerX - 110, 28);
      }

      // ==============================================================
      // 6. HARMONIC WAVE / FREQUENCY ANIMATION
      // ==============================================================
      else {
        // Destructive / constructive interference demonstration
        const omega = 12;
        const phi = (t * 0.8) % (Math.PI * 2);

        ctx.save();
        ctx.lineWidth = 2;

        // User Wave (Amber)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y = 35 * Math.sin((x / width) * omega + t * 2);
          if (x === 0) ctx.moveTo(x, centerY - 45 - y);
          else ctx.lineTo(x, centerY - 45 - y);
        }
        ctx.stroke();

        // Inverted Anti-Wave (Cyan)
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y = 35 * Math.sin((x / width) * 12 + t * 2 + phi);
          if (x === 0) ctx.moveTo(x, centerY + 45 - y);
          else ctx.lineTo(x, centerY + 45 - y);
        }
        ctx.stroke();

        // Composite Superposition Wave (Emerald Green)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y1 = 35 * Math.sin((x / width) * 12 + t * 2);
          const y2 = 35 * Math.sin((x / width) * 12 + t * 2 + phi);
          const ySum = y1 + y2;
          if (x === 0) ctx.moveTo(x, centerY - ySum);
          else ctx.lineTo(x, centerY - ySum);
        }
        ctx.stroke();
        ctx.restore();

        // Readout
        const isCancelled = Math.abs(phi - Math.PI) < 0.3;
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillStyle = isCancelled ? '#10b981' : '#38bdf8';
        ctx.fillText(
          isCancelled
            ? '★ Perfect Destructive Interference: y₁ + y₂ = 0 (Silent)'
            : `Wave Superposition | Phase Offset φ = ${phi.toFixed(2)} rad`,
          centerX - 140,
          28
        );
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    animSpeed,
    userScrub,
    isScrubbing,
    isLinear,
    isParabola,
    isMatrix,
    isCalculus,
    isLattice,
    isWave,
    currentParams,
    stepNumber,
  ]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none font-mono">
      {/* Top Animation Title & Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            Interactive Visual Derivation
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => {
              animTimeRef.current = 0;
              setUserScrub(0);
            }}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Restart Animation Cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800 text-[10px]">
            <button
              onClick={() => setAnimSpeed(0.5)}
              className={`px-1.5 py-0.5 rounded ${animSpeed === 0.5 ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              0.5x
            </button>
            <button
              onClick={() => setAnimSpeed(1)}
              className={`px-1.5 py-0.5 rounded ${animSpeed === 1 ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              1.0x
            </button>
            <button
              onClick={() => setAnimSpeed(2)}
              className={`px-1.5 py-0.5 rounded ${animSpeed === 2 ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
            >
              2.0x
            </button>
          </div>
        </div>
      </div>

      {/* 60 FPS Canvas */}
      <div className="relative w-full h-[240px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Interactive Time / Parameter Scrubber */}
      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center space-x-3 text-[11px]">
        <span className="text-slate-400 shrink-0">Scrub Phase:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={userScrub}
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={() => setIsScrubbing(false)}
          onTouchStart={() => setIsScrubbing(true)}
          onTouchEnd={() => setIsScrubbing(false)}
          onChange={(e) => setUserScrub(parseFloat(e.target.value))}
          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <span className="text-cyan-400 font-semibold w-10 text-right">
          {(userScrub * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};
