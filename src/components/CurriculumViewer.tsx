import React, { useState, useEffect } from 'react';
import { CurriculumProgress } from '../types/game';
import { CURRICULUM_MODULES } from '../data/curriculumData';
import { RosettaTable } from './RosettaTable';
import { StepDerivation } from './StepDerivation';
import { MasteryQuiz } from './MasteryQuiz';
import { CalculusCanvas } from './CalculusCanvas';
import {
  BookOpen,
  CheckCircle,
  Sparkles,
  Award,
  Layers,
  TrendingUp,
  Grid,
  Shield,
  Compass,
  ArrowRight,
  ArrowLeft,
  EyeOff,
  Maximize2,
  Table,
} from 'lucide-react';

interface CurriculumViewerProps {
  onClose?: () => void;
}

const STORAGE_KEY = 'kyber_curriculum_progress_v1';

export const CurriculumViewer: React.FC<CurriculumViewerProps> = ({ onClose }) => {
  // Load progress from localStorage
  const [progress, setProgress] = useState<CurriculumProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      completedLessons: [],
      quizScores: {},
      currentModuleId: CURRICULUM_MODULES[0].id,
      currentLessonId: CURRICULUM_MODULES[0].lessons[0].id,
    };
  });

  // Active module & lesson
  const currentModule =
    CURRICULUM_MODULES.find((m) => m.id === progress.currentModuleId) || CURRICULUM_MODULES[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === progress.currentLessonId) || currentModule.lessons[0];

  // 4-Layer Pedagogical Active Tab
  const [activeLayer, setActiveLayer] = useState<'discovery' | 'rosetta' | 'derivation' | 'mastery'>('discovery');

  // Canvas element highlight key from Rosetta Stone hover
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | undefined>(undefined);

  // Card collapsed state for canvas focus
  const [isCardCollapsed, setIsCardCollapsed] = useState<boolean>(false);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore
    }
  }, [progress]);

  const handleSelectModule = (modId: string) => {
    const mod = CURRICULUM_MODULES.find((m) => m.id === modId) || CURRICULUM_MODULES[0];
    setProgress((prev) => ({
      ...prev,
      currentModuleId: mod.id,
      currentLessonId: mod.lessons[0].id,
    }));
    setActiveHighlightKey(undefined);
  };

  const handleSelectLesson = (lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      currentLessonId: lessonId,
    }));
    setActiveHighlightKey(undefined);
  };

  const handleCompleteQuiz = (score: number, maxScore: number) => {
    setProgress((prev) => {
      const completed = prev.completedLessons.includes(currentLesson.id)
        ? prev.completedLessons
        : [...prev.completedLessons, currentLesson.id];

      return {
        ...prev,
        completedLessons: completed,
        quizScores: {
          ...prev.quizScores,
          [currentLesson.id]: {
            score,
            maxScore,
            timestamp: Date.now(),
          },
        },
      };
    });
  };

  const handleNextLesson = () => {
    const currentLessonIdx = currentModule.lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentLessonIdx < currentModule.lessons.length - 1) {
      handleSelectLesson(currentModule.lessons[currentLessonIdx + 1].id);
    } else {
      const currentModIdx = CURRICULUM_MODULES.findIndex((m) => m.id === currentModule.id);
      if (currentModIdx < CURRICULUM_MODULES.length - 1) {
        const nextMod = CURRICULUM_MODULES[currentModIdx + 1];
        setProgress((prev) => ({
          ...prev,
          currentModuleId: nextMod.id,
          currentLessonId: nextMod.lessons[0].id,
        }));
      }
    }
  };

  const handlePrevLesson = () => {
    const currentLessonIdx = currentModule.lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentLessonIdx > 0) {
      handleSelectLesson(currentModule.lessons[currentLessonIdx - 1].id);
    } else {
      const currentModIdx = CURRICULUM_MODULES.findIndex((m) => m.id === currentModule.id);
      if (currentModIdx > 0) {
        const prevMod = CURRICULUM_MODULES[currentModIdx - 1];
        setProgress((prev) => ({
          ...prev,
          currentModuleId: prevMod.id,
          currentLessonId: prevMod.lessons[prevMod.lessons.length - 1].id,
        }));
      }
    }
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'Grid':
        return <Grid className="w-4 h-4 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
    }
  };

  const totalLessons = CURRICULUM_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = progress.completedLessons.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="flex flex-col gap-2.5 font-mono">
      {/* 1. Module Selector Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 backdrop-blur shadow-xl">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              MATHEMATICS CURRICULUM ENGINE
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              {completedCount} / {totalLessons} Lessons ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCardCollapsed((prev) => !prev)}
              className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 min-h-[36px] flex items-center gap-1 transition"
            >
              {isCardCollapsed ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> EXPAND LESSON
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" /> MINIMIZE CARDS
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 min-h-[36px] transition"
              >
                ✕ HIDE
              </button>
            )}
          </div>
        </div>

        {/* Module Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {CURRICULUM_MODULES.map((mod, idx) => {
            const isActive = mod.id === currentModule.id;
            const modCompletedCount = mod.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;

            return (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod.id)}
                className={`p-2 rounded-lg border text-left transition min-h-[44px] flex flex-col gap-1 ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-slate-100 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getModuleIcon(mod.iconName)}
                    <span className="text-[10px] font-bold uppercase text-cyan-400">
                      MOD 0{idx + 1}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {modCompletedCount}/{mod.lessons.length}
                  </span>
                </div>
                <div className="text-[11px] font-bold truncate text-slate-200">{mod.tag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Lesson Selection & 4-Layer Navigation Header */}
      {!isCardCollapsed && (
        <div className="bg-slate-900/95 border border-cyan-500/40 rounded-lg p-3 backdrop-blur shadow-xl flex flex-col gap-3">
          {/* Lesson Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                {currentModule.tag}
              </span>
              <h2 className="text-sm font-bold text-cyan-400">{currentLesson.title}</h2>
            </div>

            {/* Lesson pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentModule.lessons.map((lesson, lIdx) => {
                const isCurrent = lesson.id === currentLesson.id;
                const isDone = progress.completedLessons.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition min-h-[36px] flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isDone && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    <span>L{lIdx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-300">{currentLesson.subtitle}</p>

          {/* 4-Layer Pedagogical Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveLayer('discovery')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                activeLayer === 'discovery'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md glow-cyan'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>1. TACTILE DISCOVERY</span>
            </button>

            <button
              onClick={() => setActiveLayer('rosetta')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                activeLayer === 'rosetta'
                  ? 'bg-amber-950 border-amber-400 text-amber-300 shadow-md glow-amber'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-4 h-4 text-amber-400" />
              <span>2. THE ROSETTA STONE</span>
            </button>

            <button
              onClick={() => setActiveLayer('derivation')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                activeLayer === 'derivation'
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-md glow-emerald'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3. STEP DERIVATION</span>
            </button>

            <button
              onClick={() => setActiveLayer('mastery')}
              className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                activeLayer === 'mastery'
                  ? 'bg-purple-950 border-purple-400 text-purple-300 shadow-md glow-rose'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>4. MASTERY QUIZ</span>
            </button>
          </div>
        </div>
      )}

      {/* Reopen compact bar when collapsed */}
      {isCardCollapsed && (
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-2.5 backdrop-blur flex items-center justify-between shadow-xl gap-2 font-mono">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">
              {currentModule.tag} • {currentLesson.title}
            </span>
            <span className="hidden sm:inline text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Cards Minimized • Canvas View Active
            </span>
          </div>
          <button
            onClick={() => setIsCardCollapsed(false)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 min-h-[36px] flex items-center gap-1 shadow-md transition"
          >
            <Maximize2 className="w-3.5 h-3.5" /> REOPEN CURRICULUM LESSON
          </button>
        </div>
      )}

      {/* 3. Pedagogical Content Body */}
      <div className="flex flex-col gap-3">
        {/* LAYER 1: TACTILE DISCOVERY (Interactive Calculus Canvas) */}
        {activeLayer === 'discovery' && (
          <CalculusCanvas
            interactiveMode={currentLesson.interactiveMode}
            defaultCurve={currentLesson.defaultCurve}
            activeHighlightKey={activeHighlightKey}
          />
        )}

        {/* LAYER 2: THE ROSETTA STONE */}
        {activeLayer === 'rosetta' && (
          <div className="flex flex-col gap-3">
            <RosettaTable
              rows={currentLesson.rosettaRows}
              activeHighlightKey={activeHighlightKey}
              onHoverRow={(key) => setActiveHighlightKey(key)}
              onLeaveRow={() => setActiveHighlightKey(undefined)}
            />
            {/* Embedded interactive canvas preview so hover immediately illuminates on-screen */}
            <div className="mt-2">
              <span className="text-xs font-bold text-slate-400 block mb-1">
                LIVE INTERACTIVE VISUALIZATION:
              </span>
              <CalculusCanvas
                interactiveMode={currentLesson.interactiveMode}
                defaultCurve={currentLesson.defaultCurve}
                activeHighlightKey={activeHighlightKey}
              />
            </div>
          </div>
        )}

        {/* LAYER 3: FIRST-PRINCIPLES STEP DERIVATION */}
        {activeLayer === 'derivation' && (
          <StepDerivation
            title={currentLesson.derivation.title}
            description={currentLesson.derivation.description}
            parameterName={currentLesson.derivation.parameterName}
            parameterLabel={currentLesson.derivation.parameterLabel}
            parameterDefault={currentLesson.derivation.parameterDefault}
            parameterMin={currentLesson.derivation.parameterMin}
            parameterMax={currentLesson.derivation.parameterMax}
            parameterStep={currentLesson.derivation.parameterStep}
            steps={currentLesson.derivation.steps}
          />
        )}

        {/* LAYER 4: OPERATIONAL MASTERY QUIZ */}
        {activeLayer === 'mastery' && (
          <MasteryQuiz
            lessonId={currentLesson.id}
            lessonTitle={currentLesson.title}
            questions={currentLesson.quiz}
            savedScore={progress.quizScores[currentLesson.id]}
            onCompleteQuiz={handleCompleteQuiz}
          />
        )}
      </div>

      {/* 4. Lesson Navigation Footer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur flex items-center justify-between gap-2 shadow-xl">
        <button
          onClick={handlePrevLesson}
          className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold min-h-[44px] transition"
        >
          <ArrowLeft className="w-4 h-4" /> PREV LESSON
        </button>

        <span className="text-xs text-slate-400 font-bold hidden sm:inline">
          {currentModule.title}
        </span>

        <button
          onClick={handleNextLesson}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold min-h-[44px] transition shadow"
        >
          NEXT LESSON <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
