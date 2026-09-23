// Adaptive Jargon Dictionary & Dynamic Lexicon
// Translates scary mathematical symbols and jargon into intuitive mechanical metaphors based on player tier.

export type PlayerTier = 'cadet' | 'operator' | 'theorist';

export interface TermDefinition {
  key: string;
  cadet: {
    term: string;
    description: string;
    symbol: string;
  };
  operator: {
    term: string;
    description: string;
    symbol: string;
  };
  theorist: {
    term: string;
    description: string;
    symbol: string;
  };
}

export const JARGON_DICTIONARY: Record<string, TermDefinition> = {
  slope: {
    key: 'slope',
    cadet: {
      term: 'Ramp Pitch',
      description: 'Vertical climb for every step pushed forward.',
      symbol: 'Pitch',
    },
    operator: {
      term: 'Slope (m)',
      description: 'Rise over run: Δy / Δx rate of change.',
      symbol: 'm',
    },
    theorist: {
      term: 'Differential Gradient (m)',
      description: 'First-order directional derivative along coordinate axis.',
      symbol: '\\frac{\\Delta y}{\\Delta x}',
    },
  },
  intercept: {
    key: 'intercept',
    cadet: {
      term: 'Launch Height',
      description: 'Starting vertical elevation before horizontal movement begins.',
      symbol: 'Base',
    },
    operator: {
      term: 'Y-Intercept (b)',
      description: 'Point where the line crosses the vertical axis at x = 0.',
      symbol: 'b',
    },
    theorist: {
      term: 'Affine Offset (b)',
      description: 'Translational displacement vector of affine subspace: f(0).',
      symbol: 'b \\in \\mathbb{R}',
    },
  },
  determinant: {
    key: 'determinant',
    cadet: {
      term: 'Tile Squish Ratio',
      description: 'How much the area of a square tile expands or shrinks when stretched.',
      symbol: 'Area Scale',
    },
    operator: {
      term: 'Area Multiplier (det)',
      description: 'Factor by which 2D matrix transformation scales unit area: ad - bc.',
      symbol: 'det(M)',
    },
    theorist: {
      term: 'Determinant (det A)',
      description: 'Oriented volume scaling factor: \\det(M) = \\lambda_1 \\lambda_2 = ad - bc.',
      symbol: '\\det(M)',
    },
  },
  eigenvector: {
    key: 'eigenvector',
    cadet: {
      term: 'Unbending Axis',
      description: 'The laser direction that never rotates when space gets warped, only stretches.',
      symbol: 'True Axis',
    },
    operator: {
      term: 'Invariant Direction',
      description: 'Vector whose direction is preserved under matrix multiplication: Mv = λv.',
      symbol: '\\vec{v}_{\\lambda}',
    },
    theorist: {
      term: 'Characteristic Eigenvector',
      description: 'Non-zero vector in kernel \\ker(M - \\lambda I) mapping to scalar eigenvalue multiple.',
      symbol: '\\vec{v} \\in E_\\lambda',
    },
  },
  frequency: {
    key: 'frequency',
    cadet: {
      term: 'Pulse Rate',
      description: 'How rapidly the wave cycles back and forth per second.',
      symbol: 'Speed',
    },
    operator: {
      term: 'Frequency (f / ω)',
      description: 'Oscillations per unit time, governed by angular velocity ω.',
      symbol: '\\omega',
    },
    theorist: {
      term: 'Angular Velocity (ω)',
      description: 'Fundamental radial frequency \\omega = 2\\pi f in phase space.',
      symbol: '\\omega = 2\\pi f',
    },
  },
  amplitude: {
    key: 'amplitude',
    cadet: {
      term: 'Wave Crest Height',
      description: 'Maximum peak height of the beam above its center line.',
      symbol: 'Height',
    },
    operator: {
      term: 'Amplitude (A)',
      description: 'Peak deviation of the wave oscillation from equilibrium.',
      symbol: 'A',
    },
    theorist: {
      term: 'Harmonic Amplitude (A)',
      description: 'Envelope magnitude |A| governing kinetic energy density: E \\propto A^2.',
      symbol: 'A',
    },
  },
  phase: {
    key: 'phase',
    cadet: {
      term: 'Rhythm Delay',
      description: 'Horizontal time shift pushing the wave earlier or later in rhythm.',
      symbol: 'Shift',
    },
    operator: {
      term: 'Phase Offset (φ)',
      description: 'Angular shift in radians specifying start position in the oscillation cycle.',
      symbol: '\\phi',
    },
    theorist: {
      term: 'Phase Angle (φ)',
      description: 'Initial state in trigonometric phase cycle: y(t) = A\\sin(\\omega t + \\phi).',
      symbol: '\\phi \\in [0, 2\\pi)',
    },
  },
  derivative: {
    key: 'derivative',
    cadet: {
      term: 'Instant Speedometer',
      description: 'The exact slope of the curve at this single microscopic snapshot.',
      symbol: 'Speed',
    },
    operator: {
      term: 'Tangent Slope (f\')',
      description: 'Instantaneous rate of change: limit of secant chord as h approaches 0.',
      symbol: 'f\'(x)',
    },
    theorist: {
      term: 'Differential Derivative',
      description: 'The infinitesimal differential quotient: \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}.',
      symbol: '\\frac{df}{dx}',
    },
  },
  lattice: {
    key: 'lattice',
    cadet: {
      term: 'Grid of Dots',
      description: 'Regular infinite pattern of discrete peg locations across the floor.',
      symbol: 'Grid',
    },
    operator: {
      term: 'Discrete Coordinate Grid',
      description: 'All integer combinations of basis arrows: v = c1*v1 + c2*v2.',
      symbol: '\\mathcal{L}',
    },
    theorist: {
      term: 'Discrete Module Lattice',
      description: 'Discrete subgroup \\mathcal{L} \\subset \\mathbb{R}^n generated by integer span \\mathbb{Z} B.',
      symbol: '\\mathcal{L} = \\sum \\mathbb{Z} b_i',
    },
  },
};

/**
 * Translates a mathematical parameter or concept based on user rank and unlocked vocabulary.
 */
export function translateTerm(
  termKey: string,
  userTier: PlayerTier = 'cadet',
  unlockedTerms: string[] = []
): { label: string; description: string; symbol: string } {
  const normKey = termKey.toLowerCase().trim();
  const entry = JARGON_DICTIONARY[normKey];

  if (!entry) {
    return {
      label: termKey,
      description: '',
      symbol: termKey,
    };
  }

  // If user is Theorist or has explicitly unlocked the term, return theorist
  if (userTier === 'theorist' || unlockedTerms.includes(normKey)) {
    return {
      label: entry.theorist.term,
      description: entry.theorist.description,
      symbol: entry.theorist.symbol,
    };
  }

  // If user is Operator, return operator
  if (userTier === 'operator') {
    return {
      label: entry.operator.term,
      description: entry.operator.description,
      symbol: entry.operator.symbol,
    };
  }

  // Cadet tier: purely physical metaphor
  return {
    label: entry.cadet.term,
    description: entry.cadet.description,
    symbol: entry.cadet.symbol,
  };
}
