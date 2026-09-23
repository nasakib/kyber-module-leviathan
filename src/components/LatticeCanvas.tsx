import React, { useRef, useEffect } from 'react';
import { GameState, Particle, FloatingText } from '../types/game';
import { angleBetween, norm, det2D } from '../utils/latticeMath';

interface LatticeCanvasProps {
  gameState: GameState;
  particles: Particle[];
  floatingTexts: FloatingText[];
  onAnalysisGateAnswer?: (optionIndex: number) => void;
}

export const LatticeCanvas: React.FC<LatticeCanvasProps> = ({
  gameState,
  particles,
  floatingTexts,
  onAnalysisGateAnswer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        ctx.translate(centerX, centerY);

        // Coordinate Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();

        // Retrieve current basis matrix & target
        let b1 = gameState.solverMatrix.b1;
        let b2 = gameState.solverMatrix.b2;
        let target = gameState.solverTarget;

        if (gameState.appMode === 'academy') {
          // Compute basis based on interactive angle probe
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
        ctx.lineWidth = 1.5;

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
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`det(L) = ${fundamentalArea} px²`, (b1.x + b2.x) / 2, (b1.y + b2.y) / 2);

        // Render Lattice Points grid L(B) = z1*b1 + z2*b2
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.lineWidth = 1;
        const gridRange = 3;
        for (let i = -gridRange; i <= gridRange; i++) {
          for (let j = -gridRange; j <= gridRange; j++) {
            const px = i * b1.x + j * b2.x;
            const py = i * b1.y + j * b2.y;

            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Dynamic Angle Arc θ between b1 and b2
        const currentAngle = angleBetween(b1, b2);
        const arcRadius = 35;
        const startAngle = Math.atan2(b1.y, b1.x);
        const endAngle = Math.atan2(b2.y, b2.x);

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, arcRadius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`θ = ${currentAngle.toFixed(1)}°`, arcRadius + 10, -5);

        // Gram-Schmidt Orthogonal Shadow Projection (b2*)
        if (gameState.gramSchmidtVisor || gameState.appMode === 'solver') {
          ctx.strokeStyle = '#a855f7'; // purple-400
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 2;

          // Proj of b2 onto b1
          const b1NormSq = norm(b1) * norm(b1) || 1;
          const mu = (b2.x * b1.x + b2.y * b1.y) / b1NormSq;
          const projX = b1.x * mu;
          const projY = b1.y * mu;

          // Perpendicular projection line
          ctx.beginPath();
          ctx.moveTo(b2.x, b2.y);
          ctx.lineTo(projX, projY);
          ctx.stroke();
          ctx.setLineDash([]); // reset

          ctx.fillStyle = '#a855f7';
          ctx.fillText(`b₂* (Shadow)`, b2.x + 10, b2.y - 10);
        }

        // Basis Vector b1 (cyan arrow)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b1.x, b1.y);
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(b1.x, b1.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(`b₁ (${b1.x.toFixed(0)}, ${b1.y.toFixed(0)})`, b1.x + 10, b1.y);

        // Basis Vector b2 (amber arrow)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(b2.x, b2.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`b₂ (${b2.x.toFixed(0)}, ${b2.y.toFixed(0)})`, b2.x + 10, b2.y);

        // Target Vector t & Babai CVP Result
        if (target) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText(`Target t (${target.x.toFixed(0)}, ${target.y.toFixed(0)})`, target.x + 12, target.y);
        }

        ctx.restore(); // restore center translation
      } else {
        // MODE 3: 3D PERSPECTIVE TUNNEL MODE WITH ANALYSIS GATES (Boss Mode)
        const vanishingX = width / 2;
        const vanishingY = height * 0.35;

        // Deep space background
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        // Perspective grid lines
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

        // Kyber Leviathan Boss
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

        // Player Starfighter Ship
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

      ctx.restore(); // restore screen shake

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, particles, floatingTexts]);

  return (
    <div className="relative w-full h-full border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Analysis Gate Checkpoint Modal Overlay (Boss Mode Slow-Mo Checkpoint) */}
      {gameState.isAnalysisGateActive && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 font-mono animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                ⚡ ANALYSIS GATE CHECKPOINT (SLOW-MOTION)
              </span>
              <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 font-bold border border-cyan-800">
                TACTICAL DECISION
              </span>
            </div>

            <p className="text-xs font-bold text-slate-100 leading-relaxed">
              {gameState.gateQuestion}
            </p>

            <div className="grid grid-cols-1 gap-2 mt-1">
              {gameState.gateOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnalysisGateAnswer && onAnalysisGateAnswer(idx)}
                  className="p-2.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 text-left text-xs font-semibold text-slate-200 transition"
                >
                  <span className="font-bold text-cyan-400 mr-2">[{idx + 1}]</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
