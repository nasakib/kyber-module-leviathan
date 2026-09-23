export type AppMode = 'curriculum' | 'academy' | 'solver' | 'boss';

export interface RosettaRow {
  id: string;
  algebraConcept: string;
  canvasElement: string;
  symbolicMath: string;
  plainEnglish: string;
  highlightKey?: string;
}

export interface DerivationStep {
  stepNumber: number;
  label: string;
  algebraicLine: string;
  computedLine?: (params: Record<string, number>) => string;
  whyItWorks: string;
}

export type QuizQuestionType = 'visual_prediction' | 'misconception_trap' | 'symbolic_calc';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  subtitle?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  rosettaRows: RosettaRow[];
  derivation: {
    title: string;
    description: string;
    parameterName: string;
    parameterLabel: string;
    parameterDefault: number;
    parameterMin: number;
    parameterMax: number;
    parameterStep: number;
    steps: DerivationStep[];
  };
  quiz: QuizQuestion[];
  interactiveMode: 'derivatives' | 'riemann' | 'matrix_stretch' | 'lattice_discrete';
  defaultCurve?: { a: number; b: number; c: number };
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconName: string;
  lessons: Lesson[];
}

export interface CurriculumProgress {
  completedLessons: string[];
  quizScores: Record<string, { score: number; maxScore: number; timestamp: number }>;
  currentModuleId: string;
  currentLessonId: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Matrix2D {
  b1: Vector2D;
  b2: Vector2D;
}

export interface GramSchmidtData {
  b1Star: Vector2D;
  b2Star: Vector2D;
  mu21: number;
}

export type SolverActionType = 'initial' | 'gram_schmidt' | 'size_reduce' | 'lovasz_swap' | 'complete' | 'babai_cvp';

export interface SolverStep {
  stepIndex: number;
  action: SolverActionType;
  title: string;
  matrix: Matrix2D;
  gsResult: GramSchmidtData;
  mu: number;
  b1StarNormSq: number;
  b2StarNormSq: number;
  lovaszSatisfied: boolean;
  explanation: string;
  formula: string;
  closestPoint?: Vector2D;
  errorVector?: Vector2D;
}

export interface SolverPreset {
  id: string;
  name: string;
  description: string;
  matrix: Matrix2D;
  target: Vector2D;
}

export interface AcademyChapter {
  id: number;
  title: string;
  subtitle: string;
  conceptTitle: string;
  difficultyTag: 'Beginner Intuition' | 'Intermediate Geometry' | 'Advanced Optimization' | 'Cryptographic Insight';
  physicalAnalogy: string;
  mathDefinition: string;
  microTask: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  hint: string;
}

export type Lane = -1 | 0 | 1;
export type ShipState = 'normal' | 'jumping' | 'sliding';

export interface RunnerObstacle {
  id: string;
  lane: Lane;
  z: number;
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
  // Navigation Mode
  appMode: AppMode;
  
  // Academy Mode State
  academyChapter: number;
  academyCompleted: boolean;

  // Solver Lab State
  solverMatrix: Matrix2D;
  solverTarget: Vector2D;
  solverSteps: SolverStep[];
  currentStepIndex: number;
  isSolverPlaying: boolean;
  solverPlaybackSpeed: number; // 0.25, 0.5, 1, 2

  // Explanatory Drawer
  isDrawerOpen: boolean;
  interactiveAngle: number;

  // Runner Ship Physics (Boss Mode)
  shipLane: Lane;
  shipY: number;
  shipState: ShipState;
  speed: number;
  distance: number;
  score: number;
  
  // Analysis Gate (Boss Mode Checkpoints)
  isAnalysisGateActive: boolean;
  gateQuestion: string;
  gateOptions: string[];
  correctOptionIndex: number;
  gateTimer: number; // 8 seconds countdown
  gateHintUsed: boolean;
  gateEliminatedOptions: number[];

  obstacles: RunnerObstacle[];
  powerups: RunnerPowerUp[];

  // Flow & Tutorial Mode
  isFlowMode: boolean;
  showInstructionsModal: boolean;

  // Boss
  bossHp: number;
  maxBossHp: number;
  bossPhase: BossPhaseId;
  bossZ: number;
  
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

  // Curriculum Mode State
  curriculumModuleId: string;
  curriculumLessonId: string;

  // UI & Card Visibility Controls
  isCurriculumCardOpen: boolean;
  isAcademyCardOpen: boolean;
  isSolverControlsOpen: boolean;
  isTelemetryLogOpen: boolean;
  isBossStatsOpen: boolean;
  isFocusMode: boolean;
}
