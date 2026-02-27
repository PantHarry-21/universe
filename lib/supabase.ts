import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { promisify } from 'util';

// Promisified DNS resolution
const resolve4 = promisify(dns.resolve4);

// Workaround for regional ISP issues blocking Supabase connectivity
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom fetch to force manual DNS resolution, bypassing Node's unreliable DNS resolution
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    let fetchUrl = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;

    try {
        const parsedUrl = new URL(fetchUrl);
        // Only override for supabase domains
        if (parsedUrl.hostname.includes('supabase.co')) {
            const ips = await resolve4(parsedUrl.hostname);
            if (ips && ips.length > 0) {
                const ip = ips[0];
                // Replace hostname with IP
                fetchUrl = fetchUrl.replace(parsedUrl.hostname, ip);
                // Ensure proper SNI and Host headers
                if (!options) options = {};
                if (!options.headers) options.headers = new Headers();
                if (options.headers instanceof Headers) {
                    options.headers.set('Host', parsedUrl.hostname);
                } else if (Array.isArray(options.headers)) {
                    options.headers.push(['Host', parsedUrl.hostname]);
                } else {
                    (options.headers as Record<string, string>)['Host'] = parsedUrl.hostname;
                }
                console.log(`[Supabase Fetch] Resolved ${parsedUrl.hostname} to ${ip}`);
            }
        }
    } catch (err) {
        console.warn(`[Supabase Fetch] DNS manual resolution failed, falling back to default fetch:`, err);
    }

    return fetch(fetchUrl, options);
};

// Server-side client with service role (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    global: {
        fetch: customFetch
    }
});

// Client-side safe client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: typeof window === 'undefined' ? customFetch : fetch // Only use custom fetch on server
    }
});

export const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'memories';
