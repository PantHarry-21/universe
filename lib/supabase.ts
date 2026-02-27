import { createClient } from '@supabase/supabase-js';
import dns from 'dns';

// Workaround for regional ISP issues blocking Supabase connectivity
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

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
