import { getSupabase } from '../lib/supabase';
import { CommunityLevel, LevelDifficulty } from '../types/cloud';
import { LevelDefinition } from '../types/game';

// Sample fallback levels for offline / unauthenticated exploration
const FALLBACK_COMMUNITY_LEVELS: CommunityLevel[] = [
  {
    id: 'sample_comm_1',
    authorName: 'AdaLovelace_88',
    title: 'The Harmonic Double Slit',
    sectorId: 'kinetics',
    description: 'Two oscillating phase-shifted harmonic barriers that create an interference corridor. Time your parabola apex precisely!',
    difficulty: 'hard',
    upvotes: 42,
    playCount: 180,
    createdAt: '2026-09-18T10:00:00Z',
    levelData: {
      id: 'comm_harmonic_double_slit',
      sectorId: 'kinetics',
      sectorTitle: 'Community: Wave Kinetics',
      levelNumber: 101,
      code: 'COM-01',
      title: 'The Harmonic Double Slit',
      subtitle: 'Wave-Particle Trajectory Navigation',
      description: 'Navigate through twin pulsating harmonic barrier apertures.',
      type: 'parabolic_arc',
      defaultParams: { a: -0.2, h: 2, k: 3 },
      solutionParams: { a: -0.22, h: 3, k: 4.5 },
      paramControls: [
        { key: 'a', label: 'Curvature (a)', symbol: 'a', min: -1, max: 0, step: 0.02, defaultValue: -0.2, description: 'Quadratic coefficient' },
        { key: 'h', label: 'Vertex X (h)', symbol: 'h', min: -2, max: 8, step: 0.5, defaultValue: 2, description: 'Peak X coordinate' },
        { key: 'k', label: 'Vertex Y (k)', symbol: 'k', min: 0, max: 7, step: 0.5, defaultValue: 3, description: 'Peak Y peak' },
      ],
      targets: [
        { id: 'ct_1', x: 7, y: 1.5, radius: 0.5, label: 'Collector (7, 1.5)' }
      ],
      obstacles: [],
      harmonicObstacles: [
        { id: 'h1', type: 'harmonic_barrier', x: 2, amplitude: 1.8, frequency: 1.2, phase: 0, baseY: 2.5, width: 0.6, gapSize: 1.6 },
        { id: 'h2', type: 'harmonic_barrier', x: 5, amplitude: 1.8, frequency: 1.2, phase: Math.PI / 2, baseY: 2.5, width: 0.6, gapSize: 1.6 },
      ],
      bounds: { minX: -1, maxX: 9, minY: -1, maxY: 7 },
      curriculum: {
        standard: 'Community Innovation',
        standardName: 'Dynamic Wave Oscillators',
        topicCategory: 'Applied Physics',
        intuition: 'Coordinate flight through alternating phase gaps.',
        keyFormulaLatex: 'y(t) = y_0 + A \\sin(\\omega t + \\phi)',
        stepByStepSolution: [
          { stepNumber: 1, label: 'Aperture Phase Synchronization', mathExpression: '\\Delta \\phi = \\frac{\\pi}{2}', explanation: 'The second harmonic barrier leads the first by 90 degrees of phase.' }
        ],
        formulaBreakdown: []
      },
      hints: ['Align the vertex h between the two gates to maximize clearance window.']
    }
  },
  {
    id: 'sample_comm_2',
    authorName: 'GaussEuler99',
    title: 'Orthogonal Ray Chamber',
    sectorId: 'linear',
    description: 'Requires reflecting a linear beam off two perpendicular mirrors to strike a hidden detector.',
    difficulty: 'medium',
    upvotes: 35,
    playCount: 142,
    createdAt: '2026-09-19T14:30:00Z',
    levelData: {
      id: 'comm_orthogonal_ray',
      sectorId: 'linear',
      sectorTitle: 'Community: Optics & Reflection',
      levelNumber: 102,
      code: 'COM-02',
      title: 'Orthogonal Ray Chamber',
      subtitle: 'Speculum Vector Law v\' = v - 2(v·n)n',
      description: 'Reflect the beam at 45 degrees across two deflector mirrors.',
      type: 'linear_beam',
      defaultParams: { m: 1.0, b: -2.0 },
      solutionParams: { m: 1.2, b: -1.0 },
      paramControls: [
        { key: 'm', label: 'Beam Slope (m)', symbol: 'm', min: -4, max: 4, step: 0.1, defaultValue: 1.0, description: 'Initial beam angle' },
        { key: 'b', label: 'Y-Intercept (b)', symbol: 'b', min: -5, max: 5, step: 0.5, defaultValue: -2.0, description: 'Source height' },
      ],
      targets: [
        { id: 'ct_2', x: 2, y: 5, radius: 0.5, label: 'Target Sensor (2, 5)' }
      ],
      obstacles: [],
      mirrors: [
        { id: 'm1', p1: { x: 3, y: 0 }, p2: { x: 5, y: 4 }, normal: { x: -0.89, y: 0.45 } },
        { id: 'm2', p1: { x: 0, y: 4 }, p2: { x: 4, y: 6 }, normal: { x: 0.45, y: -0.89 } }
      ],
      bounds: { minX: -2, maxX: 7, minY: -4, maxY: 7 },
      curriculum: {
        standard: 'Community Innovation',
        standardName: 'Vector Specular Optics',
        topicCategory: 'Linear Algebra',
        intuition: 'Reflection preserves beam speed while inverting the normal component.',
        keyFormulaLatex: '\\vec{v}\' = \\vec{v} - 2(\\vec{v} \\cdot \\hat{n})\\hat{n}',
        stepByStepSolution: [],
        formulaBreakdown: []
      },
      hints: ['Aim for the first mirror near x = 4 to achieve an upward ricochet.']
    }
  },
  {
    id: 'sample_comm_3',
    authorName: 'RiemannSurfaces',
    title: 'The Inflection Threshold',
    sectorId: 'tangent',
    description: 'Fine-tune a secant Chord to pierce a narrow opening right at an inflection point where f\'\'(x) = 0.',
    difficulty: 'expert',
    upvotes: 58,
    playCount: 230,
    createdAt: '2026-09-21T08:00:00Z',
    levelData: {
      id: 'comm_inflection_tangent',
      sectorId: 'tangent',
      sectorTitle: 'Community: Tangent Calculus',
      levelNumber: 103,
      code: 'COM-03',
      title: 'The Inflection Threshold',
      subtitle: 'Vanishing Second Derivative f\'\'(x) = 0',
      description: 'Find the tangent slope at the exact cubic inflection point.',
      type: 'tangent_blade',
      defaultParams: { x0: 0.5, h: 0.4 },
      solutionParams: { x0: 0.0, h: 0.05 },
      calculusFunction: (x: number) => 0.5 * Math.pow(x, 3) - 2 * x,
      calculusDerivative: (x: number) => 1.5 * Math.pow(x, 2) - 2,
      calculusFunctionLatex: 'f(x) = 0.5x^3 - 2x',
      paramControls: [
        { key: 'x0', label: 'Evaluation Point x₀', symbol: 'x₀', min: -2, max: 2, step: 0.1, defaultValue: 0.5, description: 'Evaluation coordinate' },
        { key: 'h', label: 'Secant Step h', symbol: 'h', min: 0.05, max: 1.5, step: 0.05, defaultValue: 0.4, description: 'Limit step' },
      ],
      targets: [
        { id: 'ct_3', x: 2, y: -6, radius: 0.5, label: 'Tangent Target (2, -6)' }
      ],
      obstacles: [],
      bounds: { minX: -3, maxX: 4, minY: -7, maxY: 5 },
      curriculum: {
        standard: 'Community Innovation',
        standardName: 'Cubic Inflection Tangency',
        topicCategory: 'Calculus I',
        intuition: 'At an inflection point, concavity flips and the tangent line cuts through the curve.',
        keyFormulaLatex: 'f\'\'(x) = 3x = 0 \\implies x = 0',
        stepByStepSolution: [],
        formulaBreakdown: []
      },
      hints: ['Set x₀ = 0 to evaluate the tangent directly at the inflection point.']
    }
  }
];

