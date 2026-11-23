<script lang="ts">
	interface Props {
		open: boolean;
		isSaving?: boolean;
		onSaveAndContinue: () => void;
		onDiscardAndContinue: () => void;
		onCancel: () => void;
	}

	let { open, isSaving = false, onSaveAndContinue, onDiscardAndContinue, onCancel }: Props =
		$props();

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape' && !isSaving) {
			event.preventDefault();
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			aria-label="Tutup dialog"
			onclick={() => !isSaving && onCancel()}
			class="fixed inset-0 cursor-default bg-ink/55 backdrop-blur-[2px]"
		></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="unsaved-guard-title"
			tabindex="-1"
			class="neo-border neo-shadow-lg animate-pop-in relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white"
		>
			<div class="flex items-center justify-between gap-2 border-b-2 border-ink bg-butter px-4 py-3">
				<h2 id="unsaved-guard-title" class="font-display text-sm font-bold text-ink sm:text-base">
					Jadwal belum disimpen nih
				</h2>
				<button
					type="button"
					disabled={isSaving}
					onclick={onCancel}
					aria-label="Tutup"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-2 border-ink bg-white font-display text-xs font-bold text-ink"
				>
					✕
				</button>
			</div>

			<div class="p-4 sm:p-5">
				<p class="text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
					Kamu udah ngisi aktivitas di jadwal ini. Mau disimpen dulu atau dibuang aja?
				</p>

				<div class="mt-4 flex flex-col gap-2">
					<button
						type="button"
						disabled={isSaving}
						onclick={onSaveAndContinue}
						class="neo-btn h-10 w-full cursor-pointer rounded-xl bg-mintpop px-4 font-display text-xs font-bold text-ink hover:bg-green-300 sm:text-sm"
					>
						{isSaving ? 'Lagi nyimpen...' : 'Simpen Dulu'}
					</button>

					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							disabled={isSaving}
							onclick={onDiscardAndContinue}
							class="neo-btn-sm h-9 cursor-pointer rounded-xl bg-coralpop px-3 font-display text-xs font-bold text-ink hover:bg-red-300 sm:text-sm"
						>
							Buang Aja
						</button>
						<button
							type="button"
							disabled={isSaving}
							onclick={onCancel}
							class="neo-btn-sm h-9 cursor-pointer rounded-xl bg-white px-3 font-display text-xs font-bold text-ink hover:bg-slate-100 sm:text-sm"
						>
							Gak Jadi
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
