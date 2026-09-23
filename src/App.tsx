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
  FloatingText,
  WeaponId,
  LevelId,
  GameLevel,
  MathPhysicsPuzzle,
} from './types/game';
import { soundEngine } from './utils/audio';
import { LatticeCanvas } from './components/LatticeCanvas';
import { HUD } from './components/HUD';
import { CombatLog } from './components/CombatLog';
import { LevelSelect } from './components/LevelSelect';
import { MathChallengeCard } from './components/MathChallengeCard';
import { OnboardingModal } from './components/OnboardingModal';
import { Cpu, Trophy } from 'lucide-react';

const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    title: 'Algebra & Vector Physics',
    subtitle: 'Learn 2D coordinates, force summation (F_net = F1 + F2), and displacement.',
    category: 'STAGE 1: ALGEBRA & PHYSICS',
    description: 'Master vector addition and force equilibrium to calculate target trajectories.',
    learningObjectives: ['Vector coordinates (x,y)', 'Force addition (F_net = F1 + F2)', 'Pythagorean Distance'],
    unlocked: true,
  },
  {
    id: 2,
    title: 'Geometry & Transformations',
    subtitle: 'Learn basis vectors (b1,b2), matrix grid shearing, and determinant area.',
    category: 'STAGE 2: GEOMETRY & FIELDS',
    description: 'Understand how matrix transformations warp grid space and scale fundamental area det(A).',
    learningObjectives: ['Basis vectors b1, b2', 'Matrix grid shear', 'Determinant area scaling det(A)'],
    unlocked: true,
  },
  {
    id: 3,
    title: 'Calculus & Optimization',
    subtitle: 'Learn potential energy curves V(x), gradient forces (∇V), and Gram-Schmidt projection.',
    category: 'STAGE 3: CALCULUS & OPTIMIZATION',
    description: 'Use derivatives and gradient optimization to find the shortest distance in continuous space.',
    learningObjectives: ['Potential energy gradient ∇V', 'Vector norm minimization', 'Gram-Schmidt orthogonal plane b*'],
    unlocked: true,
  },
  {
    id: 4,
    title: 'Post-Quantum Cryptanalysis',
    subtitle: 'Face Kyber: The Module Leviathan using LLL, BKZ sieving, and uSVP core strikes.',
    category: 'STAGE 4: BOSS ENCOUNTER',
    description: 'Combine all learned concepts to break ML-KEM/Kyber-768 lattice encryption!',
    learningObjectives: ['Kannan embedding', 'LLL Lovász parrying', 'BKZ block sieving', 'uSVP de-encapsulation'],
    unlocked: true,
  },
];

const PUZZLES: Record<LevelId, MathPhysicsPuzzle> = {
  1: {
    id: 'puz-1',
    title: 'Level 1 Challenge: Net Force Vector Equilibrium',
    question: 'Vector F1 is (60, -30) N and target goal is (140, -80) N. Adjust Force F2 so net force F_net matches target!',
    formula: 'F_net = F₁ + F₂  ⇒  |F_net| = √(F_x² + F_y²)',
    conceptExplanation: 'Vector Addition in Physics: When multiple forces act on an object, their resultant is the tip-to-tail vector sum.',
    targetValue: 80,
    currentValue: 40,
    unit: 'N (Force)',
    solved: false,
  },
  2: {
    id: 'puz-2',
    title: 'Level 2 Challenge: Fundamental Cell Area Determinant',
    question: 'Adjust the matrix shear transformation so the fundamental domain area det(A) equals exactly 120 px².',
    formula: 'det(A) = |b₁ₓb₂ᵧ - b₁ᵧb₂ₓ|',
    conceptExplanation: 'Matrix Determinants in Geometry: The determinant measures how much a matrix stretches or scales area in 2D space.',
    targetValue: 120,
    currentValue: 60,
    unit: 'px² (Area)',
    solved: false,
  },
  3: {
    id: 'puz-3',
    title: 'Level 3 Challenge: Potential Energy Gradient Minimization',
    question: 'Adjust gradient force magnitude |∇V| to reach the potential energy minimum curve target at 95 N/m.',
    formula: '∇V = dV/dx = kx',
    conceptExplanation: 'Calculus Optimization: Gradient vectors point in the direction of steepest energy increase; moving opposite minimizes energy.',
    targetValue: 95,
    currentValue: 30,
    unit: 'N/m (Gradient)',
    solved: false,
  },
  4: {
    id: 'puz-4',
    title: 'Level 4 Challenge: Lovász Parameter Alignment',
    question: 'Set LLL reduction parameter δ to match the Lovász threshold condition δ = 0.75.',
    formula: 'δ · ||bᵢ*||² ≤ ||bᵢ₊₁* + μᵢ₊₁,ᵢ bᵢ*||²',
    conceptExplanation: 'Post-Quantum Lattice Reduction: LLL reduction ensures basis vectors are sufficiently short and orthogonal.',
    targetValue: 0.75 * 100,
    currentValue: 0.5 * 100,
    unit: '% (δ parameter)',
    solved: false,
  },
};

