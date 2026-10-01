import 'server-only';

import { db } from '@/server/db';
import type { Category, Course, CourseEntry, TeacherCourse, TeacherChapter } from '@/shared/contracts/courses';

export async function getCategories(): Promise<Category[]> {
	return db.category.findMany({
		orderBy: {
			name: 'asc',
		},
	});
}

export async function getTeacherCourses(): Promise<Course[]> {
	return db.course.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});
}

export async function getTeacherCourse(courseId: string): Promise<TeacherCourse | null> {
	return db.course.findUnique({
		where: {
			id: courseId,
		},
		include: {
			chapters: { orderBy: { position: 'asc' } },
		},
	});
}

export async function getTeacherChapter(courseId: string, chapterId: string): Promise<TeacherChapter | null> {
	return db.chapter.findUnique({
		where: {
			id: chapterId,
			courseId,
		},
		include: {
			muxData: true,
			attachments: { orderBy: { createdAt: 'desc' } },
		},
	});
}

export async function getCourseIdentity(courseId: string): Promise<{ id: string } | null> {
	return db.course.findUnique({
		where: {
			id: courseId,
		},
		select: {
			id: true,
		},
	});
}

export async function getCourseEntry(courseId: string): Promise<CourseEntry | null> {
	return db.course.findUnique({
		where: {
			id: courseId,
		},
		include: {
			chapters: {
				where: { isPublished: true },
				orderBy: { position: 'asc' },
			},
			category: true,
		},
	});
}