export interface FetchCommunityOptions {
  sectorId?: string;
  difficulty?: LevelDifficulty;
  search?: string;
  sortBy?: 'upvotes' | 'created_at' | 'play_count';
}

export async function fetchCommunityLevels(
  options: FetchCommunityOptions = {},
  currentUserId?: string
): Promise<CommunityLevel[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Return filtered local fallback levels
    let levels = [...FALLBACK_COMMUNITY_LEVELS];
    if (options.sectorId && options.sectorId !== 'all') {
      levels = levels.filter((l) => l.sectorId === options.sectorId);
    }
    if (options.difficulty && options.difficulty !== ('all' as unknown)) {
      levels = levels.filter((l) => l.difficulty === options.difficulty);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      levels = levels.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }
    return levels;
  }

  try {
    let query = supabase.from('community_levels').select('*');

    if (options.sectorId && options.sectorId !== 'all') {
      query = query.eq('sector_id', options.sectorId);
    }
    if (options.difficulty && options.difficulty !== ('all' as unknown)) {
      query = query.eq('difficulty', options.difficulty);
    }
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const sortColumn = options.sortBy || 'upvotes';
    query = query.order(sortColumn, { ascending: false }).limit(40);

    const { data, error } = await query;
    if (error) {
      console.warn('VectorForge: Could not fetch community levels:', error.message);
      return FALLBACK_COMMUNITY_LEVELS;
    }

    if (!data || data.length === 0) {
      return FALLBACK_COMMUNITY_LEVELS;
    }

    // Check user votes if authenticated
    let userVotedSet = new Set<string>();
    if (currentUserId) {
      const { data: votes } = await supabase
        .from('level_votes')
        .select('level_id')
        .eq('user_id', currentUserId);
      if (votes) {
        userVotedSet = new Set(votes.map((v) => v.level_id));
      }
    }

    return data.map((row) => ({
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      title: row.title,
      sectorId: row.sector_id,
      description: row.description,
      levelData: row.level_data,
      difficulty: row.difficulty,
      upvotes: row.upvotes,
      playCount: row.play_count,
      createdAt: row.created_at,
      hasVoted: userVotedSet.has(row.id),
    }));
  } catch (err) {
    console.warn('VectorForge: Exception in fetchCommunityLevels:', err);
    return FALLBACK_COMMUNITY_LEVELS;
  }
}

