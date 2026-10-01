import NavbarRoutes from '@/components/navbar-routes';
import Logo from '@/components/logo';
import { Chapter, Course, UserProgress } from '@prisma/client';
import CourseMobileSidebar from './course-mobile-sidebar';

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
