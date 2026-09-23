import React, { useState } from 'react';
import { MathPhysicsPuzzle } from '../types/game';
import { HelpCircle, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface MathChallengeCardProps {
  puzzle: MathPhysicsPuzzle;
  onSolve: () => void;
}

export const MathChallengeCard: React.FC<MathChallengeCardProps> = ({
  puzzle,
  onSolve,
}) => {
  const [userVal, setUserVal] = useState<number>(puzzle.currentValue);
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkAnswer = () => {
    const diff = Math.abs(userVal - puzzle.targetValue);
    if (diff < 1.5) {
      setFeedback('SUCCESS! Concept validated. Weapon / Boost Activated!');
      onSolve();
    } else if (userVal < puzzle.targetValue) {
      setFeedback(`TOO LOW! Increase value to match target (${puzzle.targetValue} ${puzzle.unit})`);
    } else {
      setFeedback(`TOO HIGH! Decrease value to match target (${puzzle.targetValue} ${puzzle.unit})`);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 font-mono text-xs shadow-2xl backdrop-blur flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1.5 font-bold text-cyan-400">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          {puzzle.title}
        </span>
        <span className="text-[10px] text-amber-400 font-semibold uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
          FORMULA: {puzzle.formula}
        </span>
      </div>

      <p className="text-slate-200 text-xs leading-relaxed">
        {puzzle.question}
      </p>

      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] text-slate-400">
        <span className="text-emerald-400 font-bold">💡 REAL WORLD CONCEPT: </span>
        {puzzle.conceptExplanation}
      </div>

      {/* Interactive Control Slider */}
      <div className="flex flex-col gap-1.5 mt-1 bg-slate-950 p-2.5 rounded border border-slate-800">
        <div className="flex justify-between items-center text-[11px] font-semibold">
          <span className="text-slate-300">ADJUST VALUE:</span>
          <span className="text-cyan-400 font-bold">{userVal.toFixed(1)} {puzzle.unit}</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="0.5"
          value={userVal}
          onChange={(e) => setUserVal(Number(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer"
        />
      </div>

      {feedback && (
        <div
          className={`text-[11px] p-2 rounded border font-semibold flex items-center gap-1.5 ${
            feedback.startsWith('SUCCESS')
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
              : 'bg-amber-950 border-amber-500 text-amber-300'
          }`}
        >
          {feedback.startsWith('SUCCESS') ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      <button
        onClick={checkAnswer}
        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg font-mono flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-xs"
      >
        <Zap className="w-3.5 h-3.5" /> VERIFY SOLUTION & BOOST <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
