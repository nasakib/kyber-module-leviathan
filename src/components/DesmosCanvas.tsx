import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { DesmosItem } from '../types/desmos';
import {
  compileMathExpression,
  numericalDerivative,
  numericalIntegral,
  findCurveFeatures,
  CompiledExpression,
} from '../utils/mathParser';
import { ZoomIn, ZoomOut, Compass, Move } from 'lucide-react';

interface DesmosCanvasProps {
  items: DesmosItem[];
  sliderVars: Record<string, number>;
  onUpdateTangentX?: (itemId: string, newX: number) => void;
  initialBounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export const DesmosCanvas: React.FC<DesmosCanvasProps> = ({
  items,
  sliderVars,
  onUpdateTangentX,
  initialBounds = { minX: -8, maxX: 8, minY: -5, maxY: 5 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transformation: pan (screen pixels of origin) and zoom (pixels per math unit)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(45);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDraggingTangent, setActiveDraggingTangent] = useState<string | null>(null);

  // Hover state for inspection
  const [hoverCoord, setHoverCoord] = useState<{ mathX: number; mathY: number; screenX: number; screenY: number } | null>(null);
  const [inspectedPoint, setInspectedPoint] = useState<{
    mathX: number;
    mathY: number;
    screenX: number;
    screenY: number;
    label: string;
    color: string;
  } | null>(null);

  // Auto-frame initial bounds
  const resetView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const mathWidth = initialBounds.maxX - initialBounds.minX;
    const mathHeight = initialBounds.maxY - initialBounds.minY;

    const scaleX = (clientWidth * 0.85) / mathWidth;
    const scaleY = (clientHeight * 0.85) / mathHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 15), 150);