const BOSS_PHASES: Record<number, BossPhase> = {
  1: {
    id: 1,
    name: "Kannan's Embedding",
    subtitle: "Lattice Primal Binding (100% - 75% HP)",
    minHpPercent: 75,
    description: "Leviathan hovers in noisy space (t = As + e). Deploy Kannan's Anchor to bind the target vector.",
    tacticalTip: "Phase 1: Press [1] for Anchor Lock to pin down noisy lattice vectors into the grid!",
  },
  2: {
    id: 2,
    name: "LLL Parry Dance",
    subtitle: "Lovász Basis Reduction (75% - 40% HP)",
    minHpPercent: 40,
    description: "Boss sweeps skewed basis vectors. Time LLL Shears when vectors align (δ = 0.75).",
    tacticalTip: "Phase 2: Wait until the shrinking blue ring enters the GREEN target circle, then press [2] to PARRY!",
  },
  3: {
    id: 3,
    name: "BKZ Battery & Sieving",
    subtitle: "Block Reduction & Memory Heat (40% - 10% HP)",
    minHpPercent: 10,
    description: "Dial Block Size (β) from 20 to 120. Higher β deals massive damage but builds Memory Heat (2^0.292β ops).",
    tacticalTip: "Phase 3: Adjust Block Size β slider for massive damage! Press [5] Coolant before Heat reaches 100%!",
  },
  4: {
    id: 4,
    name: "uSVP Core Strike",
    subtitle: "De-encapsulation Final Strike (10% - 0% HP)",
    minHpPercent: 0,
    description: "Noise separates from Gaussian background. Click the anomalous vector on canvas to de-encapsulate!",
    tacticalTip: "Phase 4: FINAL STRIKE! Find the red target crosshair on the canvas and CLICK IT to win!",
  },
};

const INITIAL_WEAPONS: Weapon[] = [
  {
    id: 'kannan',
    name: "Kannan's Anchor",
    simpleName: 'Anchor Lock',
    cooldown: 4.0,
    currentCooldown: 0,
    description: "Locks target vector into primal lattice coordinates.",
    simpleGuide: "Locks noisy targets to the origin. Extra damage in Phase 1!",
    shortcut: '1',
    iconName: 'anchor',
  },
  {
    id: 'lll',
    name: 'LLL Shearing Blades',
    simpleName: 'Parry Blade',
    cooldown: 1.2,
    currentCooldown: 0,
    description: "Size-reduces basis vectors. Bonus damage when timed with Lovász threshold (δ=0.75).",
    simpleGuide: "Time this with the green ring for CRITICAL PARRY damage!",
    shortcut: '2',
    iconName: 'scissors',
  },
  {
    id: 'bkz',
    name: 'BKZ Siege Cannon',
    simpleName: 'Power Cannon',
    cooldown: 0.5,
    currentCooldown: 0,
    description: "Deals heavy damage scaling with Block Size β. Fills Memory Heat buffer.",
    simpleGuide: "Fires heavy blast scaled by β slider. Watch out for Heat!",
    shortcut: '3',
    iconName: 'flame',
  },
  {
    id: 'visor',
    name: 'Gram-Schmidt Visor',
    simpleName: 'Grid Visor',
    cooldown: 0.0,
    currentCooldown: 0,
    description: "Toggles orthogonal projection planes (b_i*) on canvas.",
    simpleGuide: "Toggles 90° reference grid lines to reveal hidden alignment.",
    shortcut: '4',
    iconName: 'eye',
  },
  {
    id: 'coolant',
    name: 'Sieve Coolant',
    simpleName: 'Heat Coolant',
    cooldown: 6.0,
    currentCooldown: 0,
    description: "Flushes Sieve Memory Heat buffer by 40%.",
    simpleGuide: "Flushes 40% processing heat to prevent emergency crash.",
    shortcut: '5',
    iconName: 'wind',
  },
];

