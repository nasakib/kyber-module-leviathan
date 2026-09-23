export type LevelId = 1 | 2 | 3 | 4;

export interface GameLevel {
  id: LevelId;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  learningObjectives: string[];
  unlocked: boolean;
}

export interface MathPhysicsPuzzle {
  id: string;
  title: string;
  question: string;
  formula: string;
  conceptExplanation: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  solved: boolean;
}

export type BossPhaseId = 1 | 2 | 3 | 4;

export interface BossPhase {
  id: BossPhaseId;
  name: string;
  subtitle: string;
  minHpPercent: number;
  description: string;
  tacticalTip: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  fontSize: number;
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  type: 'binomial' | 'modular_shear';
  color: string;
  radius: number;
}

export interface ParryRing {
  id: string;
  radius: number;
  targetRadius: number;
  speed: number;
  active: boolean;
  angle: number;
}

export interface TargetCore {
  x: number;
  y: number;
  active: boolean;
  pulseTimer: number;
}

export type WeaponId = 'kannan' | 'lll' | 'bkz' | 'visor' | 'coolant';

export interface Weapon {
  id: WeaponId;
  name: string;
  simpleName: string;
  cooldown: number;
  currentCooldown: number;
  description: string;
  simpleGuide: string;
  shortcut: string;
  iconName: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  text: string;
  simpleTranslation?: string;
  type: 'info' | 'player_action' | 'boss_attack' | 'warning' | 'phase_change' | 'critical';
}

export interface GameState {
  // Flow & Tutorial Mode
  isFlowMode: boolean; // Autonomous guided flow assist
  showInstructionsModal: boolean;
  tutorialStep: number;
  suggestedAction: WeaponId | null;

  // Level Progression
  activeLevel: LevelId;
  unlockedLevels: LevelId[];
  levelProgress: Record<LevelId, boolean>;
  
  // Active Interactive Puzzle
  activePuzzle: MathPhysicsPuzzle | null;
  
  // Boss
  bossHp: number;
  maxBossHp: number;
  bossPhase: BossPhaseId;
  
  // Player
  playerHp: number;
  maxPlayerHp: number;
  memoryHeat: number;
  bkzBeta: number;
  gramSchmidtVisor: boolean;
  
  // Vectors
  vector1: Vector2D;
  vector2: Vector2D;
  targetVector: Vector2D;
  
  // Combo & Juice
  comboCount: number;
  screenShake: number;
  tacticalHint: string;
  
  // Parry / Phase mechanics
  lovaszAngle: number;
  lovaszThresholdSatisfied: boolean;
  
  // Status
  isGameOver: boolean;
  isVictory: boolean;
  overheated: boolean;
  
  // Audio state
  audioMuted: boolean;
  audioInitialized: boolean;
}
