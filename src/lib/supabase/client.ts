import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$app/env/public';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (!client) {
		client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false
			}
		});
	}
	return client;
}
