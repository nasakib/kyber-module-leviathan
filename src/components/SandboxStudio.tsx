import React, { useState } from 'react';
import { SandboxMode, LevelDefinition } from '../types/game';
import { LevelCanvas } from './LevelCanvas';
import { ControlTerminal } from './ControlTerminal';
import { Share2, Check, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const SandboxStudio: React.FC = () => {
  const [mode, setMode] = useState<SandboxMode>('linear');
  const [params, setParams] = useState<Record<string, number>>({
    m: 1.5,
    b: -1.0,
    a: -0.3,
    h: 2.0,
    k: 4.0,
    m11: 1.5,
    m12: -0.5,
    m21: 0.5,
    m22: 1.5,
    x0: 1.5,
    h_secant: 0.5,
    c1: 1,
    c2: 2,
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Construct dynamic Sandbox level configuration for Canvas
  const getSandboxLevel = (): LevelDefinition => {
    switch (mode) {
      case 'linear':
        return {
          id: 'sandbox_linear',
          sectorId: 'linear',
          sectorTitle: 'Sandbox: Linear Grapher',
          levelNumber: 0,
          code: 'SBX-1',
          title: 'Linear Equation Lab',
          subtitle: 'Explore y = mx + b in Infinite Space',
          description: 'Freely alter slope and y-intercept. Observe how the rate of change affects angle and intercept affects vertical translation.',
          type: 'linear_beam',
          defaultParams: { m: 1.5, b: -1.0 },
          solutionParams: { m: 1.5, b: -1.0 },
          paramControls: [
            { key: 'm', label: 'Slope', symbol: 'm', min: -8, max: 8, step: 0.25, defaultValue: 1.5, description: 'Rise over run' },
            { key: 'b', label: 'Y-Intercept', symbol: 'b', min: -10, max: 10, step: 0.5, defaultValue: -1.0, description: 'Vertical offset' }
          ],
          targets: [
            { id: 'sb_t1', x: 2, y: 2, radius: 0.5, label: 'Sensor A (2, 2)' },
            { id: 'sb_t2', x: -2, y: -4, radius: 0.5, label: 'Sensor B (-2, -4)' }
          ],
          obstacles: [],
          bounds: { minX: -6, maxX: 6, minY: -6, maxY: 6 },
          curriculum: {
            standard: 'Sandbox Exploration Mode',
            standardName: 'Linear Function Systems',
            topicCategory: 'Algebra I',
            intuition: 'Freeform linear exploration.',
            keyFormulaLatex: 'y = mx + b',
            stepByStepSolution: [],
            formulaBreakdown: []
          },
          hints: []
        };
      case 'parabola':
        return {
          id: 'sandbox_parabola',
          sectorId: 'parabola',
          sectorTitle: 'Sandbox: Parabola Lab',
          levelNumber: 0,
          code: 'SBX-2',
          title: 'Kinetic Parabola Lab',
          subtitle: 'Vertex Form: y = a(x - h)² + k',
          description: 'Simulate gravitational trajectories. Tune curvature a and apex position (h, k).',
          type: 'parabolic_arc',
          defaultParams: { a: -0.3, h: 2.0, k: 4.0 },
          solutionParams: { a: -0.3, h: 2.0, k: 4.0 },
          paramControls: [
            { key: 'a', label: 'Curvature (a)', symbol: 'a', min: -2, max: 2, step: 0.05, defaultValue: -0.3, description: 'Quadratic coefficient' },
            { key: 'h', label: 'Vertex X (h)', symbol: 'h', min: -5, max: 5, step: 0.5, defaultValue: 2.0, description: 'Apex horizontal coordinate' },
            { key: 'k', label: 'Vertex Y (k)', symbol: 'k', min: -5, max: 8, step: 0.5, defaultValue: 4.0, description: 'Apex vertical peak' }
          ],
          targets: [
            { id: 'sb_p1', x: 4, y: 2.8, radius: 0.5, label: 'Free Target (4, 2.8)' }
          ],
          obstacles: [],
          bounds: { minX: -5, maxX: 7, minY: -4, maxY: 8 },
          curriculum: {
            standard: 'Sandbox Exploration Mode',
            standardName: 'Quadratic Trajectories',
            topicCategory: 'Algebra II',
            intuition: 'Freeform parabola laboratory.',
            keyFormulaLatex: 'y = a(x - h)^2 + k',
            stepByStepSolution: [],
            formulaBreakdown: []
          },
          hints: []
        };
      case 'matrix':
        return {
          id: 'sandbox_matrix',
          sectorId: 'matrix',
          sectorTitle: 'Sandbox: Matrix Warper',
          levelNumber: 0,
          code: 'SBX-3',
          title: '2D Linear Transformation Lab',
          subtitle: 'Warp Coordinate Space with 2x2 Matrix',
          description: 'Directly modify all 4 matrix entries. Watch how basis vectors î and ĵ move, and monitor the determinant area scale in real time.',
          type: 'matrix_warp',
          defaultParams: { a: 1.5, b: -0.5, c: 0.5, d: 1.5 },
          solutionParams: { a: 1.5, b: -0.5, c: 0.5, d: 1.5 },
          paramControls: [
            { key: 'a', label: 'Entry a (î_x)', symbol: 'a', min: -3, max: 3, step: 0.5, defaultValue: 1.5, description: 'Basis 1 X' },
            { key: 'c', label: 'Entry c (î_y)', symbol: 'c', min: -3, max: 3, step: 0.5, defaultValue: 0.5, description: 'Basis 1 Y' },
            { key: 'b', label: 'Entry b (ĵ_x)', symbol: 'b', min: -3, max: 3, step: 0.5, defaultValue: -0.5, description: 'Basis 2 X' },
            { key: 'd', label: 'Entry d (ĵ_y)', symbol: 'd', min: -3, max: 3, step: 0.5, defaultValue: 1.5, description: 'Basis 2 Y' }
          ],
          targets: [],
          obstacles: [],
          bounds: { minX: -4, maxX: 4, minY: -4, maxY: 4 },
          curriculum: {
            standard: 'Sandbox Exploration Mode',
            standardName: 'Linear Space Warping',
            topicCategory: 'Linear Algebra',
            intuition: 'Freeform matrix laboratory.',
            keyFormulaLatex: 'M = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
            stepByStepSolution: [],
            formulaBreakdown: []
          },
          hints: []
        };
      case 'calculus':
        return {
          id: 'sandbox_calculus',
          sectorId: 'calculus',
          sectorTitle: 'Sandbox: Calculus Differentiator',
          levelNumber: 0,
          code: 'SBX-4',
          title: 'Secants & Tangents Lab',
          subtitle: 'Instantaneous Rate of Change on f(x) = 0.5x³ - x',
          description: 'Slide evaluation point x₀ and secant step h to visualize how chords converge to tangent lines.',
          type: 'tangent_blade',
          defaultParams: { x0: 1.5, h: 0.5 },
          solutionParams: { x0: 1.5, h: 0.05 },
          calculusFunction: (x: number) => 0.5 * x * x * x - x,
          calculusDerivative: (x: number) => 1.5 * x * x - 1,
          calculusFunctionLatex: 'f(x) = 0.5x^3 - x',
          paramControls: [
            { key: 'x0', label: 'Point x₀', symbol: 'x₀', min: -2.5, max: 2.5, step: 0.25, defaultValue: 1.5, description: 'Evaluation coordinate' },
            { key: 'h', label: 'Step h', symbol: 'h', min: 0.05, max: 2.0, step: 0.05, defaultValue: 0.5, description: 'Secant separation' }
          ],
          targets: [],
          obstacles: [],
          bounds: { minX: -3, maxX: 3, minY: -4, maxY: 4 },
          curriculum: {
            standard: 'Sandbox Exploration Mode',
            standardName: 'Differential Calculus',
            topicCategory: 'Calculus I',
            intuition: 'Freeform calculus laboratory.',
            keyFormulaLatex: 'f\'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}',
            stepByStepSolution: [],
            formulaBreakdown: []
          },
          hints: []
        };
      case 'lattice':
        return {
          id: 'sandbox_lattice',
          sectorId: 'lattice',
          sectorTitle: 'Sandbox: Discrete Lattice Explorer',
          levelNumber: 0,
          code: 'SBX-5',
          title: 'Discrete Lattice & CVP Lab',
          subtitle: 'Integer Grid Span & Post-Quantum Vectors',
          description: 'Adjust integer multipliers c₁ and c₂ to generate integer linear combinations over the discrete space.',
          type: 'lattice_cvp',
          defaultParams: { c1: 1, c2: 2 },
          solutionParams: { c1: 1, c2: 2 },
          paramControls: [
            { key: 'c1', label: 'Multiplier c₁', symbol: 'c₁', min: -3, max: 4, step: 1, defaultValue: 1, description: 'Integer multiplier 1' },
            { key: 'c2', label: 'Multiplier c₂', symbol: 'c₂', min: -3, max: 4, step: 1, defaultValue: 2, description: 'Integer multiplier 2' }
          ],
          targets: [],
          obstacles: [],
          bounds: { minX: -2, maxX: 7, minY: -2, maxY: 6 },
          curriculum: {
            standard: 'Sandbox Exploration Mode',
            standardName: 'Lattice Cryptography',
            topicCategory: 'Discrete Mathematics',
            intuition: 'Freeform discrete lattice laboratory.',
            keyFormulaLatex: 'v = c_1 v_1 + c_2 v_2 \\in \\mathcal{L}',
            stepByStepSolution: [],
            formulaBreakdown: []
          },
          hints: []
        };
    }
  };

  const currentLevel = getSandboxLevel();

  const handleShare = () => {
    const config = JSON.stringify({ mode, params }, null, 2);
    navigator.clipboard.writeText(config);
    setCopied(true);
    soundEngine.playTargetHit(2);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Sandbox Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span>Sandbox Studio</span>
              <span className="text-xs text-cyan-400 font-normal px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800">
                Freeform Lab
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Unrestricted mathematical laboratory: graph, transform, differentiate, and discover
            </p>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['linear', 'parabola', 'matrix', 'calculus', 'lattice'] as SandboxMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                soundEngine.playSliderTick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                mode === m
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}

          {/* Copy Configuration */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono ml-2 transition-colors"
            title="Copy configuration JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <LevelCanvas
        level={currentLevel}
        params={params}
        onParamChange={handleParamChange}
        isFiring={isFiring}
        onSimulationComplete={() => setIsFiring(false)}
        playHitSound={(i) => soundEngine.playTargetHit(i)}
        playObstacleSound={() => soundEngine.playObstacleClang()}
      />

      {/* Controls */}
      <ControlTerminal
        level={currentLevel}
        params={params}
        onParamChange={handleParamChange}
        onFire={() => {
          soundEngine.playBeamSnap();
          setIsFiring(true);
        }}
        onReset={() => {
          setParams(currentLevel.defaultParams);
          soundEngine.playSliderTick();
        }}
        onAutoCalculate={() => {}}
        isFiring={isFiring}
        attempts={0}
        targetsHitCount={0}
        totalTargets={currentLevel.targets.length}
      />
    </div>
  );
};
