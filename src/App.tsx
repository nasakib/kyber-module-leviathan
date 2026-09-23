import React, { useState, useEffect, useCallback } from 'react';
import { ALL_LEVELS } from './data/levels';
import { LevelDefinition, AppMode, UserProgressStore } from './types/game';
import { HUD } from './components/HUD';
import { LevelCanvas } from './components/LevelCanvas';
import { ControlTerminal } from './components/ControlTerminal';
import { CurriculumCard } from './components/CurriculumCard';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { SandboxStudio } from './components/SandboxStudio';
import { soundEngine } from './utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'vectorforge_save_v1';

export const App: React.FC = () => {
  // App Mode: 'puzzle' (campaign) vs 'sandbox'
  const [appMode, setAppMode] = useState<AppMode>('puzzle');

  // Level Progression State
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentLevel = ALL_LEVELS[currentLevelIndex] || ALL_LEVELS[0];

  // Active Parameters for current level
  const [params, setParams] = useState<Record<string, number>>(currentLevel.defaultParams);

  // Simulation & Gameplay State
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [targetsHitCount, setTargetsHitCount] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [awardedStars, setAwardedStars] = useState<number>(0);

  // UI Drawers & Modals
  const [isCurriculumOpen, setIsCurriculumOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User Progress Store (localStorage persistence)
  const [progress, setProgress] = useState<UserProgressStore>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore JSON error
    }
    // Default unlocked state
    const initial: UserProgressStore = {};
    ALL_LEVELS.forEach((lvl, i) => {
      initial[lvl.id] = {
        completed: false,
        stars: 0,
        bestAttempts: 0,
        unlocked: i === 0,
      };
    });
    return initial;
  });

  // Sync progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage quota or disabled
    }
  }, [progress]);

  // When level changes, reset state
  useEffect(() => {
    setParams({ ...currentLevel.defaultParams });
    setAttempts(0);
    setTargetsHitCount(0);
    setHasWon(false);
    setIsFiring(false);
  }, [currentLevel.id]);

  // Audio mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Param update handler
  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Fire / Test Trajectory
  const handleFire = useCallback(() => {
    if (isFiring) return;
    soundEngine.playBeamSnap();
    setAttempts((a) => a + 1);
    setIsFiring(true);
  }, [isFiring]);

  // Reset parameters to default
  const handleReset = useCallback(() => {
    setParams({ ...currentLevel.defaultParams });
    setTargetsHitCount(0);
    soundEngine.playSliderTick();
  }, [currentLevel.defaultParams]);

  // Auto calculate solution or give hint
  const handleAutoCalculate = () => {
    if (attempts < 2) {
      // Open Curriculum drawer directly to school derivation
      setIsCurriculumOpen(true);
      soundEngine.playTargetHit(1);
    } else {
      // Auto populate exact solution parameters
      setParams({ ...currentLevel.solutionParams });
      soundEngine.playTargetHit(3);
    }
  };

  // Simulation completion callback from LevelCanvas
  const handleSimulationComplete = (success: boolean, targetsHit: string[]) => {
    setIsFiring(false);
    setTargetsHitCount(targetsHit.length);

    if (success && !hasWon) {
      // Calculate star rating
      let stars = 1;
      if (attempts <= 2) stars = 3;
      else if (attempts <= 4) stars = 2;

      setAwardedStars(stars);
      setHasWon(true);
      soundEngine.playVictoryFanfare();

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#34d399', '#fbbf24', '#f43f5e']
      });

      // Update progress
      setProgress((prev) => {
        const prevLevelProg = prev[currentLevel.id] || { completed: false, stars: 0, bestAttempts: 999, unlocked: true };
        const updatedStars = Math.max(prevLevelProg.stars, stars);
        const updatedAttempts = prevLevelProg.bestAttempts ? Math.min(prevLevelProg.bestAttempts, attempts) : attempts;

        const nextStore = {
          ...prev,
          [currentLevel.id]: {
            completed: true,
            stars: updatedStars,
            bestAttempts: updatedAttempts,
            unlocked: true,
          }
        };

        // Unlock next level
        if (currentLevelIndex + 1 < ALL_LEVELS.length) {
          const nextLvl = ALL_LEVELS[currentLevelIndex + 1];
          if (!nextStore[nextLvl.id]) {
            nextStore[nextLvl.id] = { completed: false, stars: 0, bestAttempts: 0, unlocked: true };
          } else {
            nextStore[nextLvl.id].unlocked = true;
          }
        }

        return nextStore;
      });
    }
  };

  // Level Navigation
  const handlePrevLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < ALL_LEVELS.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setHasWon(false);
    }
  };

  const handleSelectLevel = (lvl: LevelDefinition) => {
    const idx = ALL_LEVELS.findIndex((l) => l.id === lvl.id);
    if (idx !== -1) {
      setCurrentLevelIndex(idx);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFire();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'Escape') {
        setIsCurriculumOpen(false);
        setIsLevelSelectOpen(false);
        setHasWon(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFire, handleReset]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-slate-950">
      {/* Top HUD */}
      <HUD
        currentLevel={currentLevel}
        appMode={appMode}
        onToggleAppMode={setAppMode}
        progress={progress}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onPrevLevel={handlePrevLevel}
        onNextLevel={handleNextLevel}
        hasPrevLevel={currentLevelIndex > 0}
        hasNextLevel={currentLevelIndex + 1 < ALL_LEVELS.length}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Main Game Surface */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col space-y-4">
        {appMode === 'puzzle' ? (
          <>
            {/* Level Briefing Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="font-bold text-cyan-400">OBJECTIVE:</span>
                <span className="text-slate-300">{currentLevel.description}</span>
              </div>
              <button
                onClick={() => setIsCurriculumOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold self-start sm:self-auto shrink-0"
              >
                View Theory & Solution Steps →
              </button>
            </div>

            {/* Interactive 60 FPS HTML5 Canvas */}
            <LevelCanvas
              level={currentLevel}
              params={params}
              onParamChange={handleParamChange}
              isFiring={isFiring}
              onSimulationComplete={handleSimulationComplete}
              playHitSound={(i) => soundEngine.playTargetHit(i)}
              playObstacleSound={() => soundEngine.playObstacleClang()}
            />

            {/* Cyberpunk Control Terminal */}
            <ControlTerminal
              level={currentLevel}
              params={params}
              onParamChange={handleParamChange}
              onFire={handleFire}
              onReset={handleReset}
              onAutoCalculate={handleAutoCalculate}
              isFiring={isFiring}
              attempts={attempts}
              targetsHitCount={targetsHitCount}
              totalTargets={currentLevel.targets.length}
            />
          </>
        ) : (
          /* Freeform Sandbox Studio */
          <SandboxStudio />
        )}
      </main>

      {/* Curriculum & Step-by-Step Derivation Drawer */}
      <CurriculumCard
        curriculum={currentLevel.curriculum}
        currentParams={params}
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
      />

      {/* Sector Map & Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        currentLevelId={currentLevel.id}
        onSelectLevel={handleSelectLevel}
        progress={progress}
        onResetProgress={() => {
          localStorage.removeItem(STORAGE_KEY);
          setProgress({});
          window.location.reload();
        }}
      />

      {/* Level Victory Modal */}
      <VictoryModal
        isOpen={hasWon}
        level={currentLevel}
        stars={awardedStars}
        attempts={attempts}
        hasNextLevel={currentLevelIndex + 1 < ALL_LEVELS.length}
        onNextLevel={handleNextLevel}
        onReplay={() => {
          setHasWon(false);
          setAttempts(0);
          setParams({ ...currentLevel.defaultParams });
        }}
        onOpenCurriculum={() => {
          setHasWon(false);
          setIsCurriculumOpen(true);
        }}
      />
    </div>
  );
};

export default App;
