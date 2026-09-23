import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  BossPhase,
  Weapon,
  CombatLogEntry,
  Particle,
  BossProjectile,
  ParryRing,
  TargetCore,
  WeaponId,
} from './types/game';
import { soundEngine } from './utils/audio';
import { LatticeCanvas } from './components/LatticeCanvas';
import { HUD } from './components/HUD';
import { CombatLog } from './components/CombatLog';
import { Shield, Trophy, RefreshCw, Cpu, Award } from 'lucide-react';

const BOSS_PHASES: Record<number, BossPhase> = {
  1: {
    id: 1,
    name: "Kannan's Embedding",
    subtitle: "Lattice Primal Binding (100% - 75% HP)",
    minHpPercent: 75,
    description: "Leviathan hovers in noisy space (t = As + e). Deploy Kannan's Anchor to bind the target vector.",
  },
  2: {
    id: 2,
    name: "LLL Parry Dance",
    subtitle: "Lovász Basis Reduction (75% - 40% HP)",
    minHpPercent: 40,
    description: "Boss sweeps skewed basis vectors. Time LLL Shears when vectors align (δ = 0.75).",
  },
  3: {
    id: 3,
    name: "BKZ Battery & Sieving",
    subtitle: "Block Reduction & Memory Heat (40% - 10% HP)",
    minHpPercent: 10,
    description: "Dial Block Size (β) from 20 to 120. Higher β deals massive damage but builds Memory Heat (2^0.292β ops).",
  },
  4: {
    id: 4,
    name: "uSVP Core Strike",
    subtitle: "De-encapsulation Final Strike (10% - 0% HP)",
    minHpPercent: 0,
    description: "Noise separates from Gaussian background. Click the anomalous vector on canvas to de-encapsulate!",
  },
};

const INITIAL_WEAPONS: Weapon[] = [
  {
    id: 'kannan',
    name: "Kannan's Anchor",
    cooldown: 4.0,
    currentCooldown: 0,
    description: "Locks target vector into primal lattice coordinates.",
    shortcut: '1',
    iconName: 'anchor',
  },
  {
    id: 'lll',
    name: 'LLL Shearing Blades',
    cooldown: 1.2,
    currentCooldown: 0,
    description: "Size-reduces basis vectors. Bonus damage when timed with Lovász threshold (δ=0.75).",
    shortcut: '2',
    iconName: 'scissors',
  },
  {
    id: 'bkz',
    name: 'BKZ Siege Cannon',
    cooldown: 0.5,
    currentCooldown: 0,
    description: "Deals heavy damage scaling with Block Size β. Fills Memory Heat buffer.",
    shortcut: '3',
    iconName: 'flame',
  },
  {
    id: 'visor',
    name: 'Gram-Schmidt Visor',
    cooldown: 0.0,
    currentCooldown: 0,
    description: "Toggles orthogonal projection planes (b_i*) on canvas.",
    shortcut: '4',
    iconName: 'eye',
  },
  {
    id: 'coolant',
    name: 'Sieve Coolant',
    cooldown: 6.0,
    currentCooldown: 0,
    description: "Flushes Sieve Memory Heat buffer by 40%.",
    shortcut: '5',
    iconName: 'wind',
  },
];

