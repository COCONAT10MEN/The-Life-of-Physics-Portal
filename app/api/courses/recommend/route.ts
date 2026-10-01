import { db } from '@/lib/db';
import { RecommendCourse } from '@/types';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GET = async (req: Request) => {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const recommendedCourses: RecommendCourse[] = await db.courseStatistic.findMany({
			where: { course: { isPublished: true } },
			include: {
				course: true,
			},
			orderBy: { views: 'desc' },
			take: 4,
		});

		return NextResponse.json(recommendedCourses);
	} catch (error) {
		console.log('[ERROR] GET /api/courses/recommend', error);
		return new NextResponse('Internal server error', { status: 500 });
	}
};

export { GET };
