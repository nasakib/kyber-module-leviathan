import React, { useState } from 'react';
import { CurriculumContent } from '../types/game';
import { BookOpen, Compass, FileSpreadsheet, Variable, X, Sparkles } from 'lucide-react';
import { MathView, MathText } from './MathView';

interface CurriculumCardProps {
  curriculum: CurriculumContent;
  currentParams: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumCard: React.FC<CurriculumCardProps> = ({
  curriculum,
  currentParams,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'standards' | 'intuition' | 'derivation' | 'inspector'>('derivation');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-md shadow-cyan-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 bg-cyan-950/80 rounded border border-cyan-800/50">
                  {curriculum.topicCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono">{curriculum.standard}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono tracking-tight mt-0.5">
                {curriculum.standardName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 sm:px-5 select-none">
          <button
            onClick={() => setActiveTab('derivation')}
            className={`flex items-center space-x-2 px-3.5 py-3 text-xs sm:text-sm font-mono border-b-2 transition-all ${
              activeTab === 'derivation'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>School Test Derivation</span>
          </button>

          <button
            onClick={() => setActiveTab('intuition')}
            className={`flex items-center space-x-2 px-3.5 py-3 text-xs sm:text-sm font-mono border-b-2 transition-all ${
              activeTab === 'intuition'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Physical Intuition</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center space-x-2 px-3.5 py-3 text-xs sm:text-sm font-mono border-b-2 transition-all ${
              activeTab === 'inspector'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Variable className="w-4 h-4" />
            <span>Formula Inspector</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 font-mono text-sm">
          {/* Key Symbolic Formula Showcase Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-xl text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-2 left-3 flex items-center space-x-1.5 text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Governing Mathematical Law</span>
            </div>
            <div className="pt-3 pb-1 text-cyan-300 text-base sm:text-xl font-bold flex justify-center items-center">
              <MathView math={curriculum.keyFormulaLatex} displayMode />
            </div>
          </div>

          {/* TAB 1: DERIVATION STEPS */}
          {activeTab === 'derivation' && (
            <div className="space-y-3.5">
              <div className="text-xs text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                <span>Textbook-grade algebraic derivation with line-by-line justification:</span>
                <span className="text-[11px] text-cyan-400 font-semibold">{curriculum.stepByStepSolution.length} Steps</span>
              </div>

              {curriculum.stepByStepSolution.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl p-4 space-y-2 transition-all shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {step.label}
                    </span>
                  </div>

                  {/* Symbolic KaTeX Equation */}
                  <div className="pl-8 py-2 px-3 bg-slate-900/90 rounded-lg border border-slate-800 text-cyan-300 text-sm sm:text-base flex items-center overflow-x-auto">
                    <MathView math={step.mathExpression} displayMode={false} />
                  </div>

                  {/* Step Explanation with parsed inline math */}
                  <p className="pl-8 text-xs text-slate-400 leading-relaxed">
                    <MathText text={step.explanation} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PHYSICAL INTUITION */}
          {activeTab === 'intuition' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl leading-relaxed text-slate-300 text-sm space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center space-x-2 text-sm sm:text-base">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Physical & Spatial Mechanics</span>
                </h4>
                <div className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  <MathText text={curriculum.intuition} />
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed">
                💡 <span className="font-semibold text-emerald-200">First-Principles Insight:</span> Rather than memorizing blind algebraic recipes, coordinate geometry links spatial intuition (angles, curves, warp grids, and discrete points) with symbolic operations. When you calibrate variables on the terminal, you are physically steering geometry through space.
              </div>
            </div>
          )}

          {/* TAB 3: FORMULA INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 pb-1 border-b border-slate-800">
                Symbolic variable decomposition and live parameter binding:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {curriculum.formulaBreakdown.map((item, idx) => {
                  const currentVal = item.currentValueKey ? currentParams[item.currentValueKey] : undefined;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold text-base bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-500/30 flex items-center">
                          <MathView math={item.symbol} />
                        </span>
                        {currentVal !== undefined && (
                          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-500/20">
                            Live: {currentVal.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 pt-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-normal">
                        <MathText text={item.role} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="truncate max-w-[280px] sm:max-w-none">
            Curriculum Standard: <span className="text-cyan-400">{curriculum.standard}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
