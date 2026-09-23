import React, { useState } from 'react';
import { DerivationStep } from '../types/game';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StepDerivationProps {
  title: string;
  description: string;
  parameterName: string;
  parameterLabel: string;
  parameterDefault: number;
  parameterMin: number;
  parameterMax: number;
  parameterStep: number;
  steps: DerivationStep[];
}

export const StepDerivation: React.FC<StepDerivationProps> = ({
  title,
  description,
  parameterName,
  parameterLabel,
  parameterDefault,
  parameterMin,
  parameterMax,
  parameterStep,
  steps,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [paramValue, setParamValue] = useState<number>(parameterDefault);
  const [collapsedExplanations, setCollapsedExplanations] = useState<Record<number, boolean>>({});

  const toggleExplanation = (stepNum: number) => {
    setCollapsedExplanations((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const visibleSteps = showAllSteps ? steps : steps.slice(0, currentStepIndex + 1);

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Proof Card Header */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-lg p-3.5 backdrop-blur shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              FIRST-PRINCIPLES STEP DERIVATION
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
            Algebraic Rigor & Dynamic Proof
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-cyan-300">{title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{description}</p>
        </div>

        {/* Dynamic Parameter Slider Control */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 text-xs">
              {parameterLabel}: <span className="text-amber-300 font-bold">{paramValue}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-[10px] text-slate-500">{parameterMin}</span>
            <input
              type="range"
              min={parameterMin}
              max={parameterMax}
              step={parameterStep}
              value={paramValue}
              onChange={(e) => setParamValue(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">{parameterMax}</span>
          </div>

          <button
            onClick={() => setParamValue(parameterDefault)}
            className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 min-h-[36px]"
            title="Reset to default parameter"
          >
            <RotateCcw className="w-3 h-3" /> Reset Param
          </button>
        </div>

        {/* Stepper Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowAllSteps(false);
                setCurrentStepIndex(0);
              }}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setShowAllSteps(false);
                setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentStepIndex === 0 || showAllSteps}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1 min-h-[36px] transition"
            >
              <ChevronLeft className="w-4 h-4" /> PREV STEP
            </button>
            <button
              onClick={() => {
                setShowAllSteps(false);
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIndex === steps.length - 1 || showAllSteps}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1 min-h-[36px] transition shadow"
            >
              NEXT STEP <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              {showAllSteps ? `ALL ${steps.length} STEPS` : `STEP ${currentStepIndex + 1} OF ${steps.length}`}
            </span>
            <button
              onClick={() => setShowAllSteps((prev) => !prev)}
              className={`px-3 py-1.5 rounded border text-xs font-bold transition min-h-[36px] flex items-center gap-1.5 ${
                showAllSteps
                  ? 'bg-purple-950 border-purple-400 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAllSteps ? 'COLLAPSE TO STEPPER' : 'SHOW ALL STEPS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof Steps List */}
      <div className="space-y-3">
        {visibleSteps.map((step) => {
          const isLatest = !showAllSteps && step.stepNumber === currentStepIndex + 1;
          const isExplanationOpen = !collapsedExplanations[step.stepNumber];
          const dynamicLine = step.computedLine ? step.computedLine({ [parameterName]: paramValue }) : step.algebraicLine;

          return (
            <div
              key={step.stepNumber}
              className={`rounded-lg border p-3.5 transition-all duration-200 flex flex-col gap-2.5 ${
                isLatest
                  ? 'bg-slate-900 border-cyan-400/80 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  STEP 0{step.stepNumber}
                </span>
              </div>

              {/* Algebraic Expression Block */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-sm text-emerald-300 font-bold overflow-x-auto tracking-wide">
                {dynamicLine}
              </div>

              {/* Collapsible "Why this works" callout */}
              <div className="bg-slate-900/80 rounded border border-slate-800/80 overflow-hidden text-xs">
                <button
                  onClick={() => toggleExplanation(step.stepNumber)}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-400 hover:text-amber-300 transition bg-slate-950/50 min-h-[36px]"
                >
                  <span className="flex items-center gap-1.5 font-bold text-[11px] text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Why this algebraic step works:
                  </span>
                  {isExplanationOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {isExplanationOpen && (
                  <div className="p-3 text-slate-200 text-xs leading-relaxed border-t border-slate-800/80 bg-slate-900/40">
                    {step.whyItWorks}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
