import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_CUSTOM_URL_KEY = 'vectorforge_supabase_url';
const STORAGE_CUSTOM_ANON_KEY = 'vectorforge_supabase_anon_key';

function getInitialCredentials() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL as string | undefined) || '';
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_CUSTOM_URL_KEY) || '';
    localKey = localStorage.getItem(STORAGE_CUSTOM_ANON_KEY) || '';
  } catch {
    // Ignore storage error
  }

  const activeUrl = localUrl || envUrl || '';
  const activeKey = localKey || envKey || '';

  const isValidUrl =
    activeUrl.startsWith('https://') &&
    !activeUrl.includes('your-project.supabase.co') &&
    activeKey.length > 20;

  return {
    url: activeUrl,
    key: activeKey,
    isValid: isValidUrl,
    isCustom: !!localUrl,
  };
}

const currentConfig = getInitialCredentials();

export const isSupabaseConfigured = currentConfig.isValid;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(currentConfig.url, currentConfig.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabase(): SupabaseClient | null {
  return supabase;
}

export function getSupabaseConfig() {
  return {
    url: currentConfig.url,
    anonKey: currentConfig.key,
    isCustom: currentConfig.isCustom,
    isConfigured: isSupabaseConfigured,
  };
}

export function updateSupabaseConfig(url: string, anonKey: string): boolean {
  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (!trimmedUrl || !trimmedKey) {
    localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    localStorage.removeItem(STORAGE_CUSTOM_ANON_KEY);
    return false;
  }

  try {
    localStorage.setItem(STORAGE_CUSTOM_URL_KEY, trimmedUrl);
    localStorage.setItem(STORAGE_CUSTOM_ANON_KEY, trimmedKey);
    return true;
  } catch (err) {
    console.error('VectorForge: Could not save credentials:', err);
    return false;
  }
}
