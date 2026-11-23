<script lang="ts">
	import { getTodayIsoDate } from '#lib/stores/schedule.svelte.ts';
	import type { ScheduleFormInput, ScheduleItem } from '#lib/types/schedule.ts';

	interface Props {
		open: boolean;
		editingItem: ScheduleItem | null;
		requireDate: boolean;
		savedDates: Set<string>;
		defaultStartTime: string;
		onClose: () => void;
		onSubmit: (input: ScheduleFormInput, editingId: string | null) => Promise<boolean> | boolean;
	}

	let {
		open,
		editingItem,
		requireDate,
		savedDates,
		defaultStartTime,
		onClose,
		onSubmit
	}: Props = $props();

	const QUICK_TIMES = ['08:00', '10:00', '13:30', '16:00'];

	let scheduleDate = $state(getTodayIsoDate());
	let title = $state('');
	let startTime = $state('08:00');
	let description = $state('');
	let helperText = $state('');
	let errorDate = $state('');
	let errorTitle = $state('');
	let errorTime = $state('');
	let isSubmitting = $state(false);
	let titleInputEl = $state<HTMLInputElement | null>(null);

	let dateAlreadySaved = $derived(requireDate && Boolean(scheduleDate) && savedDates.has(scheduleDate));

	$effect(() => {
		if (open) {
			if (editingItem) {
				scheduleDate = editingItem.schedule_date;
				title = editingItem.title;
				startTime = editingItem.start_time;
				description = editingItem.description;
				helperText = editingItem.helper_text;
			} else {
				scheduleDate = getTodayIsoDate();
				title = '';
				startTime = defaultStartTime;
				description = '';
				helperText = '';
			}
			errorDate = '';
			errorTitle = '';
			errorTime = '';
			isSubmitting = false;

			const focusTimer = setTimeout(() => {
				if (!requireDate) {
					titleInputEl?.focus();
				}
			}, 60);
			return () => clearTimeout(focusTimer);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}

	async function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorDate = '';
		errorTitle = '';
		errorTime = '';

		const trimmedDate = scheduleDate.trim();
		const trimmedTitle = title.trim();
		const trimmedTime = startTime.trim();

		if (requireDate && !trimmedDate) {
			errorDate = 'Pilih tanggalnya dulu ya.';
		}
		if (!trimmedTitle) {
			errorTitle = 'Nama aktivitasnya belum diisi nih.';
		}
		if (!trimmedTime) {
			errorTime = 'Pilih jamnya dulu ya.';
		}
		if (errorDate || errorTitle || errorTime) {
			if (errorTitle && !errorDate) titleInputEl?.focus();
			return;
		}

		isSubmitting = true;
		const ok = await onSubmit(
			{
				schedule_date: requireDate ? trimmedDate : undefined,
				title: trimmedTitle,
				start_time: trimmedTime,
				description: description.trim(),
				helper_text: helperText.trim()
			},
			editingItem?.id ?? null
		);
		isSubmitting = false;

		if (ok) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
		<button
			type="button"
			aria-label="Tutup form aktivitas"
			onclick={onClose}
			class="fixed inset-0 cursor-default bg-ink/55 backdrop-blur-[2px]"
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="schedule-modal-title"
			tabindex="-1"
			class="neo-border neo-shadow-lg animate-sheet-up relative z-10 flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"
		>
			<!-- Header Modal -->
			<div
				class="flex shrink-0 items-center justify-between gap-3 border-b-2 border-ink bg-navy px-4 py-3 text-white sm:px-5 sm:py-3.5"
			>
				<h2 id="schedule-modal-title" class="font-display text-base font-bold tracking-tight sm:text-lg">
					{#if editingItem}
						Edit Aktivitas
					{:else if requireDate}
						Bikin Jadwal & Aktivitas Pertama
					{:else}
						Bikin Aktivitas
					{/if}
				</h2>

				<button
					type="button"
					onclick={onClose}
					aria-label="Tutup"
					class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-2 border-ink bg-coralpop font-display text-sm font-bold leading-none text-ink shadow-[2px_2px_0px_#0F172A] hover:bg-red-300"
				>
					✕
				</button>
			</div>

			<!-- Isi Form -->
			<form
				id="schedule-form"
				onsubmit={handleFormSubmit}
				class="flex-1 space-y-3 overflow-y-auto p-4 sm:space-y-4 sm:p-5"
				novalidate
			>
				{#if requireDate}
					<div>
						<label for="input-date" class="mb-1 block font-display text-xs font-bold text-ink sm:text-sm">
							Tanggal Jadwal <span class="text-red-600">*</span>
						</label>
						<input
							id="input-date"
							type="date"
							required
							bind:value={scheduleDate}
							oninput={() => (errorDate = '')}
							class="neo-input w-full rounded-xl bg-white px-3 py-2 font-display text-base font-bold text-ink sm:w-52"
						/>
						{#if dateAlreadySaved}
							<p class="mt-1 text-[11px] font-semibold text-navy">
								Tanggal ini udah ada jadwalnya. Nanti aktivitasnya langsung masuk ke situ ya.
							</p>
						{/if}
						{#if errorDate}
							<p class="mt-1 text-xs font-bold text-red-600" role="alert">
								{errorDate}
							</p>
						{/if}
					</div>
				{/if}

				<div>
					<label for="input-title" class="mb-1 block font-display text-xs font-bold text-ink sm:text-sm">
						Nama Aktivitas <span class="text-red-600">*</span>
					</label>
					<input
						bind:this={titleInputEl}
						id="input-title"
						type="text"
						maxlength="120"
						required
						bind:value={title}
						oninput={() => (errorTitle = '')}
						placeholder="Contoh: Berangkat pake ojol"
						class="neo-input w-full rounded-xl bg-white px-3 py-2.5 text-base font-semibold text-ink placeholder:text-slate-400"
					/>
					{#if errorTitle}
						<p class="mt-1 text-xs font-bold text-red-600" role="alert">
							{errorTitle}
						</p>
					{/if}
				</div>

				<div>
					<label for="input-time" class="mb-1 block font-display text-xs font-bold text-ink sm:text-sm">
						Jam <span class="text-red-600">*</span>
					</label>
					<input
						id="input-time"
						type="time"
						required
						bind:value={startTime}
						oninput={() => (errorTime = '')}
						class="neo-input w-full rounded-xl bg-white px-3 py-2 font-display text-base font-bold text-ink sm:w-44"
					/>
				</div>

				<div>
					<label for="input-description" class="mb-1 block font-display text-xs font-bold text-ink sm:text-sm">
						Keterangan <span class="text-xs font-medium text-slate-500">(Opsional)</span>
					</label>
					<textarea
						id="input-description"
						rows="2"
						maxlength="400"
						bind:value={description}
						placeholder="Tulis bebas mau ngapain aja"
						class="neo-input w-full resize-none rounded-xl bg-white px-3 py-2 text-base font-medium text-ink placeholder:text-slate-400"
					></textarea>
				</div>

				<div>
					<label for="input-helper" class="mb-1 block font-display text-xs font-bold text-ink sm:text-sm">
						Pengingat <span class="text-xs font-medium text-slate-500">(Opsional)</span>
					</label>
					<input
						id="input-helper"
						type="text"
						maxlength="160"
						bind:value={helperText}
						placeholder="Contoh: Bawa charger, obat-obatan"
						class="neo-input w-full rounded-xl bg-white px-3 py-2 text-base font-medium text-ink placeholder:text-slate-400"
					/>
					<p class="mt-1 text-[11px] font-medium text-slate-500">
						Muncul dibawah aktivitas biar gak lupa yaw.
					</p>
				</div>
			</form>

			<!-- Footer Tombol -->
			<div
				class="flex shrink-0 items-center justify-end gap-2.5 border-t border-dashed border-slate-300 bg-white px-4 py-3 sm:px-5"
			>
				<button
					type="button"
					onclick={onClose}
					class="neo-btn-sm h-10 cursor-pointer rounded-xl bg-white px-4 font-display text-xs font-bold text-ink hover:bg-slate-100 sm:text-sm"
				>
					Gak Jadi
				</button>
				<button
					type="submit"
					form="schedule-form"
					disabled={isSubmitting}
					class="neo-btn h-10 flex-1 cursor-pointer rounded-xl bg-navy px-4 font-display text-xs font-bold text-white hover:bg-navy-light sm:flex-none sm:px-5 sm:text-sm"
				>
					{#if isSubmitting}
						Lagi nyimpen...
					{:else if editingItem}
						Simpen Perubahan
					{:else}
						Bikin
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
