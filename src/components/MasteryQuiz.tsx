import React, { useState } from 'react';
import { QuizQuestion, QuizQuestionType } from '../types/game';
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Eye,
  AlertTriangle,
  Calculator,
} from 'lucide-react';

interface MasteryQuizProps {
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  savedScore?: { score: number; maxScore: number; timestamp: number };
  onCompleteQuiz: (score: number, maxScore: number) => void;
}

export const MasteryQuiz: React.FC<MasteryQuizProps> = ({
  lessonId: _lessonId,
  lessonTitle,
  questions,
  savedScore,
  onCompleteQuiz,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleToggleHint = (qIdx: number) => {
    setRevealedHints((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setSubmitted(true);
    onCompleteQuiz(score, questions.length);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setRevealedHints({});
  };

  const getQuestionTypeBadge = (type: QuizQuestionType) => {
    switch (type) {
      case 'visual_prediction':
        return (
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" /> VISUAL PREDICTION
          </span>
        );
      case 'misconception_trap':
        return (
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> MISCONCEPTION TRAP
          </span>
        );
      case 'symbolic_calc':
        return (
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
            <Calculator className="w-3 h-3 text-emerald-400" /> SYMBOLIC CALCULATION
          </span>
        );
    }
  };

  const score = calculateScore();
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;
  const isPerfect = submitted && score === questions.length;

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Quiz Card Header */}
      <div className="bg-slate-900/95 border border-purple-500/40 rounded-lg p-3.5 backdrop-blur shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              OPERATIONAL MASTERY ASSESSMENT
            </h3>
          </div>
          {savedScore && (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              PREVIOUS BEST: {savedScore.score} / {savedScore.maxScore} (
              {Math.round((savedScore.score / savedScore.maxScore) * 100)}%)
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-cyan-300">{lessonTitle}: Diagnostic Checkpoint</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Demonstrate your mastery across visual prediction, misconception traps, and formal symbolic calculations.
          </p>
        </div>

        {/* Results Banner when Submitted */}
        {submitted && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
              isPerfect
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                : score >= questions.length * 0.6
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isPerfect ? (
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Award className="w-5 h-5 text-cyan-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {isPerfect ? 'PERFECT MASTERY! 100%' : `SCORE: ${score} / ${questions.length}`}
                </span>
                <span className="text-[11px] opacity-90">
                  {isPerfect
                    ? 'You successfully diagnosed all misconceptions and formulas for this lesson!'
                    : 'Review the detailed step-by-step explanations below to solidify your understanding.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 min-h-[44px] transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> RETRY QUIZ
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selectedOption = selectedAnswers[qIdx];
          const hasAnswered = selectedOption !== undefined;
          const isCorrect = submitted && selectedOption === q.correctIndex;
          const isWrong = submitted && hasAnswered && selectedOption !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-lg border flex flex-col gap-3 transition-all ${
                submitted
                  ? isCorrect
                    ? 'bg-slate-900/90 border-emerald-500/80 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/90 border-rose-500/80 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">QUESTION {qIdx + 1}</span>
                  {getQuestionTypeBadge(q.type)}
                </div>

                {q.hint && !submitted && (
                  <button
                    onClick={() => handleToggleHint(qIdx)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{revealedHints[qIdx] ? 'Hide Clue' : 'Need a Clue?'}</span>
                  </button>
                )}
              </div>

              {/* Question Prompt */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                  {q.prompt}
                </p>
                {q.subtitle && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">{q.subtitle}</p>
                )}
              </div>

              {/* Hint Box */}
              {revealedHints[qIdx] && !submitted && (
                <div className="p-2.5 rounded bg-slate-900 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-300">CLUE: </strong>
                    {q.hint}
                  </span>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  let optionClass = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300';

                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optionClass = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      optionClass = 'bg-rose-950/80 border-rose-500 text-rose-300 line-through';
                    } else {
                      optionClass = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold shadow-md';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`p-3 rounded-lg border text-left text-xs transition min-h-[44px] flex items-center justify-between ${optionClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      {submitted && optIdx === q.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {submitted && isSelected && optIdx !== q.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-Submission Explanation */}
              {submitted && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
                      : isWrong
                      ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block text-slate-200 mb-0.5 uppercase text-[10px] tracking-wider">
                      {isCorrect ? 'Correct Analysis:' : 'Mathematical Explanation:'}
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="flex justify-end pt-2">
          <button
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg min-h-[44px] transition flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>SUBMIT ANSWERS & EVALUATE MASTERY</span>
          </button>
        </div>
      )}
    </div>
  );
};
