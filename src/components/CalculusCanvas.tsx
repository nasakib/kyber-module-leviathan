import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Play, RotateCcw, Sliders } from 'lucide-react';

interface CalculusCanvasProps {
  interactiveMode: 'derivatives' | 'riemann' | 'matrix_stretch' | 'lattice_discrete';
  defaultCurve?: { a: number; b: number; c: number };
  activeHighlightKey?: string;
}

export const CalculusCanvas: React.FC<CalculusCanvasProps> = ({
  interactiveMode,
  defaultCurve = { a: 0.5, b: 0, c: 0 },
  activeHighlightKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Derivative interactive parameters
  const [curveA, setCurveA] = useState<number>(defaultCurve.a);
  const [curveB] = useState<number>(defaultCurve.b);
  const [curveC] = useState<number>(defaultCurve.c);

  const [pinAX, setPinAX] = useState<number>(1.5);
  const [deltaH, setDeltaH] = useState<number>(1.5); // h = xB - xA
  const [isCollapsing, setIsCollapsing] = useState<boolean>(false);

  // Riemann Sum parameters
  const [riemannN, setRiemannN] = useState<number>(8);
  const [riemannMethod, setRiemannMethod] = useState<'left' | 'right' | 'midpoint'>('right');

  // Matrix Transformation parameters
  const [matrixShear, setMatrixShear] = useState<number>(1.2);

  // Canvas Dragging Pins
  const [draggedPin, setDraggedPin] = useState<'A' | 'B' | null>(null);

  // Function evaluation
  const f = useCallback(
    (x: number) => {
      return curveA * x * x + curveB * x + curveC;
    },
    [curveA, curveB, curveC]
  );

  // Exact Derivative: f'(x) = 2ax + b
  const fPrime = useCallback(
    (x: number) => {
      return 2 * curveA * x + curveB;
    },
    [curveA, curveB]
  );

  // Exact Integral of ax^2 + bx + c from 0 to B: (a/3)B^3 + (b/2)B^2 + cB
  const fIntegral = useCallback(
    (upperB: number) => {
      return (curveA / 3) * Math.pow(upperB, 3) + (curveB / 2) * Math.pow(upperB, 2) + curveC * upperB;
    },
    [curveA, curveB, curveC]
  );

  // Animate Pin B collapsing into Pin A (h -> 0)
  const handleAnimateCollapse = () => {
    if (isCollapsing) return;
    setIsCollapsing(true);

    const startH = deltaH;
    const targetH = 0.001;
    const duration = 1200; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth ease-out curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentH = startH + (targetH - startH) * ease;

      setDeltaH(Math.max(0.001, currentH));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDeltaH(0.001);
        setIsCollapsing(false);
      }
    };

    requestAnimationFrame(step);
  };

  const handleReset = () => {
    setPinAX(1.5);
    setDeltaH(1.5);
    setCurveA(defaultCurve.a);
    setRiemannN(8);
    setMatrixShear(1.2);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setIsCollapsing(false);
  };

  // Convert Math coords to Canvas Screen pixels
  const toScreen = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const scale = 50 * zoom;
      const originX = width / 2 + pan.x;
      const originY = (height * 0.65) + pan.y; // origin slightly lowered to give more room for positive curve
      return {
        sx: originX + x * scale,
        sy: originY - y * scale,
      };
    },
    [zoom, pan]
  );

  // Convert Canvas Screen pixels to Math coords
  const toMath = useCallback(
    (sx: number, sy: number, width: number, height: number) => {
      const scale = 50 * zoom;
      const originX = width / 2 + pan.x;
      const originY = (height * 0.65) + pan.y;
      return {
        x: (sx - originX) / scale,
        y: (originY - sy) / scale,
      };
    },
    [zoom, pan]
  );

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.min(4.0, Math.max(0.3, prev * factor)));
  };

  // Mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (interactiveMode === 'derivatives') {
      const pinAScreen = toScreen(pinAX, f(pinAX), canvas.clientWidth, canvas.clientHeight);
      const pinBScreen = toScreen(pinAX + deltaH, f(pinAX + deltaH), canvas.clientWidth, canvas.clientHeight);

      const distA = Math.hypot(clickX - pinAScreen.sx, clickY - pinAScreen.sy);
      const distB = Math.hypot(clickX - pinBScreen.sx, clickY - pinBScreen.sy);

      if (distB < 20) {
        setDraggedPin('B');
        return;
      }
      if (distA < 20) {
        setDraggedPin('A');
        return;
      }
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    if (draggedPin) {
      const mathCoords = toMath(moveX, moveY, canvas.clientWidth, canvas.clientHeight);
      if (draggedPin === 'A') {
        setPinAX(mathCoords.x);
      } else if (draggedPin === 'B') {
        const newH = mathCoords.x - pinAX;
        setDeltaH(Math.abs(newH) < 0.05 ? 0.05 : newH);
      }
      return;
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPin(null);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      // Background clear
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Coordinate Grid Lines
      const scale = 50 * zoom;
      const originX = width / 2 + pan.x;
      const originY = height * 0.65 + pan.y;

      // Faint background grid
      ctx.strokeStyle = '#0f172a'; // slate-900
      ctx.lineWidth = 1;
      const gridSize = scale;

      const startX = (originX % gridSize) - gridSize;
      for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const startY = (originY % gridSize) - gridSize;
      for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Main Axes
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 2;

      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Axis tick marks & numbers
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const tick = toScreen(i, 0, width, height);
        if (tick.sx >= 0 && tick.sx <= width) {
          ctx.beginPath();
          ctx.moveTo(tick.sx, originY - 4);
          ctx.lineTo(tick.sx, originY + 4);
          ctx.strokeStyle = '#475569';
          ctx.stroke();
          ctx.fillText(`${i}`, tick.sx, originY + 16);
        }
      }

      // MODE 1: DIFFERENTIAL CALCULUS (DERIVATIVES & SECANTS)
      if (interactiveMode === 'derivatives') {
        // 1. Draw smooth curve f(x) = ax^2 + bx + c
        ctx.beginPath();
        const minX = toMath(0, 0, width, height).x - 1;
        const maxX = toMath(width, 0, width, height).x + 1;
        const stepX = (maxX - minX) / 200;

        let first = true;
        for (let x = minX; x <= maxX; x += stepX) {
          const y = f(x);
          const pt = toScreen(x, y, width, height);
          if (first) {
            ctx.moveTo(pt.sx, pt.sy);
            first = false;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        }

        ctx.strokeStyle = activeHighlightKey === 'curve' ? '#38bdf8' : '#0284c7'; // cyan
        ctx.lineWidth = activeHighlightKey === 'curve' ? 4 : 2.5;
        if (activeHighlightKey === 'curve') {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pin A and Pin B
        const pinAXVal = pinAX;
        const pinBXVal = pinAX + deltaH;
        const pinAYVal = f(pinAXVal);
        const pinBYVal = f(pinBXVal);

        const screenA = toScreen(pinAXVal, pinAYVal, width, height);
        const screenB = toScreen(pinBXVal, pinBYVal, width, height);

        // 2. Draw Delta-X & Delta-Y right-triangle bracket
        const cornerScreen = toScreen(pinBXVal, pinAYVal, width, height);

        ctx.setLineDash([4, 4]);
        // Horizontal run Δx
        ctx.strokeStyle = activeHighlightKey === 'deltaX' ? '#38bdf8' : '#0ea5e9';
        ctx.lineWidth = activeHighlightKey === 'deltaX' ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(screenA.sx, screenA.sy);
        ctx.lineTo(cornerScreen.sx, cornerScreen.sy);
        ctx.stroke();

        // Vertical rise Δy
        ctx.strokeStyle = activeHighlightKey === 'deltaX' ? '#34d399' : '#10b981';
        ctx.lineWidth = activeHighlightKey === 'deltaX' ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(cornerScreen.sx, cornerScreen.sy);
        ctx.lineTo(screenB.sx, screenB.sy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bracket labels
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Δx = ${deltaH.toFixed(3)}`,
          (screenA.sx + cornerScreen.sx) / 2,
          cornerScreen.sy + (pinAYVal >= 0 ? 16 : -8)
        );

        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'left';
        ctx.fillText(
          `Δy = ${(pinBYVal - pinAYVal).toFixed(3)}`,
          cornerScreen.sx + 8,
          (cornerScreen.sy + screenB.sy) / 2
        );

        // 3. Draw Secant Line (through A and B)
        const secantSlope = (pinBYVal - pinAYVal) / deltaH;
        const lineExt = 8;
        const secantP1 = toScreen(pinAXVal - lineExt, pinAYVal - secantSlope * lineExt, width, height);
        const secantP2 = toScreen(pinBXVal + lineExt, pinBYVal + secantSlope * lineExt, width, height);

        ctx.strokeStyle = activeHighlightKey === 'secant' ? '#22d3ee' : '#06b6d4';
        ctx.lineWidth = activeHighlightKey === 'secant' ? 3.5 : 2;
        if (activeHighlightKey === 'secant') {
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.moveTo(secantP1.sx, secantP1.sy);
        ctx.lineTo(secantP2.sx, secantP2.sy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 4. Draw Tangent Line at Pin A: y - yA = f'(xA)(x - xA)
        const tangentSlope = fPrime(pinAXVal);
        const tanP1 = toScreen(pinAXVal - lineExt, pinAYVal - tangentSlope * lineExt, width, height);
        const tanP2 = toScreen(pinAXVal + lineExt, pinAYVal + tangentSlope * lineExt, width, height);

        ctx.strokeStyle = activeHighlightKey === 'tangent' ? '#10b981' : '#059669';
        ctx.lineWidth = activeHighlightKey === 'tangent' ? 3 : 1.5;
        if (activeHighlightKey === 'tangent') {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.moveTo(tanP1.sx, tanP1.sy);
        ctx.lineTo(tanP2.sx, tanP2.sy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 5. Render Pin A (Target Origin point)
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(screenA.sx, screenA.sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Pin A (${pinAXVal.toFixed(2)}, ${pinAYVal.toFixed(2)})`, screenA.sx - 10, screenA.sy - 8);

        // 6. Render Pin B (Approaching point)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(screenB.sx, screenB.sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'left';
        ctx.fillText(`Pin B (x+h, f(x+h))`, screenB.sx + 10, screenB.sy - 8);
      }

      // MODE 2: INTEGRAL CALCULUS (RIEMANN SUMS & ACCUMULATION)
      else if (interactiveMode === 'riemann') {
        const intervalA = 0;
        const intervalB = 4;
        const n = riemannN;
        const deltaX = (intervalB - intervalA) / n;

        // 1. Shaded true continuous area under curve
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // emerald
        ctx.beginPath();
        const startPt = toScreen(intervalA, 0, width, height);
        ctx.moveTo(startPt.sx, startPt.sy);

        for (let x = intervalA; x <= intervalB; x += 0.05) {
          const pt = toScreen(x, f(x), width, height);
          ctx.lineTo(pt.sx, pt.sy);
        }
        const endPt = toScreen(intervalB, 0, width, height);
        ctx.lineTo(endPt.sx, endPt.sy);
        ctx.closePath();
        ctx.fill();

        // 2. Draw Riemann Rectangles
        let riemannSum = 0;
        for (let i = 0; i < n; i++) {
          const xLeft = intervalA + i * deltaX;
          const xRight = xLeft + deltaX;
          let evalX = xRight; // default right
          if (riemannMethod === 'left') evalX = xLeft;
          if (riemannMethod === 'midpoint') evalX = (xLeft + xRight) / 2;

          const rectHeight = f(evalX);
          riemannSum += rectHeight * deltaX;

          const pTopLeft = toScreen(xLeft, rectHeight, width, height);
          const pBottomRight = toScreen(xRight, 0, width, height);

          // Draw filled rectangle
          ctx.fillStyle = activeHighlightKey === 'rectangles' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(
            pTopLeft.sx,
            pTopLeft.sy,
            pBottomRight.sx - pTopLeft.sx,
            pBottomRight.sy - pTopLeft.sy
          );

          // Rectangle borders
          ctx.strokeStyle = activeHighlightKey === 'rectangles' ? '#38bdf8' : '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(
            pTopLeft.sx,
            pTopLeft.sy,
            pBottomRight.sx - pTopLeft.sx,
            pBottomRight.sy - pTopLeft.sy
          );
        }

        // 3. Draw Continuous Curve f(x)
        ctx.beginPath();
        for (let x = -0.5; x <= 5; x += 0.05) {
          const pt = toScreen(x, f(x), width, height);
          if (x === -0.5) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // MODE 3: LINEAR ALGEBRA (MATRIX SPACE STRETCHING)
      else if (interactiveMode === 'matrix_stretch') {
        const shear = matrixShear;
        // Transformed basis vectors
        const b1 = { x: 2, y: 0.5 * shear };
        const b2 = { x: 0.8 * shear, y: 2 };

        const p0 = toScreen(0, 0, width, height);
        const p1 = toScreen(b1.x, b1.y, width, height);
        const p2 = toScreen(b1.x + b2.x, b1.y + b2.y, width, height);
        const p3 = toScreen(b2.x, b2.y, width, height);

        // Fill transformed unit parallelogram
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)'; // amber
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Vector b1 (Column 1)
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Vector b2 (Column 2)
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // MODE 4: DISCRETE LATTICES (CRYPTO GRID)
      else if (interactiveMode === 'lattice_discrete') {
        const b1 = { x: 2, y: 0.4 };
        const b2 = { x: 0.6, y: 1.8 };

        // Draw discrete lattice constellation points
        ctx.fillStyle = '#38bdf8';
        for (let z1 = -5; z1 <= 5; z1++) {
          for (let z2 = -5; z2 <= 5; z2++) {
            const px = z1 * b1.x + z2 * b2.x;
            const py = z1 * b1.y + z2 * b2.y;
            const screenPt = toScreen(px, py, width, height);

            if (screenPt.sx >= 0 && screenPt.sx <= width && screenPt.sy >= 0 && screenPt.sy <= height) {
              ctx.beginPath();
              ctx.arc(screenPt.sx, screenPt.sy, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Fundamental Cell
        const p0 = toScreen(0, 0, width, height);
        const p1 = toScreen(b1.x, b1.y, width, height);
        const p2 = toScreen(b1.x + b2.x, b1.y + b2.y, width, height);
        const p3 = toScreen(b2.x, b2.y, width, height);

        ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    interactiveMode,
    zoom,
    pan,
    pinAX,
    deltaH,
    curveA,
    curveB,
    curveC,
    riemannN,
    riemannMethod,
    matrixShear,
    activeHighlightKey,
    f,
    fPrime,
    toScreen,
    toMath,
  ]);

  // Readout calculations
  const pinAY = f(pinAX);
  const pinBY = f(pinAX + deltaH);
  const secantSlope = (pinBY - pinAY) / deltaH;
  const exactTangentSlope = fPrime(pinAX);
  const slopeError = Math.abs(secantSlope - exactTangentSlope);

  return (
    <div className="flex flex-col gap-2 font-mono">
      {/* Live HUD Telemetry Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {interactiveMode === 'derivatives' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">Secant Slope:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                {secantSlope.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">Exact Tangent f'(x):</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                {exactTangentSlope.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">Error |Δm|:</span>
              <span
                className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                  slopeError < 0.05
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300'
                }`}
              >
                {slopeError.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {interactiveMode === 'riemann' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">Riemann Sum (n={riemannN}):</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                {/* Computed Riemann sum */}
                {(
                  (4 / riemannN) *
                  Array.from({ length: riemannN }).reduce<number>((acc, _, idx) => {
                    const x = (4 / riemannN) * (idx + (riemannMethod === 'left' ? 0 : riemannMethod === 'midpoint' ? 0.5 : 1));
                    return acc + f(x);
                  }, 0)
                ).toFixed(3)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">Exact Area ∫₀⁴ f(x)dx:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                {fIntegral(4).toFixed(3)}
              </span>
            </div>
          </div>
        )}

        {interactiveMode === 'matrix_stretch' && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-amber-400 font-bold">
              Area Scaling Factor |det(A)| = {(2 * 2 - 0.5 * 0.8 * matrixShear * matrixShear).toFixed(2)}x
            </span>
          </div>
        )}

        {interactiveMode === 'lattice_discrete' && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-cyan-300 font-bold">
              Fundamental Parallelogram Area det(L) = {(2 * 1.8 - 0.4 * 0.6).toFixed(2)}
            </span>
          </div>
        )}

        {/* Global Reset Button */}
        <button
          onClick={handleReset}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Reset Canvas & Parameters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-[52vh] sm:h-[60vh] min-h-[440px] border border-slate-800 rounded-lg overflow-hidden shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* Floating Zoom & Center Controls */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg backdrop-blur shadow-xl z-20">
          <button
            onClick={() => setZoom((prev) => Math.min(4.0, prev * 1.2))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(0.3, prev * 0.8))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 min-h-[36px]"
            title="Center View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center</span>
          </button>
        </div>

        {/* Dynamic Canvas Floating Controls Bar */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 max-w-xs w-full sm:w-auto z-20">
          {interactiveMode === 'derivatives' && (
            <div className="bg-slate-900/90 border border-cyan-500/50 p-3 rounded-lg backdrop-blur shadow-2xl flex flex-col gap-2 text-xs">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> TACTILE CONTROLS
              </span>

              {/* Pin A Slider */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Pin A (x):</span>
                  <span className="font-bold text-cyan-300">{pinAX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={pinAX}
                  onChange={(e) => setPinAX(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Step Gap h Slider */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Step Gap (h):</span>
                  <span className="font-bold text-amber-300">{deltaH.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="3"
                  step="0.05"
                  value={deltaH}
                  onChange={(e) => setDeltaH(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Curvature (a) Slider */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Curvature a:</span>
                  <span className="font-bold text-emerald-300">{curveA.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={curveA}
                  onChange={(e) => setCurveA(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Animate Collapse Button */}
              <button
                onClick={handleAnimateCollapse}
                disabled={isCollapsing}
                className="w-full mt-1 py-2 px-3 rounded bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50 min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ANIMATE LIMIT: h → 0</span>
              </button>
            </div>
          )}

          {interactiveMode === 'riemann' && (
            <div className="bg-slate-900/90 border border-cyan-500/50 p-3 rounded-lg backdrop-blur shadow-2xl flex flex-col gap-2 text-xs">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> RIEMANN PARTITIONS
              </span>

              {/* Number of Rectangles Slider */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Slices (n):</span>
                  <span className="font-bold text-cyan-300">{riemannN}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="64"
                  step="1"
                  value={riemannN}
                  onChange={(e) => setRiemannN(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Method Selector */}
              <div className="flex gap-1 mt-1">
                {(['left', 'midpoint', 'right'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setRiemannMethod(method)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border uppercase transition ${
                      riemannMethod === method
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