    const centerX = (initialBounds.minX + initialBounds.maxX) / 2;
    const centerY = (initialBounds.minY + initialBounds.maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: clientWidth / 2 - centerX * newZoom,
      y: clientHeight / 2 + centerY * newZoom,
    });
  }, [initialBounds]);

  useEffect(() => {
    resetView();
  }, [resetView]);

  // Coordinate conversions
  const toScreen = useCallback((mathX: number, mathY: number): [number, number] => {
    return [pan.x + mathX * zoom, pan.y - mathY * zoom];
  }, [pan, zoom]);

  const toMath = useCallback((screenX: number, screenY: number): [number, number] => {
    return [(screenX - pan.x) / zoom, -(screenY - pan.y) / zoom];
  }, [pan, zoom]);

  // Compile expressions and cache them
  const compiledExpressions = useMemo(() => {
    const map = new Map<string, CompiledExpression | null>();
    items.forEach((item) => {
      if (item.type === 'expression' && item.visible && item.rawText) {
        try {
          const compiled = compileMathExpression(item.rawText);
          map.set(item.id, compiled);
        } catch {
          map.set(item.id, null);
        }
      }
    });
    return map;
  }, [items]);

  // Calculate dynamic grid spacing (powers of 10 subdivided into 1, 2, 5)
  const gridStep = useMemo(() => {
    const rawStep = 80 / zoom; // target ~80px per major grid line
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;

    if (residual < 1.5) return magnitude;
    if (residual < 3.5) return 2 * magnitude;
    if (residual < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }, [zoom]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
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

    // Clear background: deep cybernetic slate
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Minor & Major Grid Lines
    const [minMathX, maxMathY] = toMath(0, 0);
    const [maxMathX, minMathY] = toMath(width, height);

    const minorStep = gridStep / 5;
    const startX = Math.floor(minMathX / minorStep) * minorStep;
    const endX = Math.ceil(maxMathX / minorStep) * minorStep;
    const startY = Math.floor(minMathY / minorStep) * minorStep;
    const endY = Math.ceil(maxMathY / minorStep) * minorStep;

    // Minor grid
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
    ctx.beginPath();
    for (let x = startX; x <= endX; x += minorStep) {
      const [sx] = toScreen(x, 0);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    for (let y = startY; y <= endY; y += minorStep) {
      const [, sy] = toScreen(0, y);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Major grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
    ctx.beginPath();
    const majorStartX = Math.floor(minMathX / gridStep) * gridStep;
    const majorEndX = Math.ceil(maxMathX / gridStep) * gridStep;
    const majorStartY = Math.floor(minMathY / gridStep) * gridStep;
    const majorEndY = Math.ceil(maxMathY / gridStep) * gridStep;

    for (let x = majorStartX; x <= majorEndX; x += gridStep) {
      const [sx] = toScreen(x, 0);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    for (let y = majorStartY; y <= majorEndY; y += gridStep) {
      const [, sy] = toScreen(0, y);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // 2. Draw Main Cartesian Coordinate Axes (X and Y)
    const [originX, originY] = toScreen(0, 0);

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#0284c7'; // Cyan-600
    ctx.beginPath();
    // X Axis
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    // Y Axis
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis Tick Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = majorStartX; x <= majorEndX; x += gridStep) {
      if (Math.abs(x) < 0.0001) continue; // Skip origin 0
      const [sx] = toScreen(x, 0);
      const labelY = Math.min(Math.max(originY + 5, 5), height - 20);
      const formatted = Math.abs(x) >= 100 || (Math.abs(x) < 0.01 && x !== 0)
        ? x.toExponential(1)
        : Number(x.toFixed(3)).toString();
      ctx.fillText(formatted, sx, labelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = majorStartY; y <= majorEndY; y += gridStep) {
      if (Math.abs(y) < 0.0001) continue; // Skip origin 0
      const [, sy] = toScreen(0, y);
      const labelX = Math.min(Math.max(originX - 6, 35), width - 6);
      const formatted = Math.abs(y) >= 100 || (Math.abs(y) < 0.01 && y !== 0)
        ? y.toExponential(1)
        : Number(y.toFixed(3)).toString();
      ctx.fillText(formatted, labelX, sy);
    }

    // Origin Label (0,0)
    if (originX >= 0 && originX <= width && originY >= 0 && originY <= height) {
      ctx.fillText('0', originX - 6, originY + 6);
    }

    // 3. Render Items (Curves, Integrals, Tangents, Points)
    items.forEach((item) => {
      if (!item.visible) return;

      // Handle Coordinate Points
      if (item.type === 'point' && item.pointCoord) {
        const [px, py] = toScreen(item.pointCoord.x, item.pointCoord.y);
        ctx.save();
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(item.label || `(${item.pointCoord.x}, ${item.pointCoord.y})`, px + 8, py - 4);
        ctx.restore();
        return;
      }

      // Handle Mathematical Function Curves
      if (item.type === 'expression') {
        const compiled = compiledExpressions.get(item.id);
        if (!compiled) return;

        const fn = (x: number) => compiled.evaluate(x, sliderVars);

        // A. Shaded Area Under Curve (Definite Integral)
        if (item.calculus?.showIntegral) {
          const fromX = item.calculus.integralFrom;
          const toX = item.calculus.integralTo;
          const [startScreenX] = toScreen(Math.min(fromX, toX), 0);
          const [endScreenX] = toScreen(Math.max(fromX, toX), 0);

          ctx.save();
          ctx.fillStyle = item.color + '26'; // 15% opacity hex
          ctx.strokeStyle = item.color + '80';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          const [, screenZeroY] = toScreen(0, 0);
          ctx.moveTo(startScreenX, screenZeroY);

          const stepPx = 2;
          for (let sx = startScreenX; sx <= endScreenX; sx += stepPx) {
            const [mx] = toMath(sx, 0);
            const my = fn(mx);
            if (!isNaN(my) && isFinite(my)) {
              const [, sy] = toScreen(0, my);
              ctx.lineTo(sx, sy);
            }
          }
          ctx.lineTo(endScreenX, screenZeroY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Display Integral Value Badge
          const integralVal = numericalIntegral(fn, fromX, toX);
          const midX = (fromX + toX) / 2;
          const [midSx, midSy] = toScreen(midX, fn(midX) / 2);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          const badgeText = `∫ = ${integralVal.toFixed(3)}`;
          ctx.font = '11px ui-monospace, monospace';
          const textWidth = ctx.measureText(badgeText).width;
          ctx.beginPath();
          ctx.roundRect(midSx - textWidth / 2 - 6, midSy - 10, textWidth + 12, 20, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, midSx, midSy);

          ctx.restore();
        }

        // B. Plot the Primary Curve with Asymptote Detection
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        let isDrawing = false;
        let prevY = 0;

        for (let sx = 0; sx <= width; sx += 1.5) {
          const [mx] = toMath(sx, 0);
          const my = fn(mx);

          if (isNaN(my) || !isFinite(my)) {
            isDrawing = false;
            continue;
          }

          const [, sy] = toScreen(0, my);

          // Asymptote jump check (skip connecting vertical poles like in tan(x) or 1/x)
          if (isDrawing && Math.abs(sy - prevY) > height * 0.8 && Math.sign(sy) !== Math.sign(prevY)) {
            ctx.moveTo(sx, sy);
          } else if (!isDrawing) {
            ctx.moveTo(sx, sy);
            isDrawing = true;
          } else {
            ctx.lineTo(sx, sy);
          }

          prevY = sy;
        }
        ctx.stroke();
        ctx.restore();

        // C. Derivative Curve f'(x)
        if (item.calculus?.showDerivative) {
          ctx.save();
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);

          ctx.beginPath();
          let isDerivDrawing = false;
          for (let sx = 0; sx <= width; sx += 2) {
            const [mx] = toMath(sx, 0);
            const dVal = numericalDerivative(fn, mx);
            if (isNaN(dVal) || !isFinite(dVal)) {
              isDerivDrawing = false;
              continue;
            }
            const [, sy] = toScreen(0, dVal);
            if (!isDerivDrawing) {
              ctx.moveTo(sx, sy);
              isDerivDrawing = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          }
          ctx.stroke();
          ctx.restore();
        }

        // D. Tangent Line at x_0
        if (item.calculus?.showTangent) {
          const x0 = item.calculus.tangentX ?? 0;
          const y0 = fn(x0);
          const slope = numericalDerivative(fn, x0);

          if (!isNaN(y0) && !isNaN(slope) && isFinite(y0) && isFinite(slope)) {
            const [tx0, ty0] = toScreen(x0, y0);

            // Draw full tangent line
            const leftY = y0 + slope * (minMathX - x0);
            const rightY = y0 + slope * (maxMathX - x0);
            const [lsx, lsy] = toScreen(minMathX, leftY);
            const [rsx, rsy] = toScreen(maxMathX, rightY);

            ctx.save();
            ctx.strokeStyle = '#f59e0b'; // Amber tangent line
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(lsx, lsy);
            ctx.lineTo(rsx, rsy);
            ctx.stroke();

            // Tangent Anchor Handle Dot
            ctx.setLineDash([]);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(tx0, ty0, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(tx0, ty0, 3, 0, Math.PI * 2);
            ctx.fill();

            // Tangent Info Badge
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#020617ee';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            const badge = `m = ${slope.toFixed(2)} at (${x0.toFixed(2)}, ${y0.toFixed(2)})`;
            ctx.font = '10px ui-monospace, monospace';
            const bWidth = ctx.measureText(badge).width;
            ctx.beginPath();
            ctx.roundRect(tx0 + 10, ty0 - 18, bWidth + 10, 18, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(badge, tx0 + 15, ty0 - 9);

            ctx.restore();
          }
        }

        // E. Find & Render Curve Critical Features (Roots, Max, Min)
        const features = findCurveFeatures(fn, minMathX, maxMathX, 80);
        features.forEach((feat) => {
          const [fx, fy] = toScreen(feat.x, feat.y);
          if (fx >= 0 && fx <= width && fy >= 0 && fy <= height) {
            ctx.save();
            ctx.fillStyle = feat.type === 'root' ? '#94a3b8' : feat.type === 'max' ? '#38bdf8' : '#a855f7';
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    });

    // 4. Render Hover Coordinate Tooltip
    if (inspectedPoint) {
      ctx.save();
      // Glowing highlight circle
      ctx.fillStyle = inspectedPoint.color;
      ctx.shadowColor = inspectedPoint.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(inspectedPoint.screenX, inspectedPoint.screenY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Card
      ctx.shadowBlur = 0;
      ctx.font = '11px ui-monospace, monospace';
      const text = inspectedPoint.label;
      const textWidth = ctx.measureText(text).width;
      const cardX = Math.min(Math.max(inspectedPoint.screenX - textWidth / 2 - 8, 10), width - textWidth - 20);
      const cardY = Math.max(inspectedPoint.screenY - 30, 20);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = inspectedPoint.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, textWidth + 16, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cardX + 8, cardY + 11);
      ctx.restore();
    }

    ctx.restore();
  }, [
    items,
    sliderVars,
    compiledExpressions,
    pan,
    zoom,
    gridStep,
    inspectedPoint,
    toMath,
    toScreen,
  ]);

  // Mouse wheel zoom towards cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const nextZoom = Math.min(Math.max(zoom * zoomFactor, 10), 300);

    // Zoom centered around mouse cursor
    const mouseMathX = (mouseX - pan.x) / zoom;
    const mouseMathY = -(mouseY - pan.y) / zoom;

    const nextPanX = mouseX - mouseMathX * nextZoom;
    const nextPanY = mouseY + mouseMathY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  // Mouse Down: Start Pan or Tangent Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked near an interactive tangent anchor
    for (const item of items) {
      if (item.type === 'expression' && item.calculus?.showTangent) {
        const compiled = compiledExpressions.get(item.id);
        if (compiled) {
          const x0 = item.calculus.tangentX ?? 0;
          const y0 = compiled.evaluate(x0, sliderVars);
          const [sx, sy] = toScreen(x0, y0);
          const dist = Math.hypot(mouseX - sx, mouseY - sy);
          if (dist <= 15) {
            setActiveDraggingTangent(item.id);
            return;
          }
        }
      }
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Mouse Move: Pan or Hover Inspection
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const [mathX, mathY] = toMath(mouseX, mouseY);
    setHoverCoord({ mathX, mathY, screenX: mouseX, screenY: mouseY });

    // Handle Tangent Dragging
    if (activeDraggingTangent && onUpdateTangentX) {
      onUpdateTangentX(activeDraggingTangent, Number(mathX.toFixed(2)));
      return;
    }

    // Handle Viewport Pan Dragging
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Snap Inspection on Nearest Curve
    let closestPoint: {
      mathX: number;
      mathY: number;
      screenX: number;
      screenY: number;
      label: string;
      color: string;
    } | null = null;
    let minDistance = 16; // Threshold in screen pixels

    items.forEach((item) => {
      if (!item.visible) return;

      if (item.type === 'point' && item.pointCoord) {
        const [px, py] = toScreen(item.pointCoord.x, item.pointCoord.y);
        const dist = Math.hypot(mouseX - px, mouseY - py);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = {
            mathX: item.pointCoord.x,
            mathY: item.pointCoord.y,
            screenX: px,
            screenY: py,
            label: item.label || `(${item.pointCoord.x.toFixed(2)}, ${item.pointCoord.y.toFixed(2)})`,
            color: item.color,
          };
        }
      } else if (item.type === 'expression') {
        const compiled = compiledExpressions.get(item.id);
        if (compiled) {
          const evalY = compiled.evaluate(mathX, sliderVars);
          if (!isNaN(evalY) && isFinite(evalY)) {
            const [, evalScreenY] = toScreen(0, evalY);
            const dist = Math.abs(mouseY - evalScreenY);
            if (dist < minDistance) {
              minDistance = dist;
              closestPoint = {
                mathX,
                mathY: evalY,
                screenX: mouseX,
                screenY: evalScreenY,
                label: `(${mathX.toFixed(2)}, ${evalY.toFixed(2)})`,
                color: item.color,
              };
            }
          }
        }
      }
    });

    setInspectedPoint(closestPoint);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveDraggingTangent(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] bg-slate-950 overflow-hidden border border-slate-800 rounded-xl shadow-2xl select-none"
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setActiveDraggingTangent(null);
          setHoverCoord(null);
          setInspectedPoint(null);
        }}
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : activeDraggingTangent ? 'cursor-ew-resize' : 'cursor-crosshair'}`}
      />

      {/* Floating Viewport Navigation Overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 border border-slate-700/80 rounded-xl shadow-xl z-20">
        <button
          onClick={() => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const nextZoom = Math.min(zoom * 1.25, 300);
            const [centerMx, centerMy] = toMath(cx, cy);
            setZoom(nextZoom);
            setPan({ x: cx - centerMx * nextZoom, y: cy + centerMy * nextZoom });
          }}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const nextZoom = Math.max(zoom * 0.8, 10);
            const [centerMx, centerMy] = toMath(cx, cy);
            setZoom(nextZoom);
            setPan({ x: cx - centerMx * nextZoom, y: cy + centerMy * nextZoom });
          }}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Center Origin (0, 0)"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Live Pointer Telemetry Readout */}
      {hoverCoord && (
        <div className="absolute bottom-3 right-4 px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg font-mono text-[11px] text-slate-300 flex items-center space-x-2 shadow-lg z-20">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            X: <strong className="text-cyan-300">{hoverCoord.mathX.toFixed(2)}</strong>, Y:{' '}
            <strong className="text-cyan-300">{hoverCoord.mathY.toFixed(2)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
