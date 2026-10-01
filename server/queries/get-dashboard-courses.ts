import 'server-only';

import { db } from '@/server/db';

import type { DashboardCourse, DashboardCourses } from '@/shared/contracts/courses';

export async function queryDashboardCourses(userId: string): Promise<DashboardCourses> {
	const courses = await db.course.findMany({
		where: { isPublished: true },
		include: {
			category: true,
			chapters: {
				where: { isPublished: true },
				include: { userProgresses: { where: { userId } } },
			},
		},
	}) as DashboardCourse[];

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
}

export async function getDashboardCourses(userId: string): Promise<DashboardCourses> {
	try {
		return await queryDashboardCourses(userId);
	} catch (error) {
		console.log('Error in getDashboardCourses: ', error);
		return { completedCourses: [], coursesInProgress: [] };
	}
}
