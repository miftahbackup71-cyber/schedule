<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Ya, Hapus',
		cancelLabel = 'Batal',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
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
			aria-label="Tutup dialog konfirmasi"
			onclick={onCancel}
			class="fixed inset-0 cursor-default bg-ink/55 backdrop-blur-[2px]"
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-dialog-title"
			tabindex="-1"
			class="neo-border neo-shadow-lg animate-pop-in relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white"
		>
			<div
				class="flex items-center justify-between gap-3 border-b-2 border-ink bg-coralpop px-5 py-3.5 sm:border-b-[3px]"
			>
				<h2 id="confirm-dialog-title" class="font-display text-base font-bold text-ink">
					{title}
				</h2>
				<button
					type="button"
					onclick={onCancel}
					aria-label="Tutup dialog"
					class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-ink bg-white font-display text-sm font-bold text-ink"
				>
					✕
				</button>
			</div>

			<div class="p-5">
				<p class="text-sm font-medium leading-relaxed text-slate-700">
					{message}
				</p>

				<div class="mt-5 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onclick={onCancel}
						class="neo-btn-sm min-h-[44px] cursor-pointer rounded-xl bg-white px-4 font-display text-sm font-bold text-ink hover:bg-slate-100"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onclick={onConfirm}
						class="neo-btn-sm min-h-[44px] cursor-pointer rounded-xl bg-coralpop px-4 font-display text-sm font-bold text-ink hover:bg-red-300"
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
