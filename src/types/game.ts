export type BossPhaseId = 1 | 2 | 3 | 4;

export interface BossPhase {
  id: BossPhaseId;
  name: string;
  subtitle: string;
  minHpPercent: number; // e.g. 75 for phase 1, 40 for phase 2
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
  targetRadius: number; // The sweet spot zone radius (e.g. 70px)
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
  simpleName: string; // Novice friendly name (e.g. "Anchor Lock")
  cooldown: number; // total cooldown in seconds
  currentCooldown: number; // remaining cooldown in seconds
  description: string;
  simpleGuide: string; // Novice friendly explanation
  shortcut: string;
  iconName: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  text: string;
  simpleTranslation?: string; // Novice friendly translation
  type: 'info' | 'player_action' | 'boss_attack' | 'warning' | 'phase_change' | 'critical';
}

export interface GameState {
  // Boss
  bossHp: number; // Starts at 768
  maxBossHp: number; // 768
  bossPhase: BossPhaseId;
  
  // Player
  playerHp: number; // Starts at 100
  maxPlayerHp: number; // 100
  memoryHeat: number; // 0 to 100%
  bkzBeta: number; // 20 to 120
  gramSchmidtVisor: boolean; // toggle
  
  // Combo & Juice
  comboCount: number;
  screenShake: number; // screen shake intensity
  tacticalHint: string;
  
  // Parry / Phase mechanics
  lovaszAngle: number; // angle skew in radians
  lovaszThresholdSatisfied: boolean; // delta = 0.75 condition
  
  // Status
  isGameOver: boolean;
  isVictory: boolean;
  overheated: boolean;
  
  // Audio state
  audioMuted: boolean;
  audioInitialized: boolean;
}
