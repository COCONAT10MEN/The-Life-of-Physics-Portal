export interface RemainingTime {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	hasStarted: boolean;
}

export function getRemainingTime(target: number, now: number): RemainingTime | null {
	if (!Number.isFinite(target) || !Number.isFinite(now)) return null;
	const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
	return {
		days: Math.floor(totalSeconds / 86400),
		hours: Math.floor((totalSeconds % 86400) / 3600),
		minutes: Math.floor((totalSeconds % 3600) / 60),
		seconds: totalSeconds % 60,
		hasStarted: target <= now,
	};
}
