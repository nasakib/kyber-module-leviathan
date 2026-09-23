import { Vector2D, Matrix2D, SolverStep } from '../types/game';

// Vector 2D helper functions
export const dot = (v1: Vector2D, v2: Vector2D): number => v1.x * v2.x + v1.y * v2.y;
export const normSq = (v: Vector2D): number => dot(v, v);
export const norm = (v: Vector2D): number => Math.sqrt(normSq(v));
export const add = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const sub = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const mul = (v: Vector2D, scalar: number): Vector2D => ({ x: v.x * scalar, y: v.y * scalar });
export const det2D = (m: Matrix2D): number => Math.abs(m.b1.x * m.b2.y - m.b1.y * m.b2.x);
export const angleBetween = (v1: Vector2D, v2: Vector2D): number => {
  const cosTheta = dot(v1, v2) / (norm(v1) * norm(v2) || 1);
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  return (Math.acos(clampedCos) * 180) / Math.PI;
};

// Projection of v1 onto v2: proj_v2(v1) = (v1 · v2 / ||v2||^2) * v2
export const proj = (v1: Vector2D, v2: Vector2D): Vector2D => {
  const v2NormSq = normSq(v2);
  if (v2NormSq === 0) return { x: 0, y: 0 };
  const mu = dot(v1, v2) / v2NormSq;
  return mul(v2, mu);
};

// Compute Gram-Schmidt orthogonalization for 2D basis {b1, b2}
export interface GramSchmidtResult {
  b1Star: Vector2D;
  b2Star: Vector2D;
  mu21: number; // mu_2,1 = (b2 · b1*) / ||b1*||^2
}

export const computeGramSchmidt = (b1: Vector2D, b2: Vector2D): GramSchmidtResult => {
  const b1Star = { ...b1 };
  const b1NormSq = normSq(b1Star);
  const mu21 = b1NormSq === 0 ? 0 : dot(b2, b1Star) / b1NormSq;
  const b2Star = sub(b2, mul(b1Star, mu21));

  return { b1Star, b2Star, mu21 };
};

