'use client';

import { useSupportModal } from '@/hooks/use-support-modal';
import { HelpCircle } from 'lucide-react';

const Footer = () => {
	const { onOpen } = useSupportModal();

	return (
		<footer className="border-t border-slate-200 bg-white px-6 py-6 text-sm text-slate-500">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
				<div className="space-y-1">
					<p className="font-semibold text-slate-900">The Life of Physics</p>
					<p className="text-xs text-slate-500">Made by: Mohamed Ahmed Yehia · 3rd Secondary Series</p>
				</div>

				<p className="text-xs text-slate-500">
					Course Inquiries:{' '}
					<span className="font-medium text-slate-800">
						Mrs. Ghada Ali (01094683366)
					</span>
				</p>

				<div>
					<a
						href="mailto:support.lop.physics@gmail.com"
						onClick={(e) => {
							onOpen();
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
					>
						<HelpCircle className="h-4 w-4 text-sky-600" />
						Technical Support
					</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
