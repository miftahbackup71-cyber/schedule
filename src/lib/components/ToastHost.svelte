<script lang="ts">
	import type { ToastItem, ToastVariant } from '#lib/types/schedule.ts';

	interface Props {
		toasts: ToastItem[];
		hasFloatingMobileCta?: boolean;
		onDismiss: (id: string) => void;
	}

	let { toasts, hasFloatingMobileCta = false, onDismiss }: Props = $props();

	const variantClass: Record<ToastVariant, string> = {
		navy: 'bg-navy text-white',
		mint: 'bg-mintpop text-ink',
		butter: 'bg-butter text-ink',
		coral: 'bg-coralpop text-ink'
	};
</script>

<div
	class="pointer-events-none fixed right-3 left-3 z-40 flex flex-col items-stretch gap-2 sm:right-5 sm:bottom-5 sm:left-auto sm:items-end {hasFloatingMobileCta
		? 'bottom-16'
		: 'bottom-4'}"
	aria-live="polite"
>
	{#each toasts as toast (toast.id)}
		<div
			class="neo-border neo-shadow-sm animate-pop-in pointer-events-auto flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 sm:max-w-sm {variantClass[
				toast.variant
			]}"
		>
			<span class="font-display text-xs font-bold leading-snug sm:text-sm">
				{toast.message}
			</span>

			{#if toast.action}
				<button
					type="button"
					onclick={() => {
						toast.action?.onClick();
						onDismiss(toast.id);
					}}
					class="h-8 shrink-0 cursor-pointer rounded-lg border-[1.5px] border-ink bg-white px-2.5 font-display text-xs font-bold text-ink shadow-[2px_2px_0px_#0F172A] hover:bg-butter"
				>
					{toast.action.label}
				</button>
			{/if}
		</div>
	{/each}
</div>
