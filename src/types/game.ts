export type Lane = -1 | 0 | 1; // Left (-1), Center (0), Right (1)

export type ShipState = 'normal' | 'jumping' | 'sliding';

export interface RunnerObstacle {
  id: string;
  lane: Lane;
  z: number; // 0 (far away) to 100 (player position)
  type: 'low_barrier' | 'high_gate' | 'full_wall';
  label: string;
  color: string;
}

export interface RunnerPowerUp {
  id: string;
  lane: Lane;
  z: number;
  type: 'vector_fnet' | 'det_area' | 'grad_v';
  label: string;
  color: string;
}

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

export type BossPhaseId = 1 | 2 | 3 | 4;

export interface BossPhase {
  id: BossPhaseId;
  name: string;
  subtitle: string;
  minHpPercent: number;
  description: string;
  tacticalTip: string;
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
  // Runner Ship Physics
  shipLane: Lane;
  shipY: number; // 0 = ground, >0 = jumping, <0 = sliding
  shipState: ShipState;
  speed: number;
  distance: number;
  score: number;
  
  // Runner Objects
  obstacles: RunnerObstacle[];
  powerups: RunnerPowerUp[];

  // Flow & Tutorial Mode
  isFlowMode: boolean;
  showInstructionsModal: boolean;

  // Level Progression
  activeLevel: LevelId;
  unlockedLevels: LevelId[];
  levelProgress: Record<LevelId, boolean>;
  
  // Boss
  bossHp: number;
  maxBossHp: number;
  bossPhase: BossPhaseId;
  bossZ: number; // Boss position ahead in tunnel
  
  // Player
  playerHp: number;
  maxPlayerHp: number;
  memoryHeat: number;
  bkzBeta: number;
  gramSchmidtVisor: boolean;
  
  // Combo & Juice
  comboCount: number;
  screenShake: number;
  tacticalHint: string;
  
  // Status
  isGameOver: boolean;
  isVictory: boolean;
  
  // Audio state
  audioMuted: boolean;
  audioInitialized: boolean;
}
