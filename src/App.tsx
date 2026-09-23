import React, { useState, useEffect, useCallback } from 'react';
import { ALL_LEVELS } from './data/levels';
import {
  LevelDefinition,
  AppMode,
  UserProgressStore,
  HypothesisOption,
  LevelMasteryStatus,
} from './types/game';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  saveProgressToCloud,
  syncProgressWithCloud,
  subscribeToCloudProgress,
} from './services/cloudSaveService';
import { HUD } from './components/HUD';
import { LevelCanvas } from './components/LevelCanvas';
import { ControlTerminal } from './components/ControlTerminal';
import { CurriculumCard } from './components/CurriculumCard';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { SandboxStudio } from './components/SandboxStudio';
import { HypothesisModal } from './components/HypothesisModal';
import { AuthModal } from './components/AuthModal';
import { CommunityBrowser } from './components/CommunityBrowser';
import { ClassroomModal } from './components/ClassroomModal';
import { PublishLevelModal } from './components/PublishLevelModal';
import { checkEnergyBudget } from './components/EnergyBudgetMeter';
import { soundEngine } from './utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'vectorforge_save_v1';

const VectorForgeApp: React.FC = () => {
  const { user, profile, isConfigured } = useAuth();

  // App Mode: 'puzzle' (campaign) vs 'sandbox'
  const [appMode, setAppMode] = useState<AppMode>('puzzle');

  // Level Progression State
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [customCommunityLevel, setCustomCommunityLevel] = useState<LevelDefinition | null>(null);

  // Active level is custom community level if playing one, otherwise campaign level
  const currentLevel: LevelDefinition =
    customCommunityLevel || ALL_LEVELS[currentLevelIndex] || ALL_LEVELS[0];

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
  const [isHypothesisOpen, setIsHypothesisOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState<boolean>(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState<boolean>(false);
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);

  const [selectedHypothesisOption, setSelectedHypothesisOption] = useState<HypothesisOption | null>(null);
  const [masteryStatus, setMasteryStatus] = useState<LevelMasteryStatus | null>(null);
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

  // Two-way synchronization with Supabase cloud when user logs in
  useEffect(() => {
    if (user?.id) {
      syncProgressWithCloud(user.id, progress).then((merged) => {
        setProgress(merged);
      });

      // Subscribe to realtime cloud updates from other tabs / devices
      const unsubscribe = subscribeToCloudProgress(user.id, (levelId, remoteProg) => {
        setProgress((prev) => ({
          ...prev,
          [levelId]: remoteProg,
        }));
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user?.id]);

  // When level changes, reset state
  useEffect(() => {
    setParams({ ...currentLevel.defaultParams });
    setAttempts(0);
    setTargetsHitCount(0);
    setHasWon(false);
    setIsFiring(false);
    setSelectedHypothesisOption(null);
    setMasteryStatus(null);
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
      setIsCurriculumOpen(true);
      soundEngine.playTargetHit(1);
    } else {
      setParams({ ...currentLevel.solutionParams });
      soundEngine.playTargetHit(2);
    }
  };

  // Simulation completion callback from LevelCanvas
  const handleSimulationComplete = (success: boolean, targetsHit: string[]) => {
    setIsFiring(false);
    setTargetsHitCount(targetsHit.length);

    if (success && !hasWon) {
      let stars = 1;
      if (attempts <= 2) stars = 3;
      else if (attempts <= 4) stars = 2;

      setAwardedStars(stars);
      setHasWon(true);
      soundEngine.playVictoryFanfare();

      // Check mastery status
      const budgetMet = checkEnergyBudget(currentLevel.energyBudget, params).met;
      const hypothesisCorrect = selectedHypothesisOption?.isCorrect ?? false;
      const multiplier = selectedHypothesisOption?.isCorrect ? (currentLevel.hypothesis?.multiplier ?? 2.0) : 1.0;
      const score = Math.round(1000 * stars * multiplier);

      const status: LevelMasteryStatus = {
        cleared: true,
        budgetMet,
        hypothesisCorrect,
        score,
      };
      setMasteryStatus(status);

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#34d399', '#fbbf24', '#f43f5e'],
      });

      // Update progress locally
      setProgress((prev) => {
        const prevLevelProg = prev[currentLevel.id] || { completed: false, stars: 0, bestAttempts: 999, unlocked: true };
        const updatedStars = Math.max(prevLevelProg.stars, stars);
        const updatedAttempts = prevLevelProg.bestAttempts ? Math.min(prevLevelProg.bestAttempts, attempts) : attempts;

        const updatedLevelProg = {
          completed: true,
          stars: updatedStars,
          bestAttempts: updatedAttempts,
          unlocked: true,
          masteryStatus: status,
        };

        // If cloud user is logged in, upload progress asynchronously
        if (user?.id) {
          saveProgressToCloud(user.id, currentLevel.id, updatedLevelProg);
        }

        const nextStore = {
          ...prev,
          [currentLevel.id]: updatedLevelProg,
        };

        // Unlock next level in campaign
        if (!customCommunityLevel && currentLevelIndex + 1 < ALL_LEVELS.length) {
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
    if (customCommunityLevel) {
      setCustomCommunityLevel(null);
      return;
    }
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
    }
  };

  const handleNextLevel = () => {
    if (customCommunityLevel) {
      setCustomCommunityLevel(null);
      return;
    }
    if (currentLevelIndex + 1 < ALL_LEVELS.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setHasWon(false);
    }
  };

  const handleSelectLevel = (lvl: LevelDefinition) => {
    setCustomCommunityLevel(null);
    const idx = ALL_LEVELS.findIndex((l) => l.id === lvl.id);
    if (idx !== -1) {
      setCurrentLevelIndex(idx);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFire();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setIsCurriculumOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFire, handleReset]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Application HUD */}
      <HUD
        currentLevel={currentLevel}
        appMode={appMode}
        onToggleAppMode={(mode) => setAppMode(mode)}
        progress={progress}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onOpenClassroom={() => setIsClassroomOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onPrevLevel={handlePrevLevel}
        onNextLevel={handleNextLevel}
        hasPrevLevel={!customCommunityLevel && currentLevelIndex > 0}
        hasNextLevel={!customCommunityLevel && currentLevelIndex + 1 < ALL_LEVELS.length}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isCloudConnected={isConfigured}
        userDisplayName={profile?.displayName}
        userRole={profile?.role}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 flex flex-col space-y-4">
        {/* Custom Community Level Banner */}
        {customCommunityLevel && (
          <div className="p-3 bg-gradient-to-r from-purple-950/80 to-blue-950/80 border border-purple-500/40 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-purple-900 text-purple-200 font-bold rounded">
                Community Puzzle
              </span>
              <span className="text-slate-200 font-bold">{customCommunityLevel.title}</span>
            </div>
            <button
              onClick={() => setCustomCommunityLevel(null)}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Return to Campaign
            </button>
          </div>
        )}

        {appMode === 'puzzle' ? (
          <>
            {/* 60 FPS HTML5 Canvas Engine */}
            <LevelCanvas
              level={currentLevel}
              params={params}
              onParamChange={handleParamChange}
              isFiring={isFiring}
              onSimulationComplete={handleSimulationComplete}
              playHitSound={(i) => soundEngine.playTargetHit(i)}
              playObstacleSound={() => soundEngine.playObstacleClang()}
            />

            {/* Futuristic Cyberpunk Control Terminal */}
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
              onOpenHypothesis={currentLevel.hypothesis ? () => setIsHypothesisOpen(true) : undefined}
              isHypothesisAnswered={selectedHypothesisOption !== null}
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

      {/* Predictive Hypothesis Modal (Gold Mastery) */}
      {currentLevel.hypothesis && (
        <HypothesisModal
          hypothesis={currentLevel.hypothesis}
          isOpen={isHypothesisOpen}
          selectedOptionId={selectedHypothesisOption?.id ?? null}
          onSelectOption={(opt) => setSelectedHypothesisOption(opt)}
          onClose={() => setIsHypothesisOpen(false)}
        />
      )}

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
        masteryStatus={masteryStatus ?? undefined}
        hasNextLevel={!customCommunityLevel && currentLevelIndex + 1 < ALL_LEVELS.length}
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

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Community Level Browser */}
      <CommunityBrowser
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        onPlayLevel={(communityLvl) => {
          setCustomCommunityLevel(communityLvl);
          setAppMode('puzzle');
        }}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* Classroom Homework & Assignment Modal */}
      <ClassroomModal
        isOpen={isClassroomOpen}
        onClose={() => setIsClassroomOpen(false)}
        progress={progress}
        onSelectLevelId={(lvlId) => {
          setCustomCommunityLevel(null);
          const idx = ALL_LEVELS.findIndex((l) => l.id === lvlId);
          if (idx !== -1) {
            setCurrentLevelIndex(idx);
          }
        }}
      />

      {/* Community Level Publisher Modal */}
      <PublishLevelModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        levelToPublish={currentLevel}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VectorForgeApp />
    </AuthProvider>
  );
};

export default App;
