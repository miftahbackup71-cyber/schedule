export interface ScheduleItem {
	id: string;
	title: string;
	start_time: string; // "HH:mm"
	description: string;
	helper_text: string;
	position: number;
	is_completed: boolean;
	schedule_date: string; // "YYYY-MM-DD"
}

export interface ScheduleFormInput {
	title: string;
	start_time: string;
	description: string;
	helper_text: string;
	schedule_date?: string;
}

export interface SavedScheduleSummary {
	date: string; // "YYYY-MM-DD"
	totalCount: number;
	completedCount: number;
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ToastVariant = 'navy' | 'mint' | 'butter' | 'coral';

export interface ToastAction {
	label: string;
	onClick: () => void;
}

export interface ToastItem {
	id: string;
	message: string;
	variant: ToastVariant;
	action?: ToastAction;
}
