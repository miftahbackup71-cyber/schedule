import { browser } from '$app/env';
import { getSupabaseClient, resolveSupabaseSession } from '#lib/supabase/client.ts';
import type {
	SavedScheduleSummary,
	ScheduleFormInput,
	ScheduleItem,
	ToastAction,
	ToastItem,
	ToastVariant
} from '#lib/types/schedule.ts';

const SAVED_STORAGE_KEY = 'kudil_saved_schedules_v3';

interface ScheduleRow {
	id: string;
	user_id: string | null;
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
	isSaving = $state(false);
	hasUnsavedChanges = $state(false);
	lastSavedLabel = $state<string | null>(null);
	connectionNotice = $state<string | null>(null);
	toasts = $state<ToastItem[]>([]);
	lastAddedId = $state<string | null>(null);

	private userId: string | null = null;
	private authDisabled = false;
	private pendingDeletes = new Map<string, PendingDelete>();
	private toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
				this.hasUnsavedChanges = false;
				this.lastSavedLabel = null;
			}
		} finally {
			this.isLoading = false;
		}
	}

	async refreshSavedList(): Promise<void> {
		if (!browser) return;
		const localMap = this.readAllSavedLocal();
		const summaryMap = new Map<string, SavedScheduleSummary>();

		for (const [date, list] of Object.entries(localMap)) {
			if (list.length > 0) {
				summaryMap.set(date, {
					date,
					totalCount: list.length,
					completedCount: list.filter((i) => i.is_completed).length
				});
			}
		}

		try {
			const session = await resolveSupabaseSession();
			this.userId = session.userId;
			this.authDisabled = session.authDisabled;

			const supabase = getSupabaseClient();
			let query = supabase.from('schedules').select('schedule_date, is_completed');
			if (this.userId) {
				query = query.eq('user_id', this.userId);
			}

			const { data, error } = await query;
			if (error) throw error;

			const remoteCounts = new Map<string, { total: number; done: number }>();
			for (const row of (data ?? []) as { schedule_date: string; is_completed: boolean }[]) {
				const prev = remoteCounts.get(row.schedule_date) ?? { total: 0, done: 0 };
				prev.total += 1;
				if (row.is_completed) prev.done += 1;
				remoteCounts.set(row.schedule_date, prev);
			}

			for (const [date, counts] of remoteCounts.entries()) {
				summaryMap.set(date, {
					date,
					totalCount: counts.total,
					completedCount: counts.done
				});
			}
		} catch (err) {
			console.warn('Gagal memuat daftar jadwal dari server, memakai daftar di perangkat:', err);
		}

		this.savedSchedules = Array.from(summaryMap.values()).sort((a, b) =>
			b.date.localeCompare(a.date)
		);
	}

	async openSavedSchedule(isoDate: string, showFeedback = true): Promise<void> {
		if (!browser) return;
		this.isLoading = true;
		this.pendingDeletes.clear();
		this.selectedDate = isoDate;

		try {
			const session = await resolveSupabaseSession();
			this.userId = session.userId;
			this.authDisabled = session.authDisabled;

			const supabase = getSupabaseClient();
			let query = supabase
				.from('schedules')
				.select(
					'id, user_id, title, start_time, description, helper_text, position, is_completed, schedule_date'
				)
				.eq('schedule_date', isoDate)
				.order('position', { ascending: true });

			if (this.userId) {
				query = query.eq('user_id', this.userId);
			}

			const { data, error } = await query;
			if (error) throw error;

			const remoteItems: ScheduleItem[] = ((data ?? []) as ScheduleRow[]).map((row) => ({
				id: row.id,
				title: row.title,
				start_time: normalizeTime(row.start_time),
				description: row.description ?? '',
				helper_text: row.helper_text ?? '',
				position: row.position,
				is_completed: row.is_completed,
				schedule_date: row.schedule_date
			}));

			if (remoteItems.length > 0) {
				this.items = remoteItems;
				this.writeSavedLocalForDate(isoDate, remoteItems);
			} else {
				this.items = this.readSavedLocalForDate(isoDate);
			}

			this.hasUnsavedChanges = false;
			this.lastSavedLabel = 'Udah disimpen';
			this.connectionNotice = null;
			if (showFeedback) {
				this.showToast(`Jadwal ${formatIndonesianDate(isoDate)} udah kebuka.`, 'navy');
			}
		} catch (err) {
			console.warn('Gagal membuka dari server, membuka dari penyimpanan perangkat:', err);
			this.items = this.readSavedLocalForDate(isoDate);
			this.hasUnsavedChanges = false;
			this.lastSavedLabel = 'Disimpen di HP ini';
			if (showFeedback) {
				this.showToast(`Jadwal ${formatIndonesianDate(isoDate)} udah kebuka.`, 'navy');
			}
		} finally {
			this.isLoading = false;
		}
	}

	startNewSchedule(): void {
		this.pendingDeletes.clear();
		this.selectedDate = null;
		this.items = [];
		this.hasUnsavedChanges = false;
		this.lastSavedLabel = null;
	}

	discardChanges(): void {
		this.pendingDeletes.clear();
		this.hasUnsavedChanges = false;
		this.items = [];
		this.selectedDate = null;
		this.lastSavedLabel = null;
	}

	async saveSchedule(): Promise<boolean> {
		if (!browser || this.isSaving || !this.selectedDate) return false;
		this.isSaving = true;

		const date = this.selectedDate;
		const normalizedItems = this.items.map((item, idx) => ({
			...item,
			position: idx,
			schedule_date: date
		}));
		this.items = normalizedItems;
		this.writeSavedLocalForDate(date, normalizedItems);

		try {
			const session = await resolveSupabaseSession();
			this.userId = session.userId;
			this.authDisabled = session.authDisabled;

			const supabase = getSupabaseClient();

			if (normalizedItems.length > 0) {
				const rows = normalizedItems.map((item) => {
					const base = {
						id: item.id,
						title: item.title,
						start_time: item.start_time,
						description: item.description,
						helper_text: item.helper_text,
						position: item.position,
						is_completed: item.is_completed,
						schedule_date: date
					};
					return this.userId ? { ...base, user_id: this.userId } : base;
				});

				const { error: upsertError } = await supabase
					.from('schedules')
					.upsert(rows, { onConflict: 'id' });

				if (upsertError) throw upsertError;

				let existingQuery = supabase
					.from('schedules')
					.select('id')
					.eq('schedule_date', date);
				if (this.userId) {
					existingQuery = existingQuery.eq('user_id', this.userId);
				}

				const { data: existingRows } = await existingQuery;
				const currentIds = new Set(normalizedItems.map((i) => i.id));
				const staleIds = ((existingRows ?? []) as { id: string }[])
					.map((r) => r.id)
					.filter((id) => !currentIds.has(id));

				if (staleIds.length > 0) {
					let delQuery = supabase.from('schedules').delete().in('id', staleIds);
					if (this.userId) {
						delQuery = delQuery.eq('user_id', this.userId);
					}
					const { error: delError } = await delQuery;
					if (delError) throw delError;
				}
			} else {
				let clearQuery = supabase.from('schedules').delete().eq('schedule_date', date);
				if (this.userId) {
					clearQuery = clearQuery.eq('user_id', this.userId);
				}
				const { error: clearError } = await clearQuery;
				if (clearError) throw clearError;
			}

			this.connectionNotice = null;
			this.hasUnsavedChanges = false;
			this.lastSavedLabel = 'Udah disimpen';
			await this.refreshSavedList();
			this.showToast('Jadwal udah disimpen!', 'mint');
			return true;
		} catch (err) {
			const pgCode = (err as { code?: string } | null)?.code;
			const msg = (err as { message?: string } | null)?.message ?? '';

			if (pgCode === '42501' || msg.toLowerCase().includes('row-level security')) {
				this.connectionNotice = this.authDisabled
					? 'Aktifkan "Allow anonymous sign-ins" di Dashboard Supabase (Authentication -> Providers) agar jadwal bisa disimpen ke server.'
					: 'Izin simpen ditolak oleh aturan RLS Supabase. Cek policy tabel schedules.';
				this.showToast(
					'Jadwal disimpen di perangkat dulu. Cek pengaturan Supabase buat simpen ke server ya.',
					'butter',
					undefined,
					4200
				);
			} else {
				this.connectionNotice = 'Belum terhubung ke server. Jadwal disimpen di perangkat ini dulu ya.';
				this.showToast('Jadwal disimpen di perangkat ini ya.', 'butter');
			}

			this.hasUnsavedChanges = false;
			this.lastSavedLabel = 'Disimpen di HP ini';
			this.refreshSavedListLocalOnly();
			return true;
		} finally {
			this.isSaving = false;
		}
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
			this.selectedDate = targetDate;

			// Jika tanggal ini sudah pernah disimpan, muat aktivitas sebelumnya dulu agar tidak hilang
			if (this.savedDatesSet.has(targetDate)) {
				await this.openSavedSchedule(targetDate, false);
			}
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
		this.markDirty();
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
		this.markDirty();
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
		this.markDirty();

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
		this.markDirty();
	}

	remove(id: string): void {
		const idx = this.items.findIndex((i) => i.id === id);
		if (idx === -1) return;

		const removed = this.items[idx];
		this.items = this.items.filter((item) => item.id !== id);
		this.pendingDeletes.set(id, { item: removed, index: idx });
		this.markDirty();

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
		const next = [...this.items];
		const insertIndex = Math.min(pending.index, next.length);
		next.splice(insertIndex, 0, pending.item);
		this.items = next;
		this.lastAddedId = pending.item.id;
		this.markDirty();
		this.showToast('Aktivitas dibalikin lagi.', 'mint');
	}

	async clearCurrentSchedule(): Promise<void> {
		this.pendingDeletes.clear();
		const date = this.selectedDate;
		this.items = [];

		if (date && this.savedDatesSet.has(date)) {
			this.writeSavedLocalForDate(date, []);
			try {
				const session = await resolveSupabaseSession();
				this.userId = session.userId;
				const supabase = getSupabaseClient();
				let clearQuery = supabase.from('schedules').delete().eq('schedule_date', date);
				if (this.userId) {
					clearQuery = clearQuery.eq('user_id', this.userId);
				}
				await clearQuery;
			} catch {
				// Tetap lanjut hapus lokal
			}
			await this.refreshSavedList();
		}

		this.selectedDate = null;
		this.hasUnsavedChanges = false;
		this.lastSavedLabel = null;
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

	private markDirty(): void {
		this.hasUnsavedChanges = true;
		this.lastSavedLabel = null;
	}

	private refreshSavedListLocalOnly(): void {
		const localMap = this.readAllSavedLocal();
		const list: SavedScheduleSummary[] = [];
		for (const [date, items] of Object.entries(localMap)) {
			if (items.length > 0) {
				list.push({
					date,
					totalCount: items.length,
					completedCount: items.filter((i) => i.is_completed).length
				});
			}
		}
		this.savedSchedules = list.sort((a, b) => b.date.localeCompare(a.date));
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
