import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_CUSTOM_URL_KEY = 'vectorforge_supabase_url';
const STORAGE_CUSTOM_ANON_KEY = 'vectorforge_supabase_anon_key';

// Check environment variables first, then localStorage custom credentials
function getInitialCredentials() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL as string | undefined;
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY as string | undefined;

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

let supabaseInstance: SupabaseClient | null = null;
let currentConfig = getInitialCredentials();

if (currentConfig.isValid) {
  try {
    supabaseInstance = createClient(currentConfig.url, currentConfig.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('VectorForge: Failed to initialize Supabase client:', err);
    supabaseInstance = null;
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return !!supabaseInstance && currentConfig.isValid;
}

export function getSupabaseConfig() {
  return {
    url: currentConfig.url,
    anonKey: currentConfig.key,
    isCustom: currentConfig.isCustom,
    isConfigured: isSupabaseConfigured(),
  };
}

export function updateSupabaseConfig(url: string, anonKey: string): boolean {
  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (!trimmedUrl || !trimmedKey) {
    // Clear custom config
    localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    localStorage.removeItem(STORAGE_CUSTOM_ANON_KEY);
    currentConfig = getInitialCredentials();
    if (currentConfig.isValid) {
      supabaseInstance = createClient(currentConfig.url, currentConfig.key);
    } else {
      supabaseInstance = null;
    }
    return false;
  }

  try {
    localStorage.setItem(STORAGE_CUSTOM_URL_KEY, trimmedUrl);
    localStorage.setItem(STORAGE_CUSTOM_ANON_KEY, trimmedKey);
    supabaseInstance = createClient(trimmedUrl, trimmedKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentConfig = {
      url: trimmedUrl,
      key: trimmedKey,
      isValid: true,
      isCustom: true,
    };
    return true;
  } catch (err) {
    console.error('VectorForge: Could not configure Supabase client with given credentials:', err);
    return false;
  }
}
