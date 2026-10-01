import { getCourseEntry } from '@/server/queries/catalog';
import { recordCourseView } from '@/server/services/course-statistics';
import { redirect } from 'next/navigation';

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
	const courseId = params.courseId;

	const course = await getCourseEntry(courseId);

	if (!course) return redirect('/');

	await recordCourseView(courseId, course.category?.id);

	if (course.chapters.length > 0) {
		return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
	}

	return redirect(`/courses/${course.id}/detail`);
};

export default CourseIdPage;
