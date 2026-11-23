import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$app/env/public';

let client: SupabaseClient | null = null;
let pendingSessionPromise: Promise<SessionResolution> | null = null;

export interface SessionResolution {
	userId: string | null;
	authDisabled: boolean;
}

export function getSupabaseClient(): SupabaseClient {
	if (!client) {
		client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
			auth: {
				persistSession: true,
				autoRefreshToken: true
			}
		});
	}
	return client;
}

/**
 * Mengambil sesi pengguna aktif, atau mencoba Anonymous Sign-In.
 * Menggunakan singleton in-flight promise agar pemanggilan paralel tidak membuat sesi ganda.
 * Jika Anonymous Sign-In dimatikan di dashboard Supabase, tidak langsung memutus koneksi —
 * mengembalikan userId: null agar aplikasi tetap bisa mengecek akses tabel publik / memberi pesan jelas.
 */
export async function resolveSupabaseSession(): Promise<SessionResolution> {
	if (pendingSessionPromise) {
		return pendingSessionPromise;
	}

	pendingSessionPromise = (async () => {
		const supabase = getSupabaseClient();
		const {
			data: { session },
			error: sessionError
		} = await supabase.auth.getSession();

		if (sessionError) {
			throw sessionError;
		}

		if (session?.user?.id) {
			return { userId: session.user.id, authDisabled: false };
		}

		const { data, error } = await supabase.auth.signInAnonymously();
		if (!error && data.user?.id) {
			return { userId: data.user.id, authDisabled: false };
		}

		const errCode = (error as { code?: string } | null)?.code;
		const errMsg = error?.message ?? '';
		if (errCode === 'anonymous_provider_disabled' || errMsg.toLowerCase().includes('anonymous')) {
			return { userId: null, authDisabled: true };
		}

		throw error ?? new Error('Gagal membuat sesi Supabase.');
	})().finally(() => {
		pendingSessionPromise = null;
	});

	return pendingSessionPromise;
}

/**
 * Membersihkan sesi lokal yang kadaluarsa/tidak valid lalu membuat sesi anonim baru.
 */
export async function resetSupabaseSession(): Promise<SessionResolution> {
	const supabase = getSupabaseClient();
	await supabase.auth.signOut({ scope: 'local' });
	pendingSessionPromise = null;
	return resolveSupabaseSession();
}