export async function publishCommunityLevel(
  levelData: LevelDefinition,
  title: string,
  description: string,
  sectorId: string,
  difficulty: LevelDifficulty,
  authorName: string,
  authorId?: string
): Promise<{ success: boolean; levelId?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Connect your cloud credentials in Settings to publish community levels.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('community_levels')
      .insert({
        author_id: authorId || null,
        author_name: authorName,
        title,
        description,
        sector_id: sectorId,
        difficulty,
        level_data: levelData,
        upvotes: 1,
        play_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Auto-upvote by author
    if (data?.id && authorId) {
      await supabase.from('level_votes').insert({
        level_id: data.id,
        user_id: authorId,
      });
    }

    return { success: true, levelId: data?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Publish failed' };
  }
}

export async function toggleLevelVote(
  levelId: string,
  userId: string,
  hasCurrentlyVoted: boolean
): Promise<{ success: boolean; newCount?: number }> {
  const supabase = getSupabase();
  if (!supabase || !userId) return { success: false };

  try {
    if (hasCurrentlyVoted) {
      // Remove vote
      await supabase
        .from('level_votes')
        .delete()
        .match({ level_id: levelId, user_id: userId });

      // Decrement upvotes
      const { data } = await supabase.rpc('decrement_level_upvotes', { p_level_id: levelId });
      return { success: true, newCount: data };
    } else {
      // Add vote
      await supabase.from('level_votes').insert({ level_id: levelId, user_id: userId });
      await supabase.rpc('increment_level_upvotes', { p_level_id: levelId });
      return { success: true };
    }
  } catch {
    return { success: false };
  }
}

export async function incrementLevelPlayCount(levelId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.rpc('increment_level_play_count', { p_level_id: levelId });
  } catch {
    // Ignore analytics error
  }
}
