import React, { useRef, useEffect } from 'react';
import { GameState, Particle, BossProjectile, ParryRing, TargetCore, FloatingText } from '../types/game';

interface LatticeCanvasProps {
  gameState: GameState;
  particles: Particle[];
  projectiles: BossProjectile[];
  floatingTexts: FloatingText[];
  parryRing: ParryRing | null;
  targetCore: TargetCore | null;
  onTargetCoreClick: () => void;
}

export const LatticeCanvas: React.FC<LatticeCanvasProps> = ({
  gameState,
  particles,
  projectiles,
  floatingTexts,
  parryRing,
  targetCore,
  onTargetCoreClick,
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
        const shakeX = (Math.random() - 0.5) * gameState.screenShake * 3;
        const shakeY = (Math.random() - 0.5) * gameState.screenShake * 3;
        ctx.translate(shakeX, shakeY);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Clear background
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

      // LEVEL 1: ALGEBRA & VECTOR PHYSICS
      if (gameState.activeLevel === 1) {
        // Draw coordinate axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();

        // Vector 1 (Force F1)
        const v1 = gameState.vector1;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(`F₁ (${v1.x}, ${-v1.y})`, v1.x + 10, v1.y);

        // Vector 2 (Force F2) appended to F1
        const v2 = gameState.vector2;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v1.x + v2.x, v1.y + v2.y);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`F₂ (${v2.x}, ${-v2.y})`, v1.x + v2.x + 10, v1.y + v2.y);

        // Net Resultant Force Vector (F_net = F1 + F2)
        const netX = v1.x + v2.x;
        const netY = v1.y + v2.y;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(netX, netY);
        ctx.stroke();
        ctx.setLineDash([]);

        const netMag = Math.hypot(netX, netY).toFixed(1);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText(`F_net = F₁ + F₂ (|F_net| = ${netMag} N)`, netX + 15, netY + 5);

        // Target target coordinate
        const tgt = gameState.targetVector;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tgt.x, tgt.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`Target Goal (${tgt.x}, ${-tgt.y})`, tgt.x + 20, tgt.y);

      } else if (gameState.activeLevel === 2) {
        // LEVEL 2: GEOMETRY & MATRIX FIELD TRANSFORMATIONS
        const skew = gameState.lovaszAngle;
        const b1x = 120 * Math.cos(skew);
        const b1y = 120 * Math.sin(skew);
        const b2x = 120 * Math.cos(skew + Math.PI / 2);
        const b2y = 120 * Math.sin(skew + Math.PI / 2);

        // Render Fundamental Domain Parallelogram (Area = det A)
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(b1x, b1y);
        ctx.lineTo(b1x + b2x, b1y + b2y);
        ctx.lineTo(b2x, b2y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Calculate Determinant (Area of fundamental cell)
        const detA = Math.abs(b1x * b2y - b1y * b2x).toFixed(0);
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(`Fundamental Area det(A) = ${detA} px²`, (b1x + b2x) / 2 - 40, (b1y + b2y) / 2);

        // Warped Field Grid Nodes
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const px = i * b1x + j * b2x;
            const py = i * b1y + j * b2y;
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else if (gameState.activeLevel === 3) {
        // LEVEL 3: CALCULUS & OPTIMIZATION (Gradient & Gram-Schmidt)
        // Potential Energy Curve V(x)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = -200; x <= 200; x += 5) {
          const y = (x * x) * 0.005 - 80;
          if (x === -200) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('Potential Energy Landscape V(x) = ½kx²', 60, -60);

        // Gradient Descent Vector dV/dx
        const ballX = Math.sin(Date.now() * 0.003) * 120;
        const ballY = (ballX * ballX) * 0.005 - 80;

        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Tangent & Normal Vector (Gram-Schmidt Projection b*)
        const slope = 2 * ballX * 0.005;
        const perpX = -slope * 30;
        const perpY = 30;

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + perpX, ballY + perpY);
        ctx.stroke();

        ctx.fillText('∇V (Gradient Force)', ballX + perpX + 10, ballY + perpY);

      } else if (gameState.activeLevel === 4) {
        // LEVEL 4: POST-QUANTUM CRYPTANALYSIS BOSS (Kyber Leviathan)
        const skew = gameState.lovaszAngle;
        const entropyRatio = gameState.bossHp / gameState.maxBossHp;

        const b1x = 120 * Math.cos(skew);
        const b1y = 120 * Math.sin(skew);
        const b2x = 120 * Math.cos(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);
        const b2y = 120 * Math.sin(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);

        // Grid nodes
        ctx.strokeStyle = gameState.lovaszThresholdSatisfied ? 'rgba(52, 211, 153, 0.5)' : 'rgba(34, 211, 238, 0.25)';
        ctx.lineWidth = 1.5;

        const gridRange = 4;
        for (let i = -gridRange; i <= gridRange; i++) {
          for (let j = -gridRange; j <= gridRange; j++) {
            const px = i * b1x + j * b2x;
            const py = i * b1y + j * b2y;

            ctx.fillStyle = gameState.lovaszThresholdSatisfied ? '#34d399' : '#22d3ee';
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();

            if (i < gridRange) {
              const nextPx = (i + 1) * b1x + j * b2x;
              const nextPy = (i + 1) * b1y + j * b2y;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(nextPx, nextPy);
              ctx.stroke();
            }
          }
        }

        // Boss Emblem
        const bossRadius = 50 + entropyRatio * 20;
        ctx.strokeStyle = gameState.bossPhase === 4 ? '#f43f5e' : '#22d3ee';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(0, 0, bossRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KYBER LEVIATHAN', 0, -bossRadius - 18);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`ENTROPY: ${Math.round(gameState.bossHp)} / ${gameState.maxBossHp} dim`, 0, -bossRadius - 4);

        // LLL Parry Ring
        if (parryRing && parryRing.active && gameState.bossPhase === 2) {
          const targetRadius = 70;
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
          ctx.lineWidth = 4;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, targetRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          const isOverlap = Math.abs(parryRing.radius - targetRadius) < 18 || gameState.lovaszThresholdSatisfied;
          ctx.strokeStyle = isOverlap ? '#34d399' : '#38bdf8';
          ctx.lineWidth = isOverlap ? 4 : 2;
          ctx.beginPath();
          ctx.arc(0, 0, parryRing.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (isOverlap) {
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 13px "JetBrains Mono", monospace';
            ctx.fillText('⚡ PRESS [2] PARRY NOW!', 0, targetRadius + 30);
          }
        }
      }

      ctx.restore(); // restore center translation

      // Phase 4 Target Core
      if (gameState.activeLevel === 4 && gameState.bossPhase === 4 && targetCore && targetCore.active) {
        const tcX = centerX + targetCore.x;
        const tcY = centerY + targetCore.y;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tcX, tcY, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 CLICK ANOMALOUS VECTOR!', tcX, tcY - 35);
      }

      // Projectiles
      projectiles.forEach((proj) => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Floating Texts
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
  }, [gameState, particles, projectiles, floatingTexts, parryRing, targetCore]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !targetCore || !targetCore.active || gameState.activeLevel !== 4) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tcX = centerX + targetCore.x;
    const tcY = centerY + targetCore.y;

    if (Math.hypot(clickX - tcX, clickY - tcY) <= 45) {
      onTargetCoreClick();
    }
  };

  return (
    <div className="relative w-full h-full border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />
    </div>
  );
};
