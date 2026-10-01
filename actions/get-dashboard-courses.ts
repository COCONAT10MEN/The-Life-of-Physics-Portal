import { db } from '@/lib/db';
import { Category, Chapter, Course, UserProgress } from '@prisma/client';

type CourseWithProgressWithCategory = Course & {
	category: Category | null;
	chapters: (Chapter & { userProgresses: UserProgress[] })[];
	progress: number | null;
};

type DashboardCourses = {
	completedCourses: CourseWithProgressWithCategory[];
	coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
	userId: string
): Promise<DashboardCourses> => {
	try {
		const courses = await db.course.findMany({
			where: { isPublished: true },
			include: {
				category: true,
				chapters: {
					where: { isPublished: true },
					include: { userProgresses: { where: { userId } } },
				},
			},
		}) as CourseWithProgressWithCategory[];

		for (const course of courses) {
			const chapterCount = course.chapters.length;
			const completedCount = course.chapters.filter(
				(chapter) => chapter.userProgresses[0]?.isCompleted
			).length;

			course.progress = chapterCount ? (completedCount / chapterCount) * 100 : null;
		}

		const completedCourses = courses.filter(
			(course) => course.progress === 100
		);
		const coursesInProgress = courses.filter(
			// (course.progress ?? 0) < 100 is making sure that if progress is null, it will be 0 instead of null so that it can be compared to 100
			(course) => (course.progress ?? 0) < 100
		);

		return {
			completedCourses,
			coursesInProgress,
		};
	} catch (error) {
		console.log('Error in getDashboardCourses: ', error);

		return {
			completedCourses: [],
			coursesInProgress: [],
		};
	}
};
