import type { ScheduleItem } from '#lib/types/schedule.ts';

function sanitizeInline(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}

function formatMultilineDescription(description: string): string[] {
	return description
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

/**
 * Memformat 1 jadwal beserta seluruh aktivitasnya ke format teks WhatsApp
 * (bold judul & penomoran, jam monospace, coret + centang jika beres,
 * keterangan multiline, serta blockquote miring untuk pengingat).
 */
export function formatScheduleForWhatsApp(
	formattedDate: string,
	items: ScheduleItem[]
): string {
	const total = items.length;
	const completed = items.filter((item) => item.is_completed).length;

	const headerLines = [
		`*Jadwal — ${sanitizeInline(formattedDate)}*`,
		completed > 0 ? `_${completed} dari ${total} udah beres_` : `_Total ${total} aktivitas_`
	];

	const blocks = items.map((item, idx) => {
		const num = `*${idx + 1}.*`;
		const time = `\`${item.start_time}\``;
		const cleanTitle = sanitizeInline(item.title);
		const titleFormatted = item.is_completed ? `~*${cleanTitle}*~ ✅` : `*${cleanTitle}*`;

		const lines = [`${num} ${time} — ${titleFormatted}`];

		if (item.description.trim()) {
			lines.push(...formatMultilineDescription(item.description));
		}

		if (item.helper_text.trim()) {
			lines.push(`> _Pengingat: ${sanitizeInline(item.helper_text)}_`);
		}

		return lines.join('\n');
	});

	return [headerLines.join('\n'), ...blocks].join('\n\n');
}

/**
 * Menyalin teks ke clipboard dengan fallback textarea untuk browser mobile/non-HTTPS.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
	if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Lanjut ke fallback textarea
		}
	}

	if (typeof document === 'undefined') return false;

	try {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.top = '0';
		textarea.style.left = '-9999px';
		document.body.appendChild(textarea);
		textarea.select();
		textarea.setSelectionRange(0, text.length);
		const copied = document.execCommand('copy');
		document.body.removeChild(textarea);
		return copied;
	} catch {
		return false;
	}
}
