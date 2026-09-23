// VectorForge: The Coordinate Engine - Comprehensive 20-Level Curriculum Dataset
import { LevelDefinition } from '../types/game';

export const ALL_LEVELS: LevelDefinition[] = [
  // ==========================================
  // SECTOR 1: THE LINEAR GRID (ALGEBRA I)
  // ==========================================
  {
    id: 's1_l1',
    sectorId: 'linear',
    sectorTitle: 'Sector 1: The Linear Grid',
    levelNumber: 1,
    code: '1.1',
    title: 'Direct Intercept',
    subtitle: 'Slope-Intercept Form y = mx + b',
    description: 'Calibrate the laser emitter slope (m) and y-intercept (b) to thread a continuous beam through two collinear energy nodes.',
    type: 'linear_beam',
    defaultParams: { m: 0.5, b: 0.0 },
    solutionParams: { m: 1.0, b: 1.0 },
    paramControls: [
      {
        key: 'm',
        label: 'Slope (Rate of Change)',
        symbol: 'm = \\frac{\\Delta y}{\\Delta x}',
        min: -5,
        max: 5,
        step: 0.1,
        defaultValue: 0.5,
        description: 'Rate of vertical change per horizontal unit',
        mathMeaning: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        geometricRole: 'Tilts the trajectory beam angle of ascent/descent',
        objectiveHint: 'Target α is at (2, 3) and β at (6, 7). Required slope is (7 - 3) / (6 - 2) = 1.00. Tuning m = 1.00 aligns the beam angle.'
      },
      {
        key: 'b',
        label: 'Y-Intercept (Vertical Shift)',
        symbol: 'b = y(0)',
        min: -6,
        max: 6,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Point where the beam crosses the vertical y-axis (0, b)',
        mathMeaning: 'y - mx = b',
        geometricRole: 'Translates the entire line up or down without altering its angle',
        objectiveHint: 'Substitute Target α (2, 3) into y = 1.00x + b: 3 = 1(2) + b -> b = 1.00. Tuning b = 1.00 threads the beam through both nodes.'
      }
    ],
    targets: [
      { id: 't1', x: 2, y: 3, radius: 0.5, label: 'Node α (2, 3)' },
      { id: 't2', x: 6, y: 7, radius: 0.5, label: 'Node β (6, 7)' }
    ],
    obstacles: [],
    bounds: { minX: -2, maxX: 8, minY: -2, maxY: 8 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.CED.A.2',
      standardName: 'Create Equations in Two Variables (Slope-Intercept Form)',
      topicCategory: 'Algebra I',
      intuition: 'Slope $m = \\frac{\\Delta y}{\\Delta x}$ represents the rate of vertical elevation change relative to horizontal displacement. The Greek letter Delta ($\\Delta$) denotes change or difference: $\\Delta y = y_2 - y_1$ and $\\Delta x = x_2 - x_1$. The $y$-intercept ($b$) slides the entire line up or down without changing its slope.',
      keyFormulaLatex: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad y = mx + b',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Calculate Delta Differences and Slope (m)',
          mathExpression: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{7 - 3}{6 - 2} = \\frac{4}{4} = 1.0',
          explanation: 'Subtract y-coordinates over x-coordinates between Target $\\alpha$ $(2, 3)$ and Target $\\beta$ $(6, 7)$ to compute $\\Delta y / \\Delta x$.'
        },
        {
          stepNumber: 2,
          label: 'Solve for Y-Intercept (b)',
          mathExpression: 'y = 1(x) + b \\implies 3 = 1(2) + b \\implies b = 1.0',
          explanation: 'Substitute point $(2, 3)$ and $m = 1$ into $y = mx + b$ and isolate $b$.'
        },
        {
          stepNumber: 3,
          label: 'Verify with Second Target',
          mathExpression: '7 = 1(6) + 1 = 7 \\quad \\checkmark',
          explanation: 'Substituting $x = 6$ confirms the beam trajectory passes directly through $(6, 7)$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'm = \\frac{\\Delta y}{\\Delta x}', name: 'Slope (Rate of Change)', role: 'Ratio of vertical change $\\Delta y$ to horizontal change $\\Delta x$', currentValueKey: 'm' },
        { symbol: 'b', name: 'Y-Intercept', role: 'Vertical altitude at the origin $x = 0$', currentValueKey: 'b' },
        { symbol: 'x', name: 'Input Coordinate', role: 'Horizontal position along the coordinate axis' },
        { symbol: 'y', name: 'Output Beam Height', role: 'Vertical altitude of the laser line' }
      ]
    },
    hints: [
      'Find the slope using m = (y2 - y1) / (x2 - x1) with points (2, 3) and (6, 7).',
      'The difference in y is 7 - 3 = 4; difference in x is 6 - 2 = 4, so m = 1.0.',
      'Now adjust b to 1.0 so that when x = 0, y = 1.0.'
    ]
  },
  {
    id: 's1_l2',
    sectorId: 'linear',
    sectorTitle: 'Sector 1: The Linear Grid',
    levelNumber: 2,
    code: '1.2',
    title: 'The Perpendicular Deflector',
    subtitle: 'Orthogonal Lines & Negative Reciprocal Slopes',
    description: 'A shield barrier blocks direct access to Receptor Ω at (2, 8). Aim your beam into the deflector mirror at (4, 4), which reflects at a 90° orthogonal angle (m₂ = -1/m₁).',
    type: 'linear_beam',
    defaultParams: { m: 1.0, b: 0.0 },
    solutionParams: { m: 0.5, b: 2.0 },
    paramControls: [
      {
        key: 'm',
        label: 'Emitter Slope',
        symbol: 'm_1 = \\frac{\\Delta y_1}{\\Delta x_1}',
        min: -3,
        max: 3,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Slope of primary beam approaching the mirror',
        mathMeaning: 'm_1 = -\\frac{1}{m_2}',
        geometricRole: 'Sets the incoming trajectory angle to reflect orthogonally',
        objectiveHint: 'Target Ω needs reflected slope m₂ = (8 - 4) / (2 - 4) = -2.00. Its orthogonal negative reciprocal is m₁ = -1/(-2) = 0.50.'
      },
      {
        key: 'b',
        label: 'Emitter Intercept',
        symbol: 'b_1 = y(0)',
        min: -5,
        max: 5,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Incoming beam y-intercept at x = 0',
        mathMeaning: 'b_1 = y_{mirror} - m_1 x_{mirror}',
        geometricRole: 'Translates the incoming laser vertically so it hits the mirror center',
        objectiveHint: 'With m₁ = 0.50, plug in mirror (4, 4): 4 = 0.5(4) + b₁ -> b₁ = 2.00. This delivers the beam into the deflector at (4, 4).'
      }
    ],
    targets: [
      { id: 'mirror', x: 4, y: 4, radius: 0.45, label: 'Deflector (4, 4)' },
      { id: 't2', x: 2, y: 8, radius: 0.55, label: 'Receptor Ω (2, 8)' }
    ],
    obstacles: [
      { id: 'obs1', x: 1, y: 3.5, width: 0.4, height: 4.5, type: 'shield', label: 'Ion Shield' }
    ],
    bounds: { minX: -1, maxX: 7, minY: -1, maxY: 9 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSG.GPE.B.5',
      standardName: 'Criteria for Perpendicular Lines (Negative Reciprocals)',
      topicCategory: 'Algebra I / Geometry',
      intuition: 'Two lines are perpendicular if and only if their slopes satisfy $m_1 \\cdot m_2 = -1$, meaning $m_2 = -\\frac{1}{m_1}$. Rotating a direction vector by $90^\\circ$ inverts its Delta ratios: $\\frac{\\Delta y}{\\Delta x}$ becomes $-\\frac{\\Delta x}{\\Delta y}$.',
      keyFormulaLatex: 'm_2 = -\\frac{1}{m_1} = -\\frac{\\Delta x_1}{\\Delta y_1} \\iff m_1 \\cdot m_2 = -1',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Determine Required Reflected Slope (m₂)',
          mathExpression: 'm_2 = \\frac{\\Delta y_2}{\\Delta x_2} = \\frac{8 - 4}{2 - 4} = \\frac{4}{-2} = -2.0',
          explanation: 'The reflected beam must travel from Deflector Mirror $(4, 4)$ to Target $\\Omega$ $(2, 8)$.'
        },
        {
          stepNumber: 2,
          label: 'Calculate Incoming Emitter Slope (m₁)',
          mathExpression: 'm_1 = -\\frac{1}{m_2} = -\\frac{1}{-2.0} = 0.5',
          explanation: 'Because the deflector reflects orthogonally, $m_1$ must be the negative reciprocal of $-2$.'
        },
        {
          stepNumber: 3,
          label: 'Solve for Incoming Intercept (b₁)',
          mathExpression: '4 = 0.5(4) + b_1 \\implies 4 = 2 + b_1 \\implies b_1 = 2.0',
          explanation: 'Substitute point $(4, 4)$ with $m = 0.5$ into $y = mx + b$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'm_1 = \\frac{\\Delta y_1}{\\Delta x_1}', name: 'Incoming Slope', role: 'Slope of primary beam to mirror', currentValueKey: 'm' },
        { symbol: 'm_2 = -\\frac{1}{m_1}', name: 'Reflected Orthogonal Slope', role: 'Perpendicular reflected trajectory angle' },
        { symbol: 'b_1', name: 'Incoming Intercept', role: 'Height where incoming beam intercepts $x = 0$', currentValueKey: 'b' }
      ]
    },
    hints: [
      'The reflected beam from (4, 4) to (2, 8) has slope m₂ = (8 - 4)/(2 - 4) = -2.',
      'For perpendicular reflection, incoming slope m₁ must be -1/(-2) = 0.5.',
      'Plug (4, 4) into y = 0.5x + b to find b: 4 = 0.5(4) + b -> b = 2.'
    ]
  },
  {
    id: 's1_l3',
    sectorId: 'linear',
    sectorTitle: 'Sector 1: The Linear Grid',
    levelNumber: 3,
    code: '1.3',
    title: 'Dual System Convergence',
    subtitle: 'Solving Systems of Linear Equations',
    description: 'System Defense Laser A is locked at y = 0.5x + 3.5. Configure Laser B (m, b) so both beams intersect precisely at the Core Sensor node.',
    type: 'linear_beam',
    defaultParams: { m: 1.0, b: 2.0 },
    solutionParams: { m: -1.0, b: 8.0 },
    paramControls: [
      {
        key: 'm',
        label: 'Laser B Slope',
        symbol: 'm_2',
        min: -4,
        max: 4,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Slope of controllable Laser B',
        mathMeaning: 'm_2 = \\frac{y_{core} - b_2}{x_{core}}',
        geometricRole: 'Rotates Laser B around the y-intercept axis',
        objectiveHint: 'Laser A intersects Core (3, 5). Setting m₂ = -1.00 forms a clean transverse convergence on the sensor.'
      },
      {
        key: 'b',
        label: 'Laser B Intercept',
        symbol: 'b_2',
        min: 0,
        max: 12,
        step: 0.25,
        defaultValue: 2.0,
        description: 'Height of Laser B at x = 0',
        mathMeaning: 'b_2 = y_{core} - m_2 x_{core}',
        geometricRole: 'Shifts Laser B vertically to pass through point (3, 5)',
        objectiveHint: 'For m₂ = -1.00: 5 = -1(3) + b₂ -> b₂ = 8.00. Tuning b₂ = 8.00 locks the intersection point onto the core node.'
      }
    ],
    targets: [
      { id: 'core', x: 3, y: 5, radius: 0.5, label: 'Core Node (3, 5)' }
    ],
    obstacles: [
      { id: 'wall', x: 6, y: 1, width: 0.5, height: 6, type: 'absorber', label: 'Perimeter Barrier' }
    ],
    bounds: { minX: -1, maxX: 7, minY: -1, maxY: 10 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.REI.C.6',
      standardName: 'Solve Systems of Linear Equations',
      topicCategory: 'Algebra I',
      intuition: 'The solution to a system of equations is the unique point (x, y) where the graphs cross. Setting the two equations equal to each other finds the x-value where both beams share the identical height.',
      keyFormulaLatex: 'm_1 x + b_1 = m_2 x + b_2 \\implies x = \\frac{b_2 - b_1}{m_1 - m_2}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Confirm Intersection Point of Laser A',
          mathExpression: 'y_A(3) = 0.5(3) + 3.5 = 1.5 + 3.5 = 5.0',
          explanation: 'Laser A indeed passes through the Core Node (3, 5).'
        },
        {
          stepNumber: 2,
          label: 'Choose a Line Passing Through (3, 5)',
          mathExpression: '5 = m_2(3) + b_2 \\implies b_2 = 5 - 3m_2',
          explanation: 'Any valid slope m₂ and intercept b₂ satisfying this relation will pass through (3, 5).'
        },
        {
          stepNumber: 3,
          label: 'Target m₂ = -1.0 for Transverse Angle',
          mathExpression: 'b_2 = 5 - 3(-1.0) = 5 + 3 = 8.0',
          explanation: 'Setting m₂ = -1.0 gives b₂ = 8.0, producing a high-contrast orthogonal crossing at (3, 5).'
        }
      ],
      formulaBreakdown: [
        { symbol: 'm₁ = 0.5', name: 'Laser A Slope', role: 'Fixed slope of system beam' },
        { symbol: 'b₁ = 3.5', name: 'Laser A Intercept', role: 'Fixed intercept of system beam' },
        { symbol: 'm₂', name: 'Laser B Slope', role: 'Controllable beam slope', currentValueKey: 'm' },
        { symbol: 'b₂', name: 'Laser B Intercept', role: 'Controllable beam intercept', currentValueKey: 'b' }
      ]
    },
    hints: [
      'The Core Node is at (3, 5). Laser B must satisfy 5 = m(3) + b.',
      'If you pick m = -1.0, then 5 = -1(3) + b -> b = 8.0.',
      'Both lasers will now cross cleanly at (3, 5).'
    ]
  },
  {
    id: 's1_l4',
    sectorId: 'linear',
    sectorTitle: 'Sector 1: The Linear Grid',
    levelNumber: 4,
    code: '1.4',
    title: 'Multi-Point Beam Splitting',
    subtitle: 'Collinearity & Linear Interpolation',
    description: 'Trigger all three sequential resonance gates simultaneously. For three points to lie on a single linear beam, the rate of change between every pair must be identical.',
    type: 'linear_beam',
    defaultParams: { m: 1.0, b: 0.0 },
    solutionParams: { m: 2.0, b: 1.0 },
    paramControls: [
      {
        key: 'm',
        label: 'Unified Slope',
        symbol: 'm = \\frac{\\Delta y}{\\Delta x}',
        min: -4,
        max: 4,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Common slope through all three gates',
        mathMeaning: 'm = \\frac{\\Delta y_{12}}{\\Delta x_{12}} = \\frac{\\Delta y_{23}}{\\Delta x_{23}}',
        geometricRole: 'Steers the trajectory angle to match the collinear axis of all three gates',
        objectiveHint: 'Difference between Gate 1 (-2, -3) and Gate 2 (1, 3) is 6 / 3 = 2.00. Setting m = 2.00 aligns the beam with all 3 gates.'
      },
      {
        key: 'b',
        label: 'Unified Intercept',
        symbol: 'b = y(0)',
        min: -5,
        max: 5,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Vertical height of the beam at origin x = 0',
        mathMeaning: 'b = y - mx',
        geometricRole: 'Lifts the line vertically to thread the gates without colliding with side absorbers',
        objectiveHint: 'Substitute Gate 2 (1, 3) with m = 2: 3 = 2(1) + b -> b = 1.00. Beam y = 2x + 1 clears all 3 gates simultaneously.'
      }
    ],
    targets: [
      { id: 'gate1', x: -2, y: -3, radius: 0.45, label: 'Gate 1 (-2, -3)' },
      { id: 'gate2', x: 1, y: 3, radius: 0.45, label: 'Gate 2 (1, 3)' },
      { id: 'gate3', x: 4, y: 9, radius: 0.45, label: 'Gate 3 (4, 9)' }
    ],
    obstacles: [
      { id: 'side1', x: -1, y: 2, width: 0.5, height: 4, type: 'absorber', label: 'Shield Left' },
      { id: 'side2', x: 2.5, y: -2, width: 0.5, height: 4, type: 'absorber', label: 'Shield Right' }
    ],
    bounds: { minX: -4, maxX: 6, minY: -5, maxY: 11 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.CED.A.3',
      standardName: 'Represent Constraints by Equations and Interpret Solutions',
      topicCategory: 'Algebra I',
      intuition: 'Three points are collinear if and only if the Delta quotient between points 1 and 2 equals that between points 2 and 3: $\\frac{\\Delta y_{12}}{\\Delta x_{12}} = \\frac{\\Delta y_{23}}{\\Delta x_{23}}$. A constant rate of change $\\frac{\\Delta y}{\\Delta x} = m$ is the invariant signature of all linear functions.',
      keyFormulaLatex: 'm = \\frac{\\Delta y_{12}}{\\Delta x_{12}} = \\frac{\\Delta y_{23}}{\\Delta x_{23}} = \\text{constant}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Test Slope between Gate 1 and Gate 2',
          mathExpression: 'm_{12} = \\frac{\\Delta y_{12}}{\\Delta x_{12}} = \\frac{3 - (-3)}{1 - (-2)} = \\frac{6}{3} = 2.0',
          explanation: 'Delta ratio from $(-2, -3)$ to $(1, 3)$ is $2.0$.'
        },
        {
          stepNumber: 2,
          label: 'Test Slope between Gate 2 and Gate 3',
          mathExpression: 'm_{23} = \\frac{\\Delta y_{23}}{\\Delta x_{23}} = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2.0',
          explanation: 'Both Delta quotients match identically ($m_{12} = m_{23} = 2.0$), proving collinearity.'
        },
        {
          stepNumber: 3,
          label: 'Find the Intercept (b)',
          mathExpression: 'y = 2x + b \\implies 3 = 2(1) + b \\implies b = 1.0',
          explanation: 'Substituting Gate 2 coordinates yields $b = 1.0$. The beam equation is $y = 2x + 1$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'm = \\frac{\\Delta y}{\\Delta x}', name: 'Constant Slope', role: 'Invariable rise over run across all three gates', currentValueKey: 'm' },
        { symbol: 'b', name: 'Y-Intercept', role: 'Height at origin $x = 0$', currentValueKey: 'b' }
      ]
    },
    hints: [
      'Calculate the slope between Gate 1 (-2, -3) and Gate 2 (1, 3): (3 - (-3))/(1 - (-2)) = 6/3 = 2.',
      'Check if Gate 3 (4, 9) matches: (9 - 3)/(4 - 1) = 6/3 = 2.',
      'Use Gate 2 to find b: 3 = 2(1) + b -> b = 1.0.'
    ]
  },

  // ==========================================
  // SECTOR 2: KINETIC ARCS (ALGEBRA II / PRECALCULUS)
  // ==========================================
  {
    id: 's2_l1',
    sectorId: 'parabola',
    sectorTitle: 'Sector 2: Kinetic Arcs',
    levelNumber: 1,
    code: '2.1',
    title: 'Vertex Targeting',
    subtitle: 'Vertex Form of a Parabola: y = a(x - h)² + k',
    description: 'An asteroid defense pillar guards the coordinate column at x = 3. Set vertex (h, k) and curvature (a) so the projectile arc peaks over the barrier and descends into Target Beta at (6, 1).',
    type: 'parabolic_arc',
    defaultParams: { a: -0.2, h: 2.0, k: 4.0 },
    solutionParams: { a: -0.444, h: 3.0, k: 5.0 },
    paramControls: [
      {
        key: 'a',
        label: 'Curvature Factor',
        symbol: 'a',
        min: -1.5,
        max: -0.1,
        step: 0.02,
        defaultValue: -0.2,
        description: 'Parabolic spread and gravitational descent rate',
        mathMeaning: 'y - k = a(x - h)^2 \\implies a = \\frac{y - k}{(x - h)^2}',
        geometricRole: 'Steepens or flattens the parabola trajectory width',
        objectiveHint: 'With apex (3, 5), Target Beta (6, 1) requires a = (1 - 5) / (6 - 3)² = -4/9 ≈ -0.44. Tuning a = -0.44 drops the arc precisely onto the receptor.'
      },
      {
        key: 'h',
        label: 'Apex Horizontal (h)',
        symbol: 'h',
        min: 0,
        max: 6,
        step: 0.25,
        defaultValue: 2.0,
        description: 'X-coordinate of the trajectory summit',
        mathMeaning: 'x_{\\text{apex}} = h',
        geometricRole: 'Slides the entire parabolic arch horizontally left and right',
        objectiveHint: 'The barrier pillar and Apex Node are at x = 3. Setting h = 3.00 aligns the peak directly above the barrier.'
      },
      {
        key: 'k',
        label: 'Apex Altitude (k)',
        symbol: 'k',
        min: 2,
        max: 8,
        step: 0.25,
        defaultValue: 4.0,
        description: 'Maximum vertical apogee height',
        mathMeaning: 'y_{\\max} = k',
        geometricRole: 'Lifts or lowers the trajectory peak vertically',
        objectiveHint: 'The barrier height is 3 and Apex Node is at y = 5. Setting k = 5.00 clears the barrier and neutralizes the Apex Node.'
      }
    ],
    targets: [
      { id: 'peak', x: 3, y: 5, radius: 0.45, label: 'Apex Node (3, 5)' },
      { id: 'beta', x: 6, y: 1, radius: 0.5, label: 'Target Beta (6, 1)' }
    ],
    obstacles: [
      { id: 'asteroid_wall', x: 3, y: 1.5, width: 0.4, height: 3.0, type: 'shield', label: 'Pillar (Height 3)' }
    ],
    bounds: { minX: -1, maxX: 8, minY: -1, maxY: 7 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.CED.A.1',
      standardName: 'Represent Constraints with Quadratic Functions (Vertex Form)',
      topicCategory: 'Algebra II',
      intuition: 'In vertex form y = a(x - h)² + k, the coordinate (h, k) is the absolute highest (or lowest) turning point. Because (x - h)² is always ≥ 0, when a < 0 the maximum value is strictly k, achieved when x = h.',
      keyFormulaLatex: 'y = a(x - h)^2 + k \\quad \\text{with apex at } (h, k)',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Position the Vertex Over the Barrier',
          mathExpression: 'h = 3.0, \\quad k = 5.0',
          explanation: 'The barrier is at x = 3 with height 3. Setting vertex at (3, 5) comfortably crests the wall and triggers the Apex Node.'
        },
        {
          stepNumber: 2,
          label: 'Substitute Target Beta (6, 1)',
          mathExpression: '1 = a(6 - 3)^2 + 5 \\implies 1 = a(3)^2 + 5 \\implies 1 = 9a + 5',
          explanation: 'Plug x = 6, y = 1, h = 3, k = 5 into the vertex form.'
        },
        {
          stepNumber: 3,
          label: 'Solve for Curvature (a)',
          mathExpression: '9a = 1 - 5 = -4 \\implies a = -\\frac{4}{9} \\approx -0.444',
          explanation: 'Negative value confirms the trajectory opens downward.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'a', name: 'Curvature Factor', role: 'Controls spread and downward acceleration', currentValueKey: 'a' },
        { symbol: 'h', name: 'Horizontal Shift', role: 'X-coordinate of the trajectory apex', currentValueKey: 'h' },
        { symbol: 'k', name: 'Vertical Shift', role: 'Y-coordinate peak height', currentValueKey: 'k' }
      ]
    },
    hints: [
      'Place the vertex directly over the barrier at h = 3.0 and peak height k = 5.0.',
      'Now substitute (6, 1): 1 = a(6 - 3)² + 5 -> 1 = 9a + 5 -> 9a = -4.',
      'So a = -4/9 ≈ -0.44. Set a close to -0.44!'
    ]
  },
  {
    id: 's2_l2',
    sectorId: 'parabola',
    sectorTitle: 'Sector 2: Kinetic Arcs',
    levelNumber: 2,
    code: '2.2',
    title: 'Root Calibration',
    subtitle: 'Factored Form & Zero-Gravity Windows',
    description: 'Obstacle shields block the ground except for narrow clearance slits at x = -2 and x = 4. Calibrate root factors to thread the probe through both slits and strike Receptor γ at (1, 4.5).',
    type: 'parabolic_arc',
    defaultParams: { a: -0.2, h: 1.0, k: 3.0 },
    solutionParams: { a: -0.5, h: 1.0, k: 4.5 },
    paramControls: [
      {
        key: 'a',
        label: 'Leading Coefficient (a)',
        symbol: 'a',
        min: -1.2,
        max: -0.1,
        step: 0.02,
        defaultValue: -0.2,
        description: 'Parabola dilation and vertical scale',
        mathMeaning: 'y = a(x - r_1)(x - r_2) \\implies a = \\frac{y}{(x - r_1)(x - r_2)}',
        geometricRole: 'Expands or compresses the trajectory peak height without shifting the root zero crossings',
        objectiveHint: 'For roots r₁ = -2 and r₂ = 4, evaluating target (1, 4.5) requires 4.5 = a(3)(-3) = -9a -> a = -0.50.'
      },
      {
        key: 'h',
        label: 'Symmetry Axis (h)',
        symbol: 'h = \\frac{r_1 + r_2}{2}',
        min: -1,
        max: 3,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Midpoint between ground root slits',
        mathMeaning: 'x_{\\text{axis}} = \\frac{r_1 + r_2}{2}',
        geometricRole: 'Horizontally centers the trajectory equidistant between the two ground slits',
        objectiveHint: 'Roots are at x = -2 and x = 4. The midpoint is (-2 + 4) / 2 = 1.00. Tuning h = 1.00 threads both clearance slits.'
      },
      {
        key: 'k',
        label: 'Peak Height (k)',
        symbol: 'k = y(h)',
        min: 2,
        max: 7,
        step: 0.25,
        defaultValue: 3.0,
        description: 'Summit apogee altitude at x = h',
        mathMeaning: 'k = -a \\left(\\frac{r_2 - r_1}{2}\\right)^2',
        geometricRole: 'Sets apex elevation so the top of the arc strikes Receptor γ',
        objectiveHint: 'Target Receptor γ is at (1, 4.5). Because x = 1 is the symmetry line, setting k = 4.50 strikes the receptor directly at apogee.'
      }
    ],
    targets: [
      { id: 'slit1', x: -2, y: 0, radius: 0.45, label: 'Root Gate 1 (-2, 0)' },
      { id: 'target_gamma', x: 1, y: 4.5, radius: 0.5, label: 'Receptor γ (1, 4.5)' },
      { id: 'slit2', x: 4, y: 0, radius: 0.45, label: 'Root Gate 2 (4, 0)' }
    ],
    obstacles: [
      { id: 'ground_shield_left', x: -4, y: 0, width: 3.5, height: 0.8, type: 'shield', label: 'Shield L' },
      { id: 'ground_shield_mid', x: 1, y: 0, width: 4.0, height: 0.8, type: 'shield', label: 'Shield Mid' },
      { id: 'ground_shield_right', x: 6, y: 0, width: 3.5, height: 0.8, type: 'shield', label: 'Shield R' }
    ],
    bounds: { minX: -4, maxX: 6, minY: -1, maxY: 6 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.APR.B.3',
      standardName: 'Identify Zeros of Polynomials & Quadratic Factored Form',
      topicCategory: 'Algebra II',
      intuition: 'A parabola crossing the horizontal axis at $x = r_1$ and $x = r_2$ has factored form $y = a(x - r_1)(x - r_2)$. By symmetry, the vertex must sit exactly at the average of the two roots: $h = \\frac{r_1 + r_2}{2}$.',
      keyFormulaLatex: 'y = a(x - r_1)(x - r_2), \\quad h = \\frac{r_1 + r_2}{2}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Find Axis of Symmetry (h)',
          mathExpression: 'h = \\frac{-2 + 4}{2} = \\frac{2}{2} = 1.0',
          explanation: 'The roots are $r_1 = -2$ and $r_2 = 4$. The symmetry midpoint is $x = 1.0$.'
        },
        {
          stepNumber: 2,
          label: 'Write Factored Form with Target (1, 4.5)',
          mathExpression: 'y = a(x + 2)(x - 4) \\implies 4.5 = a(1 + 2)(1 - 4)',
          explanation: 'Substitute point $(1, 4.5)$ into the factored equation.'
        },
        {
          stepNumber: 3,
          label: 'Solve for Leading Coefficient (a)',
          mathExpression: '4.5 = a(3)(-3) = -9a \\implies a = -\\frac{4.5}{9} = -0.5',
          explanation: 'Leading coefficient is $a = -0.5$, giving peak summit $k = 4.5$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'r_1, r_2', name: 'Roots / Zeros', role: 'X-intercepts where $y = 0$ ($-2$ and $4$)' },
        { symbol: 'h = \\frac{r_1+r_2}{2}', name: 'Midpoint Symmetry', role: 'Center axis of the parabola', currentValueKey: 'h' },
        { symbol: 'a', name: 'Scale Factor', role: 'Flattens or steepens trajectory curve', currentValueKey: 'a' }
      ]
    },
    hints: [
      'The two roots are at x = -2 and x = 4. Their center (axis of symmetry) is h = (-2 + 4)/2 = 1.0.',
      'At x = 1, we want height to be 4.5 (so k = 4.5).',
      'Factored form y = a(x + 2)(x - 4) -> 4.5 = a(3)(-3) = -9a -> a = -0.5.'
    ]
  },
  {
    id: 's2_l3',
    sectorId: 'parabola',
    sectorTitle: 'Sector 2: Kinetic Arcs',
    levelNumber: 3,
    code: '2.3',
    title: 'Focal Point Resonance',
    subtitle: 'The Geometric Focus: (h, k + 1/(4a))',
    description: 'Parabolic antennas concentrate all incoming parallel rays into a single focal point F. Position the parabola vertex and curvature so its focus aligns exactly with the Energy Core at (2, 3).',
    type: 'parabolic_arc',
    defaultParams: { a: 0.1, h: 0.0, k: 0.0 },
    solutionParams: { a: 0.25, h: 2.0, k: 2.0 },
    paramControls: [
      {
        key: 'a',
        label: 'Curvature (a)',
        symbol: 'a = \\frac{1}{4p}',
        min: 0.05,
        max: 1.0,
        step: 0.01,
        defaultValue: 0.1,
        description: 'Inversely controls focal distance p = 1 / (4a)',
        mathMeaning: 'p = \\frac{1}{4a} \\implies a = \\frac{1}{4p}',
        geometricRole: 'Flattens dish to project focal point higher, or steepens dish to pull focus closer',
        objectiveHint: 'For base k = 2 and Core focus at y = 3, focal distance is p = 3 - 2 = 1.00. Setting a = 1 / (4 · 1.00) = 0.25 focuses the beam onto the core.'
      },
      {
        key: 'h',
        label: 'Dish Center (h)',
        symbol: 'h',
        min: -2,
        max: 5,
        step: 0.25,
        defaultValue: 0.0,
        description: 'X-coordinate of the reflector base',
        mathMeaning: 'x_{\\text{focus}} = h',
        geometricRole: 'Horizontally positions the focal line',
        objectiveHint: 'Core Focus is at x = 2. Setting h = 2.00 aligns the dish axis directly underneath the receptor.'
      },
      {
        key: 'k',
        label: 'Dish Base (k)',
        symbol: 'k',
        min: 0,
        max: 4,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Altitude of the reflector vertex base',
        mathMeaning: 'y_{\\text{focus}} = k + \\frac{1}{4a}',
        geometricRole: 'Raises or lowers the dish base and focus',
        objectiveHint: 'Setting k = 2.00 grounds the dish base onto Base Node (2, 2) and lifts focus to 2 + 1 = 3.'
      }
    ],
    targets: [
      { id: 'focus_core', x: 2, y: 3, radius: 0.5, label: 'Energy Core Focus (2, 3)' },
      { id: 'vertex_node', x: 2, y: 2, radius: 0.4, label: 'Dish Base (2, 2)' }
    ],
    obstacles: [
      { id: 'b1', x: -1, y: 3.5, width: 0.5, height: 3, type: 'absorber', label: 'Baffle L' }
    ],
    bounds: { minX: -2, maxX: 6, minY: -1, maxY: 6 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSG.GPE.A.2',
      standardName: 'Derive Equation of Parabola Given Focus and Directrix',
      topicCategory: 'Precalculus / Analytic Geometry',
      intuition: 'A parabola is the locus of points equidistant from a point (the focus) and a line (the directrix). This special reflective property causes all parallel rays entering the dish to reflect directly into the focus.',
      keyFormulaLatex: 'y = a(x - h)^2 + k, \\quad F = \\left(h, k + \\frac{1}{4a}\\right)',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Align Horizontal Axis with Focus',
          mathExpression: 'h = 2.0',
          explanation: 'The focus x-coordinate is 2, so the vertex axis of symmetry must be h = 2.0.'
        },
        {
          stepNumber: 2,
          label: 'Relate Focal Distance p to Curvature a',
          mathExpression: 'p = y_F - k = 3.0 - 2.0 = 1.0 \\implies p = \\frac{1}{4a} = 1.0',
          explanation: 'Choosing vertex base at k = 2.0 leaves focal distance p = 1.0.'
        },
        {
          stepNumber: 3,
          label: 'Solve for a',
          mathExpression: '\\frac{1}{4a} = 1.0 \\implies 4a = 1 \\implies a = 0.25',
          explanation: 'Curvature a = 0.25 places the focal point perfectly at y = 2 + 1 = 3.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'p = 1/(4a)', name: 'Focal Length', role: 'Distance from vertex (h, k) to focus F' },
        { symbol: 'F(h, k+p)', name: 'Focus Node', role: 'Receptor location where signals converge' },
        { symbol: 'a', name: 'Curvature', role: 'Controls focal length inversely: smaller a means farther focus', currentValueKey: 'a' }
      ]
    },
    hints: [
      'The focus must be at (2, 3), so set the vertex horizontal position h = 2.0.',
      'Place the dish base at k = 2.0. The focal distance is p = 3 - 2 = 1.0.',
      'Since p = 1/(4a) = 1.0, 4a = 1 -> a = 0.25.'
    ]
  },
  {
    id: 's2_l4',
    sectorId: 'parabola',
    sectorTitle: 'Sector 2: Kinetic Arcs',
    levelNumber: 4,
    code: '2.4',
    title: 'Inverse Ballistic Arc',
    subtitle: '3-Point Parabolic Interpolation',
    description: 'A missile test requires charting an orbital arc satisfying three boundary condition sensors at (0, 2), (2, 6), and (4, 2). Derive the exact quadratic coefficients.',
    type: 'parabolic_arc',
    defaultParams: { a: -0.5, h: 1.0, k: 4.0 },
    solutionParams: { a: -1.0, h: 2.0, k: 6.0 },
    paramControls: [
      {
        key: 'a',
        label: 'Acceleration Coeff (a)',
        symbol: 'a',
        min: -2.0,
        max: -0.2,
        step: 0.05,
        defaultValue: -0.5,
        description: 'Gravitational acceleration coefficient',
        mathMeaning: 'a = \\frac{y - k}{(x - h)^2}',
        geometricRole: 'Adjusts steepness of descent from summit apogee',
        objectiveHint: 'For apex (2, 6) and baseline (0, 2), 2 = a(-2)² + 6 -> 4a = -4 -> a = -1.00. Tuning a = -1.00 threads all 3 sensors.'
      },
      {
        key: 'h',
        label: 'Midpoint Axis (h)',
        symbol: 'h = \\frac{x_1 + x_3}{2}',
        min: 0,
        max: 4,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Symmetry center between sensors 1 and 3',
        mathMeaning: 'h = \\frac{0 + 4}{2} = 2.0',
        geometricRole: 'Centers the flight parabola horizontally',
        objectiveHint: 'Sensors 1 and 3 sit symmetrically at x = 0 and x = 4. The midpoint is h = 2.00, aligning with Sensor 2.'
      },
      {
        key: 'k',
        label: 'Summit Altitude (k)',
        symbol: 'k',
        min: 3,
        max: 8,
        step: 0.25,
        defaultValue: 4.0,
        description: 'Peak apogee height',
        mathMeaning: 'k = y(2)',
        geometricRole: 'Elevates trajectory crest to match Sensor 2',
        objectiveHint: 'Sensor 2 is located at (2, 6). Setting k = 6.00 triggers Sensor 2 directly at peak apogee without hitting the ceiling.'
      }
    ],
    targets: [
      { id: 'p1', x: 0, y: 2, radius: 0.45, label: 'Sensor 1 (0, 2)' },
      { id: 'p2', x: 2, y: 6, radius: 0.45, label: 'Sensor 2 (2, 6)' },
      { id: 'p3', x: 4, y: 2, radius: 0.45, label: 'Sensor 3 (4, 2)' }
    ],
    obstacles: [
      { id: 'shield_top', x: 2, y: 7.5, width: 4.0, height: 0.5, type: 'shield', label: 'Atmospheric Ceiling' }
    ],
    bounds: { minX: -2, maxX: 6, minY: 0, maxY: 8 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSA.CED.A.2',
      standardName: 'Quadratic Curve Fitting & Boundary Conditions',
      topicCategory: 'Algebra II / Precalculus',
      intuition: 'Three non-collinear points uniquely determine a single parabola. Symmetry between $(0, 2)$ and $(4, 2)$ guarantees that the vertex x-coordinate must be exactly midway at $h = 2$.',
      keyFormulaLatex: 'y = a(x - h)^2 + k, \\quad y = -x^2 + 4x + 2',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Recognize Symmetry Axis',
          mathExpression: 'h = \\frac{0 + 4}{2} = 2.0',
          explanation: 'Points (0, 2) and (4, 2) have identical y-values, so vertex x must be h = 2.0.'
        },
        {
          stepNumber: 2,
          label: 'Identify Peak (Vertex)',
          mathExpression: 'x = 2 \\implies y = 6.0 \\implies k = 6.0',
          explanation: 'The given point (2, 6) is at x = h, meaning (2, 6) is the vertex itself!'
        },
        {
          stepNumber: 3,
          label: 'Solve for Curvature a',
          mathExpression: '2 = a(0 - 2)^2 + 6 \\implies 2 = 4a + 6 \\implies 4a = -4 \\implies a = -1.0',
          explanation: 'Substitute point (0, 2) into vertex form.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'a = -1', name: 'Curvature', role: 'Downward gravitational acceleration', currentValueKey: 'a' },
        { symbol: 'h = 2', name: 'Vertex X', role: 'Horizontal center of trajectory', currentValueKey: 'h' },
        { symbol: 'k = 6', name: 'Vertex Y', role: 'Maximum orbital apogee', currentValueKey: 'k' }
      ]
    },
    hints: [
      'Notice (0, 2) and (4, 2) share the same y-value. The midpoint is h = 2.0.',
      'Sensor 2 is at (2, 6), which sits on the midpoint axis! So k = 6.0.',
      'Plug in (0, 2): 2 = a(0 - 2)² + 6 -> 2 = 4a + 6 -> 4a = -4 -> a = -1.0.'
    ]
  },

  // ==========================================
  // SECTOR 3: THE WARP MATRIX (LINEAR ALGEBRA)
  // ==========================================
  {
    id: 's3_l1',
    sectorId: 'matrix',
    sectorTitle: 'Sector 3: The Warp Matrix',
    levelNumber: 1,
    code: '3.1',
    title: 'Basis Alignment',
    subtitle: 'Linear Transformations & Basis Vectors [î, ĵ]',
    description: 'A docking corridor has skewed coordinates. Transform the standard basis vectors î = [1, 0]ᵀ and ĵ = [0, 1]ᵀ using matrix M = [a, b; c, d] so that î lands on Dock Pin 1 at (2, 1) and ĵ lands on Dock Pin 2 at (-1, 3).',
    type: 'matrix_warp',
    defaultParams: { a: 1.0, b: 0.0, c: 0.0, d: 1.0 },
    solutionParams: { a: 2.0, b: -1.0, c: 1.0, d: 3.0 },
    paramControls: [
      {
        key: 'a',
        label: 'T(î)_x (Col 1 Row 1)',
        symbol: 'M_{11} = a',
        min: -3,
        max: 4,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Landing X coordinate of unit vector î = [1, 0]ᵀ',
        mathMeaning: 'T(\\hat{i})_x = a',
        geometricRole: 'Stretches/compresses the horizontal basis vector î along the x-axis',
        objectiveHint: 'Dock Pin 1 requires T(î) = [2, 1]ᵀ. Set a = 2.00 to align î horizontally.'
      },
      {
        key: 'c',
        label: 'T(î)_y (Col 1 Row 2)',
        symbol: 'M_{21} = c',
        min: -3,
        max: 4,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Landing Y coordinate of unit vector î = [1, 0]ᵀ',
        mathMeaning: 'T(\\hat{i})_y = c',
        geometricRole: 'Shears/rotates the basis vector î vertically along the y-axis',
        objectiveHint: 'Dock Pin 1 requires T(î) = [2, 1]ᵀ. Set c = 1.00 to complete î landing onto Pin 1.'
      },
      {
        key: 'b',
        label: 'T(ĵ)_x (Col 2 Row 1)',
        symbol: 'M_{12} = b',
        min: -3,
        max: 4,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Landing X coordinate of unit vector ĵ = [0, 1]ᵀ',
        mathMeaning: 'T(\\hat{j})_x = b',
        geometricRole: 'Shears basis vector ĵ horizontally',
        objectiveHint: 'Dock Pin 2 requires T(ĵ) = [-1, 3]ᵀ. Set b = -1.00 to tilt ĵ leftward.'
      },
      {
        key: 'd',
        label: 'T(ĵ)_y (Col 2 Row 2)',
        symbol: 'M_{22} = d',
        min: -3,
        max: 4,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Landing Y coordinate of unit vector ĵ = [0, 1]ᵀ',
        mathMeaning: 'T(\\hat{j})_y = d',
        geometricRole: 'Stretches basis vector ĵ vertically',
        objectiveHint: 'Dock Pin 2 requires T(ĵ) = [-1, 3]ᵀ. Set d = 3.00 to lock ĵ directly onto Pin 2.'
      }
    ],
    targets: [
      { id: 'pin1', x: 2, y: 1, radius: 0.45, label: 'Dock Pin 1: T(î) = [2, 1]' },
      { id: 'pin2', x: -1, y: 3, radius: 0.45, label: 'Dock Pin 2: T(ĵ) = [-1, 3]' }
    ],
    obstacles: [],
    bounds: { minX: -3, maxX: 4, minY: -2, maxY: 5 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSN.VM.C.7 & Linear Algebra 101',
      standardName: 'Represent and Manipulate 2D Linear Transformations with Matrices',
      topicCategory: 'Linear Algebra',
      intuition: 'Every 2D linear transformation is completely and uniquely described by where it sends the standard unit vectors î = [1, 0]ᵀ and ĵ = [0, 1]ᵀ. The columns of the matrix ARE literally the new landing coordinates of î and ĵ!',
      keyFormulaLatex: 'M = \\begin{bmatrix} T(\\hat{i}) & T(\\hat{j}) \\end{bmatrix} = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Map First Basis Vector î',
          mathExpression: 'M \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} a(1) + b(0) \\\\ c(1) + d(0) \\end{bmatrix} = \\begin{bmatrix} a \\\\ c \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}',
          explanation: 'The first column [a, c]ᵀ is the transformed coordinate of î. Thus a = 2.0 and c = 1.0.'
        },
        {
          stepNumber: 2,
          label: 'Map Second Basis Vector ĵ',
          mathExpression: 'M \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} a(0) + b(1) \\\\ c(0) + d(1) \\end{bmatrix} = \\begin{bmatrix} b \\\\ d \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}',
          explanation: 'The second column [b, d]ᵀ is the transformed coordinate of ĵ. Thus b = -1.0 and d = 3.0.'
        },
        {
          stepNumber: 3,
          label: 'Verify Full Matrix',
          mathExpression: 'M = \\begin{bmatrix} 2 & -1 \\\\ 1 & 3 \\end{bmatrix}, \\quad \\det(M) = (2)(3) - (-1)(1) = 7.0',
          explanation: 'Grid is non-singular with area scaling factor of 7.'
        }
      ],
      formulaBreakdown: [
        { symbol: '[a, c]ᵀ', name: 'First Column', role: 'Landing position of î = [1, 0]ᵀ', currentValueKey: 'a' },
        { symbol: '[b, d]ᵀ', name: 'Second Column', role: 'Landing position of ĵ = [0, 1]ᵀ', currentValueKey: 'b' },
        { symbol: 'det(M)', name: 'Determinant', role: 'Area scaling factor ad - bc' }
      ]
    },
    hints: [
      'The first column [a, c]ᵀ is where î goes: set a = 2.0 and c = 1.0.',
      'The second column [b, d]ᵀ is where ĵ goes: set b = -1.0 and d = 3.0.',
      'Notice how the columns of the matrix are literally the coordinates of the target pins!'
    ]
  },
  {
    id: 's3_l2',
    sectorId: 'matrix',
    sectorTitle: 'Sector 3: The Warp Matrix',
    levelNumber: 2,
    code: '3.2',
    title: 'Shear Warp',
    subtitle: 'Area-Preserving Shear Transformations [1, k; 0, 1]',
    description: 'Security laser slits are arranged diagonally along the corridor. Apply a horizontal shear matrix to slide the unit square into a parallelogram without altering its vertical height or area.',
    type: 'matrix_warp',
    defaultParams: { a: 1.0, b: 0.0, c: 0.0, d: 1.0 },
    solutionParams: { a: 1.0, b: 1.5, c: 0.0, d: 1.0 },
    paramControls: [
      {
        key: 'b',
        label: 'Shear Factor (k)',
        symbol: 'k',
        min: -2,
        max: 3,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Horizontal displacement proportional to y',
        mathMeaning: 'S_x(k) = \\begin{bmatrix} 1 & k \\\\ 0 & 1 \\end{bmatrix}',
        geometricRole: 'Slides horizontal lines parallel to the x-axis proportional to height y without changing area or vertical height',
        objectiveHint: 'The Shear Gate is at [2.5, 1.0]. Because vertex (1, 1) transforms to [1 + k, 1], set k = 1.50 so 1 + 1.50 = 2.50 to slide through the gate.'
      }
    ],
    targets: [
      { id: 'target_shear', x: 2.5, y: 1.0, radius: 0.45, label: 'Shear Gate [1+k, 1] = [2.5, 1]' }
    ],
    obstacles: [
      { id: 'slit_barrier', x: 1.2, y: 1.0, width: 0.5, height: 1.8, type: 'shield', label: 'Slit Barrier' }
    ],
    bounds: { minX: -1, maxX: 4, minY: -1, maxY: 3 },
    curriculum: {
      standard: 'Linear Algebra: Shear Operators & Geometric Invariance',
      standardName: 'Shear Transformations and Area Invariance',
      topicCategory: 'Linear Algebra',
      intuition: 'A shear slides layers parallel to an axis like a tilted deck of cards. Because the base and height remain unchanged, det(Shear) = (1)(1) - (k)(0) = 1.0, preserving geometric area exactly!',
      keyFormulaLatex: 'S_x(k) = \\begin{bmatrix} 1 & k \\\\ 0 & 1 \\end{bmatrix}, \\quad \\det(S_x) = 1',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Analyze Transformation of Point (1, 1)',
          mathExpression: '\\begin{bmatrix} 1 & k \\\\ 0 & 1 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 1 + k \\\\ 1 \\end{bmatrix}',
          explanation: 'The top vertex of the unit square at (1, 1) shifts horizontally to 1 + k.'
        },
        {
          stepNumber: 2,
          label: 'Target Position Match',
          mathExpression: '1 + k = 2.5 \\implies k = 1.5',
          explanation: 'The target requires the vertex to land at x = 2.5 while keeping y = 1.'
        },
        {
          stepNumber: 3,
          label: 'Verify Area Preservation',
          mathExpression: '\\det(S) = (1)(1) - (1.5)(0) = 1.0',
          explanation: 'Area remains identically 1.0 unit square.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'k = 1.5', name: 'Shear Parameter', role: 'Slopes the vertical grid lines by 1.5 units per unit height', currentValueKey: 'b' },
        { symbol: 'det = 1', name: 'Unit Determinant', role: 'Guarantees zero volume expansion' }
      ]
    },
    hints: [
      'The matrix is [1, k; 0, 1]. Point (1, 1) transforms to (1 + k, 1).',
      'The target is at (2.5, 1).',
      'Set 1 + k = 2.5 -> k = 1.5.'
    ]
  },
  {
    id: 's3_l3',
    sectorId: 'matrix',
    sectorTitle: 'Sector 3: The Warp Matrix',
    levelNumber: 3,
    code: '3.3',
    title: 'Pure Rotation & Orthogonality',
    subtitle: 'Rotation Matrices & Trigonometric Invariance',
    description: 'Four satellite receiver pods are spaced at 90° intervals along a circle of radius 2. Rotate the coordinate basis by angle θ = 45° (π/4 rad) to illuminate all four pods simultaneously.',
    type: 'matrix_warp',
    defaultParams: { a: 1.0, b: 0.0, c: 0.0, d: 1.0 },
    solutionParams: { a: 0.707, b: -0.707, c: 0.707, d: 0.707 },
    paramControls: [
      {
        key: 'theta_deg',
        label: 'Rotation Angle (θ)',
        symbol: '\\theta',
        min: 0,
        max: 360,
        step: 5,
        defaultValue: 0,
        unit: '°',
        description: 'Counter-clockwise angle of rotation',
        mathMeaning: 'R(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}',
        geometricRole: 'Rotates the coordinate axes counter-clockwise while preserving vector lengths and perpendicular 90° angles (orthogonal isometry)',
        objectiveHint: 'Satellite Receiver Pod 1 is at [1.414, 1.414] along the 45° diagonal line. Increasing θ to 45° perfectly aligns all four basis arms with the receiver pods.'
      }
    ],
    targets: [
      { id: 'pod1', x: 1.414, y: 1.414, radius: 0.45, label: 'Pod 1 (45°)' },
      { id: 'pod2', x: -1.414, y: 1.414, radius: 0.45, label: 'Pod 2 (135°)' },
      { id: 'pod3', x: -1.414, y: -1.414, radius: 0.45, label: 'Pod 3 (225°)' },
      { id: 'pod4', x: 1.414, y: -1.414, radius: 0.45, label: 'Pod 4 (315°)' }
    ],
    obstacles: [],
    bounds: { minX: -3, maxX: 3, minY: -3, maxY: 3 },
    curriculum: {
      standard: 'CCSS.MATH.CONTENT.HSN.VM.C.11 & Linear Algebra: Orthogonal Matrices',
      standardName: 'Rotation Matrices in 2D Space & Isometries',
      topicCategory: 'Linear Algebra / Trigonometry',
      intuition: 'A rotation matrix preserves lengths and angles (an isometry). Because columns are orthonormal (unit length and perpendicular to each other), its determinant is always +1, and its inverse is simply its transpose: R⁻¹ = Rᵀ.',
      keyFormulaLatex: 'R(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}, \\quad \\det(R) = \\cos^2\\theta + \\sin^2\\theta = 1',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Determine Angle to Target Pod 1',
          mathExpression: '\\tan(\\theta) = \\frac{1.414}{1.414} = 1.0 \\implies \\theta = 45^\\circ = \\frac{\\pi}{4}',
          explanation: 'Pod 1 lies along the diagonal line y = x.'
        },
        {
          stepNumber: 2,
          label: 'Calculate Trigonometric Values',
          mathExpression: '\\cos(45^\\circ) = \\frac{\\sqrt{2}}{2} \\approx 0.707, \\quad \\sin(45^\\circ) = \\frac{\\sqrt{2}}{2} \\approx 0.707',
          explanation: 'Evaluate sine and cosine at 45 degrees.'
        },
        {
          stepNumber: 3,
          label: 'Construct Matrix Entries',
          mathExpression: 'R(45^\\circ) = \\begin{bmatrix} 0.707 & -0.707 \\\\ 0.707 & 0.707 \\end{bmatrix}',
          explanation: 'All 4 basis axes align precisely with the 4 target pods.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'cos θ', name: 'Diagonal Entries', role: 'Projection along original axes' },
        { symbol: '±sin θ', name: 'Cross Entries', role: 'Orthogonal shear coupling to maintain 90° rigidity' }
      ]
    },
    hints: [
      'The targets lie along the diagonal y = x in the first quadrant.',
      'The angle between the positive x-axis and the line y = x is 45°.',
      'Adjust the rotation slider θ to 45°.'
    ]
  },
  {
    id: 's3_l4',
    sectorId: 'matrix',
    sectorTitle: 'Sector 3: The Warp Matrix',
    levelNumber: 4,
    code: '3.4',
    title: 'Determinant Area Compression',
    subtitle: 'Area Scaling Factor & Singularity Avoidance',
    description: 'Calibrate matrix entries so the transformed unit square expands to an exact area of det(A) = 4.0 units, while avoiding singular collapse (det(A) = 0).',
    type: 'matrix_warp',
    defaultParams: { a: 1.0, b: 0.0, c: 0.0, d: 1.0 },
    solutionParams: { a: 2.0, b: 0.0, c: 0.0, d: 2.0 },
    paramControls: [
      {
        key: 'a',
        label: 'Entry a (M₁₁)',
        symbol: 'M_{11} = a',
        min: 0.5,
        max: 4.0,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Row 1 Col 1: Horizontal scaling factor',
        mathMeaning: 'T(\\hat{i})_x = a, \\quad \\det(M) = ad - bc',
        geometricRole: 'Stretches the grid horizontally along the x-axis',
        objectiveHint: 'The target area requires det(M) = 4.00. With d = 2.00, set a = 2.00 so that a · d = 2.00 · 2.00 = 4.00.'
      },
      {
        key: 'd',
        label: 'Entry d (M₂₂)',
        symbol: 'M_{22} = d',
        min: 0.5,
        max: 4.0,
        step: 0.25,
        defaultValue: 1.0,
        description: 'Row 2 Col 2: Vertical scaling factor',
        mathMeaning: 'T(\\hat{j})_y = d, \\quad \\det(M) = ad - bc',
        geometricRole: 'Stretches the grid vertically along the y-axis',
        objectiveHint: 'The target area requires det(M) = 4.00. With a = 2.00, set d = 2.00 so that a · d = 2.00 · 2.00 = 4.00, hitting Area Target [2, 2].'
      }
    ],
    targets: [
      { id: 'area_corner', x: 2.0, y: 2.0, radius: 0.5, label: 'Area Target (det = 4)' }
    ],
    obstacles: [
      { id: 'singularity_wall', x: 0.5, y: 0.5, width: 0.2, height: 0.2, type: 'absorber', label: 'Singularity Trap (det = 0)' }
    ],
    bounds: { minX: -1, maxX: 4, minY: -1, maxY: 4 },
    curriculum: {
      standard: 'Linear Algebra: The Determinant as Area and Volume Scaling',
      standardName: 'Determinant & Matrix Invertibility',
      topicCategory: 'Linear Algebra',
      intuition: 'The determinant of a 2x2 matrix det(A) = ad - bc measures how much area is scaled under the transformation. If det(A) = 0, 2D space squashes into a 1D line or point—a singular collapse where information is permanently lost!',
      keyFormulaLatex: '\\det(A) = ad - bc = \\text{Area Scaling Factor}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Diagonal Matrix Expansion',
          mathExpression: 'M = \\begin{bmatrix} a & 0 \\\\ 0 & d \\end{bmatrix} \\implies \\det(M) = a \\cdot d - (0)(0) = ad',
          explanation: 'For a diagonal matrix, the determinant is simply the product of the diagonal elements.'
        },
        {
          stepNumber: 2,
          label: 'Set Target Area',
          mathExpression: 'ad = 4.0',
          explanation: 'We require total area of 4.0.'
        },
        {
          stepNumber: 3,
          label: 'Choose Symmetrical Scaling',
          mathExpression: 'a = 2.0, \\quad d = 2.0 \\implies 2 \\times 2 = 4.0',
          explanation: 'Setting a = 2.0 and d = 2.0 expands the unit square evenly to area 4.0.'
        }
      ],
      formulaBreakdown: [
        { symbol: 'det(A)', name: 'Determinant', role: 'Area scale factor: ad - bc', currentValueKey: 'det' },
        { symbol: 'a, d', name: 'Scaling Axes', role: 'Scale along x and y directions' }
      ]
    },
    hints: [
      'The determinant of [a, 0; 0, d] is simply a · d.',
      'We need a · d = 4.0.',
      'Set a = 2.0 and d = 2.0.'
    ]
  },

  // ==========================================
  // SECTOR 4: THE TANGENT BLADE (INTRODUCTORY CALCULUS)
  // ==========================================
  {
    id: 's4_l1',
    sectorId: 'calculus',
    sectorTitle: 'Sector 4: The Tangent Blade',
    levelNumber: 1,
    code: '4.1',
    title: 'The Secant Convergence',
    subtitle: 'Definition of Derivative as Limit of Secant Slopes (h → 0)',
    description: 'On the parabola f(x) = 0.5x², a laser chord connects (x₀, f(x₀)) at x₀ = 2 to (x₀ + h, f(x₀ + h)). Shrink the separation step h toward 0 until the secant chord becomes the instantaneous tangent line striking Target Alpha at (4, 6).',
    type: 'tangent_blade',
    defaultParams: { x0: 2.0, h: 2.0 },
    solutionParams: { x0: 2.0, h: 0.05 },
    calculusFunction: (x: number) => 0.5 * x * x,
    calculusDerivative: (x: number) => x,
    calculusFunctionLatex: 'f(x) = 0.5 x^2',
    paramControls: [
      {
        key: 'x0',
        label: 'Tangency Point (x₀)',
        symbol: 'x_0',
        min: 0.0,
        max: 4.0,
        step: 0.25,
        defaultValue: 2.0,
        description: 'Point of evaluation along parabola f(x) = 0.5x²',
        mathMeaning: 'x_0 \\in \\text{Domain}(f)',
        geometricRole: 'Anchors the pivot point (x₀, f(x₀)) on the curve',
        objectiveHint: 'Anchor on the parabola at x₀ = 2.00 where f(2) = 2.00, launching from (2, 2).'
      },
      {
        key: 'h',
        label: 'Secant Step (h)',
        symbol: 'h = \\Delta x',
        min: 0.05,
        max: 2.5,
        step: 0.05,
        defaultValue: 2.0,
        description: 'Separation between test points Δx',
        mathMeaning: 'm_{\\text{sec}} = \\frac{f(x_0 + h) - f(x_0)}{h}',
        geometricRole: 'Controls distance to the second secant sample point; as h → 0, secant pivots into the tangent line',
        objectiveHint: 'Target Alpha is at (4, 6). Decreasing h to 0.05 causes the secant slope m = 2 + 0.5h to converge to the exact tangent slope f\'(2) = 2.00, cutting through Target Alpha.'
      }
    ],
    targets: [
      { id: 'target_alpha', x: 4.0, y: 6.0, radius: 0.5, label: 'Target Alpha (4, 6)' }
    ],
    obstacles: [
      { id: 'secant_blocker', x: 3.0, y: 4.0, width: 0.3, height: 1.5, type: 'shield', label: 'Secant Hazard' }
    ],
    bounds: { minX: -1, maxX: 6, minY: -1, maxY: 8 },
    curriculum: {
      standard: 'AP Calculus AB: CHA-2 (Limit Definition of Derivative)',
      standardName: 'Instantaneous Rate of Change & Limit of Difference Quotient',
      topicCategory: 'Calculus I',
      intuition: 'A secant line measures the average rate of change $\\frac{\\Delta y}{\\Delta x}$ across an interval $h = \\Delta x$. As the separation shrinks ($\\Delta x \\to 0$), the secant line pivots smoothly into the tangent line—the instantaneous rate of change $f\'(x_0) = \\frac{df}{dx}$ at that single moment.',
      keyFormulaLatex: 'f\'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x} = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Evaluate Function at Point x₀ = 2',
          mathExpression: 'f(2) = 0.5(2)^2 = 2.0',
          explanation: 'The point of tangency is $(x_0, y_0) = (2, 2)$.'
        },
        {
          stepNumber: 2,
          label: 'Compute Difference Quotient (Delta y / Delta x)',
          mathExpression: '\\frac{\\Delta y}{\\Delta x} = \\frac{0.5(2 + h)^2 - 2}{h} = \\frac{2h + 0.5h^2}{h} = 2 + 0.5h',
          explanation: 'Secant slope formula for any finite step increment $h = \\Delta x$.'
        },
        {
          stepNumber: 3,
          label: 'Evaluate the Limit as h → 0 (Δx → 0)',
          mathExpression: 'm_{\\text{tan}} = \\lim_{h \\to 0} (2 + 0.5h) = 2.0',
          explanation: 'The instantaneous derivative $f\'(2) = 2.0$.'
        },
        {
          stepNumber: 4,
          label: 'Write Tangent Line & Verify Target',
          mathExpression: 'y - 2 = 2(x - 2) \\implies y = 2x - 2 \\quad [\\text{At } x = 4: y = 2(4) - 2 = 6.0 \\checkmark]',
          explanation: 'The true tangent blade strikes Target $\\alpha$ $(4, 6)$ directly!'
        }
      ],
      formulaBreakdown: [
        { symbol: 'h = \\Delta x', name: 'Secant Increment', role: 'Separation interval between points, shrinking toward $0$', currentValueKey: 'h' },
        { symbol: 'f\'(x_0) = \\frac{df}{dx}', name: 'Instantaneous Derivative', role: 'Slope of tangent line at $x_0 = 2$' }
      ]
    },
    hints: [
      'The difference quotient is (f(2+h) - f(2))/h = 2 + 0.5h.',
      'As h approaches 0, the secant slope converges to the derivative f\'(2) = 2.0.',
      'Slide h down towards its minimum (0.05) to snap into the true tangent line!'
    ]
  },
  {
    id: 's4_l2',
    sectorId: 'calculus',
    sectorTitle: 'Sector 4: The Tangent Blade',
    levelNumber: 2,
    code: '4.2',
    title: 'Polynomial Velocity',
    subtitle: 'Power Rule Derivatives & Tangent Trajectories',
    description: 'For cubic curve f(x) = x³ - 3x, select the point of tangency x₀ whose tangent line shoots straight into the Relay Target at (2, 2).',
    type: 'tangent_blade',
    defaultParams: { x0: 0.0, h: 0.01 },
    solutionParams: { x0: 2.0, h: 0.01 },
    calculusFunction: (x: number) => x * x * x - 3 * x,
    calculusDerivative: (x: number) => 3 * x * x - 3,
    calculusFunctionLatex: 'f(x) = x^3 - 3x',
    paramControls: [
      {
        key: 'x0',
        label: 'Tangency Point (x₀)',
        symbol: 'x_0',
        min: -2.5,
        max: 2.5,
        step: 0.25,
        defaultValue: 0.0,
        description: 'Evaluation coordinate along cubic f(x) = x³ - 3x',
        mathMeaning: 'f\'(x_0) = 3x_0^2 - 3',
        geometricRole: 'Position where the tangent laser blade departs the curve along instantaneous velocity vector',
        objectiveHint: 'Relay Target is located at (2, 2). Since f(2) = 2³ - 3(2) = 2 lies directly on the curve, set x₀ = 2.00 to launch directly through the target with slope f\'(2) = 9.00.'
      }
    ],
    targets: [
      { id: 'relay_t', x: 2.0, y: 2.0, radius: 0.5, label: 'Relay Target (2, 2)' }
    ],
    obstacles: [
      { id: 'low_wall', x: 0.5, y: -1.0, width: 0.4, height: 1.5, type: 'absorber', label: 'Trough Shield' }
    ],
    bounds: { minX: -3, maxX: 3, minY: -4, maxY: 4 },
    curriculum: {
      standard: 'AP Calculus AB: FUN-1 (Power Rule & Tangent Lines)',
      standardName: 'Derivative of Power Functions and Tangent Lines',
      topicCategory: 'Calculus I',
      intuition: 'The power rule d/dx [xⁿ] = n xⁿ⁻¹ provides an exact formula for velocity anywhere on the curve. Evaluating f\'(x₀) gives the slope of the particle ejected from the curve at x₀.',
      keyFormulaLatex: 'f(x) = x^3 - 3x \\implies f\'(x) = 3x^2 - 3',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Apply Power Rule',
          mathExpression: '\\frac{d}{dx}[x^3 - 3x] = 3x^2 - 3',
          explanation: 'Derivative of x³ is 3x²; derivative of -3x is -3.'
        },
        {
          stepNumber: 2,
          label: 'Evaluate at Candidate x₀ = 2.0',
          mathExpression: 'f(2) = 2^3 - 3(2) = 8 - 6 = 2.0',
          explanation: 'Point on curve is (2, 2).'
        },
        {
          stepNumber: 3,
          label: 'Compute Instantaneous Slope',
          mathExpression: 'f\'(2) = 3(2)^2 - 3 = 12 - 3 = 9.0',
          explanation: 'Slope at x = 2 is 9.0, passing through (2, 2).'
        }
      ],
      formulaBreakdown: [
        { symbol: 'x₀', name: 'Evaluation Point', role: 'Location where the tangent blade launches', currentValueKey: 'x0' },
        { symbol: 'f\'(x₀)', name: 'Instantaneous Slope', role: 'Trajectory launch angle: 3x₀² - 3' }
      ]
    },
    hints: [
      'The Relay Target is at (2, 2).',
      'Check if (2, 2) is actually on the curve: f(2) = 2³ - 3(2) = 8 - 6 = 2! Yes!',
      'Select x₀ = 2.0 so the tangent blade launches right through the target.'
    ]
  },
  {
    id: 's4_l3',
    sectorId: 'calculus',
    sectorTitle: 'Sector 4: The Tangent Blade',
    levelNumber: 3,
    code: '4.3',
    title: 'Extrema & Critical Points',
    subtitle: 'Fermat\'s Theorem & Zero-Slope Tangents f\'(x) = 0',
    description: 'A horizontal capacitor receptor is situated at (4, 2). For curve f(x) = -x³ + 3x, find the critical point where f\'(x) = 0 to fire a perfectly horizontal zero-slope beam.',
    type: 'tangent_blade',
    defaultParams: { x0: -0.5, h: 0.01 },
    solutionParams: { x0: 1.0, h: 0.01 },
    calculusFunction: (x: number) => -x * x * x + 3 * x,
    calculusDerivative: (x: number) => -3 * x * x + 3,
    calculusFunctionLatex: 'f(x) = -x^3 + 3x',
    paramControls: [
      {
        key: 'x0',
        label: 'Evaluation Point (x₀)',
        symbol: 'x_0',
        min: -2.0,
        max: 2.0,
        step: 0.25,
        defaultValue: -0.5,
        description: 'Position along the curve f(x) = -x³ + 3x',
        mathMeaning: 'f\'(x_0) = -3x_0^2 + 3 = 0',
        geometricRole: 'Shifts tangency point along the curve; at local extrema, tangent line is completely horizontal (slope 0)',
        objectiveHint: 'The Horizontal Capacitor is at y = 2.00. Set x₀ = 1.00 to hit the local maximum crest where f\'(1) = 0, casting a flat horizontal beam y = 2 into (4, 2).'
      }
    ],
    targets: [
      { id: 'h_cap', x: 4.0, y: 2.0, radius: 0.5, label: 'Horizontal Capacitor (4, 2)' }
    ],
    obstacles: [
      { id: 'slant_wall', x: 2.5, y: 0.0, width: 0.5, height: 1.5, type: 'shield', label: 'Slant Shield' }
    ],
    bounds: { minX: -2.5, maxX: 5, minY: -3, maxY: 4 },
    curriculum: {
      standard: 'AP Calculus AB: FUN-4 (Fermat\'s Theorem on Critical Points)',
      standardName: 'Optimization, Critical Points & First Derivative Test',
      topicCategory: 'Calculus I',
      intuition: 'At peaks and valleys (local maxima and minima), the tangent line is momentarily perfectly flat (slope = 0). Finding where f\'(x) = 0 locates the exact coordinates of these optimal crests.',
      keyFormulaLatex: 'f\'(x) = 0 \\iff -3x^2 + 3 = 0 \\implies x = \\pm 1',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Take Derivative',
          mathExpression: 'f\'(x) = \\frac{d}{dx}[-x^3 + 3x] = -3x^2 + 3',
          explanation: 'Differentiate each term.'
        },
        {
          stepNumber: 2,
          label: 'Set Derivative to Zero',
          mathExpression: '-3x^2 + 3 = 0 \\implies 3x^2 = 3 \\implies x^2 = 1 \\implies x = \\pm 1',
          explanation: 'Critical points occur at x = 1 and x = -1.'
        },
        {
          stepNumber: 3,
          label: 'Evaluate Height at Peak (x = 1)',
          mathExpression: 'f(1) = -(1)^3 + 3(1) = -1 + 3 = 2.0',
          explanation: 'The local maximum is at (1, 2). Tangent line is y = 2.0.'
        },
        {
          stepNumber: 4,
          label: 'Verify Target Reception',
          mathExpression: 'y = 2.0 \\quad \\text{at } x = 4.0 \\quad \\checkmark',
          explanation: 'Horizontal beam strikes (4, 2) perfectly!'
        }
      ],
      formulaBreakdown: [
        { symbol: 'f\'(x) = 0', name: 'Critical Condition', role: 'Horizontal tangent line' },
        { symbol: 'x = 1', name: 'Local Maximum', role: 'Crest of the hill at height y = 2', currentValueKey: 'x0' }
      ]
    },
    hints: [
      'Take the derivative: f\'(x) = -3x² + 3.',
      'Set f\'(x) = 0: -3x² + 3 = 0 -> 3x² = 3 -> x² = 1 -> x = ±1.',
      'At x = 1, f(1) = -1 + 3 = 2. The horizontal tangent y = 2 hits (4, 2)!'
    ]
  },
  {
    id: 's4_l4',
    sectorId: 'calculus',
    sectorTitle: 'Sector 4: The Tangent Blade',
    levelNumber: 4,
    code: '4.4',
    title: 'The Inflection Laser',
    subtitle: 'Second Derivatives & Points of Inflection f\'\'(x) = 0',
    description: 'Curve f(x) = (1/3)x³ - x² - 3x transitions from concave down to concave up. Locate the inflection point x₀ where f\'\'(x) = 0 to launch a beam along the transitional tangent into Sensor Chi at (3, -11.67).',
    type: 'tangent_blade',
    defaultParams: { x0: -0.5, h: 0.01 },
    solutionParams: { x0: 1.0, h: 0.01 },
    calculusFunction: (x: number) => (1 / 3) * x * x * x - x * x - 3 * x,
    calculusDerivative: (x: number) => x * x - 2 * x - 3,
    calculusFunctionLatex: 'f(x) = \\frac{1}{3}x^3 - x^2 - 3x',
    paramControls: [
      {
        key: 'x0',
        label: 'Inflection Point (x₀)',
        symbol: 'x_0',
        min: -1.0,
        max: 3.0,
        step: 0.25,
        defaultValue: -0.5,
        description: 'Evaluation coordinate along f(x) = (1/3)x³ - x² - 3x',
        mathMeaning: 'f\'\'(x_0) = 2x_0 - 2 = 0',
        geometricRole: 'Finds the point of zero curvature where the curve flips concavity and tangent line slices through the function',
        objectiveHint: 'Setting x₀ = 1.00 places the blade at the inflection point f\'\'(1) = 0 with slope f\'(1) = -4.00, shooting the beam straight into Sensor Chi at (3, -11.67).'
      }
    ],
    targets: [
      { id: 'sensor_chi', x: 3.0, y: -11.67, radius: 0.6, label: 'Sensor Chi (3, -11.67)' }
    ],
    obstacles: [
      { id: 'concavity_shield', x: 1.5, y: -6.0, width: 0.4, height: 1.5, type: 'absorber', label: 'Baffle' }
    ],
    bounds: { minX: -2, maxX: 4, minY: -14, maxY: 3 },
    curriculum: {
      standard: 'AP Calculus AB: FUN-5 (Concavity & Inflection Points)',
      standardName: 'Second Derivative Test & Points of Inflection',
      topicCategory: 'Calculus I',
      intuition: 'The second derivative f\'\'(x) describes curvature. When f\'\'(x) > 0, the curve is shaped like a cup (concave up); when f\'\'(x) < 0, it is shaped like a frown (concave down). The inflection point is where curvature flips sign and the tangent line cuts straight through the curve.',
      keyFormulaLatex: 'f\'\'(x) = 0 \\iff 2x - 2 = 0 \\implies x = 1',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Compute First and Second Derivatives',
          mathExpression: 'f\'(x) = x^2 - 2x - 3, \\quad f\'\'(x) = 2x - 2',
          explanation: 'Differentiate twice with the power rule.'
        },
        {
          stepNumber: 2,
          label: 'Solve for Inflection Point',
          mathExpression: '2x - 2 = 0 \\implies 2x = 2 \\implies x = 1.0',
          explanation: 'The inflection point is at x = 1.0.'
        },
        {
          stepNumber: 3,
          label: 'Find Tangent Slope and Equation',
          mathExpression: 'f\'(1) = 1^2 - 2(1) - 3 = -4.0, \\quad f(1) = \\frac{1}{3} - 1 - 3 = -3.67',
          explanation: 'Equation is y - (-3.67) = -4(x - 1) -> y = -4x + 0.33.'
        },
        {
          stepNumber: 4,
          label: 'Verify at x = 3.0',
          mathExpression: 'y(3) = -4(3) + 0.33 = -12 + 0.33 = -11.67 \\quad \\checkmark',
          explanation: 'Strikes Sensor Chi at (3, -11.67)!'
        }
      ],
      formulaBreakdown: [
        { symbol: 'f\'\'(x) = 0', name: 'Inflection Condition', role: 'Point of zero curvature where bending flips direction' },
        { symbol: 'x = 1', name: 'Inflection Coordinate', role: 'Location of transition', currentValueKey: 'x0' }
      ]
    },
    hints: [
      'Find the second derivative: f\'(x) = x² - 2x - 3, so f\'\'(x) = 2x - 2.',
      'Set f\'\'(x) = 0: 2x - 2 = 0 -> x = 1.0.',
      'Set the tangency point x₀ = 1.0.'
    ]
  },

  // ==========================================
  // SECTOR 5: THE CRYPTOGRAPHIC VAULT (DISCRETE MATH & LATTICE CRYPTO)
  // ==========================================
  {
    id: 's5_l1',
    sectorId: 'lattice',
    sectorTitle: 'Sector 5: The Cryptographic Vault',
    levelNumber: 1,
    code: '5.1',
    title: 'The Gauss Reduction Gear',
    subtitle: 'Lagrange-Gauss 2D Lattice Reduction',
    description: 'A discrete integer lattice is masked with a skewed, long basis: v₁ = [5, 1]ᵀ and v₂ = [3, 1]ᵀ. Apply the integer projection reduction step v₁\' = v₁ - ⌊μ⌉ v₂ to reveal the shortest basis vector.',
    type: 'lattice_cvp',
    defaultParams: { q_factor: 1 },
    solutionParams: { q_factor: 2 },
    paramControls: [
      {
        key: 'q_factor',
        label: 'Reduction Quotient (⌊μ⌉)',
        symbol: 'q = \\lfloor \\mu \\rceil',
        min: -3,
        max: 4,
        step: 1,
        defaultValue: 1,
        description: 'Integer multiple: round((v₁ · v₂) / ||v₂||²)',
        mathMeaning: 'v_1\' = v_1 - q \\cdot v_2, \\quad q = \\left\\lfloor \\frac{v_1 \\cdot v_2}{\\|v_2\\|^2} \\right\\rceil',
        geometricRole: 'Subtracts nearest integer multiple of basis vector v₂ from v₁ to minimize its length and increase basis orthogonality',
        objectiveHint: 'v₁ · v₂ = 16 and ||v₂||² = 10, giving projection ratio μ = 1.6. Rounding to q = 2 minimizes the basis vector to [-1, -1]ᵀ, striking the shortest vector target node.'
      }
    ],
    targets: [
      { id: 'short_v', x: -1, y: -1, radius: 0.45, label: 'Shortest Vector [-1, -1]' }
    ],
    obstacles: [],
    bounds: { minX: -3, maxX: 6, minY: -3, maxY: 4 },
    curriculum: {
      standard: 'Discrete Mathematics / Modern Cryptography (NIST Post-Quantum ML-KEM)',
      standardName: 'Gauss-Lagrange 2D Lattice Reduction',
      topicCategory: 'Lattice Cryptography',
      intuition: 'Cryptographic security in post-quantum schemes relies on the hardness of finding short vectors in a lattice. While high dimensions (n=512+) make this computationally intractable, in 2D Gauss reduction subtracts nearest integer multiples of neighboring vectors until basis vectors are minimal and near-orthogonal.',
      keyFormulaLatex: 'v_1\' = v_1 - \\lfloor \\mu \\rceil v_2, \\quad \\mu = \\frac{v_1 \\cdot v_2}{\\|v_2\\|^2}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Compute Dot Product and Norm',
          mathExpression: 'v_1 \\cdot v_2 = (5)(3) + (1)(1) = 15 + 1 = 16, \\quad \\|v_2\\|^2 = 3^2 + 1^2 = 10',
          explanation: 'Calculate inner product between v₁ and v₂.'
        },
        {
          stepNumber: 2,
          label: 'Calculate Gram-Schmidt Projection Factor μ',
          mathExpression: '\\mu = \\frac{16}{10} = 1.6 \\implies \\lfloor \\mu \\rceil = \\text{round}(1.6) = 2',
          explanation: 'Nearest integer rounding yields q = 2.'
        },
        {
          stepNumber: 3,
          label: 'Perform Vector Reduction',
          mathExpression: 'v_1\' = \\begin{bmatrix} 5 \\\\ 1 \\end{bmatrix} - 2 \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 5 - 6 \\\\ 1 - 2 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ -1 \\end{bmatrix}',
          explanation: 'Length is reduced from √26 ≈ 5.1 down to √2 ≈ 1.41.'
        }
      ],
      formulaBreakdown: [
        { symbol: '\\mu = \\frac{\\langle v_1, v_2 \\rangle}{\\|v_2\\|^2}', name: 'Projection Ratio (\\mu)', role: 'Continuous scalar projection of $v_1$ onto $v_2$' },
        { symbol: 'q = \\lfloor \\mu \\rceil', name: 'Nearest Integer Quotient', role: 'Integer multiple subtracted to minimize length $\\|v_1\'\\|$', currentValueKey: 'q_factor' }
      ]
    },
    hints: [
      'Calculate dot product: (5)(3) + (1)(1) = 16.',
      'Norm squared of v₂ is 3² + 1² = 10.',
      'The projection ratio is 16/10 = 1.6. Nearest integer is round(1.6) = 2!'
    ]
  },
  {
    id: 's5_l2',
    sectorId: 'lattice',
    sectorTitle: 'Sector 5: The Cryptographic Vault',
    levelNumber: 2,
    code: '5.2',
    title: 'Babai\'s Closest Vector Vault',
    subtitle: 'Closest Vector Problem (CVP) Decoding',
    description: 'An intercept ciphertext coordinate t = [3.2, 4.1]ᵀ has been corrupted with noise e. Use Babai\'s rounding technique on basis B = [2, 1; 0, 2] to find the secret lattice code point.',
    type: 'lattice_cvp',
    defaultParams: { c1: 0, c2: 0 },
    solutionParams: { c1: 1, c2: 2 },
    paramControls: [
      {
        key: 'c1',
        label: 'Coefficient c₁',
        symbol: 'c_1',
        min: -2,
        max: 4,
        step: 1,
        defaultValue: 0,
        description: 'Integer multiplier for basis vector 1: b₁ = [2, 0]ᵀ',
        mathMeaning: 'c_1 = \\lfloor (B^{-1} t)_1 \\rceil',
        geometricRole: 'Discrete integer lattice coordinate scaling the horizontal basis vector b₁',
        objectiveHint: 'Inverting the basis gives continuous coordinate c₁ = 0.6. Rounding to integer c₁ = 1 strips horizontal channel noise to land on Lattice Node [4, 4].'
      },
      {
        key: 'c2',
        label: 'Coefficient c₂',
        symbol: 'c_2',
        min: -2,
        max: 4,
        step: 1,
        defaultValue: 0,
        description: 'Integer multiplier for basis vector 2: b₂ = [1, 2]ᵀ',
        mathMeaning: 'c_2 = \\lfloor (B^{-1} t)_2 \\rceil',
        geometricRole: 'Discrete integer lattice coordinate scaling the slanted basis vector b₂',
        objectiveHint: 'From 2c₂ = 4.1, continuous coordinate c₂ = 2.05. Rounding to integer c₂ = 2 cancels vertical perturbation to reach Lattice Node [4, 4].'
      }
    ],
    targets: [
      { id: 'lattice_node', x: 4.0, y: 4.0, radius: 0.5, label: 'Lattice Node [4, 4]' }
    ],
    obstacles: [],
    bounds: { minX: -1, maxX: 6, minY: -1, maxY: 6 },
    curriculum: {
      standard: 'Discrete Mathematics / Post-Quantum Cryptography: CVP',
      standardName: 'Babai\'s Nearest Plane / Rounding Algorithm',
      topicCategory: 'Lattice Cryptography',
      intuition: 'In lattice cryptography, ciphertexts are perturbed by small noise $e$: $t = Bc + e$. Because the recipient possesses the reduced basis $B$, continuous coordinates $c = B^{-1}t$ can be rounded $\\lfloor c \\rceil$ to eliminate noise $|e| < \\frac{\\lambda_1}{2}$.',
      keyFormulaLatex: 't = B c + e \\implies c = \\lfloor B^{-1} t \\rceil',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Solve Linear System B c = t',
          mathExpression: '\\begin{bmatrix} 2 & 1 \\\\ 0 & 2 \\end{bmatrix} \\begin{bmatrix} c_1 \\\\ c_2 \\end{bmatrix} = \\begin{bmatrix} 3.2 \\\\ 4.1 \\end{bmatrix}',
          explanation: 'Set up continuous coordinate system without rounding.'
        },
        {
          stepNumber: 2,
          label: 'Solve for Continuous c₂ and Round',
          mathExpression: '2 c_2 = 4.1 \\implies c_2 = 2.05 \\implies \\lfloor c_2 \\rceil = 2',
          explanation: '$c_2$ rounds cleanly to $2$.'
        },
        {
          stepNumber: 3,
          label: 'Back-Substitute to Solve c₁',
          mathExpression: '2 c_1 + 2 = 3.2 \\implies 2 c_1 = 1.2 \\implies c_1 = 0.6 \\implies \\lfloor c_1 \\rceil = 1',
          explanation: '$c_1$ rounds cleanly to $1$.'
        },
        {
          stepNumber: 4,
          label: 'Reconstruct Secret Lattice Point',
          mathExpression: '1 \\begin{bmatrix} 2 \\\\ 0 \\end{bmatrix} + 2 \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} = \\begin{bmatrix} 4 \\\\ 4 \\end{bmatrix} \\quad \\checkmark',
          explanation: 'Target node is precisely $[4, 4]^T$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 't = B c + e', name: 'Noisy Target Ciphertext', role: 'Continuous vector perturbed by noise $e$' },
        { symbol: 'c = \\lfloor B^{-1} t \\rceil', name: 'Babai Rounded Coordinates', role: 'Integer linear combination multipliers', currentValueKey: 'c1' }
      ]
    },
    hints: [
      'Basis vector 1 is [2, 0]ᵀ and basis vector 2 is [1, 2]ᵀ.',
      'From 2·c₂ = 4.1, c₂ = 2.05, which rounds to c₂ = 2.',
      'Then 2·c₁ + 1(2) = 3.2 -> 2·c₁ = 1.2 -> c₁ = 0.6, which rounds to c₁ = 1.'
    ]
  },
  {
    id: 's5_l3',
    sectorId: 'lattice',
    sectorTitle: 'Sector 5: The Cryptographic Vault',
    levelNumber: 3,
    code: '5.3',
    title: 'The Noisy Channel (LWE)',
    subtitle: 'Learning With Errors Noise Filter',
    description: 'An encrypted message packet a·s + e is received with noise amplitude |e| ≤ 0.8. Adjust the quantization threshold filter to separate noise from the discrete modular signal.',
    type: 'lattice_cvp',
    defaultParams: { c1: 0, c2: 0 },
    solutionParams: { c1: 2, c2: 1 },
    paramControls: [
      {
        key: 'c1',
        label: 'Carrier Weight s₁',
        symbol: 's_1',
        min: -1,
        max: 4,
        step: 1,
        defaultValue: 0,
        description: 'Carrier sample weight 1 for public vector [2, 1]ᵀ',
        mathMeaning: 's_1 \\in \\mathbb{Z}_q',
        geometricRole: 'Integer coefficient multiplying carrier sample a₁ = [2, 1]ᵀ',
        objectiveHint: 'Target LWE secret is at [5, 3]. Setting s₁ = 2 provides base contribution 2·[2, 1] = [4, 2] toward the uncorrupted message.'
      },
      {
        key: 'c2',
        label: 'Carrier Weight s₂',
        symbol: 's_2',
        min: -1,
        max: 4,
        step: 1,
        defaultValue: 0,
        description: 'Carrier sample weight 2 for public vector [1, 1]ᵀ',
        mathMeaning: 's_2 \\in \\mathbb{Z}_q',
        geometricRole: 'Integer coefficient multiplying carrier sample a₂ = [1, 1]ᵀ',
        objectiveHint: 'Setting s₂ = 1 adds [1, 1]ᵀ, yielding [4, 2] + [1, 1] = [5, 3]ᵀ to overcome channel noise |e| ≤ 0.8 and decrypt the secret.'
      }
    ],
    targets: [
      { id: 'lwe_core', x: 5.0, y: 3.0, radius: 0.5, label: 'LWE Secret [5, 3]' }
    ],
    obstacles: [],
    bounds: { minX: -1, maxX: 7, minY: -1, maxY: 5 },
    curriculum: {
      standard: 'Post-Quantum Cryptography: Learning With Errors (LWE)',
      standardName: 'Hardness of LWE and Trapdoor Inversion',
      topicCategory: 'Lattice Cryptography',
      intuition: 'Oded Regev proved that solving noisy linear equations over discrete lattices is as hard as worst-case lattice problems. In LWE, samples take the form $b = \\sum_{i=1}^n a_i s_i + e \\pmod q$. Decryption works because noise is bounded $|e| \\le \\delta < \\frac{q}{4}$, allowing rounding back to the discrete integer node.',
      keyFormulaLatex: 'b = \\sum_{i=1}^n a_i s_i + e \\pmod q, \\quad |e| \\le \\delta < \\frac{q}{4}',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Evaluate Public Carrier Inner Product',
          mathExpression: 'b_1 = [2, 1]^T, \\quad b_2 = [1, 1]^T, \\quad \\sum_{i=1}^2 a_i s_i',
          explanation: 'Public carrier basis vectors.'
        },
        {
          stepNumber: 2,
          label: 'Evaluate with Secret Vector [2, 1]',
          mathExpression: '2 \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 1 \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 4 + 1 \\\\ 2 + 1 \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 3 \\end{bmatrix}',
          explanation: 'Noise $|e| \\le \\delta$ is safely rounded out to decode $[5, 3]^T$.'
        }
      ],
      formulaBreakdown: [
        { symbol: '\\sum a_i s_i', name: 'Carrier Sum (\\Sigma)', role: 'Sum of carrier samples weighted by secret vector $s$' },
        { symbol: '|e| \\le \\delta', name: 'Noise Bound (\\delta)', role: 'Gaussian error threshold safely eliminated by quantization' }
      ]
    },
    hints: [
      'The target is at [5, 3].',
      'Basis 1 is [2, 1] and Basis 2 is [1, 1].',
      'Check: 2·[2, 1] + 1·[1, 1] = [4, 2] + [1, 1] = [5, 3]. Set c₁ = 2, c₂ = 1.'
    ]
  },
  {
    id: 's5_l4',
    sectorId: 'lattice',
    sectorTitle: 'Sector 5: The Cryptographic Vault',
    levelNumber: 4,
    code: '5.4',
    title: 'Kyber Matrix Decryption',
    subtitle: 'Module-LWE Decryption & Core Defusal',
    description: 'To defuse the Leviathan Core, compute the modular inner product sᵀ A + e. Select modular key coefficients to snap the noisy ciphertext vector to the root decoding key at [3, 2].',
    type: 'lattice_cvp',
    defaultParams: { c1: 0, c2: 0 },
    solutionParams: { c1: 1, c2: 1 },
    paramControls: [
      {
        key: 'c1',
        label: 'Secret Key s₁',
        symbol: 's_1',
        min: 0,
        max: 3,
        step: 1,
        defaultValue: 0,
        description: 'Module key entry 1 for basis vector [2, 1]ᵀ',
        mathMeaning: 's_1 \\in R_q',
        geometricRole: 'First component of the secret key polynomial vector s',
        objectiveHint: 'The decrypted root key is at [3, 2]. Setting s₁ = 1 activates basis vector [2, 1]ᵀ in the inner product sᵀ A.'
      },
      {
        key: 'c2',
        label: 'Secret Key s₂',
        symbol: 's_2',
        min: 0,
        max: 3,
        step: 1,
        defaultValue: 0,
        description: 'Module key entry 2 for basis vector [1, 1]ᵀ',
        mathMeaning: 's_2 \\in R_q',
        geometricRole: 'Second component of the secret key polynomial vector s',
        objectiveHint: 'Setting s₂ = 1 adds basis vector [1, 1]ᵀ, completing 1·[2, 1] + 1·[1, 1] = [3, 2]ᵀ and defusing the Leviathan Core.'
      }
    ],
    targets: [
      { id: 'kyber_root', x: 3.0, y: 2.0, radius: 0.55, label: 'Decrypted Key [3, 2]' }
    ],
    obstacles: [],
    bounds: { minX: -1, maxX: 5, minY: -1, maxY: 4 },
    curriculum: {
      standard: 'NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)',
      standardName: 'Kyber Polynomial Matrix Inversion & Noise Elimination',
      topicCategory: 'Lattice Cryptography',
      intuition: 'Kyber (ML-KEM) secures modern communication against quantum computers. Decryption computes the inner product $\\sum_{i=1}^k s_i v_i$ of the private vector with the ciphertext and decodes coefficients depending on whether they fall closer to $0$ or $\\frac{q}{2}$.',
      keyFormulaLatex: 'm = \\text{Decode}\\left( u - \\sum_{i=1}^k s_i v_i \\right) \\pmod q',
      stepByStepSolution: [
        {
          stepNumber: 1,
          label: 'Module Matrix Vector Multiplication',
          mathExpression: 'v = s_1 \\cdot [2, 1]^T + s_2 \\cdot [1, 1]^T = \\sum_{i=1}^2 s_i b_i',
          explanation: 'Reconstruct inner product over 2D lattice.'
        },
        {
          stepNumber: 2,
          label: 'Evaluate with Private Key [1, 1]',
          mathExpression: '1 \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 1 \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 3 \\\\ 2 \\end{bmatrix}',
          explanation: 'Eliminates error term and yields target key $[3, 2]^T$.'
        }
      ],
      formulaBreakdown: [
        { symbol: 's = [s_1, s_2]', name: 'Private Key Vector', role: 'Secret vector known only to recipient' },
        { symbol: '\\sum_{i=1}^k s_i v_i', name: 'Module Inner Product (\\Sigma)', role: 'Sum canceling out the public mask' },
        { symbol: 'u, v', name: 'Ciphertext Payloads', role: 'Encrypted vectors carrying message $m$' }
      ]
    },
    hints: [
      'The decrypted key target is at [3, 2].',
      'Basis vectors are [2, 1] and [1, 1].',
      '1·[2, 1] + 1·[1, 1] = [3, 2]. Set s₁ = 1 and s₂ = 1.'
    ]
  }
];

