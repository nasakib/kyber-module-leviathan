export type DesmosItemType = 'expression' | 'slider' | 'point' | 'table';

export interface DesmosSliderConfig {
  variable: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isPlaying: boolean;
  speed: number; // units per second
}

export interface DesmosCalculusConfig {
  showDerivative: boolean;
  showTangent: boolean;
  tangentX: number;
  showIntegral: boolean;
  integralFrom: number;
  integralTo: number;
}

export interface DesmosTableConfig {
  minX: number;
  maxX: number;
  step: number;
}

export interface DesmosItem {
  id: string;
  type: DesmosItemType;
  rawText: string;
  color: string;
  visible: boolean;
  slider?: DesmosSliderConfig;
  calculus?: DesmosCalculusConfig;
  table?: DesmosTableConfig;
  pointCoord?: { x: number; y: number };
  label?: string;
  error?: string | null;
}

export interface DesmosPreset {
  id: string;
  name: string;
  description: string;
  category: 'algebra' | 'calculus' | 'physics' | 'trigonometry';
  items: Omit<DesmosItem, 'id'>[];
  viewport?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export const DESMOS_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];
