import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  Matrix2D,
  Vector2D,
  SolverPreset,
  Particle,
  FloatingText,
  Lane,
  CombatLogEntry,
} from './types/game';
import { generateLatticeSolution } from './utils/latticeMath';
import { soundEngine } from './utils/audio';
import { LatticeCanvas } from './components/LatticeCanvas';
import { HUD } from './components/HUD';
import { CombatLog } from './components/CombatLog';
import { AcademyMode, ACADEMY_CHAPTERS } from './components/AcademyMode';
import { SolverLab } from './components/SolverLab';
import { ExplanatoryDrawer } from './components/ExplanatoryDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import {
  Cpu,
  Trophy,
  Volume2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Maximize2,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Sliders,
  BookOpen,
  Terminal,
} from 'lucide-react';

const INITIAL_MATRIX: Matrix2D = {
  b1: { x: 200, y: 195 },
  b2: { x: 195, y: 190 },
};

const INITIAL_TARGET: Vector2D = { x: 210, y: 180 };

export function App() {
  const initialSteps = generateLatticeSolution(INITIAL_MATRIX.b1, INITIAL_MATRIX.b2, INITIAL_TARGET);

  const [gameState, setGameState] = useState<GameState>({
    appMode: 'academy',
    academyChapter: 1,
    academyCompleted: false,

    solverMatrix: INITIAL_MATRIX,
    solverTarget: INITIAL_TARGET,
    solverSteps: initialSteps,
    currentStepIndex: 0,
    isSolverPlaying: false,
    solverPlaybackSpeed: 1,

    isDrawerOpen: false,
    interactiveAngle: 45,

    shipLane: 0,
    shipY: 0,
    shipState: 'normal',
    speed: 1.0,
    distance: 0,
    score: 0,

    isAnalysisGateActive: false,
    gateQuestion: 'Analysis Checkpoint: The basis vectors are heavily skewed (obtuse angle θ ≈ 170°). What algorithm reduces them to short, orthogonal vectors?',
    gateOptions: [
      'Gram-Schmidt Orthogonalization & LLL Lovász Swaps',
      'Multiply the matrix by zero',
      'Ignore the lattice and brute force 2^768 keys',
    ],
    correctOptionIndex: 0,
    gateTimer: 8.0,
    gateHintUsed: false,
    gateEliminatedOptions: [],

    obstacles: [],
    powerups: [],

    isFlowMode: true,
    showInstructionsModal: false,

    bossHp: 768,
    maxBossHp: 768,
    bossPhase: 1,
    bossZ: 0,

    playerHp: 100,
    maxPlayerHp: 100,
    memoryHeat: 0,
    bkzBeta: 40,
    gramSchmidtVisor: false,

    comboCount: 0,
    screenShake: 0,
    tacticalHint: 'Academy Mode Active: Explore 5 chapters from vector basics to post-quantum cryptanalysis!',

    isGameOver: false,
    isVictory: false,
    audioMuted: false,
    audioInitialized: false,

    isAcademyCardOpen: true,
    isSolverControlsOpen: true,
    isTelemetryLogOpen: true,
    isBossStatsOpen: true,
    isFocusMode: false,
  });

  const handleToggleFocusMode = useCallback(() => {
    setGameState((prev) => {
      const nextFocus = !prev.isFocusMode;
      return {
        ...prev,
        isFocusMode: nextFocus,
        isAcademyCardOpen: !nextFocus,
        isSolverControlsOpen: !nextFocus,
        isTelemetryLogOpen: !nextFocus,
        isBossStatsOpen: !nextFocus,
      };
    });
  }, []);

  const handleToggleAcademyCard = useCallback(() => {
    setGameState((prev) => ({ ...prev, isAcademyCardOpen: !prev.isAcademyCardOpen }));
  }, []);

  const handleToggleSolverControls = useCallback(() => {
    setGameState((prev) => ({ ...prev, isSolverControlsOpen: !prev.isSolverControlsOpen }));
  }, []);

  const handleToggleTelemetryLog = useCallback(() => {
    setGameState((prev) => ({ ...prev, isTelemetryLogOpen: !prev.isTelemetryLogOpen }));
  }, []);

  const handleToggleBossStats = useCallback(() => {
    setGameState((prev) => ({ ...prev, isBossStatsOpen: !prev.isBossStatsOpen }));
  }, []);

  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const addLog = useCallback(
    (text: string, type: CombatLogEntry['type'] = 'info', simpleTranslation?: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLogs((prev) => [
        ...prev.slice(-40),
        {
          id: Math.random().toString(),
          timestamp,
          text,
          simpleTranslation,
          type,
        },
      ]);
    },
    []
  );

  useEffect(() => {
    addLog("KYBER PEDAGOGICAL PLATFORM LOADED: SELECT ACADEMY, SOLVER LAB, OR BOSS ENCOUNTER", "warning", "Platform initialized! Learn math in The Academy or run step-by-step LLL in Solver Lab.");
  }, [addLog]);

  const initAudioCtx = useCallback(() => {
    if (!gameState.audioInitialized) {
      soundEngine.init();
      setGameState((prev) => ({ ...prev, audioInitialized: true }));
    }
  }, [gameState.audioInitialized]);

  const spawnFloatingText = (text: string, x: number, y: number, color: string = '#34d399', fontSize: number = 18) => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        text,
        x,
        y,
        color,
        life: 30,
        maxLife: 30,
        fontSize,
      },
    ]);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number = 15) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      newParticles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        life: 1,
        maxLife: Math.random() * 20 + 20,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Keyboard Shortcuts with intelligent scroll prevention (respects inputs and mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';
      if (isInputActive) return;

      if (gameState.appMode === 'boss') {
        const handledKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
        if (handledKeys.includes(e.key)) {
          e.preventDefault();
        }
      } else if (gameState.appMode === 'solver') {
        const handledKeys = ['ArrowLeft', 'ArrowRight', ' '];
        if (handledKeys.includes(e.key)) {
          e.preventDefault();
        }
      }

      initAudioCtx();

      if (gameState.appMode === 'solver') {
        if (e.key === ' ') {
          setGameState((prev) => ({ ...prev, isSolverPlaying: !prev.isSolverPlaying }));
        } else if (e.key === 'ArrowLeft') {
          setGameState((prev) => ({ ...prev, currentStepIndex: Math.max(0, prev.currentStepIndex - 1) }));
        } else if (e.key === 'ArrowRight') {
          setGameState((prev) => ({ ...prev, currentStepIndex: Math.min(prev.solverSteps.length - 1, prev.currentStepIndex + 1) }));
        }
      } else if (gameState.appMode === 'boss') {
        if (gameState.isGameOver || gameState.isVictory || gameState.isAnalysisGateActive) return;

        switch (e.key) {
          case 'ArrowLeft':
            setGameState((prev) => ({ ...prev, shipLane: Math.max(-1, prev.shipLane - 1) as Lane }));
            break;
          case 'ArrowRight':
            setGameState((prev) => ({ ...prev, shipLane: Math.min(1, prev.shipLane + 1) as Lane }));
            break;
          case 'ArrowUp':
            setGameState((prev) => (prev.shipState !== 'jumping' ? { ...prev, shipY: 70, shipState: 'jumping' } : prev));
            break;
          case 'ArrowDown':
            setGameState((prev) => (prev.shipState !== 'sliding' ? { ...prev, shipY: -25, shipState: 'sliding' } : prev));
            break;
          case ' ':
            handleFireBlaster();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initAudioCtx, gameState.appMode, gameState.isGameOver, gameState.isVictory, gameState.isAnalysisGateActive]);

  // Solver Lab Automated Playback Loop
  useEffect(() => {
    if (gameState.appMode !== 'solver' || !gameState.isSolverPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.currentStepIndex >= prev.solverSteps.length - 1) {
          return { ...prev, isSolverPlaying: false };
        }
        return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
      });
    }, 1200 / gameState.solverPlaybackSpeed);

    return () => clearInterval(interval);
  }, [gameState.appMode, gameState.isSolverPlaying, gameState.solverPlaybackSpeed]);

  // Fire Blaster Action for Boss mode
  const handleFireBlaster = () => {
    soundEngine.playLaser();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    spawnParticles(centerX, centerY, '#38bdf8', 25);
    spawnFloatingText(`💥 BLASTER BLAST! -40 DIM`, centerX, centerY, '#38bdf8', 20);

    setGameState((prev) => {
      const damage = 40;
      const nextHp = Math.max(0, prev.bossHp - damage);

      let isVictorious = false;
      if (nextHp <= 0) {
        isVictorious = true;
        soundEngine.playExplosion();
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }

      return {
        ...prev,
        bossHp: nextHp,
        score: prev.score + 100,
        isVictory: isVictorious,
        screenShake: 3,
      };
    });

    addLog("PARTICLE BLASTER FIRED! Lattice barrier damaged.", "player_action", "Blaster blast hit the Leviathan! (-40 Boss Entropy)");
  };

  // Boss Runner Mode 60 FPS update tick loop with Gate Countdown
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (gameState.appMode !== 'boss' || gameState.isGameOver || gameState.isVictory) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Handle Analysis Gate Checkpoint countdown
      if (gameState.isAnalysisGateActive) {
        setGameState((prev) => {
          const nextTimer = prev.gateTimer - dt;
          if (nextTimer <= 0) {
            // Timeout penalty: 25 HP damage, auto-resume
            soundEngine.playAlarm();
            addLog("ANALYSIS GATE TIMEOUT: Shield took 25 damage, flight resumed.", "boss_attack");
            const nextHp = Math.max(0, prev.playerHp - 25);
            return {
              ...prev,
              gateTimer: 8.0,
              isAnalysisGateActive: false,
              playerHp: nextHp,
              isGameOver: nextHp <= 0,
            };
          }
          return { ...prev, gateTimer: nextTimer };
        });
        return;
      }

      // Normal flight update
      setGameState((prev) => {
        const nextDist = prev.distance + prev.speed * 2.5;

        // Recover ship vertical position
        let nextShipY = prev.shipY;
        let nextShipState = prev.shipState;
        if (prev.shipState === 'jumping') {
          nextShipY = Math.max(0, prev.shipY - dt * 180);
          if (nextShipY === 0) nextShipState = 'normal';
        } else if (prev.shipState === 'sliding') {
          nextShipY = Math.min(0, prev.shipY + dt * 80);
          if (nextShipY === 0) nextShipState = 'normal';
        }

        // Trigger Analysis Gate Checkpoint at distance 300, 600, 900
        const intDist = Math.floor(nextDist);
        let triggerGate = false;
        if ((intDist === 300 || intDist === 600) && !prev.isAnalysisGateActive) {
          triggerGate = true;
          soundEngine.playAlarm();
        }

        return {
          ...prev,
          distance: nextDist,
          score: prev.score + 1,
          shipY: nextShipY,
          shipState: nextShipState,
          isAnalysisGateActive: triggerGate,
          gateTimer: triggerGate ? 8.0 : prev.gateTimer,
          gateHintUsed: triggerGate ? false : prev.gateHintUsed,
          gateEliminatedOptions: triggerGate ? [] : prev.gateEliminatedOptions,
          screenShake: Math.max(0, prev.screenShake - dt * 8),
        };
      });

      // Update Particles & Floating Texts
      setParticles((prev) => prev.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 })).filter((p) => p.life > 0));
      setFloatingTexts((prev) => prev.map((ft) => ({ ...ft, y: ft.y - 0.8, life: ft.life - 1 })).filter((ft) => ft.life > 0));

    }, 50);

    return () => clearInterval(interval);
  }, [gameState.appMode, gameState.isGameOver, gameState.isVictory, gameState.isAnalysisGateActive, addLog]);

  // Solver Matrix & Target Handlers
  const handleMatrixChange = (newMatrix: Matrix2D) => {
    const newSteps = generateLatticeSolution(newMatrix.b1, newMatrix.b2, gameState.solverTarget);
    setGameState((prev) => ({
      ...prev,
      solverMatrix: newMatrix,
      solverSteps: newSteps,
      currentStepIndex: 0,
    }));
    addLog("SOLVER MATRIX UPDATED: RE-CALCULATING LLL REDUCTION STEPS", "info");
  };

  const handleTargetChange = (newTarget: Vector2D) => {
    const newSteps = generateLatticeSolution(gameState.solverMatrix.b1, gameState.solverMatrix.b2, newTarget);
    setGameState((prev) => ({
      ...prev,
      solverTarget: newTarget,
      solverSteps: newSteps,
      currentStepIndex: 0,
    }));
  };

  const handleLoadPreset = (preset: SolverPreset) => {
    soundEngine.playParry(true);
    const newSteps = generateLatticeSolution(preset.matrix.b1, preset.matrix.b2, preset.target);
    setGameState((prev) => ({
      ...prev,
      solverMatrix: preset.matrix,
      solverTarget: preset.target,
      solverSteps: newSteps,
      currentStepIndex: 0,
    }));
    addLog(`LOADED PRESET: ${preset.name}`, "critical", preset.description);
  };

  // Auto-Snap Solution in Academy
  const handleAutoSnap = (targetVal: number) => {
    soundEngine.playParry(true);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles(centerX, centerY, '#34d399', 30);
    spawnFloatingText(`✨ AUTO-SNAPPED TO ${targetVal}°!`, centerX, centerY, '#34d399', 20);
    setGameState((prev) => ({ ...prev, interactiveAngle: targetVal }));
    addLog(`Auto-snapped angle to target ${targetVal}°!`, "player_action");
  };

  // Analysis Gate Checkpoint Handler
  const handleAnalysisGateAnswer = (optionIdx: number) => {
    if (optionIdx === gameState.correctOptionIndex) {
      soundEngine.playParry(true);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      spawnParticles(centerX, centerY, '#34d399', 40);
      spawnFloatingText(`✨ CORRECT ANALYSIS! +STAGE BOOST`, centerX, centerY, '#34d399', 24);
      addLog("ANALYSIS GATE PASSED! Vector reduction optimal.", "critical");
      setGameState((prev) => ({
        ...prev,
        isAnalysisGateActive: false,
        score: prev.score + 1000,
        bossHp: Math.max(0, prev.bossHp - 100),
      }));
    } else {
      soundEngine.playAlarm();
      spawnFloatingText(`❌ INCORRECT! -25 HP`, window.innerWidth / 2, window.innerHeight / 2, '#f43f5e', 22);
      addLog("ANALYSIS GATE FAILED: Moderate damage sustained (-25 HP).", "boss_attack");
      const nextHp = Math.max(0, gameState.playerHp - 25);
      setGameState((prev) => ({
        ...prev,
        isAnalysisGateActive: false,
        playerHp: nextHp,
        isGameOver: nextHp <= 0,
      }));
    }
  };

  // Analysis Gate 50/50 Hint Handler
  const handleAnalysisGateHint = () => {
    if (gameState.gateHintUsed) return;
    soundEngine.playAnchor();
    const wrongIndices = gameState.gateOptions
      .map((_, idx) => idx)
      .filter((idx) => idx !== gameState.correctOptionIndex);

    if (wrongIndices.length > 0) {
      const eliminated = wrongIndices[0];
      setGameState((prev) => ({
        ...prev,
        gateHintUsed: true,
        gateEliminatedOptions: [...prev.gateEliminatedOptions, eliminated],
      }));
      addLog("50/50 HINT USED: Incorrect option eliminated.", "info");
    }
  };

  // Reset Boss Runner in-memory (no full page reload)
  const handleRestartBoss = () => {
    setGameState((prev) => ({
      ...prev,
      bossHp: 768,
      playerHp: 100,
      distance: 0,
      score: 0,
      isGameOver: false,
      isVictory: false,
      isAnalysisGateActive: false,
      shipLane: 0,
      shipY: 0,
      shipState: 'normal',
    }));
    addLog("RUNNER REBOOTED: IN-MEMORY RESTART SUCCESSFUL", "warning");
  };

  return (
    <div onClick={initAudioCtx} className="flex flex-col min-h-screen w-full bg-slate-950 text-slate-100 p-2 sm:p-3 gap-2 scanline select-none overflow-x-hidden overflow-y-auto">
      {/* Audio Gesture Unlock Banner */}
      {!gameState.audioInitialized && (
        <div
          onClick={initAudioCtx}
          className="bg-cyan-950/90 border border-cyan-500/80 px-4 py-1.5 rounded-lg text-xs font-bold text-cyan-200 flex items-center justify-between shadow-lg cursor-pointer shrink-0 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio suspended by browser policy. Click anywhere to activate SFX!</span>
          </div>
          <span className="text-[11px] bg-cyan-900 px-2 py-0.5 rounded text-cyan-300">ACTIVATE</span>
        </div>
      )}

      {/* Top Main Header */}
      <header className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 backdrop-blur shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100 font-mono">
            KYBER: <span className="text-cyan-400">THE MODULE LEVIATHAN</span>
          </h1>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
            Pedagogical Math & Lattice Solver Engine
          </span>
        </div>
      </header>

      {/* Navigation HUD Mode Switcher */}
      <div className="shrink-0">
        <HUD
          gameState={gameState}
          onSelectMode={(mode) => setGameState((prev) => ({ ...prev, appMode: mode }))}
          onToggleAudio={() => {
            const nextMuted = !gameState.audioMuted;
            soundEngine.setMuted(nextMuted);
            setGameState((prev) => ({ ...prev, audioMuted: nextMuted }));
          }}
          onOpenDrawer={() => setGameState((prev) => ({ ...prev, isDrawerOpen: true }))}
          onOpenInstructions={() => setGameState((prev) => ({ ...prev, showInstructionsModal: true }))}
          onToggleAcademyCard={handleToggleAcademyCard}
          onToggleSolverControls={handleToggleSolverControls}
          onToggleTelemetryLog={handleToggleTelemetryLog}
          onToggleBossStats={handleToggleBossStats}
          onToggleFocusMode={handleToggleFocusMode}
          onTouchMoveLane={(dir) =>
            setGameState((prev) => ({
              ...prev,
              shipLane: (dir === 'left' ? Math.max(-1, prev.shipLane - 1) : Math.min(1, prev.shipLane + 1)) as Lane,
            }))
          }
          onTouchJump={() =>
            setGameState((prev) => (prev.shipState !== 'jumping' ? { ...prev, shipY: 70, shipState: 'jumping' } : prev))
          }
          onTouchSlide={() =>
            setGameState((prev) => (prev.shipState !== 'sliding' ? { ...prev, shipY: -25, shipState: 'sliding' } : prev))
          }
          onTouchFire={handleFireBlaster}
        />
      </div>

      {/* Main Mode Body */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2.5">
        {/* Left Column: Active Mode UI & Canvas */}
        <div className={`${gameState.isTelemetryLogOpen ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col gap-2 relative`}>
          {/* MODE 1: THE ACADEMY */}
          {gameState.appMode === 'academy' && (
            gameState.isAcademyCardOpen ? (
              <AcademyMode
                currentChapterId={gameState.academyChapter}
                onSelectChapter={(chId) => setGameState((prev) => ({ ...prev, academyChapter: chId }))}
                onOpenDrawer={() => setGameState((prev) => ({ ...prev, isDrawerOpen: true }))}
                onAutoSnap={handleAutoSnap}
                onClose={() => setGameState((prev) => ({ ...prev, isAcademyCardOpen: false }))}
                onCompleteChapter={() => {
                  soundEngine.playParry(true);
                  addLog(`COMPLETED CHAPTER ${gameState.academyChapter}!`, "critical");
                  setGameState((prev) => ({ ...prev, academyChapter: Math.min(5, prev.academyChapter + 1) }));
                }}
              />
            ) : (
              <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-2.5 backdrop-blur flex items-center justify-between shadow-xl gap-2 font-mono">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Ch. 0{gameState.academyChapter}: {ACADEMY_CHAPTERS.find((c) => c.id === gameState.academyChapter)?.title.split(': ')[1]}
                  </span>
                  <span className="hidden sm:inline text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    Lesson Hidden • Canvas Focus Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, isDrawerOpen: true }))}
                    className="text-[11px] font-bold px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 min-h-[36px] flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">OPEN</span> DRAWER
                  </button>
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, isAcademyCardOpen: true }))}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 min-h-[36px] flex items-center gap-1 shadow-md transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> REOPEN LESSON
                  </button>
                </div>
              </div>
            )
          )}

          {/* MODE 2: THE GEOMETRIC SOLVER LAB */}
          {gameState.appMode === 'solver' && (
            gameState.isSolverControlsOpen ? (
              <SolverLab
                matrix={gameState.solverMatrix}
                target={gameState.solverTarget}
                steps={gameState.solverSteps}
                currentStepIndex={gameState.currentStepIndex}
                isPlaying={gameState.isSolverPlaying}
                playbackSpeed={gameState.solverPlaybackSpeed}
                onMatrixChange={handleMatrixChange}
                onTargetChange={handleTargetChange}
                onStepIndexChange={(idx) => setGameState((prev) => ({ ...prev, currentStepIndex: idx }))}
                onTogglePlay={() => setGameState((prev) => ({ ...prev, isSolverPlaying: !prev.isSolverPlaying }))}
                onSpeedChange={(speed) => setGameState((prev) => ({ ...prev, solverPlaybackSpeed: speed }))}
                onLoadPreset={handleLoadPreset}
                onClose={() => setGameState((prev) => ({ ...prev, isSolverControlsOpen: false }))}
              />
            ) : (
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-2.5 backdrop-blur flex flex-wrap items-center justify-between shadow-xl gap-2 font-mono">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, currentStepIndex: 0 }))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, currentStepIndex: Math.max(0, prev.currentStepIndex - 1) }))}
                    disabled={gameState.currentStepIndex === 0}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Previous"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, isSolverPlaying: !prev.isSolverPlaying }))}
                    className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title={gameState.isSolverPlaying ? 'Pause' : 'Play'}
                  >
                    {gameState.isSolverPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, currentStepIndex: Math.min(prev.solverSteps.length - 1, prev.currentStepIndex + 1) }))}
                    disabled={gameState.currentStepIndex === gameState.solverSteps.length - 1}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Next"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-amber-300 ml-1">
                    Step {gameState.currentStepIndex + 1}/{gameState.solverSteps.length}: {gameState.solverSteps[gameState.currentStepIndex]?.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, isSolverControlsOpen: true }))}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 min-h-[36px] flex items-center gap-1 shadow-md transition"
                  >
                    <Sliders className="w-3.5 h-3.5" /> REOPEN CONTROLS
                  </button>
                </div>
              </div>
            )
          )}

          {/* Interactive Topological Inspection Canvas Container */}
          <div
            className={`w-full relative transition-all duration-300 ${
              (gameState.appMode === 'academy' && !gameState.isAcademyCardOpen) ||
              (gameState.appMode === 'solver' && !gameState.isSolverControlsOpen) ||
              (gameState.appMode === 'boss' && !gameState.isBossStatsOpen)
                ? 'h-[75vh] sm:h-[82vh] min-h-[520px]'
                : 'h-[50vh] sm:h-[58vh] min-h-[420px]'
            }`}
          >
            <LatticeCanvas
              gameState={gameState}
              particles={particles}
              floatingTexts={floatingTexts}
              onAnalysisGateAnswer={handleAnalysisGateAnswer}
              onAnalysisGateHint={handleAnalysisGateHint}
            />
          </div>
        </div>

        {/* Right Column: Telemetry Log */}
        {gameState.isTelemetryLogOpen && (
          <div className="lg:col-span-1 flex flex-col min-h-[300px] lg:min-h-0">
            <CombatLog logs={logs} onClose={() => setGameState((prev) => ({ ...prev, isTelemetryLogOpen: false }))} />
          </div>
        )}
      </main>

      {/* Floating Reopen Button for Telemetry Log when closed */}
      {!gameState.isTelemetryLogOpen && (
        <button
          onClick={() => setGameState((prev) => ({ ...prev, isTelemetryLogOpen: true }))}
          className="fixed bottom-4 right-4 z-40 bg-slate-900/90 border border-emerald-500/70 text-emerald-300 hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-bold shadow-2xl backdrop-blur flex items-center gap-2 transition"
          title="Reopen Cryptanalysis Telemetry Log"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>REOPEN LOG ({logs.length})</span>
        </button>
      )}

      {/* Collapsible Explanatory Slide-out Drawer */}
      <ExplanatoryDrawer
        isOpen={gameState.isDrawerOpen}
        onClose={() => setGameState((prev) => ({ ...prev, isDrawerOpen: false }))}
        chapter={ACADEMY_CHAPTERS.find((c) => c.id === gameState.academyChapter)}
        interactiveAngle={gameState.interactiveAngle}
        onAngleChange={(angle) => setGameState((prev) => ({ ...prev, interactiveAngle: angle }))}
      />

      {/* Onboarding Instructions Modal */}
      {gameState.showInstructionsModal && (
        <OnboardingModal
          onClose={() => setGameState((prev) => ({ ...prev, showInstructionsModal: false }))}
          onEnableFlowMode={() => setGameState((prev) => ({ ...prev, isFlowMode: true }))}
        />
      )}

      {/* Victory Modal */}
      {gameState.isVictory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-400">PEDAGOGICAL PLATFORM MASTERED!</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              You mastered visual vector theory, basis reduction, LLL Gram-Schmidt decomposition, and Babai CVP!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRestartBoss}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-slate-950 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" /> PLAY AGAIN
              </button>
              <button
                onClick={() => setGameState((prev) => ({ ...prev, appMode: 'academy', isVictory: false }))}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                ACADEMY <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold text-rose-400">SHIP SHIELD CRASHED</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your starfighter took too much noise damage. Review concepts in The Academy or try again!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRestartBoss}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 font-bold rounded-lg text-slate-950 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" /> TRY AGAIN
              </button>
              <button
                onClick={() => setGameState((prev) => ({ ...prev, appMode: 'academy', isGameOver: false }))}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                ACADEMY <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
