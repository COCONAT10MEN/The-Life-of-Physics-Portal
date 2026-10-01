import 'server-only';

import { db } from '@/server/db';

import type { StudentLesson } from '@/shared/contracts/dashboard';

export async function getAdminHomeData() {
	const [
		totalStudents,
		pendingWaitlistCount,
		pendingHomeworkCount,
		activeGroupsCount,
		recentSignups,
		recentSubmissions,
	] = await Promise.all([
		db.user.count({ where: { role: 'STUDENT', isApproved: true } }),
		db.user.count({ where: { isApproved: false } }),
		db.submission.count({ where: { status: 'PENDING_APPROVAL' } }),
		db.group.count(),
		db.user.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isApproved: true,
				createdAt: true,
			},
		}),
		db.submission.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				userName: true,
				status: true,
				createdAt: true,
				chapter: {
					select: {
						title: true,
						course: { select: { title: true } },
					},
				},
			},
		}),
	]);
	return { totalStudents, pendingWaitlistCount, pendingHomeworkCount, activeGroupsCount, recentSignups, recentSubmissions };
}

export async function getStudentHomeData(userId: string, targetUserId: string) {
	const [courses, membership, homeworkSubmissions] = await Promise.all([
		db.course.findMany({
			where: { isPublished: true },
			orderBy: [{ chapterNumber: 'asc' }, { createdAt: 'asc' }],
			select: {
				id: true,
				title: true,
				chapterNumber: true,
				chapters: {
					where: { isPublished: true },
					orderBy: { position: 'asc' },
					select: {
						id: true,
						title: true,
						contentType: true,
						userProgresses: {
							where: { userId },
							select: { isCompleted: true },
						},
					},
				},
			},
		}),
		db.userGroup.findFirst({
			where: {
				OR: [
					{ userId: targetUserId },
					{ userId },
				],
			},
			select: {
				group: {
					select: {
						name: true,
						schedule: true,
					},
				},
			},
		}),
		db.submission.findMany({
			where: {
				OR: [
					{ userId: targetUserId },
					{ userId },
				],
			},
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				chapterId: true,
				status: true,
				createdAt: true,
			},
		}),
	]);

	const lessons: StudentLesson[] = courses.map((course) => ({
		id: course.id,
		title: course.title,
		chapterNumber: course.chapterNumber,
		chapters: course.chapters.map((chapter) => ({
			id: chapter.id,
			title: chapter.title,
			isCompleted: chapter.userProgresses[0]?.isCompleted ?? false,
		})),
	}));

	// Find the student's active lesson & homework status
	const activeCourse =
		courses.find((c) =>
			c.chapters.some((ch) => !ch.userProgresses[0]?.isCompleted)
		) || courses[0];

	// Find homework chapter in active course
	const homeworkChapter =
		activeCourse?.chapters.find(
			(ch) => ch.contentType === 'HOMEWORK_ASSIGNMENT'
		) || activeCourse?.chapters[0];

	let homeworkStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'PENDING' | 'REJECTED' =
		'PENDING';

	if (homeworkChapter) {
		const sub = homeworkSubmissions.find((s) => s.chapterId === homeworkChapter.id);
		if (sub) {
			homeworkStatus = sub.status;
		}
	} else if (homeworkSubmissions.length > 0) {
		homeworkStatus = homeworkSubmissions[0].status;
	}

	const homeworkInfo = homeworkChapter
		? {
				status: homeworkStatus,
				chapterTitle: homeworkChapter.title,
				courseId: activeCourse?.id || '',
				chapterId: homeworkChapter.id,
		  }
		: null;
	return { lessons, membership, homeworkInfo };
}
