import { getSupabase } from '../lib/supabase';
import { UserProgressStore, UserLevelProgress, LevelMasteryStatus } from '../types/game';
import { ALL_LEVELS } from '../data/levels';

interface DbUserProgress {
  id?: string;
  user_id: string;
  level_id: string;
  completed: boolean;
  stars: number;
  best_attempts: number;
  mastery_status: LevelMasteryStatus;
  updated_at: string;
}

export async function loadCloudProgress(userId: string): Promise<UserProgressStore | null> {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('VectorForge: Could not load cloud progress:', error.message);
      return null;
    }

    if (!data || data.length === 0) return {};

    const progress: UserProgressStore = {};
    data.forEach((row: DbUserProgress) => {
      progress[row.level_id] = {
        completed: row.completed,
        stars: row.stars,
        bestAttempts: row.best_attempts,
        masteryStatus: row.mastery_status,
        unlocked: true,
      };
    });

    return progress;
  } catch (err) {
    console.warn('VectorForge: Cloud save load error:', err);
    return null;
  }
}

export async function saveProgressToCloud(
  userId: string,
  levelId: string,
  progress: UserLevelProgress
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !userId) return false;

  try {
    const row: DbUserProgress = {
      user_id: userId,
      level_id: levelId,
      completed: progress.completed,
      stars: progress.stars,
      best_attempts: progress.bestAttempts,
      mastery_status: progress.masteryStatus || {
        cleared: progress.completed,
        budgetMet: false,
        hypothesisCorrect: false,
        score: progress.stars * 1000,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_progress')
      .upsert(row, { onConflict: 'user_id,level_id' });

    if (error) {
      console.warn('VectorForge: Could not save progress to cloud:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('VectorForge: Error in saveProgressToCloud:', err);
    return false;
  }
}

// Merge local and cloud progress and synchronize both directions
export async function syncProgressWithCloud(
  userId: string,
  localProgress: UserProgressStore
): Promise<UserProgressStore> {
  const supabase = getSupabase();
  if (!supabase || !userId) return localProgress;

  const cloudData = await loadCloudProgress(userId);
  if (!cloudData) return localProgress;

  const merged: UserProgressStore = { ...localProgress };
  const rowsToUpsert: DbUserProgress[] = [];

  // Iterate all campaign levels to resolve state
  ALL_LEVELS.forEach((level, i) => {
    const lvlId = level.id;
    const local = localProgress[lvlId];
    const cloud = cloudData[lvlId];

    if (!local && !cloud) {
      merged[lvlId] = {
        completed: false,
        stars: 0,
        bestAttempts: 0,
        unlocked: i === 0,
      };
      return;
    }

    const completed = !!(local?.completed || cloud?.completed);
    const stars = Math.max(local?.stars || 0, cloud?.stars || 0);
    const bestAttempts =
      local?.bestAttempts && cloud?.bestAttempts
        ? Math.min(local.bestAttempts, cloud.bestAttempts)
        : (local?.bestAttempts || cloud?.bestAttempts || 0);

    const cleared = !!(local?.masteryStatus?.cleared || cloud?.masteryStatus?.cleared || completed);
    const budgetMet = !!(local?.masteryStatus?.budgetMet || cloud?.masteryStatus?.budgetMet);
    const hypothesisCorrect = !!(local?.masteryStatus?.hypothesisCorrect || cloud?.masteryStatus?.hypothesisCorrect);
    const score = Math.max(local?.masteryStatus?.score || 0, cloud?.masteryStatus?.score || 0, stars * 1000);

    const mergedEntry: UserLevelProgress = {
      completed,
      stars,
      bestAttempts,
      masteryStatus: { cleared, budgetMet, hypothesisCorrect, score },
      unlocked: i === 0 || completed || !!local?.unlocked || !!cloud?.unlocked,
    };

    merged[lvlId] = mergedEntry;

    // Check if cloud was missing or outdated
    const cloudNeedsUpdate =
      !cloud ||
      cloud.stars < stars ||
      (!cloud.completed && completed) ||
      (!cloud.masteryStatus?.hypothesisCorrect && hypothesisCorrect);

    if (cloudNeedsUpdate) {
      rowsToUpsert.push({
        user_id: userId,
        level_id: lvlId,
        completed,
        stars,
        best_attempts: bestAttempts,
        mastery_status: { cleared, budgetMet, hypothesisCorrect, score },
        updated_at: new Date().toISOString(),
      });
    }
  });

  // Batch upsert differences to cloud
  if (rowsToUpsert.length > 0) {
    try {
      await supabase
        .from('user_progress')
        .upsert(rowsToUpsert, { onConflict: 'user_id,level_id' });
    } catch (err) {
      console.warn('VectorForge: Could not batch upsert merged progress to cloud:', err);
    }
  }

  return merged;
}

// Realtime multi-tab / multi-device listener
export function subscribeToCloudProgress(
  userId: string,
  onRemoteUpdate: (levelId: string, progress: UserLevelProgress) => void
) {
  const supabase = getSupabase();
  if (!supabase || !userId) return () => {};

  const channel = supabase
    .channel(`progress_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as DbUserProgress;
        if (row && row.level_id) {
          onRemoteUpdate(row.level_id, {
            completed: row.completed,
            stars: row.stars,
            bestAttempts: row.best_attempts,
            masteryStatus: row.mastery_status,
            unlocked: true,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
