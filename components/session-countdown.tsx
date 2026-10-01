'use client';

import { useState, useEffect } from 'react';

interface SessionCountdownProps {
	targetDate?: string | Date | null;
	className?: string;
}

export const SessionCountdown = ({
	targetDate,
	className = '',
}: SessionCountdownProps) => {
	const [timeLeft, setTimeLeft] = useState<{
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	} | null>(null);

	useEffect(() => {
		if (!targetDate) return;

		const target = new Date(targetDate).getTime();

		const calculateRemaining = () => {
			const now = new Date().getTime();
			const diff = target - now;

			if (diff <= 0) {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			setTimeLeft({ days, hours, minutes, seconds });
		};

		calculateRemaining();
		const interval = setInterval(calculateRemaining, 1000);
		return () => clearInterval(interval);
	}, [targetDate]);

	if (!timeLeft) return null;

	return (
		<div
			className={`flex items-center gap-2 sm:gap-3 shrink-0 overflow-visible ${className}`}
		>
			{/* Days */}
			<div className="flex flex-col items-center justify-center h-15 w-15 sm:h-18 sm:w-18 rounded-xl bg-slate-900 border border-cyan-500/30 text-white shadow-inner shrink-0">
				<span className="text-lg sm:text-2xl font-black text-cyan-400 leading-none">
					{timeLeft.days}
				</span>
				<span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">
					Days
				</span>
			</div>

			<span className="text-lg sm:text-xl font-bold text-slate-500">:</span>

			{/* Hours */}
			<div className="flex flex-col items-center justify-center h-15 w-15 sm:h-18 sm:w-18 rounded-xl bg-slate-900 border border-cyan-500/30 text-white shadow-inner shrink-0">
				<span className="text-lg sm:text-2xl font-black text-cyan-400 leading-none">
					{timeLeft.hours}
				</span>
				<span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">
					Hours
				</span>
			</div>

			<span className="text-lg sm:text-xl font-bold text-slate-500">:</span>

			{/* Minutes */}
			<div className="flex flex-col items-center justify-center h-15 w-15 sm:h-18 sm:w-18 rounded-xl bg-slate-900 border border-cyan-500/30 text-white shadow-inner shrink-0">
				<span className="text-lg sm:text-2xl font-black text-cyan-400 leading-none">
					{timeLeft.minutes}
				</span>
				<span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">
					Mins
				</span>
			</div>

			<span className="text-lg sm:text-xl font-bold text-slate-500">:</span>

			{/* Seconds */}
			<div className="flex flex-col items-center justify-center h-15 w-15 sm:h-18 sm:w-18 rounded-xl bg-slate-900 border border-cyan-500/30 text-white shadow-inner shrink-0">
				<span className="text-lg sm:text-2xl font-black text-emerald-400 leading-none">
					{timeLeft.seconds}
				</span>
				<span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">
					Secs
				</span>
			</div>
		</div>
	);
};

export default SessionCountdown;
