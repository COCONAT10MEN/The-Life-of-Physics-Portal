import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getCourseIdentity } from '@/server/queries/catalog';

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

	const course = await getCourseIdentity(params.courseId);

	if (!course) {
		return redirect('/');
	}

	return <>{children}</>;
};

export default CourseLayout;
