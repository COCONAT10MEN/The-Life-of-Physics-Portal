export interface GroupSessionScheduleItem {
	day: string; // e.g. "Monday", "Tuesday", etc.
	time: string; // e.g. "16:00", "4:00 PM", "14:30"
}

export interface UpcomingGroupSession {
	date: Date;
	dateLabel: string;
	dayLabel: string;
	timeLabel: string;
	fullFormatted: string; // e.g. "Thursday, Oct 1 @ 2:00 PM"
}

const weekdays = [
	{ day: 0, label: 'Sunday', pattern: /\b(sun|sunday)\b/i },
	{ day: 1, label: 'Monday', pattern: /\b(mon|monday)\b/i },
	{ day: 2, label: 'Tuesday', pattern: /\b(tue|tues|tuesday)\b/i },
	{ day: 3, label: 'Wednesday', pattern: /\b(wed|wednesday)\b/i },
	{ day: 4, label: 'Thursday', pattern: /\b(thu|thur|thurs|thursday)\b/i },
	{ day: 5, label: 'Friday', pattern: /\b(fri|friday)\b/i },
	{ day: 6, label: 'Saturday', pattern: /\b(sat|saturday)\b/i },
] as const;

/**
 * Parse time strings in either 24-hour ("16:00", "09:30") or 12-hour ("4:00 PM", "9:30 AM") format.
 */
export const parseTimeString = (timeStr: string) => {
	if (!timeStr) return null;
	const trimmed = timeStr.trim();

	// Check 12-hour format first: "4:00 PM", "4 PM", "04:30 pm"
	const match12 = trimmed.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
	if (match12) {
		const hour = Number(match12[1]);
		const minute = Number(match12[2] ?? 0);
		const period = match12[3].toUpperCase();
		const militaryHour = (hour % 12) + (period === 'PM' ? 12 : 0);

		if (minute > 59) return null;

		return {
			hour: militaryHour,
			minute,
			label: `${hour}:${String(minute).padStart(2, '0')} ${period}`,
		};
	}

	// Check 24-hour format: "16:00", "09:30", "14:15"
	const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
	if (match24) {
		const hour = Number(match24[1]);
		const minute = Number(match24[2]);
		if (hour > 23 || minute > 59) return null;

		const period = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;

		return {
			hour,
			minute,
			label: `${displayHour}:${String(minute).padStart(2, '0')} ${period}`,
		};
	}

	return null;
};

const getLegacyTimeFromGroupName = (groupName: string) => {
	return parseTimeString(groupName);
};

export const getUpcomingGroupSessions = (
	groupName?: string | null,
	schedule?: unknown,
	now = new Date()
): UpcomingGroupSession[] => {
	// 1. Try parsing JSON schedule array if present
	if (Array.isArray(schedule) && schedule.length > 0) {
		const parsedSessions: UpcomingGroupSession[] = [];

		for (const item of schedule) {
			if (!item || typeof item !== 'object') continue;
			const dayStr = String((item as { day?: unknown }).day || '').trim();
			const timeStr = String((item as { time?: unknown }).time || '').trim();

			const weekdayItem = weekdays.find(
				(w) =>
					w.label.toLowerCase() === dayStr.toLowerCase() ||
					w.pattern.test(dayStr)
			);
			const timeInfo = parseTimeString(timeStr);

			if (!weekdayItem || !timeInfo) continue;

			const targetDay = weekdayItem.day;
			const date = new Date(now);
			const daysUntil = (targetDay - now.getDay() + 7) % 7;
			date.setDate(now.getDate() + daysUntil);
			date.setHours(timeInfo.hour, timeInfo.minute, 0, 0);

			if (date <= now) {
				date.setDate(date.getDate() + 7);
			}

			const dateLabel = new Intl.DateTimeFormat('en', {
				month: 'short',
				day: 'numeric',
			}).format(date);

			parsedSessions.push({
				date,
				dayLabel: weekdayItem.label,
				timeLabel: timeInfo.label,
				dateLabel,
				fullFormatted: `${weekdayItem.label}, ${dateLabel} @ ${timeInfo.label}`,
			});
		}

		if (parsedSessions.length > 0) {
			return parsedSessions.sort((a, b) => a.date.getTime() - b.date.getTime());
		}
	}

	// 2. Fall back to legacy pattern in groupName (e.g. "Group A - Mon/Thu 4 PM")
	if (!groupName) return [];

	const legacyTime = getLegacyTimeFromGroupName(groupName);
	if (!legacyTime) return [];

	return weekdays
		.filter(({ pattern }) => pattern.test(groupName))
		.map(({ day, label }) => {
			const date = new Date(now);
			const daysUntil = (day - now.getDay() + 7) % 7;
			date.setDate(now.getDate() + daysUntil);
			date.setHours(legacyTime.hour, legacyTime.minute, 0, 0);

			if (date <= now) {
				date.setDate(date.getDate() + 7);
			}

			const dateLabel = new Intl.DateTimeFormat('en', {
				month: 'short',
				day: 'numeric',
			}).format(date);

			return {
				date,
				dayLabel: label,
				timeLabel: legacyTime.label,
				dateLabel,
				fullFormatted: `${label}, ${dateLabel} @ ${legacyTime.label}`,
			};
		})
		.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getNextUpcomingSession = (
	groupName?: string | null,
	schedule?: unknown,
	now = new Date()
): UpcomingGroupSession | null => {
	const sessions = getUpcomingGroupSessions(groupName, schedule, now);
	return sessions[0] ?? null;
};
