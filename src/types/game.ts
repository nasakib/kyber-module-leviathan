// VectorForge: The Coordinate Engine - Core Type Definitions

export type SectorId = 
  | 'linear' 
  | 'parabola' 
  | 'matrix' 
  | 'calculus' 
  | 'lattice'
  | 'kinetics'
  | 'warp'
  | 'tangent'
  | 'vault';

export type LevelType = 
  | 'linear_beam'       // y = mx + b, reflections, systems
  | 'parabolic_arc'     // y = a(x-h)^2 + k, roots, focus
  | 'matrix_warp'       // 2x2 linear transformations, shear, rotation, det
  | 'tangent_blade'     // secants, tangent lines, derivatives, critical points
  | 'lattice_cvp';      // discrete 2D lattice, reduction, noisy decryption

export interface Vector2D {
  x: number;
  y: number;
}

export interface Matrix2D {
  a: number; // m00
  b: number; // m01
  c: number; // m10
  d: number; // m11
}

export interface HarmonicObstacle {
  id: string;
  type: 'harmonic_barrier';
  x: number;
  amplitude: number;
  frequency: number; // omega in rad/s
  phase: number;     // phi in rad
  baseY: number;
  width: number;
  gapSize: number;
}

export interface DeflectorMirror {
  id: string;
  p1: Vector2D;
  p2: Vector2D;
  normal: Vector2D;
  receptiveAngleRange?: [number, number];
}

export interface SplineMembrane {
  x: number; // junction coordinate c
  requiredContinuity: 'C0' | 'C1';
  tolerance: number; // epsilon for derivative match
}

export interface HypothesisOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface HypothesisQuestion {
  id: string;
  prompt: string;
  options: HypothesisOption[];
  multiplier: number; // e.g. 2.0x
}

export interface EnergyBudget {
  maxL1Norm?: number;        // Sum of |params|
  exactTrace?: number;       // For matrices: a + d
  requireUnitDeterminant?: boolean; // det(M) = 1
  maxCurvatureIntegral?: number;
}

export interface LevelMasteryStatus {
  cleared: boolean;          // Bronze
  budgetMet: boolean;        // Silver
  hypothesisCorrect: boolean;// Gold
  score: number;
}

export interface TargetNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  hit?: boolean;
  requiredOrder?: number;
  label?: string;
  subLabel?: string;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'shield' | 'absorber' | 'reflector';
  normal?: [number, number]; // for reflector angle, e.g. [-1, 1] for 45 deg
  label?: string;
}

export interface DerivationStepItem {
  stepNumber: number;
  label: string;
  mathExpression: string;
  explanation: string;
}

export interface FormulaSymbolItem {
  symbol: string;
  name: string;
  role: string;
  currentValueKey?: string;
}

export interface CurriculumContent {
  standard: string;          // e.g. "CCSS.MATH.CONTENT.HSA.CED.A.2" or "AP Calc CHA-2"
  standardName: string;      // e.g. "Creating Linear Equations in Two Variables"
  topicCategory: string;     // e.g. "Algebra I", "AP Calculus AB", "Linear Algebra"
  intuition: string;         // Plain-English physical mechanical rationale
  stepByStepSolution: DerivationStepItem[];
  formulaBreakdown: FormulaSymbolItem[];
  keyFormulaLatex: string;
}

export interface ParameterControl {
  key: string;
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  defaultValue: number;
  description: string;
  mathMeaning?: string;   // Symbolic LaTeX mathematical definition (e.g. m = \Delta y / \Delta x)
  geometricRole?: string; // Physical/geometric transformation effect
  objectiveHint?: string; // Clear explanation of why changing this operator satisfies the level goal
}

export interface LevelDefinition {
  id: string;
  sectorId: SectorId;
  sectorTitle: string;
  levelNumber: number; // 1 to 4
  code: string;        // e.g. "1.1", "4.3"
  title: string;
  subtitle: string;
  description: string;
  type: LevelType;
  defaultParams: Record<string, number>;
  paramControls: ParameterControl[];
  targets: TargetNode[];
  obstacles: Obstacle[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  curriculum: CurriculumContent;
  hints: string[];
  // Solution criteria or exact answer representation for auto-calc
  solutionParams: Record<string, number>;
  // Custom curve formula for calculus levels
  calculusFunction?: (x: number) => number;
  calculusDerivative?: (x: number) => number;
  calculusFunctionLatex?: string;

  // Advanced Mechanics
  harmonicObstacles?: HarmonicObstacle[];
  mirrors?: DeflectorMirror[];
  membranes?: SplineMembrane[];
  energyBudget?: EnergyBudget;
  hypothesis?: HypothesisQuestion;
  
  // Boss Mechanics
  isBossLevel?: boolean;
  bossMatrix?: Matrix2D; // For Eigen-Leviathan
  bossCorePosition?: Vector2D;
  paperDerivation?: string[];
}

export interface AdvancedLevelDefinition {
  id: string;
  sector: SectorId;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  syllabusStandard: string;
  
  // Mechanics
  harmonicObstacles?: HarmonicObstacle[];
  mirrors?: DeflectorMirror[];
  membranes?: SplineMembrane[];
  energyBudget?: EnergyBudget;
  hypothesis?: HypothesisQuestion;
  
  // Boss Mechanics
  isBossLevel?: boolean;
  bossMatrix?: Matrix2D; // For Eigen-Leviathan
  bossCorePosition?: Vector2D;
  
  // Initial parameters & targets
  initialParams: Record<string, number>;
  targets: { id: string; position: Vector2D; radius: number }[];
  staticObstacles: { x: number; y: number; width: number; height: number }[];
  
  // Educational Paper Solution
  paperDerivation: string[];
}

export interface UserLevelProgress {
  completed: boolean;
  stars: number;        // 1, 2, or 3
  bestAttempts: number;
  unlocked: boolean;
  masteryStatus?: LevelMasteryStatus;
}

export type UserProgressStore = Record<string, UserLevelProgress>;

export type AppMode = 'puzzle' | 'sandbox';

export type SandboxMode = 'linear' | 'parabola' | 'matrix' | 'calculus' | 'lattice';

export interface TrajectoryPoint {
  x: number;
  y: number;
  hitTargetId?: string;
  hitObstacleId?: string;
  isReflected?: boolean;
}

export interface SimulationResult {
  path: TrajectoryPoint[];
  targetsHit: string[];
  obstaclesCollided: string[];
  success: boolean;
  message: string;
}

