import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseProgressProps {
	value: number;
	variant?: 'success' | 'default';
	size?: 'default' | 'sm';
}

const colorByVariant = {
	default: 'text-physics-cyan',
	success: 'text-physics-cyan-bright',
};

const sizeByVariant = {
	default: 'text-sm',
	sm: 'text-xs',
};

const CourseProgress = ({ variant, value, size }: CourseProgressProps) => {
	return (
		<div>
			<Progress className="h-2" value={value} variant={variant} />

			<p
				className={cn(
					'mt-2 font-medium text-physics-cyan',
					colorByVariant[variant || 'default'],
					sizeByVariant[size || 'default']
				)}
			>{`${Math.round(value)}% Complete`}</p>
		</div>
	);
};

export default CourseProgress;
