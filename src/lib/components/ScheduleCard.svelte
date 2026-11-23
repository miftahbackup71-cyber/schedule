<script lang="ts">
	import type { ScheduleItem } from '#lib/types/schedule.ts';

	interface Props {
		item: ScheduleItem;
		stepNumber: number;
		isFirst: boolean;
		isLast: boolean;
		isNewlyAdded?: boolean;
		onToggleComplete: (id: string) => void;
		onMoveUp: (id: string) => void;
		onMoveDown: (id: string) => void;
		onEdit: (item: ScheduleItem) => void;
		onDelete: (id: string) => void;
	}

	let {
		item,
		stepNumber,
		isFirst,
		isLast,
		isNewlyAdded = false,
		onToggleComplete,
		onMoveUp,
		onMoveDown,
		onEdit,
		onDelete
	}: Props = $props();
</script>

<article
	data-item-id={item.id}
	class="relative flex items-stretch gap-2.5 pb-3 sm:gap-3.5 sm:pb-4 {isNewlyAdded
		? 'animate-pop-in'
		: ''}"
>
	<!-- Garis Urutan Sisi Kiri (Sekaligus Tombol Centang Selesai) -->
	<div class="flex w-9 shrink-0 flex-col items-center sm:w-11">
		<button
			type="button"
			onclick={() => onToggleComplete(item.id)}
			title={item.is_completed ? 'Tandai belum beres' : 'Tandai beres'}
			aria-label={item.is_completed
				? `Tandai aktivitas ${item.title} belum beres`
				: `Tandai aktivitas ${item.title} beres`}
			aria-pressed={item.is_completed}
			class="neo-border neo-shadow-sm z-10 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl font-display text-sm font-bold transition-transform active:scale-95 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-base {item.is_completed
				? 'bg-mintpop text-ink'
				: 'bg-navy text-white'}"
		>
			{#if item.is_completed}
				<svg
					class="h-4 w-4 stroke-[3.2] sm:h-5 sm:w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			{:else}
				<span>{stepNumber}</span>
			{/if}
		</button>

		<!-- Garis Penghubung ke Urutan Berikutnya -->
		<div
			class="mt-1 min-h-[16px] w-[3px] flex-1 rounded-full {item.is_completed
				? 'bg-mintpop border-x border-ink'
				: 'bg-navy'}"
			aria-hidden="true"
		></div>
	</div>

	<!-- Kartu Jadwal Ringkas -->
	<div
		class="neo-border neo-shadow min-w-0 flex-1 rounded-xl p-3 transition-colors sm:rounded-2xl sm:p-4 {item.is_completed
			? 'bg-slate-50/95'
			: 'bg-white'}"
	>
		<!-- Baris Atas: Jam Mulai + Tombol Aksi Ringkas -->
		<div class="mb-1.5 flex items-center justify-between gap-2">
			<time
				class="inline-block rounded-lg border-[1.5px] border-ink bg-navy px-2 py-0.5 font-display text-xs font-bold text-white sm:text-sm"
			>
				{item.start_time}
			</time>

			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => onMoveUp(item.id)}
					disabled={isFirst}
					aria-label="Geser ke atas"
					title="Geser ke atas"
					class="neo-btn-sm flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white font-display text-xs font-bold text-ink hover:bg-skypop sm:h-9 sm:w-9 sm:text-sm"
				>
					↑
				</button>
				<button
					type="button"
					onclick={() => onMoveDown(item.id)}
					disabled={isLast}
					aria-label="Geser ke bawah"
					title="Geser ke bawah"
					class="neo-btn-sm flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white font-display text-xs font-bold text-ink hover:bg-skypop sm:h-9 sm:w-9 sm:text-sm"
				>
					↓
				</button>

				<button
					type="button"
					onclick={() => onEdit(item)}
					aria-label="Edit aktivitas"
					title="Edit aktivitas"
					class="neo-btn-sm flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-butter text-ink hover:bg-yellow-300 sm:h-9 sm:w-9"
				>
					<svg
						class="h-3.5 w-3.5 stroke-[2.4] sm:h-4 sm:w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 20h9" />
						<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
					</svg>
				</button>

				<button
					type="button"
					onclick={() => onDelete(item.id)}
					aria-label="Hapus aktivitas"
					title="Hapus aktivitas"
					class="neo-btn-sm flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-ink hover:bg-coralpop sm:h-9 sm:w-9"
				>
					<svg
						class="h-3.5 w-3.5 stroke-[2.4] sm:h-4 sm:w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6" />
						<path d="M14 11v6" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Nama Kegiatan (Klik juga bisa tandai selesai atau cukup jelas dibaca) -->
		<h2
			class="break-words font-display text-sm font-bold leading-snug sm:text-base {item.is_completed
				? 'text-slate-500 line-through'
				: 'text-ink'}"
		>
			{item.title}
		</h2>

		<!-- Keterangan (Opsional) -->
		{#if item.description}
			<p
				class="mt-1 whitespace-pre-line break-words text-xs font-medium leading-relaxed text-slate-600 sm:text-sm {item.is_completed
					? 'opacity-65'
					: ''}"
			>
				{item.description}
			</p>
		{/if}

		<!-- Pengingat (Opsional) -->
		{#if item.helper_text}
			<div
				class="mt-2 rounded-lg border-[1.5px] border-ink bg-butter/80 px-2.5 py-1.5 text-xs font-semibold leading-snug text-ink"
			>
				<span class="font-display font-bold">Pengingat:</span>
				<span class="break-words"> {item.helper_text}</span>
			</div>
		{/if}

		<!-- Tombol Check / Uncheck Ringkas -->
		<div class="mt-2.5 border-t border-dashed border-slate-200 pt-2">
			<button
				type="button"
				onclick={() => onToggleComplete(item.id)}
				aria-pressed={item.is_completed}
				class="neo-btn-sm inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 font-display text-xs font-bold text-ink sm:h-9 sm:px-3 {item.is_completed
					? 'bg-mintpop hover:bg-green-300'
					: 'bg-cream hover:bg-mintpop/60'}"
			>
				<span
					class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border-[1.5px] border-ink bg-white text-[10px] leading-none"
					aria-hidden="true"
				>
					{item.is_completed ? '✓' : ''}
				</span>
				<span>{item.is_completed ? 'Beres' : 'Tandai Beres'}</span>
			</button>
		</div>
	</div>
</article>
