<script lang="ts">
	interface Props {
		onOpenEasterEgg: () => void;
	}

	let { onOpenEasterEgg }: Props = $props();
</script>

<footer class="relative z-10 mx-auto mt-auto w-full max-w-2xl px-3 pt-6 pb-20 sm:px-6 sm:pb-8">
	<!-- Tombol Easter Egg unik di pojok miring dengan panah melengkung memancing -->
	<div class="mb-6 flex items-end justify-end pr-2 sm:pr-6">
		<div class="relative inline-flex items-end gap-1.5">
			<!-- Panah gambar tangan melengkung langsung menunjuk ke tombol -->
			<svg
				class="h-11 w-14 -translate-y-1 text-navy sm:h-12 sm:w-16"
				viewBox="0 0 72 52"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M6 10C18 4 38 6 46 22C50 30 56 35 64 36"
					stroke="currentColor"
					stroke-width="2.6"
					stroke-linecap="round"
					stroke-dasharray="5 4"
				/>
				<path
					d="M55 29L66 36.5L54.5 42.5"
					stroke="currentColor"
					stroke-width="2.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>

			<button
				type="button"
				onclick={onOpenEasterEgg}
				class="neo-btn-sm animate-bait-wiggle inline-flex h-8 cursor-pointer items-center justify-center rounded-full bg-butter px-3.5 font-display text-xs font-bold text-ink hover:bg-yellow-300"
			>
				Jangan diklik plisss
			</button>
		</div>
	</div>

	<p class="text-center text-xs font-medium text-slate-500">
		Made with love by Karung❤️
	</p>
</footer>
