import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DesmosItem, DesmosPreset } from '../types/desmos';
import { DESMOS_PRESETS } from '../data/desmosPresets';
import { DesmosCanvas } from './DesmosCanvas';
import { DesmosSidebar } from './DesmosSidebar';
import { soundEngine } from '../utils/audio';
import { Sparkles, Share2, Check, RotateCcw } from 'lucide-react';

const INITIAL_ITEMS: DesmosItem[] = [
  {
    id: 'd_slider_1',
    type: 'slider',
    rawText: 'a = 1.5',
    color: '#f59e0b',
    visible: true,
    slider: {
      variable: 'a',
      value: 1.5,
      min: -3,
      max: 3,
      step: 0.1,
      isPlaying: false,
      speed: 1.0,
    },
  },
  {
    id: 'd_expr_1',
    type: 'expression',
    rawText: 'y = a * sin(x)',
    color: '#06b6d4',
    visible: true,
    calculus: {
      showDerivative: false,
      showTangent: true,
      tangentX: 1.0,
      showIntegral: false,
      integralFrom: 0,
      integralTo: 3.14,
    },
  },
  {
    id: 'd_expr_2',
    type: 'expression',
    rawText: 'y = 0.5 * x^2 - 2',
    color: '#a855f7',
    visible: true,
  },
];

export const DesmosGrapher: React.FC = () => {
  const [items, setItems] = useState<DesmosItem[]>(INITIAL_ITEMS);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute slider variables map: { a: 1.5, omega: 2, etc. }
  const sliderVars = useMemo(() => {
    const vars: Record<string, number> = {};
    items.forEach((item) => {
      if (item.type === 'slider' && item.slider) {
        vars[item.slider.variable] = item.slider.value;
      }
    });
    return vars;
  }, [items]);

  // Animation frame loop for playing sliders
  const sliderDirectionsRef = useRef<Record<string, number>>({});
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animId: number;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      let hasActiveSlider = false;

      setItems((prevItems) => {
        let changed = false;
        const updated = prevItems.map((item) => {
          if (item.type === 'slider' && item.slider?.isPlaying) {
            hasActiveSlider = true;
            changed = true;
            const s = item.slider;
            let dir = sliderDirectionsRef.current[item.id] ?? 1;
            let nextVal = s.value + dir * s.speed * dt;

            // Bounce back and forth
            if (nextVal >= s.max) {
              nextVal = s.max;
              dir = -1;
            } else if (nextVal <= s.min) {
              nextVal = s.min;
              dir = 1;
            }
            sliderDirectionsRef.current[item.id] = dir;

            return {
              ...item,
              rawText: `${s.variable} = ${Number(nextVal.toFixed(2))}`,
              slider: {
                ...s,
                value: nextVal,
              },
            };
          }
          return item;
        });

        return changed ? updated : prevItems;
      });

      if (hasActiveSlider) {
        animId = requestAnimationFrame(loop);
      }
    };

    const hasAnyPlaying = items.some((i) => i.type === 'slider' && i.slider?.isPlaying);
    if (hasAnyPlaying) {
      lastTimeRef.current = performance.now();
      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [items]);

  // Handlers for Items
  const handleAddItem = (type: 'expression' | 'slider' | 'point') => {
    const id = `item_${Date.now()}`;
    soundEngine.playSliderTick();

    if (type === 'slider') {
      const existingVars = new Set(
        items.filter((i) => i.type === 'slider' && i.slider).map((i) => i.slider!.variable)
      );
      // Pick next available variable name
      const candidateVars = ['m', 'b', 'k', 'h', 'c', 't', 'p', 'q', 'r'];
      const chosenVar = candidateVars.find((v) => !existingVars.has(v)) || `v${items.length}`;

      const newSlider: DesmosItem = {
        id,
        type: 'slider',
        rawText: `${chosenVar} = 1.0`,
        color: '#f59e0b',
        visible: true,
        slider: {
          variable: chosenVar,
          value: 1.0,
          min: -5,
          max: 5,
          step: 0.25,
          isPlaying: false,
          speed: 1.0,
        },
      };
      setItems((prev) => [newSlider, ...prev]);
    } else if (type === 'point') {
      const newPoint: DesmosItem = {
        id,
        type: 'point',
        rawText: '(2, 3)',
        color: '#10b981',
        visible: true,
        pointCoord: { x: 2, y: 3 },
        label: '(2, 3)',
      };
      setItems((prev) => [...prev, newPoint]);
    } else {
      const newExpr: DesmosItem = {
        id,
        type: 'expression',
        rawText: 'y = cos(x)',
        color: '#3b82f6',
        visible: true,
      };
      setItems((prev) => [...prev, newExpr]);
    }
  };

  const handleUpdateItem = useCallback((id: string, updates: Partial<DesmosItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    soundEngine.playObstacleClang();
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleTogglePlaySlider = useCallback((id: string) => {
    soundEngine.playLaserCharge();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.slider) {
          return {
            ...item,
            slider: {
              ...item.slider,
              isPlaying: !item.slider.isPlaying,
            },
          };
        }
        return item;
      })
    );
  }, []);

  const handleLoadPreset = (preset: DesmosPreset) => {
    soundEngine.playTargetHit(2);
    const preparedItems: DesmosItem[] = preset.items.map((item, idx) => ({
      ...item,
      id: `preset_${preset.id}_${idx}_${Date.now()}`,
    }));
    setItems(preparedItems);
  };

  const handleReset = () => {
    soundEngine.playSliderTick();
    setItems(INITIAL_ITEMS);
  };

  const handleShare = () => {
    const config = JSON.stringify(items, null, 2);
    navigator.clipboard.writeText(config);
    setCopied(true);
    soundEngine.playTargetHit(2);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 rounded-lg text-cyan-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span>Desmos Graphing Engine</span>
              <span className="text-[10px] text-cyan-400 font-normal px-2 py-0.5 bg-cyan-950/80 rounded border border-cyan-800">
                Continuous 60 FPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Plot multi-variable functions, animate sliders, inspect instantaneous tangents, and compute integrals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors border border-slate-700"
            title="Reset to default equations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs font-mono transition-colors shadow-lg shadow-cyan-600/20"
            title="Export state to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop, Stacked on Tablet/Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Desmos Expressions & Sliders Sidebar */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <DesmosSidebar
            items={items}
            sliderVars={sliderVars}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onTogglePlaySlider={handleTogglePlaySlider}
            onLoadPreset={handleLoadPreset}
            presets={DESMOS_PRESETS}
          />
        </div>

        {/* Right Column: Desmos 60 FPS Canvas */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <DesmosCanvas
            items={items}
            sliderVars={sliderVars}
            onUpdateTangentX={(itemId, newX) => {
              handleUpdateItem(itemId, {
                calculus: {
                  ...items.find((i) => i.id === itemId)?.calculus!,
                  tangentX: newX,
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
