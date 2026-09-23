import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Particle, FloatingText } from '../types/game';
import { angleBetween, norm, det2D } from '../utils/latticeMath';
import { ZoomIn, ZoomOut, Maximize2, Lightbulb, Clock } from 'lucide-react';

interface LatticeCanvasProps {
  gameState: GameState;
  particles: Particle[];
  floatingTexts: FloatingText[];
  onAnalysisGateAnswer?: (optionIndex: number) => void;
  onAnalysisGateHint?: () => void;
}

export const LatticeCanvas: React.FC<LatticeCanvasProps> = ({
  gameState,
  particles,
  floatingTexts,
  onAnalysisGateAnswer,
  onAnalysisGateHint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2D Pan & Zoom Engine State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Auto-frame vectors within canvas
  const handleAutoFrame = useCallback(() => {
    let b1 = gameState.solverMatrix.b1;
    let b2 = gameState.solverMatrix.b2;
    let target = gameState.solverTarget;

    if (gameState.appMode === 'academy') {
      const rad = (gameState.interactiveAngle * Math.PI) / 180;
      b1 = { x: 120, y: 0 };
      b2 = { x: 120 * Math.cos(rad), y: -120 * Math.sin(rad) };
      target = { x: 150, y: -80 };
    } else if (gameState.solverSteps.length > 0) {
      const currentStep = gameState.solverSteps[gameState.currentStepIndex] || gameState.solverSteps[0];
      b1 = currentStep.matrix.b1;
      b2 = currentStep.matrix.b2;
    }

    const maxCoord = Math.max(
      Math.abs(b1.x),
      Math.abs(b1.y),
      Math.abs(b2.x),
      Math.abs(b2.y),
      Math.abs(target.x),
      Math.abs(target.y),
      100
    );

    const canvas = canvasRef.current;
    if (!canvas) return;
    const minDim = Math.min(canvas.clientWidth, canvas.clientHeight);
    const targetScale = Math.min(2.5, Math.max(0.25, (minDim * 0.35) / maxCoord));

    setZoom(targetScale);
    setPan({ x: 0, y: 0 });
  }, [gameState.appMode, gameState.interactiveAngle, gameState.solverMatrix, gameState.solverTarget, gameState.solverSteps, gameState.currentStepIndex]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (gameState.appMode === 'boss') return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.min(5.0, Math.max(0.2, prev * factor)));
  };

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.appMode === 'boss') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || gameState.appMode === 'boss') return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Pan & Pinch Zoom Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState.appMode === 'boss') return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState.appMode === 'boss') return;
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      setZoom((prev) => Math.min(5.0, Math.max(0.2, prev * factor)));
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();

      // Screen Shake FX
      if (gameState.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * gameState.screenShake * 4;
        const shakeY = (Math.random() - 0.5) * gameState.screenShake * 4;
        ctx.translate(shakeX, shakeY);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // MODE 1 & MODE 2: 2D TOPOLOGICAL INSPECTION CANVAS (Academy & Solver Lab)
      if (gameState.appMode === 'academy' || gameState.appMode === 'solver') {
        // Clear slate-950 background
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        // Faint background grid
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.save();
        // Apply Pan & Zoom transformations
        ctx.translate(centerX + pan.x, centerY + pan.y);
        ctx.scale(zoom, zoom);

        // Coordinate Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.moveTo(-width * 2, 0);
        ctx.lineTo(width * 2, 0);
        ctx.moveTo(0, -height * 2);
        ctx.lineTo(0, height * 2);
        ctx.stroke();

        // Retrieve current basis matrix & target
        let b1 = gameState.solverMatrix.b1;
        let b2 = gameState.solverMatrix.b2;
        let target = gameState.solverTarget;

        if (gameState.appMode === 'academy') {
          const rad = (gameState.interactiveAngle * Math.PI) / 180;
          b1 = { x: 120, y: 0 };
          b2 = { x: 120 * Math.cos(rad), y: -120 * Math.sin(rad) };
          target = { x: 150, y: -80 };
        } else if (gameState.solverSteps.length > 0) {
          const currentStep = gameState.solverSteps[gameState.currentStepIndex] || gameState.solverSteps[0];
          b1 = currentStep.matrix.b1;
          b2 = currentStep.matrix.b2;
        }

        // Shaded Fundamental Domain Parallelogram (Area = det L)
        ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 1.5 / zoom;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b1.x + b2.x, b1.y + b2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Enclosed Area Label
        const fundamentalArea = det2D({ b1, b2 }).toFixed(0);
        ctx.fillStyle = '#22d3ee';
        ctx.font = `bold ${Math.max(10, Math.round(12 / zoom))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`det(L) = ${fundamentalArea} px²`, (b1.x + b2.x) / 2, (b1.y + b2.y) / 2);

        // Render Lattice Points grid L(B) = z1*b1 + z2*b2
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.lineWidth = 1 / zoom;
        const gridRange = 3;
        for (let i = -gridRange; i <= gridRange; i++) {
          for (let j = -gridRange; j <= gridRange; j++) {
            const px = i * b1.x + j * b2.x;
            const py = i * b1.y + j * b2.y;

            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(px, py, 3 / zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Dynamic Angle Arc θ between b1 and b2
        const currentAngle = angleBetween(b1, b2);
        const arcRadius = 35;
        const startAngle = Math.atan2(b1.y, b1.x);
        const endAngle = Math.atan2(b2.y, b2.x);

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(0, 0, arcRadius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.max(9, Math.round(11 / zoom))}px "JetBrains Mono", monospace`;
        ctx.fillText(`θ = ${currentAngle.toFixed(1)}°`, arcRadius + 10, -5);

        // Gram-Schmidt Orthogonal Shadow Projection (b2*)
        if (gameState.gramSchmidtVisor || gameState.appMode === 'solver') {
          ctx.strokeStyle = '#a855f7';
          ctx.setLineDash([5 / zoom, 5 / zoom]);
          ctx.lineWidth = 2 / zoom;

          const b1NormSq = norm(b1) * norm(b1) || 1;
          const mu = (b2.x * b1.x + b2.y * b1.y) / b1NormSq;
          const projX = b1.x * mu;
          const projY = b1.y * mu;

          ctx.beginPath();
          ctx.moveTo(b2.x, b2.y);
          ctx.lineTo(projX, projY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#a855f7';
          ctx.fillText(`b₂* (Shadow)`, b2.x + 10, b2.y - 10);
        }

        // Basis Vector b1 (cyan arrow)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3 / zoom;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b1.x, b1.y);
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(b1.x, b1.y, 5 / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `bold ${Math.max(10, Math.round(13 / zoom))}px "JetBrains Mono", monospace`;
        ctx.fillText(`b₁ (${b1.x.toFixed(0)}, ${b1.y.toFixed(0)})`, b1.x + 10, b1.y);

        // Basis Vector b2 (amber arrow)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3 / zoom;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(b2.x, b2.y, 5 / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`b₂ (${b2.x.toFixed(0)}, ${b2.y.toFixed(0)})`, b2.x + 10, b2.y);

        // Target Vector t & Babai CVP Result
        if (target) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5 / zoom;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(target.x, target.y, 6 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `bold ${Math.max(10, Math.round(12 / zoom))}px "JetBrains Mono", monospace`;
          ctx.fillText(`Target t (${target.x.toFixed(0)}, ${target.y.toFixed(0)})`, target.x + 12, target.y);
        }

        ctx.restore();
      } else {
        // MODE 3: 3D PERSPECTIVE TUNNEL MODE WITH ANALYSIS GATES (Boss Mode)
        const vanishingX = width / 2;
        const vanishingY = height * 0.35;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        const laneWidthsAtBottom = width * 0.28;
        const laneOffsets = [-laneWidthsAtBottom, 0, laneWidthsAtBottom];

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        for (let l = -1.5; l <= 1.5; l += 1) {
          const bottomX = vanishingX + l * laneWidthsAtBottom * 1.2;
          ctx.beginPath();
          ctx.moveTo(vanishingX, vanishingY);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        const bossScale = 0.4 + (gameState.bossHp / gameState.maxBossHp) * 0.3;
        const bossY = vanishingY - 20;
        const bossRadius = 45 * bossScale;

        ctx.save();
        ctx.translate(vanishingX, bossY);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        ctx.arc(0, 0, bossRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        const shipBaseY = height - 100;
        const currentShipX = vanishingX + laneOffsets[gameState.shipLane + 1];
        const currentShipY = shipBaseY - gameState.shipY;

        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentShipX, currentShipY - 25);
        ctx.lineTo(currentShipX - 25, currentShipY + 20);
        ctx.lineTo(currentShipX, currentShipY + 10);
        ctx.lineTo(currentShipX + 25, currentShipY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Particles & Floating Texts
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      floatingTexts.forEach((ft) => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = `bold ${ft.fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, particles, floatingTexts, zoom, pan]);

  return (
    <div className="relative w-full h-full border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full block ${gameState.appMode !== 'boss' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      />

      {/* Floating Pan & Zoom Controls for 2D Modes */}
      {gameState.appMode !== 'boss' && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-lg shadow-xl backdrop-blur z-30">
          <button
            onClick={() => setZoom((z) => Math.min(5.0, z * 1.25))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoFrame}
            className="p-2 rounded bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-400 font-bold min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            title="Center & Auto-Fit Grid"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 font-bold px-1.5">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      )}

      {/* Analysis Gate Checkpoint Modal Overlay (Boss Mode Slow-Mo Checkpoint) */}
      {gameState.isAnalysisGateActive && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40 font-mono animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                ANALYSIS GATE (SLOW-MOTION)
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                {Math.ceil(gameState.gateTimer)}s REMAINING
              </span>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-100"
                style={{ width: `${Math.max(0, (gameState.gateTimer / 8.0) * 100)}%` }}
              />
            </div>

            <p className="text-xs font-bold text-slate-100 leading-relaxed">
              {gameState.gateQuestion}
            </p>

            <div className="grid grid-cols-1 gap-2 mt-1">
              {gameState.gateOptions.map((option, idx) => {
                const isEliminated = gameState.gateEliminatedOptions.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isEliminated}
                    onClick={() => onAnalysisGateAnswer && onAnalysisGateAnswer(idx)}
                    className={`p-3 rounded border text-left text-xs font-semibold transition min-h-[44px] flex items-center ${
                      isEliminated
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 line-through cursor-not-allowed'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-cyan-400 text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-cyan-400 mr-2">[{idx + 1}]</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* 50/50 Elimination Hint Button */}
            <div className="flex justify-end pt-1">
              <button
                disabled={gameState.gateHintUsed}
                onClick={onAnalysisGateHint}
                className="px-3 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-amber-300 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 min-h-[44px]"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{gameState.gateHintUsed ? '50/50 HINT APPLIED' : 'USE 50/50 HINT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