export function App() {
  const [gameState, setGameState] = useState<GameState>({
    isFlowMode: true,
    showInstructionsModal: false,
    tutorialStep: 1,
    suggestedAction: 'kannan',
    activeLevel: 1,
    unlockedLevels: [1, 2, 3, 4],
    levelProgress: { 1: false, 2: false, 3: false, 4: false },
    activePuzzle: PUZZLES[1],
    vector1: { x: 60, y: -30 },
    vector2: { x: 40, y: -20 },
    targetVector: { x: 140, y: -80 },
    bossHp: 768,
    maxBossHp: 768,
    bossPhase: 1,
    playerHp: 100,
    maxPlayerHp: 100,
    memoryHeat: 0,
    bkzBeta: 40,
    gramSchmidtVisor: false,
    comboCount: 0,
    screenShake: 0,
    tacticalHint: "Guided Flow Active: Press highlighted key [1] Anchor Lock!",
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
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [projectiles] = useState<BossProjectile[]>([]);
  const [parryRing, setParryRing] = useState<ParryRing | null>({
    id: 'ring-1',
    radius: 180,
    targetRadius: 70,
    speed: 1.5,
    active: true,
    angle: 0,
  });

  const [targetCore, setTargetCore] = useState<TargetCore | null>(null);

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
    addLog("GUIDED FLOW MODE ACTIVE: FOLLOW GLOWING KEYBIND SUGGESTIONS FOR EFFORTLESS PLAY", "warning", "Guided Flow Mode enabled: follow highlighted buttons to play!");
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

  // Main tick loop
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (gameState.isGameOver || gameState.isVictory) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setWeapons((prev) =>
        prev.map((w) => ({
          ...w,
          currentCooldown: Math.max(0, w.currentCooldown - dt),
        }))
      );

      setGameState((prev) => {
        const newAngle = (prev.lovaszAngle + dt * 1.8) % (Math.PI * 2);
        const thresholdMet = Math.abs(Math.sin(newAngle * 2)) > 0.85;

        // Determine suggested action for Guided Flow Mode
        let suggested: WeaponId | null = 'kannan';
        if (prev.memoryHeat > 70) {
          suggested = 'coolant';
        } else if (prev.activeLevel === 4 && prev.bossPhase === 2 && thresholdMet) {
          suggested = 'lll';
        } else if (prev.activeLevel === 4 && prev.bossPhase === 3) {
          suggested = 'bkz';
        }

        return {
          ...prev,
          lovaszAngle: newAngle,
          lovaszThresholdSatisfied: thresholdMet,
          suggestedAction: suggested,
          screenShake: Math.max(0, prev.screenShake - dt * 8),
          memoryHeat: Math.max(0, prev.memoryHeat - dt * 3),
        };
      });

      // Update Parry Ring
      setParryRing((prev) => {
        if (!prev) return null;
        let newRadius = prev.radius - prev.speed * 2.5;
        if (newRadius <= 20) newRadius = 200;
        return { ...prev, radius: newRadius };
      });

      // Update Phase 4 target core
      if (gameState.activeLevel === 4 && gameState.bossPhase === 4) {
        setTargetCore((prev) => {
          if (!prev) return { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, active: true, pulseTimer: 0 };
          return { ...prev, pulseTimer: prev.pulseTimer + dt };
        });
      }

      // Projectiles & Particles
      setParticles((prev) => prev.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 })).filter((p) => p.life > 0));
      setFloatingTexts((prev) => prev.map((ft) => ({ ...ft, y: ft.y - 0.8, life: ft.life - 1 })).filter((ft) => ft.life > 0));

    }, 50);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isVictory, gameState.activeLevel, gameState.bossPhase]);

  // Level switching handler
  const handleSelectLevel = (levelId: LevelId) => {
    initAudioCtx();
    setGameState((prev) => ({
      ...prev,
      activeLevel: levelId,
      activePuzzle: PUZZLES[levelId],
      tacticalHint: `Level ${levelId}: ${GAME_LEVELS.find((l) => l.id === levelId)?.subtitle}`,
    }));
    addLog(`SWITCHED TO STAGE ${levelId}: ${GAME_LEVELS.find((l) => l.id === levelId)?.title}`, "phase_change");
  };

  const handleSolvePuzzle = () => {
    soundEngine.playParry(true);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles(centerX, centerY, '#34d399', 50);
    spawnFloatingText(`✨ PUZZLE SOLVED! +STAGE BOOST`, centerX, centerY, '#34d399', 22);

    addLog(`STEM CHALLENGE COMPLETED FOR STAGE ${gameState.activeLevel}!`, "critical", "Concept verified!");

    setGameState((prev) => ({
      ...prev,
      levelProgress: { ...prev.levelProgress, [prev.activeLevel]: true },
      playerHp: Math.min(100, prev.playerHp + 20),
      comboCount: prev.comboCount + 1,
    }));
  };

  // Weapon Handler
  const handleUseWeapon = (weaponId: WeaponId) => {
    initAudioCtx();
    if (gameState.isGameOver || gameState.isVictory) return;

    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon || weapon.currentCooldown > 0) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 40;

    switch (weaponId) {
      case 'kannan': {
        soundEngine.playAnchor();
        const damage = 95;
        setGameState((prev) => ({ ...prev, bossHp: Math.max(0, prev.bossHp - damage), comboCount: prev.comboCount + 1 }));
        spawnParticles(centerX, centerY, '#22d3ee', 25);
        spawnFloatingText(`ANCHOR LOCKED! -${damage} DIM`, centerX, centerY, '#22d3ee', 20);
        addLog(`Kannan's Anchor Deployed! Dealt ${damage} damage.`, "player_action");
        break;
      }
      case 'lll': {
        soundEngine.playParry(true);
        const damage = 110;
        setGameState((prev) => ({ ...prev, bossHp: Math.max(0, prev.bossHp - damage), comboCount: prev.comboCount + 1 }));
        spawnParticles(centerX, centerY, '#34d399', 40);
        spawnFloatingText(`⚡ PERFECT PARRY! -${damage} DIM`, centerX, centerY, '#34d399', 22);
        addLog(`CRITICAL LLL PARRY! Dealt ${damage} damage.`, "critical");
        break;
      }
      case 'bkz': {
        soundEngine.playLaser();
        const damage = Math.round(gameState.bkzBeta * 1.3);
        setGameState((prev) => ({ ...prev, bossHp: Math.max(0, prev.bossHp - damage), memoryHeat: Math.min(100, prev.memoryHeat + 20) }));
        spawnParticles(centerX, centerY, '#fbbf24', 30);
        spawnFloatingText(`BKZ BLAST! -${damage} DIM`, centerX, centerY, '#fbbf24', 18);
        addLog(`BKZ Cannon Fired (β=${gameState.bkzBeta})! Dealt ${damage} damage.`, "player_action");
        break;
      }
      case 'visor': {
        setGameState((prev) => ({ ...prev, gramSchmidtVisor: !prev.gramSchmidtVisor }));
        return;
      }
      case 'coolant': {
        soundEngine.playCoolant();
        setGameState((prev) => ({ ...prev, memoryHeat: Math.max(0, prev.memoryHeat - 40) }));
        spawnFloatingText(`❄️ COOLANT FLUSH! -40% HEAT`, centerX, centerY, '#38bdf8', 18);
        break;
      }
    }

    setWeapons((prev) => prev.map((w) => (w.id === weaponId ? { ...w, currentCooldown: w.cooldown } : w)));
  };

  const handleTargetCoreClick = () => {
    initAudioCtx();
    soundEngine.playExplosion();
    setGameState((prev) => ({ ...prev, bossHp: 0, isVictory: true }));
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  };

  return (
    <div onClick={initAudioCtx} className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 p-2.5 gap-2 scanline select-none overflow-hidden">
      <header className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 backdrop-blur shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100 font-mono">
            KYBER: <span className="text-cyan-400">THE MODULE LEVIATHAN</span>
          </h1>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
            Guided STEM Onboarding Engine
          </span>
        </div>
      </header>

      {/* Curriculum Level Select Bar */}
      <div className="shrink-0">
        <LevelSelect levels={GAME_LEVELS} activeLevel={gameState.activeLevel} onSelectLevel={handleSelectLevel} />
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2.5 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-0 relative">
          <LatticeCanvas
            gameState={gameState}
            particles={particles}
            projectiles={projectiles}
            floatingTexts={floatingTexts}
            parryRing={parryRing}
            targetCore={targetCore}
            onTargetCoreClick={handleTargetCoreClick}
          />

          {gameState.activePuzzle && (
            <div className="absolute bottom-3 left-3 right-3 max-w-lg z-40">
              <MathChallengeCard puzzle={gameState.activePuzzle} onSolve={handleSolvePuzzle} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col min-h-0">
          <CombatLog logs={logs} />
        </div>
      </main>

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

      {gameState.isVictory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 font-mono">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-400">CURRICULUM MASTERED!</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              You mastered Algebra, Physics, Geometry, Calculus, and Post-Quantum Cryptanalysis to defeat the Kyber Leviathan!
            </p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-emerald-600 font-bold rounded-lg text-slate-950">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
