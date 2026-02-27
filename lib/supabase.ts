import { createClient } from '@supabase/supabase-js';
import dns from 'dns';

/**
 * FIX FOR REGIONAL NETWORK ISSUES (INDIA)
 * Many ISPs in India are currently mis-resolving Supabase domains.
 * We force the Node process to use Google DNS for all requests.
 */
if (typeof window === 'undefined') {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        console.log('[DNS FIX] System DNS servers forced to 8.8.8.8, 1.1.1.1');
    } catch (e) {
        console.warn('[DNS FIX] Could not set global DNS servers:', e);
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client with service role (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

// Client-side safe client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'memories';
