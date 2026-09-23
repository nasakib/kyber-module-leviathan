import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  BossPhase,
  CombatLogEntry,
  Particle,
  FloatingText,
  RunnerObstacle,
  RunnerPowerUp,
  Lane,
  LevelId,
} from './types/game';
import { soundEngine } from './utils/audio';
import { LatticeCanvas } from './components/LatticeCanvas';
import { HUD } from './components/HUD';
import { CombatLog } from './components/CombatLog';
import { OnboardingModal } from './components/OnboardingModal';
import { Cpu, Trophy } from 'lucide-react';

const BOSS_PHASES: Record<number, BossPhase> = {
  1: {
    id: 1,
    name: "Kannan's Embedding",
    subtitle: "Lattice Primal Binding (100% - 75% HP)",
    minHpPercent: 75,
    description: "Leviathan hovers in noisy space. Collect vector Orbs and dodge noise barriers!",
    tacticalTip: "Use ARROW KEYS (← →) to change lanes, (↑) to JUMP over barriers, and (↓) to SLIDE!",
  },
  2: {
    id: 2,
    name: "LLL Parry Dance",
    subtitle: "Lovász Basis Reduction (75% - 40% HP)",
    minHpPercent: 40,
    description: "Matrix shears sweep across lanes. Slide under high gates using (↓) Down Arrow!",
    tacticalTip: "Press (↓) DOWN ARROW to SLIDE under high matrix shear gates!",
  },
  3: {
    id: 3,
    name: "BKZ Battery & Sieving",
    subtitle: "Block Reduction & Memory Heat (40% - 10% HP)",
    minHpPercent: 10,
    description: "Collect STEM powerups (F_net, det(A), ∇V) to blast the Leviathan's core!",
    tacticalTip: "Press [SPACEBAR] to fire your particle blaster and blast barriers!",
  },
  4: {
    id: 4,
    name: "uSVP Core Strike",
    subtitle: "De-encapsulation Final Strike (10% - 0% HP)",
    minHpPercent: 0,
    description: "Final strike window! Collect the anomalous vector orb to win!",
    tacticalTip: "FINAL STRIKE! Dodge barriers and press [SPACEBAR] to de-encapsulate!",
  },
};