// Step-by-Step LLL Reduction & Babai CVP History Generator
export const generateLatticeSolution = (
  initialB1: Vector2D,
  initialB2: Vector2D,
  target: Vector2D,
  delta: number = 0.75
): SolverStep[] => {
  const steps: SolverStep[] = [];
  let b1 = { ...initialB1 };
  let b2 = { ...initialB2 };

  // Initial State Step
  let gs = computeGramSchmidt(b1, b2);
  steps.push({
    stepIndex: 0,
    action: 'initial',
    title: 'Initial Input Basis',
    matrix: { b1: { ...b1 }, b2: { ...b2 } },
    gsResult: { ...gs },
    mu: gs.mu21,
    b1StarNormSq: normSq(gs.b1Star),
    b2StarNormSq: normSq(gs.b2Star),
    lovaszSatisfied: false,
    explanation: 'Initial un-reduced input basis vectors entered into the solver.',
    formula: 'B = [b₁, b₂]',
  });

  // Step 1: Gram-Schmidt Orthogonalization Computation
  steps.push({
    stepIndex: 1,
    action: 'gram_schmidt',
    title: 'Gram-Schmidt Orthogonal Decomposition',
    matrix: { b1: { ...b1 }, b2: { ...b2 } },
    gsResult: { ...gs },
    mu: gs.mu21,
    b1StarNormSq: normSq(gs.b1Star),
    b2StarNormSq: normSq(gs.b2Star),
    lovaszSatisfied: false,
    explanation: `Calculated orthogonal projections b₁* = b₁ and b₂* = b₂ - μ₂₁b₁*, where μ₂₁ = ${gs.mu21.toFixed(3)}.`,
    formula: 'b₂* = b₂ - \\frac{\\langle b₂, b₁* \\rangle}{||b₁*||²} b₁*',
  });

  // LLL Loop for 2D Basis
  let k = 1;
  let stepIdx = 2;
  const maxIter = 15;
  let iter = 0;

  while (k <= 1 && iter < maxIter) {
    iter++;
    gs = computeGramSchmidt(b1, b2);

    // Size Reduction check: |mu_2,1| > 0.5
    if (Math.abs(gs.mu21) > 0.5) {
      const q = Math.round(gs.mu21);
      b2 = sub(b2, mul(b1, q));
      gs = computeGramSchmidt(b1, b2);

      steps.push({
        stepIndex: stepIdx++,
        action: 'size_reduce',
        title: `Size Reduction: b₂ = b₂ - (${q})b₁`,
        matrix: { b1: { ...b1 }, b2: { ...b2 } },
        gsResult: { ...gs },
        mu: gs.mu21,
        b1StarNormSq: normSq(gs.b1Star),
        b2StarNormSq: normSq(gs.b2Star),
        lovaszSatisfied: false,
        explanation: `Projection coefficient |μ₂,| = ${Math.abs(gs.mu21).toFixed(3)} > 0.5. Subtracted ${q}·b₁ from b₂ to make vectors as orthogonal as possible.`,
        formula: 'b₂ \\leftarrow b₂ - \\lfloor \\mu₂₁ \\rceil b₁',
      });
    }

    // Lovász Condition check: ||b2*||^2 >= (delta - mu21^2) * ||b1*||^2
    const b1NormSqVal = normSq(gs.b1Star);
    const b2NormSqVal = normSq(gs.b2Star);
    const lovaszRhs = (delta - gs.mu21 * gs.mu21) * b1NormSqVal;

    if (b2NormSqVal >= lovaszRhs) {
      // Lovász condition satisfied!
      steps.push({
        stepIndex: stepIdx++,
        action: 'complete',
        title: 'Lovász Condition Satisfied (Basis Reduced)',
        matrix: { b1: { ...b1 }, b2: { ...b2 } },
        gsResult: { ...gs },
        mu: gs.mu21,
        b1StarNormSq: b1NormSqVal,
        b2StarNormSq: b2NormSqVal,
        lovaszSatisfied: true,
        explanation: `Lovász condition ||b₂*||² (${b2NormSqVal.toFixed(1)}) ≥ (δ - μ₂₁²) ||b₁*||² (${lovaszRhs.toFixed(1)}) satisfied with δ = ${delta}! Basis is LLL-reduced.`,
        formula: '||b₂*||² \\ge (\\delta - \\mu₂₁²) ||b₁*||²',
      });
      break;
    } else {
      // Lovász condition failed -> Swap b1 and b2
      const temp = { ...b1 };
      b1 = { ...b2 };
      b2 = { ...temp };
      gs = computeGramSchmidt(b1, b2);

      steps.push({
        stepIndex: stepIdx++,
        action: 'lovasz_swap',
        title: 'Lovász Swap: Swap b₁ and b₂',
        matrix: { b1: { ...b1 }, b2: { ...b2 } },
        gsResult: { ...gs },
        mu: gs.mu21,
        b1StarNormSq: normSq(gs.b1Star),
        b2StarNormSq: normSq(gs.b2Star),
        lovaszSatisfied: false,
        explanation: `Lovász condition failed because b₂* is significantly shorter than b₁*. Swapped b₁ and b₂ to put the shorter vector first.`,
        formula: 'b₁ \\leftrightarrow b₂',
      });
    }
  }

  // Babai's Nearest Plane CVP Algorithm step on target
  gs = computeGramSchmidt(b1, b2);
  const c2 = Math.round(dot(target, gs.b2Star) / (normSq(gs.b2Star) || 1));
  const t2 = sub(target, mul(b2, c2));
  const c1 = Math.round(dot(t2, gs.b1Star) / (normSq(gs.b1Star) || 1));

  const closestLatticePoint = add(mul(b1, c1), mul(b2, c2));
  const errorVector = sub(target, closestLatticePoint);

  steps.push({
    stepIndex: stepIdx++,
    action: 'babai_cvp',
    title: "Babai's Nearest Plane CVP De-encapsulation",
    matrix: { b1: { ...b1 }, b2: { ...b2 } },
    gsResult: { ...gs },
    mu: gs.mu21,
    b1StarNormSq: normSq(gs.b1Star),
    b2StarNormSq: normSq(gs.b2Star),
    lovaszSatisfied: true,
    closestPoint: closestLatticePoint,
    errorVector,
    explanation: `Babai's algorithm projected target vector t onto reduced lattice plane, finding closest lattice point (${closestLatticePoint.x.toFixed(1)}, ${closestLatticePoint.y.toFixed(1)}) with secret noise vector e (${errorVector.x.toFixed(1)}, ${errorVector.y.toFixed(1)}).`,
    formula: 'v = \\lfloor c₂ \\rceil b₂ + \\lfloor c₁ \\rceil b₁ \\implies e = t - v',
  });

  return steps;
};
