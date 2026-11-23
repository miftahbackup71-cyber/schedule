<script lang="ts">
	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			aria-label="Tutup"
			onclick={onClose}
			class="fixed inset-0 cursor-default bg-ink/65 backdrop-blur-[3px]"
		></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="easter-egg-title"
			tabindex="-1"
			class="neo-border neo-shadow-lg animate-pop-in relative z-10 max-h-[92dvh] w-full max-w-sm overflow-visible rounded-3xl bg-cream"
		>
			<!-- Ornamen Panah Love (Cupid Arrow) mengintip di pojok kiri atas -->
			<svg
				class="animate-float pointer-events-none absolute -top-6 -left-5 z-20 h-14 w-16 -rotate-12"
				viewBox="0 0 76 64"
				fill="none"
				aria-hidden="true"
			>
				<!-- Batang panah masuk dari kiri bawah ke kanan atas -->
				<path
					d="M8 54L64 12"
					stroke="#0F172A"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<!-- Bulu ekor panah -->
				<path
					d="M12 45L6 55L17 53M18 40L12 50L23 48"
					stroke="#FDE047"
					stroke-width="2.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<!-- Hati di tengah tertembus panah -->
				<path
					d="M38 49C38 49 21 38 21 26.5C21 21 25.2 17 30.2 17C33.8 17 36.6 19.1 38 21.8C39.4 19.1 42.2 17 45.8 17C50.8 17 55 21 55 26.5C55 38 38 49 38 49Z"
					fill="#FB7185"
					stroke="#0F172A"
					stroke-width="2.8"
					stroke-linejoin="round"
				/>
				<!-- Kilau hati -->
				<path
					d="M28 24.5C28 22.8 29.3 21.5 31 21.5"
					stroke="#FFFDF7"
					stroke-width="2.4"
					stroke-linecap="round"
				/>
				<!-- Ujung mata panah -->
				<path
					d="M54 11L66 10.5L62 21.5"
					fill="#FDE047"
					stroke="#0F172A"
					stroke-width="2.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>

			<!-- Ornamen Sparkle & Hati Melayang di kanan bawah luar bingkai -->
			<svg
				class="animate-float pointer-events-none absolute -right-4 -bottom-5 z-20 h-12 w-12 rotate-12"
				viewBox="0 0 56 56"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M28 45C28 45 11 35 11 23.5C11 18.5 14.8 15 19.5 15C23 15 26.1 17 28 19.8C29.9 17 33 15 36.5 15C41.2 15 45 18.5 45 23.5C45 35 28 45 28 45Z"
					fill="#FCA5A5"
					stroke="#0F172A"
					stroke-width="2.6"
					stroke-linejoin="round"
				/>
				<path
					d="M46 8L47.5 12L51.5 13.5L47.5 15L46 19L44.5 15L40.5 13.5L44.5 12L46 8Z"
					fill="#FDE047"
					stroke="#0F172A"
					stroke-width="2"
					stroke-linejoin="round"
				/>
			</svg>

			<!-- Header Lucu + Tombol Silang Saja -->
			<div
				class="flex items-center justify-between gap-2 rounded-t-[22px] border-b-2 border-ink bg-butter px-4 py-2.5"
			>
				<span class="pl-5 font-display text-xs font-bold text-ink">
					Kan sudah dibilang jangan diklik
				</span>
				<button
					type="button"
					onclick={onClose}
					aria-label="Tutup"
					class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-ink bg-coralpop font-display text-xs font-bold text-ink shadow-[2px_2px_0px_#0F172A] hover:bg-red-300"
				>
					✕
				</button>
			</div>

			<!-- Isi Modal: Polaroid Foto Full Utuh + Ornamen Lucu -->
			<div class="relative overflow-y-auto p-4 sm:p-5">
				<!-- Sparkle kiri & kanan -->
				<svg
					class="pointer-events-none absolute top-3 right-4 h-6 w-6"
					viewBox="0 0 32 32"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M16 3L18.5 13.5L29 16L18.5 18.5L16 29L13.5 18.5L3 16L13.5 13.5L16 3Z"
						fill="#FDE047"
						stroke="#0F172A"
						stroke-width="2"
						stroke-linejoin="round"
					/>
				</svg>

				<svg
					class="pointer-events-none absolute bottom-14 left-2 h-5 w-5 -rotate-12"
					viewBox="0 0 32 32"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M16 3L18.5 13.5L29 16L18.5 18.5L16 29L13.5 18.5L3 16L13.5 13.5L16 3Z"
						fill="#7DD3FC"
						stroke="#0F172A"
						stroke-width="2"
						stroke-linejoin="round"
					/>
				</svg>

				<!-- Bingkai Polaroid (Gambar Full Tidak Terpotong) -->
				<div class="neo-border neo-shadow rounded-2xl bg-white p-2.5">
					<div class="overflow-hidden rounded-xl border-[1.5px] border-ink bg-cream">
						<img
							src="/images/myminegueh.jpeg"
							alt="My Mine Gueh ini, eh"
							class="mx-auto block h-auto max-h-[58dvh] w-full object-contain"
						/>
					</div>

					<!-- Caption Lucu dengan Hati di Kiri & Kanan -->
					<div class="mt-3 flex items-center justify-center gap-2 pb-0.5">
						<svg class="h-4 w-4 shrink-0 -rotate-12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M12 20.5C12 20.5 3.5 15 3.5 9C3.5 6.2 5.7 4 8.3 4C10 4 11.4 4.9 12 6.3C12.6 4.9 14 4 15.7 4C18.3 4 20.5 6.2 20.5 9C20.5 15 12 20.5 12 20.5Z"
								fill="#FB7185"
								stroke="#0F172A"
								stroke-width="2"
							/>
						</svg>

						<p
							id="easter-egg-title"
							class="text-center font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
						>
							My Mine Gueh ini, eh
						</p>

						<svg class="h-4 w-4 shrink-0 rotate-12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M12 20.5C12 20.5 3.5 15 3.5 9C3.5 6.2 5.7 4 8.3 4C10 4 11.4 4.9 12 6.3C12.6 4.9 14 4 15.7 4C18.3 4 20.5 6.2 20.5 9C20.5 15 12 20.5 12 20.5Z"
								fill="#FB7185"
								stroke="#0F172A"
								stroke-width="2"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
