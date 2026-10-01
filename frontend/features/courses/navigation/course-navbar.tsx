import NavbarRoutes from '@/frontend/components/navbar-routes';
import Logo from '@/frontend/components/logo';
import type { Chapter, Course, UserProgress } from '@/shared/contracts/courses';
import CourseMobileSidebar from '@/frontend/features/courses/navigation/course-mobile-sidebar';

interface CourseNavbarProps {
	course: Course & {
		chapters: (Chapter & {
			userProgresses: UserProgress[] | null;
		})[];
	};
	progressCount: number;
}

const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
	return (
		<div className="flex h-full items-center border-b border-physics-cyan/30 bg-physics-charcoal px-4 shadow-[0_4px_22px_rgba(0,0,0,0.24)]">
			<CourseMobileSidebar course={course} progressCount={progressCount} />

			<Logo />

			<NavbarRoutes />
		</div>
	);
};

export default CourseNavbar;
