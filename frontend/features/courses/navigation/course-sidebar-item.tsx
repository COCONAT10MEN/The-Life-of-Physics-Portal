'use client';

import { cn } from '@/shared/utils';
import { CheckCircle, PlayCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface CourseSidebarItemProps {
	id: string;
	label: string;
	isCompleted: boolean;
	courseId: string;
}

const CourseSidebarItem = ({
	id,
	label,
	isCompleted,
	courseId,
}: CourseSidebarItemProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const Icon = isCompleted ? CheckCircle : PlayCircle;

	const isActive = pathname?.includes(id);

	const onClick = () => {
		router.push(`/courses/${courseId}/chapters/${id}`);
	};

	return (
		<button
			onClick={onClick}
			type="button"
			className={cn(
				'flex items-center gap-x-2 pl-6 text-sm font-[500] text-physics-muted transition-all hover:bg-physics-panel hover:text-physics-white',
				isActive &&
					'bg-physics-cyan/10 text-physics-cyan-bright hover:bg-physics-cyan/10 hover:text-physics-cyan-bright',
				isCompleted && 'text-physics-cyan hover:text-physics-cyan',
				isCompleted && isActive && 'bg-physics-cyan/10'
			)}
		>
			<div className="flex items-center gap-x-2 py-4">
				<Icon
					size={22}
					className={cn(
						'text-physics-muted',
						isActive && 'text-physics-cyan-bright',
						isCompleted && 'text-physics-cyan'
					)}
				/>

				<p className='text-left'>{label}</p>
			</div>

			<div
				className={cn(
					'ml-auto h-full border-2 border-physics-cyan opacity-0 transition-all',
					isActive && 'opacity-100',
					isCompleted && 'border-physics-cyan'
				)}
			/>
		</button>
	);
};

export default CourseSidebarItem;
