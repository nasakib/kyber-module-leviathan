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
      // Canvas resolution handling
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
      ctx.fillStyle = '#020617'; // slate-950
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

      // 2. Render Lattice Grid & Vector Shear (Matrix B)
      const skew = gameState.lovaszAngle;
      const entropyRatio = gameState.bossHp / gameState.maxBossHp;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Base vector b1
      const b1x = 120 * Math.cos(skew);
      const b1y = 120 * Math.sin(skew);

      // Base vector b2
      const b2x = 120 * Math.cos(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);
      const b2y = 120 * Math.sin(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);

      // Draw Lattice Grid Nodes
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
          if (j < gridRange) {
            const nextPx = i * b1x + (j + 1) * b2x;
            const nextPy = i * b1y + (j + 1) * b2y;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(nextPx, nextPy);
            ctx.stroke();
          }
        }
      }

      // Draw primary basis vectors b1 and b2 with arrows & labels
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(b1x, b1y);
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(b2x, b2y);
      ctx.stroke();

      // Vector labels
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('b₁ (Basis 1)', b1x + 8, b1y);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('b₂ (Basis 2)', b2x + 8, b2y);

      // 3. Gram-Schmidt Orthogonalization Visor (b_i^*)
      if (gameState.gramSchmidtVisor) {
        ctx.strokeStyle = '#34d399';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;

        const projLength = 180;
        const perpX = -b1y / Math.hypot(b1x, b1y) * projLength;
        const perpY = b1x / Math.hypot(b1x, b1y) * projLength;

        ctx.beginPath();
        ctx.moveTo(-perpX, -perpY);
        ctx.lineTo(perpX, perpY);
        ctx.stroke();

        ctx.setLineDash([]); // reset

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('b₁* (Orthogonal Projection Plane)', perpX + 10, perpY);
      }

      // 4. Boss Core ("Kyber, the Module Leviathan")
      const bossRadius = 50 + entropyRatio * 20;

      ctx.strokeStyle = gameState.bossPhase === 4 ? '#f43f5e' : (gameState.bossPhase === 2 ? '#fbbf24' : '#22d3ee');
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      ctx.arc(0, 0, bossRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Rotating inner polygon
      ctx.save();
      const time = Date.now() * 0.002;
      ctx.rotate(time);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sides = 6;
      for (let k = 0; k < sides; k++) {
        const angle = (k * 2 * Math.PI) / sides;
        const rx = (bossRadius - 12) * Math.cos(angle);
        const ry = (bossRadius - 12) * Math.sin(angle);
        if (k === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Boss Label & Entropy
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KYBER LEVIATHAN', 0, -bossRadius - 18);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ENTROPY: ${Math.round(gameState.bossHp)} / ${gameState.maxBossHp} dim`, 0, -bossRadius - 4);

      // Phase 1: Kannan's Anchor Orbiting Vectors
      if (gameState.bossPhase === 1) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        const numNoise = 8;
        for (let n = 0; n < numNoise; n++) {
          const nAngle = time + (n * Math.PI * 2) / numNoise;
          const dist = bossRadius + 40 + Math.sin(time * 3 + n) * 10;
          const nx = Math.cos(nAngle) * dist;
          const ny = Math.sin(nAngle) * dist;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Phase 2: LLL Parry Ring + NOVICE TIMING ZONE
      if (parryRing && parryRing.active && gameState.bossPhase === 2) {
        const targetRadius = 70; // Sweet spot radius

        // Render stationary target zone (Green Circle)
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, targetRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Shrinking timing ring
        const isOverlap = Math.abs(parryRing.radius - targetRadius) < 18 || gameState.lovaszThresholdSatisfied;

        ctx.strokeStyle = isOverlap ? '#34d399' : '#38bdf8';
        ctx.lineWidth = isOverlap ? 4 : 2;
        ctx.shadowBlur = isOverlap ? 20 : 0;
        ctx.shadowColor = '#34d399';

        ctx.beginPath();
        ctx.arc(0, 0, parryRing.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (isOverlap) {
          ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
          ctx.beginPath();
          ctx.arc(0, 0, targetRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          ctx.fillText('⚡ PRESS [2] PARRY NOW! (δ = 0.75)', 0, targetRadius + 30);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText('PARRY ZONE (Match Green Ring)', 0, targetRadius + 20);
        }
      }

      ctx.restore(); // restore center translation

      // 5. Phase 4: uSVP Core Target Vector
      if (gameState.bossPhase === 4 && targetCore && targetCore.active) {
        const tcX = centerX + targetCore.x;
        const tcY = centerY + targetCore.y;

        const pulseScale = 1 + Math.sin(targetCore.pulseTimer * 10) * 0.2;
        const reticleRadius = 25 * pulseScale;

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#f43f5e';

        ctx.beginPath();
        ctx.arc(tcX, tcY, reticleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(tcX - reticleRadius - 10, tcY);
        ctx.lineTo(tcX + reticleRadius + 10, tcY);
        ctx.moveTo(tcX, tcY - reticleRadius - 10);
        ctx.lineTo(tcX, tcY + reticleRadius + 10);
        ctx.stroke();

        ctx.shadowBlur = 0; // reset

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 CLICK ANOMALOUS VECTOR TO DE-ENCAPSULATE!', tcX, tcY - reticleRadius - 15);
      }

      // 6. Boss Projectiles
      projectiles.forEach((proj) => {
        ctx.fillStyle = proj.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. Particles
      particles.forEach((p) => {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 8. Floating Text Popups (Damage Numbers & Visual Feedback)
      floatingTexts.forEach((ft) => {
        const alpha = Math.max(0, ft.life / ft.maxLife);
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${ft.fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      });

      // 9. Combo Display on Top Right of Canvas
      if (gameState.comboCount > 1) {
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`🔥 ${gameState.comboCount}x COMBO MULTIPLIER`, width - 20, 30);
      }

      ctx.restore(); // restore screen shake translation

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, particles, projectiles, floatingTexts, parryRing, targetCore]);

  // Handle canvas click for Phase 4 core strike
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !targetCore || !targetCore.active) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tcX = centerX + targetCore.x;
    const tcY = centerY + targetCore.y;

    const dist = Math.hypot(clickX - tcX, clickY - tcY);
    if (dist <= 45) {
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
