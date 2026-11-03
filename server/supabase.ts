import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('⚡ Supabase Client initialized successfully with remote endpoint:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.log('ℹ️ Supabase credentials not detected in .env. Running in local high-performance database mode with Supabase schema compatibility.');
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

export async function checkSupabaseStatus() {
  const isConfigured = Boolean(supabaseUrl && supabaseKey);
  let isConnected = false;
  let latencyMs = 0;
  let errorMsg: string | null = null;

  if (isConfigured && supabaseClient) {
    const start = Date.now();
    try {
      const { data, error } = await supabaseClient.from('site_settings').select('id').limit(1);
      latencyMs = Date.now() - start;
      if (!error) {
        isConnected = true;
      } else {
        errorMsg = error.message;
      }
    } catch (err: any) {
      errorMsg = err.message || 'Connection test failed';
    }
  }

  return {
    isConfigured,
    isConnected,
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/https:\/\/(.{4}).*(\..*)/, 'https://$1***$2') : null,
    latencyMs,
    errorMsg,
    requiredEnvVars: [
      { name: 'VITE_SUPABASE_URL', description: 'Your Supabase Project URL (e.g. https://xyz.supabase.co)', isSet: Boolean(supabaseUrl) },
      { name: 'VITE_SUPABASE_ANON_KEY', description: 'Your Supabase Project Anonymous Public Key', isSet: Boolean(supabaseKey) },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase Service Role Key (for admin backend access)', isSet: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) }
    ]
  };
}
