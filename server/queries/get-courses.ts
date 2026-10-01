import 'server-only';

import { getProgress } from '@/server/queries/get-progress';
import { db } from '@/server/db';
import type { CourseWithProgressWithCategory } from '@/shared/contracts/courses';

type GetCourses = {
	userId: string;
	title?: string;
	categoryId?: string;
};

export const getCourses = async ({
	userId,
	title,
	categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
	try {
		const courses = await db.course.findMany({
			where: {
				isPublished: true,
				title: { contains: title },
				categoryId,
			},
			include: {
				category: true,
				chapters: {
					where: { isPublished: true },
					select: { id: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		const coursesWithProgress: CourseWithProgressWithCategory[] =
			await Promise.all(
				courses.map(async (course) => ({
					...course,
					progress: await getProgress(userId, course.id),
				}))
			);

		return coursesWithProgress;
	} catch (error) {
		console.log('EROOR GETTING COURSES: ', error);
		return [];
	}
};
