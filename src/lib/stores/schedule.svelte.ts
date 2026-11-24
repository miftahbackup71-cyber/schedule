import { browser } from '$app/env';
import { getSupabaseClient } from '#lib/supabase/client.ts';
import type {
	SavedScheduleSummary,
	ScheduleFormInput,
	ScheduleItem,
	SyncStatus,
	ToastAction,
	ToastItem,
	ToastVariant
} from '#lib/types/schedule.ts';

const SAVED_STORAGE_KEY = 'kudil_saved_schedules_v3';

interface ScheduleRow {
	id: string;
	title: string;
	start_time: string;
	description: string | null;
	helper_text: string | null;
	position: number;
	is_completed: boolean;
	schedule_date: string;
}

interface PendingDelete {
	item: ScheduleItem;
	index: number;
}

interface SyncSnapshot {
	date: string;
	items: ScheduleItem[];
	revision: number;
}

function generateUuid(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function normalizeTime(raw: string): string {
	if (!raw) return '08:00';
	return raw.slice(0, 5);
}

export function getTodayIsoDate(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function formatIndonesianDate(isoDate: string): string {
	try {
		const [y, m, d] = isoDate.split('-').map(Number);
		const dt = new Date(y, m - 1, d);
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(dt);
	} catch {
		return isoDate;
	}
}

export class ScheduleStore {
	selectedDate = $state<string | null>(null);
	items = $state<ScheduleItem[]>([]);
	savedSchedules = $state<SavedScheduleSummary[]>([]);
	isLoading = $state(true);
	syncStatus = $state<SyncStatus>('idle');
	connectionNotice = $state<string | null>(null);
	toasts = $state<ToastItem[]>([]);
	lastAddedId = $state<string | null>(null);

	private pendingDeletes = new Map<string, PendingDelete>();
	private toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

	private syncTimer: ReturnType<typeof setTimeout> | null = null;
	private activeSyncPromise: Promise<boolean> | null = null;
	private syncRevision = 0;
	private pendingSnapshot: SyncSnapshot | null = null;

	isSaving = $derived(this.syncStatus === 'saving');
	totalCount = $derived(this.items.length);
	completedCount = $derived(this.items.filter((item) => item.is_completed).length);
	progressPercent = $derived(
		this.items.length === 0 ? 0 : Math.round((this.completedCount / this.items.length) * 100)
	);
	isEmpty = $derived(!this.isLoading && this.items.length === 0);
	formattedSelectedDate = $derived(
		this.selectedDate ? formatIndonesianDate(this.selectedDate) : ''
	);
	savedDatesSet = $derived(new Set(this.savedSchedules.map((s) => s.date)));

	hasPendingSync(): boolean {
		return (
			this.syncTimer !== null ||
			this.activeSyncPromise !== null ||
			this.pendingSnapshot !== null
		);
	}

	async init(): Promise<void> {
		if (!browser) return;
		this.isLoading = true;
		this.connectionNotice = null;

		try {
			await this.refreshSavedList();

			// Opsi A: jika jadwal hari ini sudah pernah disimpan, langsung buka
			const today = getTodayIsoDate();
			if (this.savedSchedules.some((s) => s.date === today)) {
				await this.openSavedSchedule(today, false);
			} else {
				this.selectedDate = null;
				this.items = [];
				this.syncStatus = 'idle';
			}
		} finally {
			this.isLoading = false;
		}
	}

	async refreshSavedList(): Promise<void> {
		if (!browser) return;

		try {
			const supabase = getSupabaseClient();
			const { data, error } = await supabase
				.from('schedules')
				.select('schedule_date, is_completed');
			if (error) throw error;

			const remoteCounts = new Map<string, { total: number; done: number }>();
			for (const row of (data ?? []) as { schedule_date: string; is_completed: boolean }[]) {
				const prev = remoteCounts.get(row.schedule_date) ?? { total: 0, done: 0 };
				prev.total += 1;
				if (row.is_completed) prev.done += 1;
				remoteCounts.set(row.schedule_date, prev);
			}

			const summaryMap = new Map<string, SavedScheduleSummary>();
			for (const [date, counts] of remoteCounts.entries()) {
				summaryMap.set(date, {
					date,
					totalCount: counts.total,
					completedCount: counts.done
				});
			}

			// Pertahankan tanggal yang sedang antre / gagal sync di perangkat agar tidak hilang dari daftar
			const unsyncedDate =
				this.pendingSnapshot?.date ??
				(this.syncStatus === 'error' ? this.selectedDate : null);
			if (unsyncedDate && this.items.length > 0 && unsyncedDate === this.selectedDate) {
				summaryMap.set(unsyncedDate, {
					date: unsyncedDate,
					totalCount: this.items.length,
					completedCount: this.items.filter((i) => i.is_completed).length
				});
			}

			// Bersihkan cache localStorage untuk tanggal yang sudah dihapus dari perangkat lain
			this.pruneLocalCache(new Set(summaryMap.keys()));

			this.savedSchedules = Array.from(summaryMap.values()).sort((a, b) =>
				b.date.localeCompare(a.date)
			);
		} catch (err) {
			console.warn('Gagal memuat daftar jadwal dari server, memakai daftar di perangkat:', err);
			const localMap = this.readAllSavedLocal();
			const fallback: SavedScheduleSummary[] = [];
			for (const [date, list] of Object.entries(localMap)) {
				if (list.length > 0) {
					fallback.push({
						date,
						totalCount: list.length,
						completedCount: list.filter((i) => i.is_completed).length
					});
				}
			}
			this.savedSchedules = fallback.sort((a, b) => b.date.localeCompare(a.date));
		}
	}

	async openSavedSchedule(isoDate: string, showFeedback = true): Promise<void> {
		if (!browser) return;
		await this.flushPendingSync();

		this.isLoading = true;
		this.pendingDeletes.clear();
		this.selectedDate = isoDate;

		try {
			const supabase = getSupabaseClient();
			const { data, error } = await supabase
				.from('schedules')
				.select(
					'id, title, start_time, description, helper_text, position, is_completed, schedule_date'
				)
				.eq('schedule_date', isoDate)
				.order('position', { ascending: true });

			if (error) throw error;

			const remoteItems = this.mapRows(data as ScheduleRow[] | null);

			// Server adalah source of truth saat online
			this.items = remoteItems;
			this.writeSavedLocalForDate(isoDate, remoteItems);
			this.updateSavedSummaryForDate(isoDate, remoteItems);
			this.syncStatus = remoteItems.length > 0 ? 'saved' : 'idle';
			this.connectionNotice = null;

			if (remoteItems.length === 0) {
				this.selectedDate = null;
			}

			if (showFeedback) {
				this.showToast(`Jadwal ${formatIndonesianDate(isoDate)} udah kebuka.`, 'navy');
			}
		} catch (err) {
			console.warn('Gagal membuka dari server, membuka dari penyimpanan perangkat:', err);
			this.items = this.readSavedLocalForDate(isoDate);
			this.syncStatus = this.items.length > 0 ? 'error' : 'idle';
			if (showFeedback) {
				this.showToast(`Jadwal ${formatIndonesianDate(isoDate)} udah kebuka.`, 'navy');
			}
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Menarik pembaruan terbaru dari Supabase secara diam-diam (tanpa skeleton)
	 * saat pengguna kembali membuka tab/aplikasi dari perangkat lain.
	 */
	async refreshActiveFromServer(): Promise<void> {
		if (!browser || this.isLoading || this.hasPendingSync()) return;

		await this.refreshSavedList();
		if (this.hasPendingSync()) return;

		const targetDate = this.selectedDate;
		if (!targetDate) {
			const today = getTodayIsoDate();
			if (this.savedSchedules.some((s) => s.date === today)) {
				await this.openSavedSchedule(today, false);
			}
			return;
		}

		try {
			const supabase = getSupabaseClient();
			const { data, error } = await supabase
				.from('schedules')
				.select(
					'id, title, start_time, description, helper_text, position, is_completed, schedule_date'
				)
				.eq('schedule_date', targetDate)
				.order('position', { ascending: true });

			if (error) throw error;
			if (this.hasPendingSync() || this.selectedDate !== targetDate) return;

			const remoteItems = this.mapRows(data as ScheduleRow[] | null);
			this.items = remoteItems;
			this.writeSavedLocalForDate(targetDate, remoteItems);
			this.updateSavedSummaryForDate(targetDate, remoteItems);
			this.connectionNotice = null;

			if (remoteItems.length > 0) {
				this.syncStatus = 'saved';
			} else {
				this.selectedDate = null;
				this.syncStatus = 'idle';
			}
		} catch (err) {
			console.warn('Gagal menyegarkan jadwal dari server:', err);
		}
	}

	async startNewSchedule(): Promise<void> {
		await this.flushPendingSync();
		this.pendingDeletes.clear();
		this.selectedDate = null;
		this.items = [];
		this.syncStatus = 'idle';
	}

	async flushPendingSync(): Promise<boolean> {
		if (!browser) return true;

		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
			this.syncTimer = null;
		}

		if (this.activeSyncPromise) {
			const ok = await this.activeSyncPromise;
			if (this.pendingSnapshot) {
				return this.runSyncQueue();
			}
			return ok;
		}

		if (this.pendingSnapshot) {
			return this.runSyncQueue();
		}

		return true;
	}

	async retrySync(): Promise<boolean> {
		if (!browser || !this.selectedDate) return false;
		this.persistAndSync(0);
		const ok = await this.flushPendingSync();
		if (ok) {
			this.showToast('Jadwal udah kesimpen ke server!', 'mint');
		}
		return ok;
	}

	suggestNextStartTime(): string {
		if (this.items.length > 0) {
			const last = this.items[this.items.length - 1].start_time;
			const [hh, mm] = last.split(':').map(Number);
			if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
				const nextHour = (hh + 1) % 24;
				return `${String(nextHour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
			}
		}
		const now = new Date();
		return `${String(now.getHours()).padStart(2, '0')}:00`;
	}

	async add(input: ScheduleFormInput): Promise<boolean> {
		let targetDate = this.selectedDate;

		// Aktivitas pertama pada jadwal kosong wajib menentukan tanggal
		if (this.items.length === 0) {
			targetDate = input.schedule_date || getTodayIsoDate();

			// Jika tanggal ini sudah pernah disimpan, muat aktivitas sebelumnya dulu agar tidak hilang
			if (this.savedDatesSet.has(targetDate) && this.selectedDate !== targetDate) {
				await this.openSavedSchedule(targetDate, false);
			}
			this.selectedDate = targetDate;
		}

		const resolvedDate = targetDate ?? getTodayIsoDate();
		const nextPosition =
			this.items.length === 0 ? 0 : Math.max(...this.items.map((i) => i.position)) + 1;

		const newItem: ScheduleItem = {
			id: generateUuid(),
			title: input.title.trim(),
			start_time: normalizeTime(input.start_time),
			description: input.description.trim(),
			helper_text: input.helper_text.trim(),
			position: nextPosition,
			is_completed: false,
			schedule_date: resolvedDate
		};

		this.items = [...this.items, newItem];
		this.lastAddedId = newItem.id;
		this.persistAndSync(0);
		this.showToast('Aktivitas udah dibikin.', 'navy');
		return true;
	}

	update(id: string, input: ScheduleFormInput): boolean {
		const idx = this.items.findIndex((i) => i.id === id);
		if (idx === -1) return false;

		const updated: ScheduleItem = {
			...this.items[idx],
			title: input.title.trim(),
			start_time: normalizeTime(input.start_time),
			description: input.description.trim(),
			helper_text: input.helper_text.trim()
		};

		this.items = this.items.map((item) => (item.id === id ? updated : item));
		this.persistAndSync(0);
		this.showToast('Aktivitas udah diedit.', 'butter');
		return true;
	}

	toggleCompleted(id: string): void {
		const idx = this.items.findIndex((i) => i.id === id);
		if (idx === -1) return;

		const nextDone = !this.items[idx].is_completed;
		this.items = this.items.map((item) =>
			item.id === id ? { ...item, is_completed: nextDone } : item
		);
		this.persistAndSync(300);

		if (nextDone && this.items.length > 0 && this.items.every((i) => i.is_completed)) {
			this.showToast('Mantap! Semua aktivitas udah beres!', 'mint');
		}
	}

	move(id: string, direction: -1 | 1): void {
		const idx = this.items.findIndex((i) => i.id === id);
		if (idx === -1) return;
		const targetIdx = idx + direction;
		if (targetIdx < 0 || targetIdx >= this.items.length) return;

		const nextList = [...this.items];
		[nextList[idx], nextList[targetIdx]] = [nextList[targetIdx], nextList[idx]];
		this.items = nextList.map((item, pos) => ({ ...item, position: pos }));
		this.persistAndSync(300);
	}

	remove(id: string): void {
		const idx = this.items.findIndex((i) => i.id === id);
		if (idx === -1) return;

		const removed = this.items[idx];
		this.items = this.items.filter((item) => item.id !== id);
		this.pendingDeletes.set(id, { item: removed, index: idx });
		this.persistAndSync(300);

		this.showToast(
			'Aktivitas dihapus.',
			'coral',
			{
				label: 'Balikin',
				onClick: () => this.undoDelete(id)
			},
			5000
		);
	}

	undoDelete(id: string): void {
		const pending = this.pendingDeletes.get(id);
		if (!pending) return;

		this.pendingDeletes.delete(id);
		if (!this.selectedDate) {
			this.selectedDate = pending.item.schedule_date;
		}
		const next = [...this.items];
		const insertIndex = Math.min(pending.index, next.length);
		next.splice(insertIndex, 0, pending.item);
		this.items = next;
		this.lastAddedId = pending.item.id;
		this.persistAndSync(0);
		this.showToast('Aktivitas dibalikin lagi.', 'mint');
	}

	async clearCurrentSchedule(): Promise<void> {
		this.pendingDeletes.clear();
		const date = this.selectedDate;

		// Batalkan antrean sync untuk tanggal yang akan dihapus agar tidak menimpa delete
		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
			this.syncTimer = null;
		}
		if (this.pendingSnapshot?.date === date) {
			this.pendingSnapshot = null;
		}
		if (this.activeSyncPromise) {
			await this.activeSyncPromise;
		}

		this.items = [];

		if (date) {
			this.writeSavedLocalForDate(date, []);
			this.updateSavedSummaryForDate(date, []);
			try {
				const supabase = getSupabaseClient();
				const { error } = await supabase
					.from('schedules')
					.delete()
					.eq('schedule_date', date);
				if (error) throw error;
			} catch (err) {
				console.error('[KudilSchedule] Gagal menghapus jadwal di Supabase:', err);
			}
		}

		this.selectedDate = null;
		this.syncStatus = 'idle';
		this.showToast('Jadwal udah dihapus.', 'coral');
	}

	showToast(
		message: string,
		variant: ToastVariant = 'navy',
		action?: ToastAction,
		durationMs = 3000
	): void {
		const id = generateUuid();
		const toast: ToastItem = { id, message, variant, action };
		this.toasts = [...this.toasts.slice(-2), toast];

		const timer = setTimeout(() => {
			this.dismissToast(id);
		}, durationMs);
		this.toastTimers.set(id, timer);
	}

	dismissToast(id: string): void {
		const timer = this.toastTimers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.toastTimers.delete(id);
		}
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	private mapRows(rows: ScheduleRow[] | null): ScheduleItem[] {
		return (rows ?? []).map((row) => ({
			id: row.id,
			title: row.title,
			start_time: normalizeTime(row.start_time),
			description: row.description ?? '',
			helper_text: row.helper_text ?? '',
			position: row.position,
			is_completed: row.is_completed,
			schedule_date: row.schedule_date
		}));
	}

	private persistAndSync(debounceMs: number): void {
		if (!browser || !this.selectedDate) return;

		const date = this.selectedDate;
		const normalizedItems = this.items.map((item, idx) => ({
			...item,
			position: idx,
			schedule_date: date
		}));
		this.items = normalizedItems;
		this.writeSavedLocalForDate(date, normalizedItems);
		this.updateSavedSummaryForDate(date, normalizedItems);

		this.syncRevision += 1;
		this.pendingSnapshot = {
			date,
			items: normalizedItems.map((item) => ({ ...item })),
			revision: this.syncRevision
		};
		this.syncStatus = 'saving';

		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
			this.syncTimer = null;
		}

		if (debounceMs <= 0) {
			void this.runSyncQueue();
		} else {
			this.syncTimer = setTimeout(() => {
				this.syncTimer = null;
				void this.runSyncQueue();
			}, debounceMs);
		}
	}

	private runSyncQueue(): Promise<boolean> {
		if (this.activeSyncPromise) {
			return this.activeSyncPromise;
		}

		this.activeSyncPromise = (async () => {
			let allSucceeded = true;

			while (this.pendingSnapshot) {
				const snapshot = this.pendingSnapshot;
				this.pendingSnapshot = null;

				if (this.selectedDate === snapshot.date) {
					this.syncStatus = 'saving';
				}

				const ok = await this.syncSnapshotToSupabase(snapshot);
				if (!ok) {
					allSucceeded = false;
					if (!this.pendingSnapshot && this.selectedDate === snapshot.date) {
						this.syncStatus = 'error';
					}
					break;
				}

				if (
					!this.pendingSnapshot &&
					this.syncTimer === null &&
					this.selectedDate === snapshot.date
				) {
					this.syncStatus = snapshot.items.length > 0 ? 'saved' : 'idle';
					this.connectionNotice = null;
				}
			}

			return allSucceeded;
		})().finally(() => {
			this.activeSyncPromise = null;
		});

		return this.activeSyncPromise;
	}

	private async syncSnapshotToSupabase(snapshot: SyncSnapshot): Promise<boolean> {
		try {
			const supabase = getSupabaseClient();

			if (snapshot.items.length > 0) {
				const rows = snapshot.items.map((item) => ({
					id: item.id,
					title: item.title,
					start_time: item.start_time,
					description: item.description,
					helper_text: item.helper_text,
					position: item.position,
					is_completed: item.is_completed,
					schedule_date: snapshot.date
				}));

				const { error: upsertError } = await supabase
					.from('schedules')
					.upsert(rows, { onConflict: 'id' });

				if (upsertError) throw upsertError;

				const { data: existingRows, error: selectError } = await supabase
					.from('schedules')
					.select('id')
					.eq('schedule_date', snapshot.date);
				if (selectError) throw selectError;

				const currentIds = new Set(snapshot.items.map((i) => i.id));
				const staleIds = ((existingRows ?? []) as { id: string }[])
					.map((r) => r.id)
					.filter((id) => !currentIds.has(id));

				if (staleIds.length > 0) {
					const { error: delError } = await supabase
						.from('schedules')
						.delete()
						.in('id', staleIds);
					if (delError) throw delError;
				}
			} else {
				const { error: clearError } = await supabase
					.from('schedules')
					.delete()
					.eq('schedule_date', snapshot.date);
				if (clearError) throw clearError;
			}

			return true;
		} catch (err) {
			const pgCode = (err as { code?: string } | null)?.code;
			const msg = (err as { message?: string } | null)?.message ?? '';

			console.error('[KudilSchedule] Gagal sinkron ke Supabase:', err);

			const hadNoticeBefore = this.connectionNotice !== null;
			if (pgCode === '42501' || msg.toLowerCase().includes('row-level security')) {
				this.connectionNotice =
					'Izin akses ditolak aturan RLS Supabase. Jalankan ulang SQL policy shared di supabase/schema.sql lewat SQL Editor Supabase ya.';
			} else {
				this.connectionNotice =
					'Belum bisa nyimpen ke server. Perubahan tetap aman di perangkat ini — klik Simpen Ulang nanti ya.';
			}

			if (!hadNoticeBefore) {
				this.showToast(
					'Gagal sinkron ke server, sementara disimpen di perangkat ya.',
					'butter',
					undefined,
					3600
				);
			}

			return false;
		}
	}

	private updateSavedSummaryForDate(isoDate: string, list: ScheduleItem[]): void {
		const filtered = this.savedSchedules.filter((entry) => entry.date !== isoDate);
		if (list.length > 0) {
			filtered.push({
				date: isoDate,
				totalCount: list.length,
				completedCount: list.filter((i) => i.is_completed).length
			});
		}
		this.savedSchedules = filtered.sort((a, b) => b.date.localeCompare(a.date));
	}

	private pruneLocalCache(validDates: Set<string>): void {
		if (!browser) return;
		try {
			const map = this.readAllSavedLocal();
			let changed = false;
			for (const date of Object.keys(map)) {
				if (!validDates.has(date)) {
					delete map[date];
					changed = true;
				}
			}
			if (changed) {
				localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(map));
			}
		} catch {
			// Abaikan jika penyimpanan browser tidak tersedia
		}
	}

	private readAllSavedLocal(): Record<string, ScheduleItem[]> {
		if (!browser) return {};
		try {
			const raw = localStorage.getItem(SAVED_STORAGE_KEY);
			if (!raw) return {};
			const parsed = JSON.parse(raw);
			return parsed && typeof parsed === 'object' ? parsed : {};
		} catch {
			return {};
		}
	}

	private readSavedLocalForDate(isoDate: string): ScheduleItem[] {
		const map = this.readAllSavedLocal();
		const list = map[isoDate];
		return Array.isArray(list) ? list : [];
	}

	private writeSavedLocalForDate(isoDate: string, list: ScheduleItem[]): void {
		if (!browser) return;
		try {
			const map = this.readAllSavedLocal();
			if (list.length === 0) {
				delete map[isoDate];
			} else {
				map[isoDate] = list;
			}
			localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(map));
		} catch {
			// Abaikan jika penyimpanan browser penuh
		}
	}
}
