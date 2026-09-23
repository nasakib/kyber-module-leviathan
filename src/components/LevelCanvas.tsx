import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LevelDefinition } from '../types/game';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LevelCanvasProps {
  level: LevelDefinition;
  params: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  isFiring: boolean;
  onSimulationComplete?: (success: boolean, targetsHit: string[]) => void;
  playHitSound?: (index: number) => void;
  playObstacleSound?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export const LevelCanvas: React.FC<LevelCanvasProps> = ({
  level,
  params,
  onParamChange,
  isFiring,
  onSimulationComplete,
  playHitSound,
  playObstacleSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pan and Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(50); // pixels per math unit
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // On-canvas interactive handle dragging
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  // Firing animation state
  const fireProgressRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const hasTriggeredEndRef = useRef<boolean>(false);

  // Auto-center viewport to level bounds
  const resetView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const bounds = level.bounds;
    const mathWidth = bounds.maxX - bounds.minX;
    const mathHeight = bounds.maxY - bounds.minY;

    const scaleX = (clientWidth * 0.8) / mathWidth;
    const scaleY = (clientHeight * 0.8) / mathHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 20), 120);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const screenCenterX = clientWidth / 2;
    const screenCenterY = clientHeight / 2;

    setZoom(newZoom);
    setPan({
      x: screenCenterX - centerX * newZoom,
      y: screenCenterY + centerY * newZoom,
    });
  }, [level.bounds]);

  useEffect(() => {
    resetView();
  }, [level.id, resetView]);

  // Coordinate Conversion Helpers
  const toScreen = useCallback((mathX: number, mathY: number): [number, number] => {
    return [
      pan.x + mathX * zoom,
      pan.y - mathY * zoom // Canvas Y goes down, math Y goes up
    ];
  }, [pan, zoom]);

  const toMath = useCallback((screenX: number, screenY: number): [number, number] => {
    return [
      (screenX - pan.x) / zoom,
      -(screenY - pan.y) / zoom
    ];
  }, [pan, zoom]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 15), 250);

    // Zoom centered on mouse pointer
    const mathX = (mouseX - pan.x) / zoom;
    const mathY = -(mouseY - pan.y) / zoom;

    setZoom(newZoom);
    setPan({
      x: mouseX - mathX * newZoom,
      y: mouseY + mathY * newZoom,
    });
  };

  // Drag handles hit-testing
  const getHandles = useCallback(() => {
    const handles: { id: string; mathX: number; mathY: number; label: string; color: string }[] = [];

    if (level.type === 'linear_beam') {
      const m = params.m ?? 1;
      const b = params.b ?? 0;
      // Handle at y-intercept
      handles.push({ id: 'intercept', mathX: 0, mathY: b, label: `b=${b.toFixed(1)}`, color: '#38bdf8' });
      // Handle at x=2 or x=3
      handles.push({ id: 'slope', mathX: 2, mathY: m * 2 + b, label: `m=${m.toFixed(2)}`, color: '#f59e0b' });
    } else if (level.type === 'parabolic_arc') {
      const h = params.h ?? 0;
      const k = params.k ?? 0;
      handles.push({ id: 'vertex', mathX: h, mathY: k, label: `Apex (${h.toFixed(1)}, ${k.toFixed(1)})`, color: '#34d399' });
    } else if (level.type === 'matrix_warp') {
      const a = params.a ?? 1;
      const c = params.c ?? 0;
      const b = params.b ?? 0;
      const d = params.d ?? 1;
      handles.push({ id: 'basis_i', mathX: a, mathY: c, label: `T(î)=[${a.toFixed(1)}, ${c.toFixed(1)}]`, color: '#22d3ee' });
      handles.push({ id: 'basis_j', mathX: b, mathY: d, label: `T(ĵ)=[${b.toFixed(1)}, ${d.toFixed(1)}]`, color: '#f43f5e' });
    } else if (level.type === 'tangent_blade') {
      const x0 = params.x0 ?? 0;
      const fn = level.calculusFunction ?? ((x: number) => x * x);
      const y0 = fn(x0);
      handles.push({ id: 'x0_handle', mathX: x0, mathY: y0, label: `x₀=${x0.toFixed(2)}`, color: '#fbbf24' });
    }

    return handles;
  }, [level, params]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Check if clicked near an interactive handle
    const handles = getHandles();
    for (const h of handles) {
      const [hx, hy] = toScreen(h.mathX, h.mathY);
      const dist = Math.hypot(screenX - hx, screenY - hy);
      if (dist <= 16) {
        setActiveHandle(h.id);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
    }

    // Otherwise, start canvas pan
    setIsDragging(true);
    setDragStart({ x: screenX - pan.x, y: screenY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (activeHandle) {
      const [mathX, mathY] = toMath(screenX, screenY);
      if (activeHandle === 'intercept') {
        const roundedB = Math.round(mathY * 2) / 2;
        onParamChange('b', Math.max(-10, Math.min(10, roundedB)));
      } else if (activeHandle === 'slope') {
        const b = params.b ?? 0;
        if (Math.abs(mathX) > 0.3) {
          const calcM = (mathY - b) / mathX;
          const roundedM = Math.round(calcM * 4) / 4;
          onParamChange('m', Math.max(-5, Math.min(5, roundedM)));
        }
      } else if (activeHandle === 'vertex') {
        const roundedH = Math.round(mathX * 2) / 2;
        const roundedK = Math.round(mathY * 2) / 2;
        onParamChange('h', roundedH);
        onParamChange('k', roundedK);
      } else if (activeHandle === 'basis_i') {
        onParamChange('a', Math.round(mathX * 2) / 2);
        onParamChange('c', Math.round(mathY * 2) / 2);
      } else if (activeHandle === 'basis_j') {
        onParamChange('b', Math.round(mathX * 2) / 2);
        onParamChange('d', Math.round(mathY * 2) / 2);
      } else if (activeHandle === 'x0_handle') {
        const roundedX0 = Math.round(mathX * 4) / 4;
        onParamChange('x0', roundedX0);
      }
    } else if (isDragging) {
      setPan({
        x: screenX - dragStart.x,
        y: screenY - dragStart.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      setActiveHandle(null);
    }
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  // Spark particle burst helper
  const addExplosion = (screenX: number, screenY: number, color: string = '#10b981') => {
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5);
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x: screenX,
        y: screenY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color,
        size: Math.random() * 3 + 2,
      });
    }
  };

  // Main 60 FPS Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // High-DPI resizing
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Deep Space Slate Background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // 2. Coordinate Grid Lines
      const [mathLeft, mathTop] = toMath(0, 0);
      const [mathRight, mathBottom] = toMath(width, height);

      const xMin = Math.floor(Math.min(mathLeft, mathRight)) - 1;
      const xMax = Math.ceil(Math.max(mathLeft, mathRight)) + 1;
      const yMin = Math.floor(Math.min(mathTop, mathBottom)) - 1;
      const yMax = Math.ceil(Math.max(mathTop, mathBottom)) + 1;

      // Minor grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)'; // slate-800
      ctx.beginPath();
      for (let x = xMin; x <= xMax; x++) {
        const [sx] = toScreen(x, 0);
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      }
      for (let y = yMin; y <= yMax; y++) {
        const [, sy] = toScreen(0, y);
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
      }
      ctx.stroke();

      // Major axes: X & Y
      const [originX, originY] = toScreen(0, 0);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; // cyan-400
      ctx.beginPath();
      // X-axis
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      // Y-axis
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Grid coordinate numbers
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; // slate-400
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let x = xMin; x <= xMax; x++) {
        if (x === 0) continue;
        const [sx] = toScreen(x, 0);
        if (sx > 20 && sx < width - 20) {
          ctx.fillText(x.toString(), sx, originY + 4);
        }
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = yMin; y <= yMax; y++) {
        if (y === 0) continue;
        const [, sy] = toScreen(0, y);
        if (sy > 20 && sy < height - 20) {
          ctx.fillText(y.toString(), originX - 6, sy);
        }
      }
      ctx.fillText('(0,0)', originX - 6, originY + 12);

      // 3. Render Sector Specific Mathematical Models
      renderMathContent(ctx, width, height);

      // 4. Render Obstacles
      renderObstacles(ctx);

      // 5. Render Targets
      renderTargets(ctx);

      // 6. Render Draggable Interactive Handles
      renderHandles(ctx);

      // 7. Update and Render Confetti/Spark Particles
      renderParticles(ctx);

      // 8. Firing Simulation Progress & Collision Checks
      if (isFiring) {
        updateSimulation();
      } else {
        fireProgressRef.current = 0;
        hasTriggeredEndRef.current = false;
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pan, zoom, level, params, isFiring]);

  // Mathematical Geometry Renderer
  const renderMathContent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (level.type === 'linear_beam') {
      const m = params.m ?? 1;
      const b = params.b ?? 0;

      // If Dual Systems level (1.3), render the system Laser A first
      if (level.id === 's1_l3') {
        const [xStart, yStart] = toScreen(-2, 0.5 * -2 + 3.5);
        const [xEnd, yEnd] = toScreen(8, 0.5 * 8 + 3.5);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Check if deflector mirror is in play (Level 1.2)
      if (level.id === 's1_l2') {
        // Draw mirror at (4, 4)
        const [mx, my] = toScreen(4, 4);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mx - 15, my + 15);
        ctx.lineTo(mx + 15, my - 15);
        ctx.stroke();

        // Beam from left to mirror
        const [pStartX, pStartY] = toScreen(-2, m * -2 + b);
        const hitMirrorY = m * 4 + b;
        const [mBeamX, mBeamY] = toScreen(4, hitMirrorY);

        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pStartX, pStartY);
        ctx.lineTo(mBeamX, mBeamY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // If beam hits mirror closely (around y = 4), draw orthogonal reflected beam
        if (Math.abs(hitMirrorY - 4) < 0.3) {
          const mReflected = -1 / (m || 0.001);
          // Reflected line passes through (4, 4): y - 4 = mRefl * (x - 4)
          const [rEndX, rEndY] = toScreen(0, 4 + mReflected * (0 - 4));
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(rEndX, rEndY);
          ctx.stroke();
        }
      } else {
        // Standard continuous line beam
        const [mathLeft] = toMath(0, 0);
        const [mathRight] = toMath(width, height);
        const [x1, y1] = toScreen(mathLeft - 2, m * (mathLeft - 2) + b);
        const [x2, y2] = toScreen(mathRight + 2, m * (mathRight + 2) + b);

        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else if (level.type === 'parabolic_arc') {
      const a = params.a ?? -0.2;
      const h = params.h ?? 0;
      const k = params.k ?? 0;

      // Draw Parabola curve
      ctx.strokeStyle = '#34d399'; // emerald-400
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const [mathLeft] = toMath(0, 0);
      const [mathRight] = toMath(width, height);
      const step = 0.05;
      let first = true;

      for (let px = mathLeft - 2; px <= mathRight + 2; px += step) {
        const py = a * (px - h) * (px - h) + k;
        const [sx, sy] = toScreen(px, py);
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw focus point if relevant (Level 2.3)
      if (level.id === 's2_l3') {
        const focusY = k + 1 / (4 * (a || 0.001));
        const [fx, fy] = toScreen(h, focusY);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`Focus (${h.toFixed(1)}, ${focusY.toFixed(1)})`, fx + 8, fy);
      }
    } else if (level.type === 'matrix_warp') {
      const a = params.a ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
      const b = params.b ?? (params.theta_deg !== undefined ? -Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const c = params.c ?? (params.theta_deg !== undefined ? Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const d = params.d ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);

      // Transformed Unit Square Parallelogram
      const [p0x, p0y] = toScreen(0, 0);
      const [p1x, p1y] = toScreen(a, c);
      const [p2x, p2y] = toScreen(a + b, c + d);
      const [p3x, p3y] = toScreen(b, d);

      // Fill area with translucent glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.closePath();
      ctx.fill();

      // Deformed grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        const [gx1, gy1] = toScreen(i * a - 3 * b, i * c - 3 * d);
        const [gx2, gy2] = toScreen(i * a + 3 * b, i * c + 3 * d);
        ctx.beginPath();
        ctx.moveTo(gx1, gy1);
        ctx.lineTo(gx2, gy2);
        ctx.stroke();

        const [hx1, hy1] = toScreen(-3 * a + i * b, -3 * c + i * d);
        const [hx2, hy2] = toScreen(3 * a + i * b, 3 * c + i * d);
        ctx.beginPath();
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
        ctx.stroke();
      }

      // Basis vector v1 = [a, c] (Cyan arrow)
      drawArrow(ctx, p0x, p0y, p1x, p1y, '#22d3ee', 'T(î)');
      // Basis vector v2 = [b, d] (Rose arrow)
      drawArrow(ctx, p0x, p0y, p3x, p3y, '#f43f5e', 'T(ĵ)');
    } else if (level.type === 'tangent_blade') {
      const fn = level.calculusFunction ?? ((x: number) => x * x);
      const df = level.calculusDerivative ?? ((x: number) => 2 * x);
      const x0 = params.x0 ?? 2;
      const h = params.h ?? 0.05;

      // 1. Draw base function curve
      ctx.strokeStyle = '#38bdf8'; // sky-400
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const [mathLeft] = toMath(0, 0);
      const [mathRight] = toMath(width, height);
      let first = true;
      for (let px = mathLeft - 1; px <= mathRight + 1; px += 0.05) {
        const py = fn(px);
        const [sx, sy] = toScreen(px, py);
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();

      // 2. Point of tangency (x0, f(x0))
      const y0 = fn(x0);
      const [s0x, s0y] = toScreen(x0, y0);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(s0x, s0y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Secant or Tangent Blade line
      let slope = df(x0);
      if (h > 0.08) {
        // Secant mode
        const y1 = fn(x0 + h);
        slope = (y1 - y0) / h;
        const [s1x, s1y] = toScreen(x0 + h, y1);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(s1x, s1y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`x₀+h`, s1x + 8, s1y);
      }

      // Draw tangent/secant line through (x0, y0)
      const [tx1, ty1] = toScreen(x0 - 5, y0 - slope * 5);
      const [tx2, ty2] = toScreen(x0 + 5, y0 + slope * 5);

      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (level.type === 'lattice_cvp') {
      // Discrete Lattice Grid Points
      const [mathLeft, mathTop] = toMath(0, 0);
      const [mathRight, mathBottom] = toMath(width, height);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      for (let ix = Math.floor(mathLeft); ix <= Math.ceil(mathRight); ix++) {
        for (let iy = Math.floor(mathBottom); iy <= Math.ceil(mathTop); iy++) {
          const [lx, ly] = toScreen(ix, iy);
          ctx.beginPath();
          ctx.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw active lattice combination vector
      const c1 = params.c1 ?? (params.q_factor !== undefined ? 1 : 0);
      const c2 = params.c2 ?? (params.q_factor !== undefined ? params.q_factor : 0);

      const [originX, originY] = toScreen(0, 0);
      if (level.id === 's5_l1') {
        // v1 = [5, 1], v2 = [3, 1], v1' = v1 - q*v2
        const q = params.q_factor ?? 1;
        const resX = 5 - q * 3;
        const resY = 1 - q * 1;
        const [rx, ry] = toScreen(resX, resY);
        drawArrow(ctx, originX, originY, rx, ry, '#f43f5e', `v₁' = [${resX}, ${resY}]`);
      } else {
        // Linear combination of basis vectors
        const b1 = [2, 1];
        const b2 = [1, 1];
        const resX = c1 * b1[0] + c2 * b2[0];
        const resY = c1 * b1[1] + c2 * b2[1];
        const [rx, ry] = toScreen(resX, resY);
        drawArrow(ctx, originX, originY, rx, ry, '#10b981', `s = [${resX}, ${resY}]`);
      }
    }
  };

  // Helper to draw clean vector arrow with label
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string
  ) => {
    const headLen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = '11px "JetBrains Mono"';
    ctx.fillText(label, toX + 8, toY - 6);
  };

  // Render Obstacle Barriers
  const renderObstacles = (ctx: CanvasRenderingContext2D) => {
    for (const obs of level.obstacles) {
      const [ox, oy] = toScreen(obs.x, obs.y);
      const w = obs.width * zoom;
      const h = obs.height * zoom;

      ctx.save();
      if (obs.type === 'shield') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // rose-500
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox - w / 2, oy - h / 2, w, h);
        ctx.fillRect(ox - w / 2, oy - h / 2, w, h);

        // Warning hash lines
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = -w / 2; i <= w / 2; i += 12) {
          ctx.moveTo(ox + i, oy - h / 2);
          ctx.lineTo(ox + i + 10, oy + h / 2);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(ox - w / 2, oy - h / 2, w, h);
        ctx.strokeRect(ox - w / 2, oy - h / 2, w, h);
      }

      if (obs.label) {
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(obs.label, ox, oy);
      }
      ctx.restore();
    }
  };

  // Render Target Receptor Nodes
  const renderTargets = (ctx: CanvasRenderingContext2D) => {
    level.targets.forEach((target) => {
      const [tx, ty] = toScreen(target.x, target.y);
      const r = Math.max(target.radius * zoom, 12);

      ctx.save();
      // Outer pulse ring
      ctx.strokeStyle = target.hit ? '#10b981' : '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glowing core
      ctx.fillStyle = target.hit ? 'rgba(16, 185, 129, 0.6)' : 'rgba(52, 211, 153, 0.25)';
      ctx.beginPath();
      ctx.arc(tx, ty, r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Target Crosshairs
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx - r - 4, ty);
      ctx.lineTo(tx + r + 4, ty);
      ctx.moveTo(tx, ty - r - 4);
      ctx.lineTo(tx, ty + r + 4);
      ctx.stroke();

      // Label
      if (target.label) {
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText(target.label, tx, ty + r + 14);
      }

      ctx.restore();
    });
  };

  // Render Interactive Handles
  const renderHandles = (ctx: CanvasRenderingContext2D) => {
    const handles = getHandles();
    handles.forEach((h) => {
      const [hx, hy] = toScreen(h.mathX, h.mathY);
      ctx.save();
      ctx.fillStyle = h.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label chip
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(h.label, hx + 12, hy - 4);
      ctx.restore();
    });
  };

  // Render Particle Effects
  const renderParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Firing Simulation and Target Hit-Testing
  const updateSimulation = () => {
    fireProgressRef.current += 0.025;

    // Check hit condition at progress completion
    if (fireProgressRef.current >= 1.0 && !hasTriggeredEndRef.current) {
      hasTriggeredEndRef.current = true;
      evaluateSolution();
    }
  };

  const evaluateSolution = () => {
    const hits: string[] = [];
    let blocked = false;

    // Collision check by level type
    if (level.type === 'linear_beam') {
      const m = params.m ?? 1;
      const b = params.b ?? 0;

      // Obstacle collision check
      for (const obs of level.obstacles) {
        if (obs.type === 'shield' || obs.type === 'absorber') {
          // Check line intersection with bounding box
          const lineYAtObsX = m * obs.x + b;
          if (Math.abs(lineYAtObsX - obs.y) <= obs.height / 2 + 0.2) {
            blocked = true;
            playObstacleSound?.();
            break;
          }
        }
      }

      if (!blocked) {
        level.targets.forEach((target, idx) => {
          if (level.id === 's1_l2') {
            // Deflector level: target 1 is mirror (4, 4), target 2 is (2, 8)
            const hitsMirror = Math.abs(m * 4 + b - 4) < 0.3;
            if (target.id === 'mirror' && hitsMirror) {
              hits.push(target.id);
              const [sx, sy] = toScreen(target.x, target.y);
              addExplosion(sx, sy);
              playHitSound?.(idx);
            }
            if (target.id === 't2' && hitsMirror) {
              const mRefl = -1 / (m || 0.001);
              const yAtTarget = 4 + mRefl * (target.x - 4);
              if (Math.abs(yAtTarget - target.y) < 0.4) {
                hits.push(target.id);
                const [sx, sy] = toScreen(target.x, target.y);
                addExplosion(sx, sy);
                playHitSound?.(idx + 1);
              }
            }
          } else {
            // Normal linear equation distance
            const expectedY = m * target.x + b;
            if (Math.abs(expectedY - target.y) <= target.radius + 0.15) {
              hits.push(target.id);
              const [sx, sy] = toScreen(target.x, target.y);
              addExplosion(sx, sy);
              playHitSound?.(idx);
            }
          }
        });
      }
    } else if (level.type === 'parabolic_arc') {
      const a = params.a ?? -0.2;
      const h = params.h ?? 0;
      const k = params.k ?? 0;

      // Check obstacle collisions
      for (const obs of level.obstacles) {
        const obsParabolaY = a * (obs.x - h) * (obs.x - h) + k;
        if (Math.abs(obsParabolaY - obs.y) <= obs.height / 2 + 0.1) {
          blocked = true;
          playObstacleSound?.();
          break;
        }
      }

      if (!blocked) {
        level.targets.forEach((target, idx) => {
          if (level.id === 's2_l3' && target.id === 'focus_core') {
            const focusY = k + 1 / (4 * (a || 0.001));
            if (Math.abs(h - target.x) < 0.3 && Math.abs(focusY - target.y) < 0.3) {
              hits.push(target.id);
              const [sx, sy] = toScreen(target.x, target.y);
              addExplosion(sx, sy);
              playHitSound?.(idx);
            }
          } else {
            const curveY = a * (target.x - h) * (target.x - h) + k;
            if (Math.abs(curveY - target.y) <= target.radius + 0.2) {
              hits.push(target.id);
              const [sx, sy] = toScreen(target.x, target.y);
              addExplosion(sx, sy);
              playHitSound?.(idx);
            }
          }
        });
      }
    } else if (level.type === 'matrix_warp') {
      const a = params.a ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
      const b = params.b ?? (params.theta_deg !== undefined ? -Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const c = params.c ?? (params.theta_deg !== undefined ? Math.sin((params.theta_deg * Math.PI) / 180) : 0);
      const d = params.d ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);

      level.targets.forEach((target, idx) => {
        if (level.id === 's3_l1') {
          if (target.id === 'pin1' && Math.hypot(a - target.x, c - target.y) < 0.3) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
          if (target.id === 'pin2' && Math.hypot(b - target.x, d - target.y) < 0.3) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        } else if (level.id === 's3_l2') {
          const transformedX = 1 + (params.b ?? 0);
          if (Math.abs(transformedX - target.x) < 0.2) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        } else if (level.id === 's3_l3') {
          const theta = params.theta_deg ?? 0;
          if (Math.abs(theta - 45) < 5 || Math.abs(theta - 225) < 5) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        } else if (level.id === 's3_l4') {
          const det = a * d - b * c;
          if (Math.abs(det - 4.0) < 0.2) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        }
      });
    } else if (level.type === 'tangent_blade') {
      const fn = level.calculusFunction ?? ((x: number) => x * x);
      const df = level.calculusDerivative ?? ((x: number) => 2 * x);
      const x0 = params.x0 ?? 2;
      const h = params.h ?? 0.05;

      const slope = h > 0.08 ? (fn(x0 + h) - fn(x0)) / h : df(x0);
      const y0 = fn(x0);

      level.targets.forEach((target, idx) => {
        const lineY = y0 + slope * (target.x - x0);
        if (Math.abs(lineY - target.y) <= target.radius + 0.3) {
          hits.push(target.id);
          const [sx, sy] = toScreen(target.x, target.y);
          addExplosion(sx, sy);
          playHitSound?.(idx);
        }
      });
    } else if (level.type === 'lattice_cvp') {
      level.targets.forEach((target, idx) => {
        if (level.id === 's5_l1') {
          const q = params.q_factor ?? 1;
          const resX = 5 - q * 3;
          const resY = 1 - q * 1;
          if (Math.hypot(resX - target.x, resY - target.y) < 0.2) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        } else {
          const c1 = params.c1 ?? 0;
          const c2 = params.c2 ?? 0;
          const b1 = [2, 1];
          const b2 = [1, 1];
          const resX = c1 * b1[0] + c2 * b2[0];
          const resY = c1 * b1[1] + c2 * b2[1];
          if (Math.hypot(resX - target.x, resY - target.y) < 0.2) {
            hits.push(target.id);
            const [sx, sy] = toScreen(target.x, target.y);
            addExplosion(sx, sy);
            playHitSound?.(idx);
          }
        }
      });
    }

    const success = hits.length >= level.targets.length && !blocked;
    onSimulationComplete?.(success, hits);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[55vh] min-h-[420px] max-h-[640px] bg-slate-950 overflow-hidden border border-slate-800 rounded-xl shadow-2xl">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair touch-none select-none block"
      />

      {/* Floating Viewport Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 backdrop-blur-md shadow-lg z-10">
        <button
          onClick={() => {
            setZoom((z) => Math.min(z * 1.25, 250));
          }}
          title="Zoom In"
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom((z) => Math.max(z * 0.8, 15));
          }}
          title="Zoom Out"
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset / Auto-Frame Bounds"
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tactile Coordinate Reticle / Helper badge */}
      <div className="absolute bottom-3 left-4 bg-slate-900/80 border border-slate-800 rounded-md px-3 py-1.5 text-[11px] font-mono text-slate-400 backdrop-blur-sm pointer-events-none">
        Zoom: <span className="text-cyan-400 font-semibold">{Math.round(zoom)}px/unit</span> | Drag canvas to Pan | Drag dots to tune
      </div>
    </div>
  );
};