export function App() {
  const [gameState, setGameState] = useState<GameState>({
    bossHp: 768,
    maxBossHp: 768,
    bossPhase: 1,
    playerHp: 100,
    maxPlayerHp: 100,
    memoryHeat: 0,
    bkzBeta: 40,
    gramSchmidtVisor: false,
    lovaszAngle: 0,
    lovaszThresholdSatisfied: false,
    isGameOver: false,
    isVictory: false,
    overheated: false,
    audioMuted: false,
    audioInitialized: false,
  });

  const [weapons, setWeapons] = useState<Weapon[]>(INITIAL_WEAPONS);
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [projectiles, setProjectiles] = useState<BossProjectile[]>([]);
  const [parryRing, setParryRing] = useState<ParryRing | null>({
    id: 'ring-1',
    radius: 180,
    targetRadius: 40,
    speed: 1.5,
    active: true,
    angle: 0,
  });

  const [targetCore, setTargetCore] = useState<TargetCore | null>(null);

  // Helper log function
  const addLog = useCallback((text: string, type: CombatLogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [
      ...prev.slice(-40), // keep last 40 logs
      {
        id: Math.random().toString(),
        timestamp,
        text,
        type,
      },
    ]);
  }, []);

  // Initial welcome log
  useEffect(() => {
    addLog("MODULE LEVIATHAN DETECTED: KYBER-768 INITIALIZED", "warning");
    addLog("ENGAGING LATTICE-BASED CRYPTANALYSIS PROTOCOL", "info");
    addLog("Phase 1 Active: Kannan's Embedding (t = As + e). Deploy Anchor!", "phase_change");
  }, [addLog]);

  // Audio setup on user interaction
  const initAudioCtx = useCallback(() => {
    if (!gameState.audioInitialized) {
      soundEngine.init();
      setGameState((prev) => ({ ...prev, audioInitialized: true }));
    }
  }, [gameState.audioInitialized]);

  // Particle generator helper
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

  // Main game tick loop (50ms ~ 20 updates per sec for physics/game rules)
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (gameState.isGameOver || gameState.isVictory) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // 1. Decrement Cooldowns
      setWeapons((prev) =>
        prev.map((w) => ({
          ...w,
          currentCooldown: Math.max(0, w.currentCooldown - dt),
        }))
      );

      // 2. Skew Angle & Lovász Threshold calculation
      setGameState((prev) => {
        const newAngle = (prev.lovaszAngle + dt * 1.8) % (Math.PI * 2);
        // Lovász condition satisfied when angle aligns with sweet spot near ~0.75 rad (or multiples)
        const angleMod = Math.abs(Math.sin(newAngle * 2));
        const thresholdMet = angleMod > 0.85;

        // Check phase transitions based on HP ratio
        const hpPercent = (prev.bossHp / prev.maxBossHp) * 100;
        let newPhase = prev.bossPhase;

        if (hpPercent <= 10 && prev.bossPhase < 4) {
          newPhase = 4;
          addLog("PHASE 4: uSVP CORE STRIKE! Target vector exposed!", "critical");
          soundEngine.playAlarm();
        } else if (hpPercent <= 40 && hpPercent > 10 && prev.bossPhase < 3) {
          newPhase = 3;
          addLog("PHASE 3: BKZ BATTERY & SIEVING ENGAGED! Adjust Block Size β!", "phase_change");
          soundEngine.playAlarm();
        } else if (hpPercent <= 75 && hpPercent > 40 && prev.bossPhase < 2) {
          newPhase = 2;
          addLog("PHASE 2: LLL PARRY DANCE! Time shears with Lovász condition (δ=0.75).", "phase_change");
          soundEngine.playAlarm();
        }

        // Passive memory heat decay
        const newHeat = Math.max(0, prev.memoryHeat - dt * 3);

        return {
          ...prev,
          lovaszAngle: newAngle,
          lovaszThresholdSatisfied: thresholdMet,
          bossPhase: newPhase,
          memoryHeat: newHeat,
        };
      });

      // 3. Update Parry Ring for Phase 2
      setParryRing((prev) => {
        if (!prev) return null;
        let newRadius = prev.radius - prev.speed * 2.5;
        if (newRadius <= 20) {
          newRadius = 200;
        }
        return {
          ...prev,
          radius: newRadius,
        };
      });

      // 4. Update Phase 4 Core target vector positioning
      if (gameState.bossPhase === 4) {
        setTargetCore((prev) => {
          if (!prev) {
            return {
              x: (Math.random() - 0.5) * 200,
              y: (Math.random() - 0.5) * 200,
              active: true,
              pulseTimer: 0,
            };
          }
          return {
            ...prev,
            pulseTimer: prev.pulseTimer + dt,
          };
        });
      }

      // 5. Boss Attack Spawner
      if (Math.random() < 0.04) {
        const attackType = Math.random() > 0.5 ? 'binomial' : 'modular_shear';
        const color = attackType === 'binomial' ? '#f43f5e' : '#fbbf24';
        const damage = attackType === 'binomial' ? 8 : 12;

        setProjectiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
            y: window.innerHeight / 2 - 100,
            targetX: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
            targetY: window.innerHeight - 50,
            speed: 4 + Math.random() * 3,
            damage,
            type: attackType,
            color,
            radius: attackType === 'binomial' ? 5 : 8,
          },
        ]);
      }

      // 6. Projectile movement & collision with player shield
      setProjectiles((prev) => {
        const updated: BossProjectile[] = [];
        prev.forEach((p) => {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 10) {
            // Hit player
            setGameState((state) => {
              const nextHp = state.playerHp - p.damage;
              if (nextHp <= 0) {
                addLog("CRITICAL FAILURE: SYSTEM INTEGRITY DESTROYED BY LATTICE NOISE", "critical");
                soundEngine.playExplosion();
                return { ...state, playerHp: 0, isGameOver: true };
              }
              return { ...state, playerHp: nextHp };
            });
            addLog(`Shield Impact! ${p.type.toUpperCase()} dealt ${p.damage} damage.`, "boss_attack");
            soundEngine.playAlarm();
          } else {
            updated.push({
              ...p,
              x: p.x + (dx / dist) * p.speed,
              y: p.y + (dy / dist) * p.speed,
            });
          }
        });
        return updated;
      });

      // 7. Particle physics
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );

    }, 50);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isVictory, gameState.bossPhase, addLog]);

  // Weapon Trigger Handler
  const handleUseWeapon = (weaponId: WeaponId) => {
    initAudioCtx();

    if (gameState.isGameOver || gameState.isVictory) return;

    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon || weapon.currentCooldown > 0) return;

    // Trigger specific weapon mechanics
    switch (weaponId) {
      case 'kannan': {
        soundEngine.playAnchor();
        const damage = gameState.bossPhase === 1 ? 95 : 35;
        setGameState((prev) => {
          const nextHp = Math.max(0, prev.bossHp - damage);
          return { ...prev, bossHp: nextHp };
        });
        spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '#22d3ee', 25);
        addLog(`Kannan's Anchor Deployed: Bound target vector t to origin. Dealt ${damage} damage.`, "player_action");
        addLog("Mathematical proof: Implemented primal embedding matrix [[A, t], [0, q]]", "info");
        break;
      }
      case 'lll': {
        const isParryTimed = gameState.lovaszThresholdSatisfied;
        soundEngine.playParry();

        const damage = isParryTimed ? 80 : 30;
        setGameState((prev) => {
          const nextHp = Math.max(0, prev.bossHp - damage);
          return { ...prev, bossHp: nextHp };
        });
        spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '#34d399', isParryTimed ? 35 : 15);

        if (isParryTimed) {
          addLog(`CRITICAL LLL PARRY! Lovász condition satisfied (δ = 0.75). Size reduction dealt ${damage} damage!`, "critical");
          addLog("Gram-Schmidt length bound achieved: ||b1|| <= 2^((n-1)/4) * det(L)^(1/n)", "info");
        } else {
          addLog(`LLL Shearing Blade used. Basis vector reduced by ${damage} damage.`, "player_action");
        }
        break;
      }
      case 'bkz': {
        soundEngine.playLaser();
        const beta = gameState.bkzBeta;
        const damage = Math.round(beta * 1.25);
        const heatCost = Math.round(beta * 0.45);

        setGameState((prev) => {
          const nextHeat = prev.memoryHeat + heatCost;
          const nextHp = Math.max(0, prev.bossHp - damage);

          if (nextHeat >= 100) {
            soundEngine.playExplosion();
            addLog(`EMERGENCY CRASH: Sieve Memory Overheated (2^(0.292*${beta}) ops breached buffer)!`, "critical");
            return {
              ...prev,
              bossHp: nextHp,
              memoryHeat: 100,
              playerHp: Math.max(0, prev.playerHp - 25),
              overheated: true,
            };
          }

          return {
            ...prev,
            bossHp: nextHp,
            memoryHeat: nextHeat,
          };
        });

        spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '#fbbf24', 30);
        addLog(`BKZ Siege Cannon Fired (Block Size β=${beta}): Dealt ${damage} damage. (+${heatCost}% Heat)`, "player_action");
        addLog(`Sieving Complexity: 2^(0.292 * ${beta}) operations calculated.`, "info");
        break;
      }
      case 'visor': {
        setGameState((prev) => {
          const nextVisor = !prev.gramSchmidtVisor;
          addLog(`Gram-Schmidt Orthogonalization Visor: ${nextVisor ? 'ENABLED (b_i* planes visible)' : 'DISABLED'}`, "info");
          return { ...prev, gramSchmidtVisor: nextVisor };
        });
        return; // Visor does not put on cooldown
      }
      case 'coolant': {
        soundEngine.playCoolant();
        setGameState((prev) => {
          const nextHeat = Math.max(0, prev.memoryHeat - 40);
          addLog(`Sieve Coolant Flushed: Memory Heat buffer reduced by 40% (Current: ${Math.round(nextHeat)}%)`, "player_action");
          return { ...prev, memoryHeat: nextHeat, overheated: false };
        });
        break;
      }
    }

    // Set cooldown
    setWeapons((prev) =>
      prev.map((w) => (w.id === weaponId ? { ...w, currentCooldown: w.cooldown } : w))
    );
  };

  // Phase 4 anomalous target click -> De-encapsulation Victory!
  const handleTargetCoreClick = () => {
    initAudioCtx();
    soundEngine.playExplosion();
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, '#f43f5e', 80);

    setGameState((prev) => ({
      ...prev,
      bossHp: 0,
      isVictory: true,
    }));

    addLog("DE-ENCAPSULATION SUCCESSFUL! UNBALANCED SVP SOLVED!", "critical");
    addLog("KYBER-768 MODULE LEVIATHAN DEFEATED!", "phase_change");

    // Launch celebratory confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      initAudioCtx();
      switch (e.key) {
        case '1':
          handleUseWeapon('kannan');
          break;
        case '2':
          handleUseWeapon('lll');
          break;
        case '3':
          handleUseWeapon('bkz');
          break;
        case '4':
          handleUseWeapon('visor');
          break;
        case '5':
          handleUseWeapon('coolant');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initAudioCtx]);

  // Restart game logic
  const handleRestart = () => {
    setGameState({
      bossHp: 768,
      maxBossHp: 768,
      bossPhase: 1,
      playerHp: 100,
      maxPlayerHp: 100,
      memoryHeat: 0,
      bkzBeta: 40,
      gramSchmidtVisor: false,
      lovaszAngle: 0,
      lovaszThresholdSatisfied: false,
      isGameOver: false,
      isVictory: false,
      overheated: false,
      audioMuted: false,
      audioInitialized: true,
    });
    setWeapons(INITIAL_WEAPONS);
    setLogs([]);
    addLog("SYSTEM REBOOT: RE-INITIALIZING KYBER-768 ENGAGEMENT", "warning");
  };

  return (
    <div
      onClick={initAudioCtx}
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 p-3 gap-3 scanline select-none overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 backdrop-blur shadow-lg">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100 font-mono">
            KYBER: <span className="text-cyan-400">THE MODULE LEVIATHAN</span>
          </h1>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
            ML-KEM-768 Cryptanalysis Simulator
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Phase {gameState.bossPhase}: <strong className="text-emerald-300">{BOSS_PHASES[gameState.bossPhase].name}</strong></span>
          </div>
        </div>
      </header>

      {/* Main Game Arena Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-0">
        {/* Canvas Engine Column (3/4 width on desktop) */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <LatticeCanvas
            gameState={gameState}
            particles={particles}
            projectiles={projectiles}
            parryRing={parryRing}
            targetCore={targetCore}
            onTargetCoreClick={handleTargetCoreClick}
          />
        </div>

        {/* Streaming Combat Log Column (1/4 width on desktop) */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <CombatLog logs={logs} />
        </div>
      </main>

      {/* Footer HUD & Weapon Action Bar */}
      <footer className="shrink-0">
        <HUD
          gameState={gameState}
          weapons={weapons}
          currentPhaseInfo={BOSS_PHASES[gameState.bossPhase]}
          onUseWeapon={handleUseWeapon}
          onBetaChange={(newBeta) => setGameState((prev) => ({ ...prev, bkzBeta: newBeta }))}
          onToggleAudio={() => {
            const nextMuted = !gameState.audioMuted;
            soundEngine.setMuted(nextMuted);
            setGameState((prev) => ({ ...prev, audioMuted: nextMuted }));
          }}
        />
      </footer>

      {/* Victory Modal */}
      {gameState.isVictory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg glow-emerald">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400 tracking-wide font-mono">
              DE-ENCAPSULATION SUCCESSFUL!
            </h2>
            <p className="text-slate-300 text-xs font-mono leading-relaxed">
              You have successfully reduced the Kyber-768 module lattice, isolated the secret error vector via uSVP core strike, and de-encapsulated the shared key.
            </p>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-left text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Lattice Dimensions:</span>
                <span className="text-emerald-400 font-bold">768 Reduced</span>
              </div>
              <div className="flex justify-between">
                <span>Final BKZ Block Size (β):</span>
                <span className="text-amber-400 font-bold">{gameState.bkzBeta}</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptanalysis Result:</span>
                <span className="text-cyan-400 font-bold">KYBER-768 BROKEN</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg font-mono flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> RESTART ENGAGEMENT
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-rose-950/80 border border-rose-400 rounded-full flex items-center justify-center mx-auto text-rose-400 shadow-lg glow-rose">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-rose-400 tracking-wide font-mono">
              SYSTEM INTEGRITY CRITICAL
            </h2>
            <p className="text-slate-300 text-xs font-mono leading-relaxed">
              The Module Leviathan's Binomial Noise Barrage overwhelmed your lattice reduction buffer before de-encapsulation was complete.
            </p>

            <button
              onClick={handleRestart}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded-lg font-mono flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> REBOOT PROTOCOL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
