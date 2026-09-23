import React, { useState } from 'react';
import { DesmosItem, DESMOS_COLORS, DesmosPreset } from '../types/desmos';
import {
  formatExpressionToLatex,
  compileMathExpression,
} from '../utils/mathParser';
import { MathView } from './MathView';
import {
  Eye,
  EyeOff,
  Trash2,
  Play,
  Pause,
  Plus,
  Sliders,
  TrendingUp,
  Table as TableIcon,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DesmosSidebarProps {
  items: DesmosItem[];
  sliderVars: Record<string, number>;
  onAddItem: (type: 'expression' | 'slider' | 'point') => void;
  onUpdateItem: (id: string, updates: Partial<DesmosItem>) => void;
  onRemoveItem: (id: string) => void;
  onTogglePlaySlider: (id: string) => void;
  onLoadPreset: (preset: DesmosPreset) => void;
  presets: DesmosPreset[];
}

export const DesmosSidebar: React.FC<DesmosSidebarProps> = ({
  items,
  sliderVars,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onTogglePlaySlider,
  onLoadPreset,
  presets,
}) => {
  const [activeExpandedCalculus, setActiveExpandedCalculus] = useState<string | null>(null);
  const [activeExpandedTable, setActiveExpandedTable] = useState<string | null>(null);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);

  // Cycle color on click
  const cycleColor = (id: string, currentColor: string) => {
    const currentIndex = DESMOS_COLORS.indexOf(currentColor);
    const nextColor = DESMOS_COLORS[(currentIndex + 1) % DESMOS_COLORS.length];
    onUpdateItem(id, { color: nextColor });
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4 shadow-xl font-mono">
      {/* Top Bar: Action Buttons & Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Expressions & State</span>
          </span>
          <span className="text-[11px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
            {items.length}
          </span>
        </div>

        {/* Quick Add Bar & Presets Button */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => onAddItem('expression')}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 rounded-lg transition-all"
            title="Add explicit function y = f(x)"
          >
            <Plus className="w-3 h-3" />
            <span>Function</span>
          </button>

          <button
            onClick={() => onAddItem('slider')}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/50 rounded-lg transition-all"
            title="Add dynamic animated slider"
          >
            <Plus className="w-3 h-3" />
            <span>Slider</span>
          </button>

          <button
            onClick={() => onAddItem('point')}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 rounded-lg transition-all"
            title="Add coordinate point (x, y)"
          >
            <Plus className="w-3 h-3" />
            <span>Point</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsPresetsOpen((prev) => !prev)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 rounded-lg transition-all"
              title="Load Curated Mathematical Presets"
            >
              <Sparkles className="w-3 h-3" />
              <span>Presets</span>
              {isPresetsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Presets Dropdown Drawer */}
            {isPresetsOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-slate-950 border border-purple-500/40 rounded-xl shadow-2xl p-2 z-50 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  <span>Desmos Presets Gallery</span>
                </div>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onLoadPreset(preset);
                      setIsPresetsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-purple-500/30 transition-all flex flex-col space-y-0.5 group"
                  >
                    <span className="text-xs text-slate-200 group-hover:text-purple-300 font-semibold">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item List Container */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto no-scrollbar pr-0.5">
        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No active expressions. Click <strong>+ Function</strong> or <strong>Presets</strong> above to begin plotting.
          </div>
        ) : (
          items.map((item, index) => {
            const isCalculusExpanded = activeExpandedCalculus === item.id;
            const isTableExpanded = activeExpandedTable === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3 space-y-2.5 transition-all shadow-md"
              >
                {/* Main Row: Color, Visibility, Input, Actions */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-semibold w-4 text-center">
                    {index + 1}
                  </span>

                  {/* Color Swatch Button */}
                  <button
                    onClick={() => cycleColor(item.id, item.color)}
                    style={{ backgroundColor: item.color }}
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0 hover:scale-110 transition-transform"
                    title="Click to cycle color"
                  />

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onUpdateItem(item.id, { visible: !item.visible })}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                    title={item.visible ? 'Hide from canvas' : 'Show on canvas'}
                  >
                    {item.visible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  {/* Primary Text Input Field */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.rawText}
                      onChange={(e) => {
                        const newText = e.target.value;
                        const updates: Partial<DesmosItem> = { rawText: newText };

                        // If it's a slider, update variable and value
                        if (item.type === 'slider' && item.slider) {
                          const match = newText.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([-+]?[0-9]*\.?[0-9]+)$/);
                          if (match) {
                            updates.slider = {
                              ...item.slider,
                              variable: match[1],
                              value: parseFloat(match[2]),
                            };
                          }
                        }

                        // If it's a point, update coordinates
                        if (item.type === 'point') {
                          const pMatch = newText.match(/^\(\s*([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)\s*\)$/);
                          if (pMatch) {
                            updates.pointCoord = {
                              x: parseFloat(pMatch[1]),
                              y: parseFloat(pMatch[2]),
                            };
                          }
                        }

                        onUpdateItem(item.id, updates);
                      }}
                      placeholder={
                        item.type === 'expression'
                          ? 'e.g. y = sin(x) or y = a*x^2 + b'
                          : item.type === 'slider'
                          ? 'e.g. a = 2.0'
                          : 'e.g. (2, 3)'
                      }
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono transition-colors"
                    />
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mathematical LaTeX Formula Preview Badge */}
                {item.rawText && (
                  <div className="pl-9 pr-2 py-1 text-cyan-300 text-xs flex items-center flex-wrap break-words bg-slate-900/60 rounded border border-slate-800/80">
                    <MathView math={formatExpressionToLatex(item.rawText)} />
                  </div>
                )}

                {/* SLIDER CONTROLS (If Slider) */}
                {item.type === 'slider' && item.slider && (
                  <div className="pl-9 pr-2 py-2 bg-slate-900/40 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onTogglePlaySlider(item.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all ${
                            item.slider.isPlaying
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-600/40'
                          }`}
                          title={item.slider.isPlaying ? 'Pause Animation' : 'Play Continuous Animation'}
                        >
                          {item.slider.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <span className="text-amber-300 font-bold">
                          {item.slider.variable} = {item.slider.value.toFixed(2)}
                        </span>
                      </div>

                      {/* Numeric Manual Input */}
                      <input
                        type="number"
                        step={item.slider.step}
                        value={item.slider.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            onUpdateItem(item.id, {
                              rawText: `${item.slider!.variable} = ${val}`,
                              slider: { ...item.slider!, value: val },
                            });
                          }
                        }}
                        className="w-16 bg-slate-950 border border-slate-700 text-right text-xs px-1.5 py-0.5 rounded text-amber-300 font-mono outline-none"
                      />
                    </div>

                    {/* Range Scrub Slider */}
                    <input
                      type="range"
                      min={item.slider.min}
                      max={item.slider.max}
                      step={item.slider.step}
                      value={item.slider.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateItem(item.id, {
                          rawText: `${item.slider!.variable} = ${val}`,
                          slider: { ...item.slider!, value: val },
                        });
                      }}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />

                    {/* Slider Limits: Min / Max / Step */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center space-x-1">
                        <span>Min:</span>
                        <input
                          type="number"
                          value={item.slider.min}
                          onChange={(e) => {
                            const minVal = parseFloat(e.target.value);
                            if (!isNaN(minVal)) {
                              onUpdateItem(item.id, { slider: { ...item.slider!, min: minVal } });
                            }
                          }}
                          className="w-10 bg-slate-950 border border-slate-800 px-1 rounded text-slate-300 text-center"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Step:</span>
                        <input
                          type="number"
                          value={item.slider.step}
                          onChange={(e) => {
                            const stepVal = parseFloat(e.target.value);
                            if (!isNaN(stepVal) && stepVal > 0) {
                              onUpdateItem(item.id, { slider: { ...item.slider!, step: stepVal } });
                            }
                          }}
                          className="w-10 bg-slate-950 border border-slate-800 px-1 rounded text-slate-300 text-center"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Max:</span>
                        <input
                          type="number"
                          value={item.slider.max}
                          onChange={(e) => {
                            const maxVal = parseFloat(e.target.value);
                            if (!isNaN(maxVal)) {
                              onUpdateItem(item.id, { slider: { ...item.slider!, max: maxVal } });
                            }
                          }}
                          className="w-10 bg-slate-950 border border-slate-800 px-1 rounded text-slate-300 text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CALCULUS TOOLS BAR (If Function Expression) */}
                {item.type === 'expression' && (
                  <div className="pl-9 pr-2 space-y-2">
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
                      {/* Calculus Inspector Toggle */}
                      <button
                        onClick={() =>
                          setActiveExpandedCalculus((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                          isCalculusExpanded || item.calculus?.showTangent || item.calculus?.showDerivative || item.calculus?.showIntegral
                            ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Calculus Tools</span>
                      </button>

                      {/* Table of Values Toggle */}
                      <button
                        onClick={() =>
                          setActiveExpandedTable((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                          isTableExpanded
                            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <TableIcon className="w-3 h-3" />
                        <span>Table</span>
                      </button>
                    </div>

                    {/* EXPANDED CALCULUS DRAWER */}
                    {isCalculusExpanded && (
                      <div className="p-3 bg-slate-900/90 border border-cyan-500/30 rounded-lg space-y-3 text-xs">
                        {/* 1. Derivative Overlay f'(x) */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.calculus?.showDerivative ?? false}
                            onChange={(e) => {
                              onUpdateItem(item.id, {
                                calculus: {
                                  showDerivative: e.target.checked,
                                  showTangent: item.calculus?.showTangent ?? false,
                                  tangentX: item.calculus?.tangentX ?? 1,
                                  showIntegral: item.calculus?.showIntegral ?? false,
                                  integralFrom: item.calculus?.integralFrom ?? -1,
                                  integralTo: item.calculus?.integralTo ?? 1,
                                },
                              });
                            }}
                            className="accent-cyan-400"
                          />
                          <span className="text-slate-200">Overlay Derivative f'(x) (Dashed)</span>
                        </label>

                        {/* 2. Interactive Tangent Line at x0 */}
                        <div className="space-y-1.5">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.calculus?.showTangent ?? false}
                              onChange={(e) => {
                                onUpdateItem(item.id, {
                                  calculus: {
                                    showDerivative: item.calculus?.showDerivative ?? false,
                                    showTangent: e.target.checked,
                                    tangentX: item.calculus?.tangentX ?? 1,
                                    showIntegral: item.calculus?.showIntegral ?? false,
                                    integralFrom: item.calculus?.integralFrom ?? -1,
                                    integralTo: item.calculus?.integralTo ?? 1,
                                  },
                                });
                              }}
                              className="accent-amber-400"
                            />
                            <span className="text-slate-200">Interactive Tangent Line</span>
                          </label>

                          {item.calculus?.showTangent && (
                            <div className="pl-5 flex items-center space-x-2">
                              <span className="text-[11px] text-amber-300">Point x₀:</span>
                              <input
                                type="range"
                                min="-6"
                                max="6"
                                step="0.1"
                                value={item.calculus.tangentX}
                                onChange={(e) => {
                                  onUpdateItem(item.id, {
                                    calculus: {
                                      ...item.calculus!,
                                      tangentX: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                className="w-28 accent-amber-400 h-1 bg-slate-800 rounded"
                              />
                              <span className="text-[11px] text-amber-200 w-10">
                                {item.calculus.tangentX.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 3. Definite Integral Shading */}
                        <div className="space-y-1.5">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.calculus?.showIntegral ?? false}
                              onChange={(e) => {
                                onUpdateItem(item.id, {
                                  calculus: {
                                    showDerivative: item.calculus?.showDerivative ?? false,
                                    showTangent: item.calculus?.showTangent ?? false,
                                    tangentX: item.calculus?.tangentX ?? 1,
                                    showIntegral: e.target.checked,
                                    integralFrom: item.calculus?.integralFrom ?? -1,
                                    integralTo: item.calculus?.integralTo ?? 1,
                                  },
                                });
                              }}
                              className="accent-emerald-400"
                            />
                            <span className="text-slate-200">Definite Integral Area Shading</span>
                          </label>

                          {item.calculus?.showIntegral && (
                            <div className="pl-5 flex items-center space-x-2 text-[11px]">
                              <span className="text-emerald-300">From a:</span>
                              <input
                                type="number"
                                step="0.5"
                                value={item.calculus.integralFrom}
                                onChange={(e) => {
                                  onUpdateItem(item.id, {
                                    calculus: {
                                      ...item.calculus!,
                                      integralFrom: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                className="w-12 bg-slate-950 border border-slate-700 px-1 py-0.5 rounded text-emerald-300 text-center"
                              />
                              <span className="text-emerald-300">To b:</span>
                              <input
                                type="number"
                                step="0.5"
                                value={item.calculus.integralTo}
                                onChange={(e) => {
                                  onUpdateItem(item.id, {
                                    calculus: {
                                      ...item.calculus!,
                                      integralTo: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                className="w-12 bg-slate-950 border border-slate-700 px-1 py-0.5 rounded text-emerald-300 text-center"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* EXPANDED TABLE OF VALUES */}
                    {isTableExpanded && (
                      <div className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-lg space-y-2 text-xs">
                        <div className="text-[11px] font-bold text-emerald-300 pb-1 border-b border-slate-800 flex justify-between">
                          <span>Evaluated Table of Values</span>
                          <span>x ↦ f(x)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                          {[-3, -2, -1, 0, 1, 2, 3].map((valX) => {
                            let valY = 'NaN';
                            try {
                              const compiled = compileMathExpression(item.rawText);
                              const res = compiled.evaluate(valX, sliderVars);
                              valY = isNaN(res) || !isFinite(res) ? 'Undef' : res.toFixed(3);
                            } catch {
                              valY = 'Err';
                            }
                            return (
                              <div
                                key={valX}
                                className="flex justify-between px-2 py-0.5 bg-slate-950/60 rounded border border-slate-800/80"
                              >
                                <span className="text-slate-400">x = {valX}</span>
                                <span className="text-emerald-300 font-semibold">{valY}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
