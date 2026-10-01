import 'server-only';

import { db } from '@/server/db';

export async function recordCourseView(courseId: string, categoryId?: string) {
	if (categoryId) {
		const courseStatistic = await db.courseStatistic.findUnique({
			where: { courseId },
		});

		if (!courseStatistic) {
			await db.courseStatistic.create({
				data: {
					courseId,
					views: 1,
					categoryId,
				},
			});
		} else {
			await db.courseStatistic.update({
				where: {
					courseId,
				},
				data: {
					views: courseStatistic.views + 1,
				},
			});
		}
	}
}
