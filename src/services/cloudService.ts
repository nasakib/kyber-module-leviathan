import { supabase } from '../lib/supabase';
import { PlayerTier } from '../utils/jargonDictionary';
import { LevelDefinition } from '../types/game';

export interface UserProfileData {
  id: string;
  display_name: string;
  displayName?: string; // alias for compatibility
  role?: 'student' | 'teacher';
  tier: PlayerTier;
  diagnostic_completed: boolean;
  unlocked_terms: string[];
  stars_total: number;
}

export interface LevelCompletionStats {
  cleared: boolean;
  silver_star?: boolean;
  gold_star?: boolean;
  energy_spent?: number;
  completion_time_ms?: number;
}

export interface CustomLevelRecord {
  id: string;
  creator_id?: string;
  creator_name: string;
  title: string;
  description: string;
  sector: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  level_data: LevelDefinition;
  upvotes: number;
  play_count: number;
  created_at: string;
}

const LOCAL_PROFILE_KEY = 'vectorforge_user_profile_v2';

export async function syncProfile(profileData: UserProfileData): Promise<UserProfileData> {
  // Always persist locally
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profileData));
  } catch {
    // Ignore storage quota
  }

  if (!supabase || !profileData.id) {
    return profileData;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profileData.id,
        display_name: profileData.display_name,
        tier: profileData.tier,
        diagnostic_completed: profileData.diagnostic_completed,
        unlocked_terms: profileData.unlocked_terms,
        stars_total: profileData.stars_total,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (!error && data) {
      return {
        id: data.id,
        display_name: data.display_name,
        displayName: data.display_name,
        role: data.role || 'student',
        tier: data.tier as PlayerTier,
        diagnostic_completed: data.diagnostic_completed,
        unlocked_terms: data.unlocked_terms || [],
        stars_total: data.stars_total || 0,
      };
    }
  } catch (err) {
    console.warn('VectorForge: Could not sync profile to Supabase:', err);
  }

  return profileData;
}

export async function recordCompletion(
  userId: string,
  levelId: string,
  stats: LevelCompletionStats
): Promise<boolean> {
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from('level_completions').insert({
      user_id: userId,
      level_id: levelId,
      cleared: stats.cleared,
      silver_star: !!stats.silver_star,
      gold_star: !!stats.gold_star,
      energy_spent: stats.energy_spent ?? null,
      completion_time_ms: stats.completion_time_ms ?? null,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('VectorForge: Could not record level completion in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('VectorForge: Error in recordCompletion:', err);
    return false;
  }
}

export async function fetchCommunityLevels(): Promise<CustomLevelRecord[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('custom_levels')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(50);

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      creator_id: row.creator_id,
      creator_name: row.creator_name,
      title: row.title,
      description: row.description,
      sector: row.sector,
      difficulty: row.difficulty,
      level_data: row.level_data,
      upvotes: row.upvotes,
      play_count: row.play_count,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.warn('VectorForge: Exception in fetchCommunityLevels:', err);
    return [];
  }
}

export async function publishCustomLevel(
  level: LevelDefinition,
  title: string,
  description: string,
  sector: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'master',
  userId: string,
  creatorName: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Cloud database is offline. Connect Supabase credentials to publish.' };
  }

  try {
    const { data, error } = await supabase
      .from('custom_levels')
      .insert({
        creator_id: userId,
        creator_name: creatorName,
        title,
        description,
        sector,
        difficulty,
        level_data: level,
        upvotes: 1,
        play_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Publish failed' };
  }
}
