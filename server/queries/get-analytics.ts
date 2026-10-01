import 'server-only';

import { db } from '@/server/db';

export const getAnalytics = async (userId: string) => {
	try {
		const courses = await db.course.findMany({
			where: { userId },
			include: { CourseStatistic: true },
		});

		const data = courses.map((course) => ({
			name: course.title,
			total: course.CourseStatistic?.views ?? 0,
		}));

		const totalViews = data.reduce((acc, curr) => acc + curr.total, 0);
		const totalCourses = courses.length;

		return {
			data,
			totalViews,
			totalCourses,
		};
	} catch (error) {
		console.log('[ERROR] getAnalytics: ', error);

		return {
			data: [],
			totalViews: 0,
			totalCourses: 0,
		};
	}
};
