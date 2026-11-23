<script lang="ts">
	import KudilMascot from '#lib/components/KudilMascot.svelte';

	interface Props {
		totalCount: number;
		completedCount: number;
		onOpenMenu: () => void;
		onAdd: () => void;
		onRequestClearAll: () => void;
	}

	let { totalCount, completedCount, onOpenMenu, onAdd, onRequestClearAll }: Props = $props();

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<header class="sticky top-0 z-30 px-3 pt-2.5 pb-1.5 sm:px-6 sm:pt-4 sm:pb-2">
	<div
		class="neo-border neo-shadow mx-auto flex max-w-2xl items-center justify-between gap-2.5 rounded-xl bg-white px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-2.5"
	>
		<!-- Kiri: Identitas Aplikasi -->
		<button
			type="button"
			onclick={scrollToTop}
			class="flex min-w-0 cursor-pointer items-center gap-2 text-left"
			aria-label="Kembali ke atas"
		>
			<span
				class="neo-border neo-shadow-sm flex h-8 w-8 shrink-0 -rotate-2 items-center justify-center rounded-lg bg-navy transition-transform hover:rotate-0 sm:h-10 sm:w-10 sm:rounded-xl"
			>
				<KudilMascot variant="mini" />
			</span>
			<span class="min-w-0">
				<span
					class="block truncate font-display text-base font-bold leading-tight tracking-tight text-ink sm:text-lg"
				>
					Kudil Schedule
				</span>
				{#if totalCount > 0}
					<span class="block text-[11px] font-semibold text-slate-500 sm:hidden">
						{completedCount}/{totalCount} beres
					</span>
				{/if}
			</span>
		</button>

		<!-- Kanan: Aksi Desktop + Hamburger Menu di Paling Kanan -->
		<div class="flex items-center gap-2">
			<div class="hidden items-center gap-2 sm:flex">
				{#if totalCount > 0}
					<button
						type="button"
						onclick={onRequestClearAll}
						class="neo-btn-sm h-9 cursor-pointer rounded-xl bg-coralpop px-3 font-display text-xs font-bold text-ink hover:bg-red-300 sm:h-10 sm:text-sm"
					>
						Hapus Jadwal
					</button>
				{/if}

				<button
					type="button"
					onclick={onAdd}
					class="neo-btn inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-navy px-3.5 font-display text-xs font-bold text-white hover:bg-navy-light sm:h-10 sm:text-sm"
				>
					<svg
						class="h-3.5 w-3.5 stroke-[3]"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					<span>Bikin Aktivitas</span>
				</button>
			</div>

			<button
				type="button"
				onclick={onOpenMenu}
				aria-label="Buka daftar jadwal tersimpan"
				title="Daftar jadwal"
				class="neo-btn-sm flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-cream text-ink hover:bg-butter sm:h-10 sm:w-10 sm:rounded-xl"
			>
				<svg
					class="h-4 w-4 stroke-[2.6] sm:h-5 sm:w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<line x1="4" y1="7" x2="20" y2="7" />
					<line x1="4" y1="12" x2="20" y2="12" />
					<line x1="4" y1="17" x2="20" y2="17" />
				</svg>
			</button>
		</div>
	</div>
</header>
