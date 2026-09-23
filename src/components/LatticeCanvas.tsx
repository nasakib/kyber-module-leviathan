import React, { useRef, useEffect } from 'react';
import { GameState, Particle, BossProjectile, ParryRing, TargetCore } from '../types/game';

interface LatticeCanvasProps {
  gameState: GameState;
  particles: Particle[];
  projectiles: BossProjectile[];
  parryRing: ParryRing | null;
  targetCore: TargetCore | null;
  onTargetCoreClick: () => void;
  onParryTimingCheck?: () => void;
}

export const LatticeCanvas: React.FC<LatticeCanvasProps> = ({
  gameState,
  particles,
  projectiles,
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
      // Handle canvas resolution
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Clear background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw faint background grid
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

      // 2. Render Lattice Grid & Shear Angle (Matrix B)
      const skew = gameState.lovaszAngle;
      const entropyRatio = gameState.bossHp / gameState.maxBossHp;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Base vector 1: b1
      const b1x = 120 * Math.cos(skew);
      const b1y = 120 * Math.sin(skew);

      // Base vector 2: b2
      const b2x = 120 * Math.cos(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);
      const b2y = 120 * Math.sin(skew + Math.PI / 2 + (1 - entropyRatio) * 0.5);

      // Draw Lattice Grid Points & Connections
      ctx.strokeStyle = gameState.lovaszThresholdSatisfied ? 'rgba(52, 211, 153, 0.4)' : 'rgba(34, 211, 238, 0.2)';
      ctx.lineWidth = 1.5;

      const gridRange = 4;
      for (let i = -gridRange; i <= gridRange; i++) {
        for (let j = -gridRange; j <= gridRange; j++) {
          const px = i * b1x + j * b2x;
          const py = i * b1y + j * b2y;

          // Draw point
          ctx.fillStyle = gameState.lovaszThresholdSatisfied ? '#34d399' : '#22d3ee';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();

          // Connect neighboring lattice nodes
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

      // 3. Gram-Schmidt Orthogonalization Visor (b_i^*)
      if (gameState.gramSchmidtVisor) {
        // Gram-Schmidt orthogonal projection plane lines
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'; // amber-400
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;

        // Orthogonal projection to b1
        const projLength = 180;
        const perpX = -b1y / Math.hypot(b1x, b1y) * projLength;
        const perpY = b1x / Math.hypot(b1x, b1y) * projLength;

        ctx.beginPath();
        ctx.moveTo(-perpX, -perpY);
        ctx.lineTo(perpX, perpY);
        ctx.stroke();

        ctx.setLineDash([]); // reset

        // Label GS planes
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('b₁*', perpX + 10, perpY);
        ctx.fillText('b₂*', -perpX - 25, -perpY);
      }

      // 4. Boss Core ("Kyber, the Module Leviathan")
      const bossRadius = 50 + entropyRatio * 20;

      // Outer noise ring
      ctx.strokeStyle = gameState.bossPhase === 4 ? '#f43f5e' : (gameState.bossPhase === 2 ? '#fbbf24' : '#22d3ee');
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      ctx.arc(0, 0, bossRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Rotating inner polygon (Module Leviathan Emblem)
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

      // Boss Label & Entropy Status
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KYBER LEVIATHAN', 0, -bossRadius - 15);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ENTROPY: ${Math.round(gameState.bossHp)} / ${gameState.maxBossHp} dim`, 0, -bossRadius - 3);

      // Phase 1: Kannan's Anchor visualization
      if (gameState.bossPhase === 1) {
        // Orbiting noisy vectors t = As + e
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
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Phase 2: LLL Parry Ring
      if (parryRing && parryRing.active) {
        ctx.strokeStyle = gameState.lovaszThresholdSatisfied ? '#34d399' : '#38bdf8';
        ctx.lineWidth = gameState.lovaszThresholdSatisfied ? 4 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, parryRing.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Lovász condition indicator ring
        if (gameState.lovaszThresholdSatisfied) {
          ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
          ctx.beginPath();
          ctx.arc(0, 0, parryRing.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText('PARRY READY! (δ = 0.75)', 0, parryRing.radius + 20);
        }
      }

      ctx.restore(); // restore center translation

      // 5. Phase 4: uSVP anomalous vector blinking target core
      if (gameState.bossPhase === 4 && targetCore && targetCore.active) {
        const tcX = centerX + targetCore.x;
        const tcY = centerY + targetCore.y;

        const pulseScale = 1 + Math.sin(targetCore.pulseTimer * 10) * 0.2;
        const reticleRadius = 25 * pulseScale;

        // Glowing anomalous vector reticle
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

        // Target Label
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO DE-ENCAPSULATE uSVP', tcX, tcY - reticleRadius - 15);
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

      // 8. Memory Heat Screen Vignette / Warning
      if (gameState.memoryHeat > 80) {
        ctx.fillStyle = `rgba(244, 63, 94, ${(gameState.memoryHeat - 80) * 0.015})`;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRITICAL OVERHEAT WARNING: SIEVE MEMORY BREACH', centerX, 40);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, particles, projectiles, parryRing, targetCore]);

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
    if (dist <= 40) {
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
