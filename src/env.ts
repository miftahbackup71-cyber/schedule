import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		description: 'URL proyek Supabase untuk Kudil Schedule'
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		static: true,
		description: 'Publishable key Supabase untuk klien browser'
	}
});
