import { Sheet, SheetContent, SheetTrigger } from '@/frontend/components/ui/sheet';
import type { Chapter, Course, UserProgress } from '@/shared/contracts/courses';
import { Menu } from 'lucide-react';
import CourseSidebar from '@/frontend/features/courses/navigation/course-sidebar';

interface CourseMobileSidebarProps {
	course: Course & {
		chapters: (Chapter & {
			userProgresses: UserProgress[] | null;
		})[];
	};
	progressCount: number;
}

const CourseMobileSidebar = ({
	course,
	progressCount,
}: CourseMobileSidebarProps) => {
	return (
		<Sheet>
			<SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
				<Menu />
			</SheetTrigger>

			<SheetContent side={'left'} className="w-72 border-physics-cyan/30 bg-physics-charcoal p-0">
				<CourseSidebar course={course} progressCount={progressCount} />
			</SheetContent>
		</Sheet>
	);
};

export default CourseMobileSidebar;
