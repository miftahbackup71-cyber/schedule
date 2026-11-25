<script lang="ts">
	import { onMount, tick } from 'svelte';
	import AppFooter from '#lib/components/AppFooter.svelte';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import BackgroundOrnament from '#lib/components/BackgroundOrnament.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import EasterEggModal from '#lib/components/EasterEggModal.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import SavedSchedulesDrawer from '#lib/components/SavedSchedulesDrawer.svelte';
	import ScheduleCard from '#lib/components/ScheduleCard.svelte';
	import ScheduleModal from '#lib/components/ScheduleModal.svelte';
	import ScheduleSkeleton from '#lib/components/ScheduleSkeleton.svelte';
	import TimelineToolbar from '#lib/components/TimelineToolbar.svelte';
	import ToastHost from '#lib/components/ToastHost.svelte';
	import { ScheduleStore } from '#lib/stores/schedule.svelte.ts';
	import type { ScheduleFormInput, ScheduleItem } from '#lib/types/schedule.ts';
	import { copyTextToClipboard, formatScheduleForWhatsApp } from '#lib/utils/whatsapp.ts';

	const store = new ScheduleStore();

	let isDrawerOpen = $state(false);
	let isFormModalOpen = $state(false);
	let editingItem = $state<ScheduleItem | null>(null);
	let isClearConfirmOpen = $state(false);
	let isEasterEggOpen = $state(false);
	let isCopiedWa = $state(false);
	let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

	let hasFloatingMobileCta = $derived(!store.isLoading && store.totalCount > 0);
	let requireDateInModal = $derived(!editingItem && store.totalCount === 0);

	onMount(() => {
		void store.init();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden' && store.hasPendingSync()) {
				void store.flushPendingSync();
			} else if (document.visibilityState === 'visible' && !isFormModalOpen) {
				void store.refreshActiveFromServer();
			}
		};

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (store.hasPendingSync()) {
				void store.flushPendingSync();
				event.preventDefault();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', handleBeforeUnload);
			if (copyResetTimer) {
				clearTimeout(copyResetTimer);
			}
		};
	});

	function openAddModal() {
		editingItem = null;
		isFormModalOpen = true;
	}

	function openEditModal(item: ScheduleItem) {
		editingItem = item;
		isFormModalOpen = true;
	}

	function closeFormModal() {
		isFormModalOpen = false;
		editingItem = null;
	}

	function openDrawer() {
		void store.refreshSavedList();
		isDrawerOpen = true;
	}

	function handleSelectSchedule(date: string) {
		if (date === store.selectedDate) return;
		void store.openSavedSchedule(date);
	}

	function handleCreateNewSchedule() {
		void store.startNewSchedule();
	}

	async function handleModalSubmit(
		input: ScheduleFormInput,
		editingId: string | null
	): Promise<boolean> {
		if (editingId) {
			return store.update(editingId, input);
		}

		const ok = await store.add(input);
		if (ok && store.lastAddedId) {
			const targetId = store.lastAddedId;
			await tick();
			const addedEl = document.querySelector(`[data-item-id="${targetId}"]`);
			addedEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
		return ok;
	}

	async function handleConfirmClearAll() {
		isClearConfirmOpen = false;
		await store.clearCurrentSchedule();
	}

	async function handleCopyWhatsApp() {
		if (!store.selectedDate || store.items.length === 0) return;

		const formattedText = formatScheduleForWhatsApp(store.formattedSelectedDate, store.items);
		const ok = await copyTextToClipboard(formattedText);

		if (ok) {
			isCopiedWa = true;
			if (copyResetTimer) clearTimeout(copyResetTimer);
			copyResetTimer = setTimeout(() => {
				isCopiedWa = false;
				copyResetTimer = null;
			}, 2000);
			store.showToast('Jadwal udah disalin, tinggal paste ke WA!', 'mint');
		} else {
			store.showToast('Gagal nyalin jadwal, coba lagi ya.', 'coral');
		}
	}
</script>

<BackgroundOrnament />

<AppHeader
	totalCount={store.totalCount}
	completedCount={store.completedCount}
	onOpenMenu={openDrawer}
	onAdd={openAddModal}
	onRequestClearAll={() => (isClearConfirmOpen = true)}
/>

<main class="relative z-10 mx-auto w-full max-w-2xl flex-1 space-y-3 px-3 pt-2.5 pb-4 sm:space-y-4 sm:px-6 sm:pt-4">
	{#if store.connectionNotice}
		<div
			class="neo-border flex flex-wrap items-center justify-between gap-2 rounded-xl bg-butter/90 px-3 py-2 text-[11px] font-semibold leading-snug text-ink sm:text-xs"
			role="status"
		>
			<span class="min-w-0 flex-1">{store.connectionNotice}</span>
			<button
				type="button"
				onclick={() => (store.selectedDate ? store.retrySync() : store.init())}
				class="h-7 shrink-0 cursor-pointer rounded-lg border-[1.5px] border-ink bg-white px-2.5 font-display text-[11px] font-bold text-ink hover:bg-cream"
			>
				Coba Lagi
			</button>
		</div>
	{/if}

	{#if store.isLoading}
		<ScheduleSkeleton />
	{:else if store.isEmpty}
		<EmptyState onAdd={openAddModal} />
	{:else}
		<div class="space-y-3 sm:space-y-4">
			<TimelineToolbar
				formattedDate={store.formattedSelectedDate}
				totalCount={store.totalCount}
				completedCount={store.completedCount}
				progressPercent={store.progressPercent}
				syncStatus={store.syncStatus}
				isCopied={isCopiedWa}
				onCopyWhatsApp={handleCopyWhatsApp}
				onRetrySync={() => store.retrySync()}
				onRequestClearAll={() => (isClearConfirmOpen = true)}
			/>

			<div class="relative">
				{#each store.items as item, idx (item.id)}
					<ScheduleCard
						{item}
						stepNumber={idx + 1}
						isFirst={idx === 0}
						isLast={idx === store.items.length - 1}
						isNewlyAdded={store.lastAddedId === item.id}
						onToggleComplete={(id) => store.toggleCompleted(id)}
						onMoveUp={(id) => store.move(id, -1)}
						onMoveDown={(id) => store.move(id, 1)}
						onEdit={openEditModal}
						onDelete={(id) => store.remove(id)}
					/>
				{/each}

				<!-- Kartu Tambah Aktivitas Berikutnya -->
				<div class="relative flex items-start gap-2.5 pt-0.5 sm:gap-3.5">
					<div class="flex w-9 shrink-0 flex-col items-center sm:w-11">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl border-[1.5px] border-dashed border-ink bg-butter font-display text-base font-bold text-ink shadow-[2px_2px_0px_#0F172A] sm:h-11 sm:w-11 sm:rounded-2xl sm:border-2"
							aria-hidden="true"
						>
							+
						</div>
					</div>

					<button
						type="button"
						onclick={openAddModal}
						class="flex min-h-[42px] flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl border-[1.5px] border-dashed border-ink bg-white/90 px-3.5 py-2.5 text-left shadow-[2px_2px_0px_#0F172A] transition-all hover:bg-butter/35 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none sm:min-h-[48px] sm:rounded-2xl sm:border-2 sm:px-4"
					>
						<span>
							<span class="block font-display text-xs font-bold text-navy sm:text-sm">
								Bikin Aktivitas Berikutnya
							</span>
							<span class="block text-[11px] font-medium text-slate-500">
								Lanjut ke urutan #{store.totalCount + 1}
							</span>
						</span>
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>

<AppFooter onOpenEasterEgg={() => (isEasterEggOpen = true)} />

<!-- Tombol Tambah Melayang Ringkas Khusus Mobile -->
{#if hasFloatingMobileCta}
	<div class="pointer-events-none fixed right-3 bottom-3.5 z-30 sm:hidden">
		<button
			type="button"
			onclick={openAddModal}
			class="neo-btn pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-navy px-4 font-display text-xs font-bold text-white hover:bg-navy-light"
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
			<span>Bikin Aktivitas</span>
		</button>
	</div>
{/if}

<SavedSchedulesDrawer
	open={isDrawerOpen}
	savedSchedules={store.savedSchedules}
	activeDate={store.selectedDate}
	onClose={() => (isDrawerOpen = false)}
	onSelectSchedule={handleSelectSchedule}
	onCreateNew={handleCreateNewSchedule}
/>

<ScheduleModal
	open={isFormModalOpen}
	{editingItem}
	requireDate={requireDateInModal}
	savedDates={store.savedDatesSet}
	defaultStartTime={store.suggestNextStartTime()}
	onClose={closeFormModal}
	onSubmit={handleModalSubmit}
/>

<ConfirmDialog
	open={isClearConfirmOpen}
	title="Yakin mau hapus jadwal ini?"
	message="Semua aktivitas di jadwal ini bakal kehapus loh."
	confirmLabel="Ya, Hapus Aja"
	cancelLabel="Gak Jadi"
	onConfirm={handleConfirmClearAll}
	onCancel={() => (isClearConfirmOpen = false)}
/>

<EasterEggModal open={isEasterEggOpen} onClose={() => (isEasterEggOpen = false)} />

<ToastHost
	toasts={store.toasts}
	{hasFloatingMobileCta}
	onDismiss={(id) => store.dismissToast(id)}
/>