export const SECTORS = [
  { id: 'linear', code: 'S1', title: 'The Linear Grid', description: 'Algebra I: Slopes, Intercepts, Perpendiculars & Systems', color: 'cyan', levels: ['s1_l1', 's1_l2', 's1_l3', 's1_l4'] },
  { id: 'parabola', code: 'S2', title: 'Kinetic Arcs', description: 'Algebra II: Vertex Form, Zeros, Parabolas & Trajectories', color: 'emerald', levels: ['s2_l1', 's2_l2', 's2_l3', 's2_l4'] },
  { id: 'matrix', code: 'S3', title: 'The Warp Matrix', description: 'Linear Algebra: 2D Basis Transformations, Shears, Rotations & Determinants', color: 'violet', levels: ['s3_l1', 's3_l2', 's3_l3', 's3_l4'] },
  { id: 'calculus', code: 'S4', title: 'The Tangent Blade', description: 'Calculus I: Secants, Power Rule, Critical Points & Inflections', color: 'amber', levels: ['s4_l1', 's4_l2', 's4_l3', 's4_l4'] },
  { id: 'lattice', code: 'S5', title: 'The Cryptographic Vault', description: 'Discrete Math: Lattice Reduction, CVP & NIST Kyber / ML-KEM', color: 'rose', levels: ['s5_l1', 's5_l2', 's5_l3', 's5_l4'] }
];