export function App() {
  const [gameState, setGameState] = useState<GameState>({
    shipLane: 0,
    shipY: 0,
    shipState: 'normal',
    speed: 1.0,
    distance: 0,
    score: 0,
    obstacles: [],
    powerups: [],
    isFlowMode: true,
    showInstructionsModal: false,
    activeLevel: 1,
    unlockedLevels: [1, 2, 3, 4],
    levelProgress: { 1: false, 2: false, 3: false, 4: false },
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
    tacticalHint: "Use ARROW KEYS (← →) to change lanes, (↑) to JUMP, (↓) to SLIDE, [SPACE] to BLAST!",
    isGameOver: false,
    isVictory: false,
    audioMuted: false,
    audioInitialized: false,
  });

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
    addLog("SPACE RUNNER ENGINE INITIALIZED: USE ARROW KEYS TO FLY", "warning", "Controls: Arrow Left/Right to change lanes, Up to jump, Down to slide, Space to shoot!");
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

  // Handle Arrow Key Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      initAudioCtx();
      if (gameState.isGameOver || gameState.isVictory) return;

      switch (e.key) {
        case 'ArrowLeft':
          setGameState((prev) => {
            const nextLane = Math.max(-1, prev.shipLane - 1) as Lane;
            soundEngine.playAnchor();
            return { ...prev, shipLane: nextLane };
          });
          break;

        case 'ArrowRight':
          setGameState((prev) => {
            const nextLane = Math.min(1, prev.shipLane + 1) as Lane;
            soundEngine.playAnchor();
            return { ...prev, shipLane: nextLane };
          });
          break;

        case 'ArrowUp':
          setGameState((prev) => {
            if (prev.shipState !== 'jumping') {
              soundEngine.playParry(true);
              return { ...prev, shipY: 70, shipState: 'jumping' };
            }
            return prev;
          });
          break;

        case 'ArrowDown':
          setGameState((prev) => {
            if (prev.shipState !== 'sliding') {
              soundEngine.playCoolant();
              return { ...prev, shipY: -25, shipState: 'sliding' };
            }
            return prev;
          });
          break;

        case ' ': // Spacebar to Blast
          handleFireBlaster();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initAudioCtx, gameState.isGameOver, gameState.isVictory]);

  // Fire Blaster Action
  const handleFireBlaster = () => {
    soundEngine.playLaser();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    spawnParticles(centerX, centerY, '#38bdf8', 25);
    spawnFloatingText(`💥 BLASTER BLAST! -40 DIM`, centerX, centerY, '#38bdf8', 20);

    setGameState((prev) => {
      const damage = 40;
      const nextHp = Math.max(0, prev.bossHp - damage);

      // Check obstacle destruction in current lane
      const updatedObstacles = prev.obstacles.filter(
        (obs) => !(obs.lane === prev.shipLane && obs.z > 50)
      );

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
        obstacles: updatedObstacles,
        isVictory: isVictorious,
        screenShake: 3,
      };
    });

    addLog("PARTICLE BLASTER FIRED! Lattice barrier damaged.", "player_action", "Blaster blast hit the Leviathan! (-40 Boss Entropy)");
  };

  // Main 60 FPS Tunnel Runner physics update loop
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (gameState.isGameOver || gameState.isVictory) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight - 100;

      // 1. Update Distance, Score & Gravity
      setGameState((prev) => {
        const nextDist = prev.distance + prev.speed * 2.5;
        const nextScore = prev.score + Math.round(prev.speed);

        // Ship gravity recovery (jumping & sliding)
        let nextShipY = prev.shipY;
        let nextShipState = prev.shipState;

        if (prev.shipState === 'jumping') {
          nextShipY = Math.max(0, prev.shipY - dt * 180);
          if (nextShipY === 0) nextShipState = 'normal';
        } else if (prev.shipState === 'sliding') {
          nextShipY = Math.min(0, prev.shipY + dt * 80);
          if (nextShipY === 0) nextShipState = 'normal';
        }

        // Check boss phase transition
        const hpPercent = (prev.bossHp / prev.maxBossHp) * 100;
        let nextPhase: LevelId = prev.bossPhase;
        if (hpPercent <= 10) nextPhase = 4;
        else if (hpPercent <= 40) nextPhase = 3;
        else if (hpPercent <= 75) nextPhase = 2;

        return {
          ...prev,
          distance: nextDist,
          score: nextScore,
          shipY: nextShipY,
          shipState: nextShipState,
          bossPhase: nextPhase,
          screenShake: Math.max(0, prev.screenShake - dt * 8),
        };
      });

      // 2. Obstacle Spawner (Random Lanes)
      if (Math.random() < 0.05) {
        const randomLane = (Math.floor(Math.random() * 3) - 1) as Lane;
        const types: ('low_barrier' | 'high_gate' | 'full_wall')[] = ['low_barrier', 'high_gate', 'full_wall'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const labels = {
          low_barrier: 'NOISE (JUMP ↑)',
          high_gate: 'SHEAR (SLIDE ↓)',
          full_wall: 'WALL (DODGE ← →)',
        };
        const colors = {
          low_barrier: '#f43f5e',
          high_gate: '#fbbf24',
          full_wall: '#e11d48',
        };

        setGameState((prev) => ({
          ...prev,
          obstacles: [
            ...prev.obstacles,
            {
              id: Math.random().toString(),
              lane: randomLane,
              z: 0,
              type: chosenType,
              label: labels[chosenType],
              color: colors[chosenType],
            },
          ],
        }));
      }

      // 3. STEM Powerup Spawner
      if (Math.random() < 0.03) {
        const randomLane = (Math.floor(Math.random() * 3) - 1) as Lane;
        const powerupTypes: ('vector_fnet' | 'det_area' | 'grad_v')[] = ['vector_fnet', 'det_area', 'grad_v'];
        const chosenPw = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        const labels = { vector_fnet: 'F_net', det_area: 'det(A)', grad_v: '∇V' };
        const colors = { vector_fnet: '#34d399', det_area: '#22d3ee', grad_v: '#a855f7' };

        setGameState((prev) => ({
          ...prev,
          powerups: [
            ...prev.powerups,
            {
              id: Math.random().toString(),
              lane: randomLane,
              z: 0,
              type: chosenPw,
              label: labels[chosenPw],
              color: colors[chosenPw],
            },
          ],
        }));
      }

      // 4. Move & Collide Obstacles
      setGameState((prev) => {
        const remainingObstacles: RunnerObstacle[] = [];
        let hitHpLoss = 0;

        prev.obstacles.forEach((obs) => {
          const newZ = obs.z + prev.speed * 2.2;

          if (newZ >= 90 && newZ <= 100 && obs.lane === prev.shipLane) {
            // Collision Check!
            let isSafe = false;

            if (obs.type === 'low_barrier' && prev.shipY > 40) isSafe = true; // jumped over
            if (obs.type === 'high_gate' && prev.shipY < -15) isSafe = true; // slided under

            if (!isSafe) {
              hitHpLoss += 15;
              spawnParticles(centerX, centerY, '#f43f5e', 30);
              spawnFloatingText(`💥 IMPACT! -15 HP`, centerX, centerY, '#f43f5e', 22);
              soundEngine.playAlarm();
              addLog(`COLLISION IMPACT with ${obs.label}!`, "boss_attack", "Obstacle hit! Dodge with Arrow Keys!");
            }
          } else if (newZ < 100) {
            remainingObstacles.push({ ...obs, z: newZ });
          }
        });

        const nextHp = Math.max(0, prev.playerHp - hitHpLoss);
        let gameOver = prev.isGameOver;

        if (nextHp <= 0) {
          gameOver = true;
          soundEngine.playExplosion();
          addLog("SHIP INTEGRITY DESTROYED BY NOISE BARRIERS", "critical", "Game Over! Press Restart to try again.");
        }

        return {
          ...prev,
          obstacles: remainingObstacles,
          playerHp: nextHp,
          isGameOver: gameOver,
          screenShake: hitHpLoss > 0 ? 5 : prev.screenShake,
        };
      });

      // 5. Move & Collect Powerups
      setGameState((prev) => {
        const remainingPowerups: RunnerPowerUp[] = [];
        let scoreAdd = 0;
        let bossDamageAdd = 0;

        prev.powerups.forEach((pw) => {
          const newZ = pw.z + prev.speed * 2.2;

          if (newZ >= 90 && newZ <= 100 && pw.lane === prev.shipLane) {
            // Collect Powerup!
            soundEngine.playParry(true);
            scoreAdd += 500;
            bossDamageAdd += 35;

            spawnParticles(centerX, centerY, pw.color, 25);
            spawnFloatingText(`✨ COLLECTED ${pw.label}! +500 PTS`, centerX, centerY, pw.color, 20);
            addLog(`COLLECTED STEM POWERUP (${pw.label})!`, "player_action", `Collected ${pw.label}! (-35 Boss Entropy, +500 PTS)`);
          } else if (newZ < 100) {
            remainingPowerups.push({ ...pw, z: newZ });
          }
        });

        const nextBossHp = Math.max(0, prev.bossHp - bossDamageAdd);
        let isVictorious = prev.isVictory;

        if (nextBossHp <= 0) {
          isVictorious = true;
          soundEngine.playExplosion();
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        }

        return {
          ...prev,
          powerups: remainingPowerups,
          score: prev.score + scoreAdd,
          bossHp: nextBossHp,
          isVictory: isVictorious,
        };
      });

      // 6. Update Particle & Floating Text physics
      setParticles((prev) => prev.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 })).filter((p) => p.life > 0));
      setFloatingTexts((prev) => prev.map((ft) => ({ ...ft, y: ft.y - 0.8, life: ft.life - 1 })).filter((ft) => ft.life > 0));

    }, 50);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isVictory, addLog]);

  // Restart Handler
  const handleRestart = () => {
    setGameState({
      shipLane: 0,
      shipY: 0,
      shipState: 'normal',
      speed: 1.0,
      distance: 0,
      score: 0,
      obstacles: [],
      powerups: [],
      isFlowMode: true,
      showInstructionsModal: false,
      activeLevel: 1,
      unlockedLevels: [1, 2, 3, 4],
      levelProgress: { 1: false, 2: false, 3: false, 4: false },
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
      tacticalHint: "Use ARROW KEYS (← →) to change lanes, (↑) to JUMP, (↓) to SLIDE, [SPACE] to BLAST!",
      isGameOver: false,
      isVictory: false,
      audioMuted: false,
      audioInitialized: true,
    });
    setLogs([]);
    setFloatingTexts([]);
    addLog("SPACE RUNNER ENGINE REBOOTED", "warning", "Reboot complete! Fly with Arrow Keys!");
  };

  return (
    <div onClick={initAudioCtx} className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 p-2.5 gap-2 scanline select-none overflow-hidden">
      <header className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 backdrop-blur shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100 font-mono">
            KYBER: <span className="text-cyan-400">LATTICE TUNNEL RUNNER</span>
          </h1>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
            3D Space Subway Surfers Arcade Mode
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2.5 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-0 relative">
          <LatticeCanvas
            gameState={gameState}
            particles={particles}
            floatingTexts={floatingTexts}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col min-h-0">
          <CombatLog logs={logs} />
        </div>
      </main>

      <footer className="shrink-0">
        <HUD
          gameState={gameState}
          currentPhaseInfo={BOSS_PHASES[gameState.bossPhase]}
          onToggleAudio={() => {
            const nextMuted = !gameState.audioMuted;
            soundEngine.setMuted(nextMuted);
            setGameState((prev) => ({ ...prev, audioMuted: nextMuted }));
          }}
          onToggleFlowMode={() => setGameState((prev) => ({ ...prev, isFlowMode: !prev.isFlowMode }))}
          onOpenInstructions={() => setGameState((prev) => ({ ...prev, showInstructionsModal: true }))}
        />
      </footer>

      {/* Onboarding Instructions Modal */}
      {gameState.showInstructionsModal && (
        <OnboardingModal
          onClose={() => setGameState((prev) => ({ ...prev, showInstructionsModal: false }))}
          onEnableFlowMode={() => setGameState((prev) => ({ ...prev, isFlowMode: true }))}
        />
      )}

      {/* Victory Modal */}
      {gameState.isVictory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 font-mono">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-400">KYBER LEVIATHAN DESTROYED!</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Awesome job! You navigated the 3D lattice tunnel, dodged noise barriers, collected STEM energy crystals, and blasted the Kyber Leviathan!
            </p>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-left text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Final Distance:</span>
                <span className="text-cyan-400 font-bold">{Math.round(gameState.distance)} M</span>
              </div>
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="text-amber-400 font-bold">{gameState.score} PTS</span>
              </div>
            </div>
            <button onClick={handleRestart} className="w-full py-3 bg-emerald-600 font-bold rounded-lg text-slate-950">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 font-mono">
            <h2 className="text-2xl font-bold text-rose-400">SHIP SHIELD CRASHED</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Noise barriers destroyed your starfighter! Tip: Use Up Arrow (↑) to JUMP over red low barriers and Down Arrow (↓) to SLIDE under yellow gates!
            </p>
            <button onClick={handleRestart} className="w-full py-3 bg-rose-600 font-bold rounded-lg text-slate-950">
              REBOOT RUNNER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
