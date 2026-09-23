import React, { useState } from 'react';
import { CurriculumContent } from '../types/game';
import { BookOpen, Compass, FileSpreadsheet, Variable, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 bg-cyan-950/60 rounded border border-cyan-800/40">
                  {curriculum.topicCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono">{curriculum.standard}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono">
                {curriculum.standardName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 sm:px-5">
          <button
            onClick={() => setActiveTab('derivation')}
            className={`flex items-center space-x-2 px-3 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors ${
              activeTab === 'derivation'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>School Test Derivation</span>
          </button>

          <button
            onClick={() => setActiveTab('intuition')}
            className={`flex items-center space-x-2 px-3 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors ${
              activeTab === 'intuition'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Physical Intuition</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center space-x-2 px-3 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors ${
              activeTab === 'inspector'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Variable className="w-4 h-4" />
            <span>Formula Inspector</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 font-mono text-sm">
          {/* Key Formula Banner */}
          <div className="p-3.5 bg-slate-950 border border-cyan-500/20 rounded-xl text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Foundational Formula</div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 font-mono tracking-wide">
              {curriculum.keyFormulaLatex}
            </div>
          </div>

          {/* TAB 1: DERIVATION STEPS */}
          {activeTab === 'derivation' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Pristine textbook-grade solution showing how to solve this exact scenario on a school exam:
              </div>
              {curriculum.stepByStepSolution.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{step.label}</span>
                  </div>
                  <div className="pl-7 text-cyan-300 font-bold bg-slate-900/60 py-1 px-2.5 rounded border border-slate-800/80 text-sm">
                    {step.mathExpression}
                  </div>
                  <p className="pl-7 text-xs text-slate-400 leading-relaxed">
                    {step.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PHYSICAL INTUITION */}
          {activeTab === 'intuition' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl leading-relaxed text-slate-300 text-sm">
                <h4 className="text-cyan-400 font-bold mb-2 flex items-center space-x-2">
                  <Compass className="w-4 h-4" />
                  <span>Why the Mathematics Behaves This Way</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">{curriculum.intuition}</p>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed">
                💡 <span className="font-semibold text-emerald-200">First-Principles Takeaway:</span> Rather than memorizing blind formulas, coordinate geometry links spatial intuition (angles, trajectories, grids) with algebraic manipulations. When you adjust numbers on the terminal, you are physically steering geometry in space.
              </div>
            </div>
          )}

          {/* TAB 3: FORMULA INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Detailed breakdown of variables and coefficients in the active mathematical formula:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curriculum.formulaBreakdown.map((item, idx) => {
                  const currentVal = item.currentValueKey ? currentParams[item.currentValueKey] : undefined;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-bold text-sm bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                          {item.symbol}
                        </span>
                        {currentVal !== undefined && (
                          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                            Current: {currentVal.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 pt-1">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Standard: {curriculum.standard}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
