<script lang="ts">
	interface Props {
		formattedDate: string;
		totalCount: number;
		completedCount: number;
		progressPercent: number;
		hasUnsavedChanges: boolean;
		isSaving: boolean;
		lastSavedLabel: string | null;
		onSaveSchedule: () => void;
		onRequestClearAll: () => void;
	}

	let {
		formattedDate,
		totalCount,
		completedCount,
		progressPercent,
		hasUnsavedChanges,
		isSaving,
		lastSavedLabel,
		onSaveSchedule,
		onRequestClearAll
	}: Props = $props();
</script>

<section class="neo-border neo-shadow rounded-xl bg-white p-3 sm:rounded-2xl sm:p-4">
	<!-- Baris Atas: Tanggal Jadwal + Tombol Simpan Jadwal (+ Hapus khusus mobile) -->
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="min-w-0 flex-1">
			<h1 class="truncate font-display text-sm font-bold text-ink sm:text-base">
				{formattedDate}
			</h1>
			<p class="text-[11px] font-semibold text-slate-500 sm:text-xs">
				{completedCount} dari {totalCount} udah beres
				{#if hasUnsavedChanges}
					· Belum disimpen
				{:else if lastSavedLabel}
					· {lastSavedLabel}
				{/if}
			</p>
		</div>

		<div class="flex shrink-0 items-center gap-1.5">
			<button
				type="button"
				onclick={onRequestClearAll}
				class="neo-btn-sm inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-coralpop px-2.5 font-display text-xs font-bold text-ink hover:bg-red-300 sm:hidden"
			>
				Hapus
			</button>

			<button
				type="button"
				onclick={onSaveSchedule}
				disabled={isSaving}
				class="neo-btn-sm inline-flex h-8 cursor-pointer items-center justify-center rounded-lg px-3 font-display text-xs font-bold transition-colors sm:h-9 sm:px-3.5 sm:text-sm {hasUnsavedChanges
					? 'bg-mintpop text-ink hover:bg-green-300'
					: 'bg-navy text-white hover:bg-navy-light'}"
			>
				{isSaving ? 'Lagi nyimpen...' : 'Simpen Jadwal'}
			</button>
		</div>
	</div>

	<!-- Batang Progres -->
	<div
		class="mt-2.5 h-2.5 w-full overflow-hidden rounded-full border-[1.5px] border-ink bg-cream p-[1px]"
		role="progressbar"
		aria-valuenow={progressPercent}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label="Progres aktivitas"
	>
		<div
			class="h-full rounded-full bg-mintpop transition-all duration-300"
			style:width="{progressPercent}%"
		></div>
	</div>
</section>
