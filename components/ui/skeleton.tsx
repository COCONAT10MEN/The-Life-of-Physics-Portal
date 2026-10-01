import { cn } from '@/lib/utils';

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
				className
			)}
			{...props}
		/>
	);
}

export { Skeleton };
export default Skeleton;
