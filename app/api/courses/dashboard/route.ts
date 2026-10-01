import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { Category, Chapter, Course, UserProgress } from '@prisma/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type CourseWithProgressWithCategory = Course & {
	category: Category | null;
	chapters: (Chapter & { userProgresses: UserProgress[] })[];
	progress: number | null;
};

export async function GET(req: Request) {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

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

		return NextResponse.json({
			completedCourses,
			coursesInProgress,
		});
	} catch (error) {
		console.log('ERROR GET /api/courses/dashboard');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
