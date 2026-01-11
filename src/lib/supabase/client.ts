import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

// Mock client for build time when env vars are missing
const createMockClient = () => {
    return {
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: async () => ({ error: null }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: async () => ({ data: null, error: null }),
                    single: async () => ({ data: null, error: null }),
                })
            }),
            insert: async () => ({ error: null }),
            update: async () => ({ error: null }),
            delete: async () => ({ error: null }),
        })
    } as unknown as SupabaseClient;
};

export function createClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('Supabase credentials missing. Using mock client for build.');
        return createMockClient();
    }
    
    supabaseClient = createBrowserClient(url, key);
    
    return supabaseClient;
}
