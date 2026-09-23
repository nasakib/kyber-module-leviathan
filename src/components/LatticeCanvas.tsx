import React, { useRef, useEffect } from 'react';
import { GameState, Particle, FloatingText } from '../types/game';

interface LatticeCanvasProps {
  gameState: GameState;
  particles: Particle[];
  floatingTexts: FloatingText[];
}

export const LatticeCanvas: React.FC<LatticeCanvasProps> = ({
  gameState,
  particles,
  floatingTexts,
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

      const vanishingX = width / 2;
      const vanishingY = height * 0.35; // horizon line

      // 1. Clear background (deep cyberpunk space)
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Starfield background particles
      ctx.fillStyle = '#ffffff';
      const time = Date.now() * 0.001;
      for (let s = 0; s < 40; s++) {
        const sx = (Math.sin(s * 99 + time * 0.2) * 0.5 + 0.5) * width;
        const sy = (Math.cos(s * 33 + time * 0.3) * 0.5 + 0.5) * (vanishingY);
        ctx.beginPath();
        ctx.arc(sx, sy, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 3D Perspective Tunnel Grid Lines
      const laneWidthsAtBottom = width * 0.28;
      const laneOffsets = [-laneWidthsAtBottom, 0, laneWidthsAtBottom];

      // Draw perspective lane boundaries
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let l = -1.5; l <= 1.5; l += 1) {
        const bottomX = vanishingX + l * laneWidthsAtBottom * 1.2;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // Draw moving horizontal tunnel grid lines (Z-perspective scroll)
      const scrollOffset = (gameState.distance * 8) % 40;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      for (let z = 0; z < 20; z++) {
        const zPos = (z * 40 + scrollOffset) / 800; // 0 (horizon) to 1 (bottom)
        const currentY = vanishingY + (height - vanishingY) * Math.pow(zPos, 2);
        const currentW = width * Math.pow(zPos, 2);

        ctx.beginPath();
        ctx.moveTo(vanishingX - currentW / 2, currentY);
        ctx.lineTo(vanishingX + currentW / 2, currentY);
        ctx.stroke();
      }

      // Highlight active lane track glows
      const shipTargetX = vanishingX + laneOffsets[gameState.shipLane + 1];
      ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(shipTargetX - laneWidthsAtBottom * 0.5, height);
      ctx.lineTo(shipTargetX + laneWidthsAtBottom * 0.5, height);
      ctx.closePath();
      ctx.fill();

      // 3. Kyber Leviathan Boss hovering ahead in tunnel
      const bossScale = 0.4 + (gameState.bossHp / gameState.maxBossHp) * 0.3;
      const bossY = vanishingY - 20;
      const bossRadius = 45 * bossScale;

      ctx.save();
      ctx.translate(vanishingX, bossY);
      ctx.strokeStyle = gameState.bossPhase === 4 ? '#f43f5e' : '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      ctx.arc(0, 0, bossRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating inner polygon
      ctx.rotate(time * 2);
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      const sides = 6;
      for (let k = 0; k < sides; k++) {
        const angle = (k * 2 * Math.PI) / sides;
        const rx = (bossRadius - 10) * Math.cos(angle);
        const ry = (bossRadius - 10) * Math.sin(angle);
        if (k === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Boss Label & Entropy
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KYBER LEVIATHAN', vanishingX, bossY - bossRadius - 15);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ENTROPY: ${Math.round(gameState.bossHp)} DIM`, vanishingX, bossY - bossRadius - 3);

      // 4. Render Incoming 3D Obstacles
      gameState.obstacles.forEach((obs) => {
        const zRatio = Math.max(0, Math.min(1, obs.z / 100)); // 0 (far) to 1 (near)
        const obsY = vanishingY + (height - vanishingY - 80) * Math.pow(zRatio, 2);
        const laneCenterX = vanishingX + laneOffsets[obs.lane + 1] * zRatio;
        const scale = 0.2 + zRatio * 0.8;

        const w = 70 * scale;
        const h = obs.type === 'high_gate' ? 90 * scale : 40 * scale;

        ctx.fillStyle = obs.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * scale;
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = obs.color;

        ctx.fillRect(laneCenterX - w / 2, obsY - h, w, h);
        ctx.strokeRect(laneCenterX - w / 2, obsY - h, w, h);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(9, Math.round(11 * scale))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(obs.label, laneCenterX, obsY - h / 2 + 4);
      });

      // 5. Render Incoming STEM Powerups
      gameState.powerups.forEach((pw) => {
        const zRatio = Math.max(0, Math.min(1, pw.z / 100));
        const scale = 0.2 + zRatio * 0.8;
        const pwY = vanishingY + (height - vanishingY - 80) * Math.pow(zRatio, 2) - 25 * scale;
        const laneCenterX = vanishingX + laneOffsets[pw.lane + 1] * zRatio;
        const radius = 18 * scale;

        ctx.fillStyle = pw.color;
        ctx.shadowBlur = 20 * scale;
        ctx.shadowColor = pw.color;

        ctx.beginPath();
        ctx.arc(laneCenterX, pwY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#020617';
        ctx.font = `bold ${Math.max(8, Math.round(10 * scale))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(pw.label, laneCenterX, pwY + 3);
      });

      // 6. Player Starfighter Ship (Foreground)
      const shipBaseY = height - 100;
      const currentShipX = vanishingX + laneOffsets[gameState.shipLane + 1];
      const currentShipY = shipBaseY - gameState.shipY;

      // Draw Ship Flame Thrusters
      ctx.fillStyle = '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(currentShipX - 10, currentShipY + 20);
      ctx.lineTo(currentShipX + 10, currentShipY + 20);
      ctx.lineTo(currentShipX, currentShipY + 40 + Math.random() * 10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Cyber Starfighter Body
      ctx.fillStyle = gameState.shipState === 'sliding' ? '#fbbf24' : (gameState.shipState === 'jumping' ? '#34d399' : '#38bdf8');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(currentShipX, currentShipY - 25); // nose
      ctx.lineTo(currentShipX - 25, currentShipY + 20); // left wing
      ctx.lineTo(currentShipX, currentShipY + 10); // center tail
      ctx.lineTo(currentShipX + 25, currentShipY + 20); // right wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ship Cockpit Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(currentShipX, currentShipY - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // 7. Render Particles & Floating Texts
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
    </div>
  );
};
