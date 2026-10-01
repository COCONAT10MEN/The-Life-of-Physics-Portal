import { Atom } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
	compact?: boolean;
}

const Logo = ({ compact = false }: LogoProps) => {
	return (
		<Link
			aria-label="The Life of Physics home"
			className="group flex items-center gap-3"
			href="/home"
		>
			<span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 shadow-2xs transition group-hover:bg-sky-100">
				<Atom aria-hidden="true" className="h-6 w-6 text-sky-600" strokeWidth={1.75} />
			</span>

			{!compact && (
				<span className="flex min-w-0 flex-col leading-none">
					<span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900">
						The Life of Physics
					</span>
					<span className="mt-1 text-[11px] font-semibold text-sky-700">
						3rd Secondary
					</span>
				</span>
			)}
		</Link>
	);
};

export default Logo;
