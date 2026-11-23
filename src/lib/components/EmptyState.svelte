<script lang="ts">
	import KudilMascot from '#lib/components/KudilMascot.svelte';

	interface Props {
		onAdd: () => void;
	}

	let { onAdd }: Props = $props();
</script>

<section class="animate-pop-in">
	<div
		class="neo-border neo-shadow mx-auto max-w-xl rounded-2xl bg-white px-4 py-6 text-center sm:rounded-3xl sm:px-8 sm:py-9"
	>
		<div class="mb-3">
			<KudilMascot variant="full" />
		</div>

		<h1 class="font-display text-lg font-bold leading-snug text-ink sm:text-2xl">
			Belum ada aktivitas nih
		</h1>
		<p class="mx-auto mt-1.5 max-w-xs text-xs font-medium leading-relaxed text-slate-600 sm:max-w-sm sm:text-sm">
			Let's go bikin jadwal
		</p>

		<div class="mt-5 flex items-center justify-center sm:mt-6">
			<button
				type="button"
				onclick={onAdd}
				class="neo-btn inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-navy px-5 font-display text-xs font-bold text-white hover:bg-navy-light sm:h-11 sm:px-6 sm:text-sm"
			>
				<svg
					class="h-4 w-4 stroke-[3]"
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
	</div>
</section>
