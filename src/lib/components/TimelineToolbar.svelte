<script lang="ts">
	import type { SyncStatus } from '#lib/types/schedule.ts';

	interface Props {
		formattedDate: string;
		totalCount: number;
		completedCount: number;
		progressPercent: number;
		syncStatus: SyncStatus;
		onRetrySync: () => void;
		onRequestClearAll: () => void;
	}

	let {
		formattedDate,
		totalCount,
		completedCount,
		progressPercent,
		syncStatus,
		onRetrySync,
		onRequestClearAll
	}: Props = $props();
</script>

<section class="neo-border neo-shadow rounded-xl bg-white p-3 sm:rounded-2xl sm:p-4">
	<!-- Baris Atas: Tanggal Jadwal + Status Sinkronisasi Otomatis (+ Hapus khusus mobile) -->
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="min-w-0 flex-1">
			<h1 class="truncate font-display text-sm font-bold text-ink sm:text-base">
				{formattedDate}
			</h1>
			<p class="text-[11px] font-semibold text-slate-500 sm:text-xs">
				{completedCount} dari {totalCount} udah beres
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

			{#if syncStatus === 'saving'}
				<span
					role="status"
					aria-live="polite"
					class="neo-border inline-flex h-8 items-center gap-1.5 rounded-lg bg-butter px-2.5 font-display text-[11px] font-bold text-ink sm:h-9 sm:px-3 sm:text-xs"
				>
					<span class="h-2 w-2 animate-pulse rounded-full bg-ink" aria-hidden="true"></span>
					<span>Lagi nyimpen...</span>
				</span>
			{:else if syncStatus === 'error'}
				<button
					type="button"
					onclick={onRetrySync}
					class="neo-btn-sm inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-butter px-2.5 font-display text-xs font-bold text-ink hover:bg-yellow-300 sm:h-9 sm:px-3 sm:text-xs"
				>
					<svg
						class="h-3.5 w-3.5 stroke-[2.6]"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polyline points="23 4 23 10 17 10" />
						<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
					</svg>
					<span>Simpen Ulang</span>
				</button>
			{:else if syncStatus === 'saved'}
				<span
					role="status"
					aria-live="polite"
					class="neo-border inline-flex h-8 items-center gap-1 rounded-lg bg-mintpop px-2.5 font-display text-[11px] font-bold text-ink sm:h-9 sm:px-3 sm:text-xs"
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
						<polyline points="20 6 9 17 4 12" />
					</svg>
					<span>Tersimpen</span>
				</span>
			{/if}
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
