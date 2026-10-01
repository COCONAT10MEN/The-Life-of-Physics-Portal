import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

const CourseLayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { courseId: string };
}) => {
	const { userId } = auth();

	if (!userId) {
		return redirect('/');
	}

	const course = await db.course.findUnique({
		where: {
			id: params.courseId,
		},
		select: {
			id: true,
		},
	});

	if (!course) {
		return redirect('/');
	}

	return <>{children}</>;
};

export default CourseLayout;
