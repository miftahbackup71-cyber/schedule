<script lang="ts">
	import { formatIndonesianDate } from '#lib/stores/schedule.svelte.ts';
	import type { SavedScheduleSummary } from '#lib/types/schedule.ts';

	interface Props {
		open: boolean;
		savedSchedules: SavedScheduleSummary[];
		activeDate: string | null;
		onClose: () => void;
		onSelectSchedule: (isoDate: string) => void;
		onCreateNew: () => void;
	}

	let { open, savedSchedules, activeDate, onClose, onSelectSchedule, onCreateNew }: Props =
		$props();

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex justify-end">
		<button
			type="button"
			aria-label="Tutup daftar jadwal"
			onclick={onClose}
			class="fixed inset-0 cursor-default bg-ink/50 backdrop-blur-[2px]"
		></button>

		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="drawer-title"
			tabindex="-1"
			class="neo-border relative z-10 flex h-full w-[82vw] max-w-xs flex-col border-y-0 border-r-0 bg-cream shadow-[-4px_0px_0px_#0F172A]"
		>
			<!-- Header Drawer -->
			<div
				class="flex shrink-0 items-center justify-between gap-2 border-b-2 border-ink bg-navy px-4 py-3.5 text-white"
			>
				<h2 id="drawer-title" class="font-display text-base font-bold tracking-tight">
					Jadwal Kamu
				</h2>
				<button
					type="button"
					onclick={onClose}
					aria-label="Tutup menu"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-2 border-ink bg-coralpop font-display text-xs font-bold text-ink hover:bg-red-300"
				>
					✕
				</button>
			</div>

			<!-- Tombol Buat Jadwal Baru -->
			<div class="shrink-0 border-b border-dashed border-slate-300 p-3.5">
				<button
					type="button"
					onclick={() => {
						onClose();
						onCreateNew();
					}}
					class="neo-btn inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-butter px-3 font-display text-xs font-bold text-ink hover:bg-yellow-300 sm:text-sm"
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
					<span>Bikin Jadwal Baru</span>
				</button>
			</div>

			<!-- Daftar Jadwal Tersimpan -->
			<div class="flex-1 overflow-y-auto p-3.5">
				<p class="mb-2 font-display text-[11px] font-bold tracking-wide text-slate-500 uppercase">
					Udah Disimpen
				</p>

				{#if savedSchedules.length === 0}
					<div class="neo-border rounded-xl bg-white p-4 text-center">
						<p class="font-display text-xs font-bold text-ink">Belum ada jadwal yang disimpen</p>
						<p class="mt-1 text-[11px] font-medium text-slate-500">
							Isi aktivitas dulu terus klik Simpen Jadwal biar muncul di sini.
						</p>
					</div>
				{:else}
					<ul class="space-y-2">
						{#each savedSchedules as entry (entry.date)}
							{@const isActive = activeDate === entry.date}
							<li>
								<button
									type="button"
									onclick={() => {
										onClose();
										onSelectSchedule(entry.date);
									}}
									class="neo-btn-sm flex w-full cursor-pointer flex-col items-start rounded-xl px-3 py-2.5 text-left transition-colors {isActive
										? 'bg-navy text-white'
										: 'bg-white text-ink hover:bg-skypop/35'}"
								>
									<span class="font-display text-xs font-bold leading-snug sm:text-sm">
										{formatIndonesianDate(entry.date)}
									</span>
									<span
										class="mt-0.5 text-[11px] font-medium {isActive
											? 'text-navy-soft'
											: 'text-slate-500'}"
									>
										{entry.totalCount} aktivitas · {entry.completedCount} beres
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
{/if}
