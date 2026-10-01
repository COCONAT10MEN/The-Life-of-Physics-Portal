import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Clock } from 'lucide-react';

import StudentHome, { type StudentLesson } from '@/app/(dashboard)/_components/student-home';
import AdminHome from '@/app/(dashboard)/_components/admin-home';
import { db } from '@/lib/db';
import { isTeacher, isAdminOrTeacher } from '@/lib/teacher';
import { getDbUser } from '@/lib/user';

const HomePage = async () => {
	const { userId, sessionClaims } = auth();

	if (!userId) {
		return redirect('/');
	}

	const dbUser = await getDbUser(userId);
	const targetUserId = dbUser ? dbUser.id : userId;

	const isStaff =
		dbUser?.role === 'ADMIN' ||
		dbUser?.role === 'TEACHER' ||
		(await isTeacher(userId, sessionClaims));

	// If authenticated user is ADMIN or TEACHER, render the dedicated Admin Command Center!
	if (isStaff) {
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

		return (
			<AdminHome
				adminName={dbUser?.name || 'Mrs. Ghada'}
				metrics={{
					totalStudents,
					pendingWaitlistCount,
					pendingHomeworkCount,
					activeGroupsCount,
				}}
				recentSignups={recentSignups}
				recentSubmissions={recentSubmissions.map((s) => ({
					id: s.id,
					userName: s.userName,
					status: s.status,
					createdAt: s.createdAt,
					chapterTitle: s.chapter.title,
					courseTitle: s.chapter.course?.title,
				}))}
			/>
		);
	}

	// Check if student account is approved in Prisma
	const isPending = dbUser ? !dbUser.isApproved : false;

	if (isPending) {
		return (
			<div className="mx-auto flex max-w-xl flex-col items-center justify-center pt-16 pb-20 text-center">
				<div className="w-full rounded-3xl border border-amber-200 bg-white p-8 shadow-sm space-y-4">
					<div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
						<Clock className="h-7 w-7" />
					</div>
					<div className="space-y-1">
						<span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider">
							Admission Pending Review
						</span>
						<h2 className="text-xl font-bold text-slate-900 pt-2">
							Welcome to The Life of Physics
						</h2>
						<p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
							Your student sign-up has been registered in our portal. An assistant or teacher will review and approve your account shortly.
						</p>
					</div>
					<div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
						<span>Questions? Contact:</span>
						<a
							href="mailto:support.lop.physics@gmail.com"
							className="font-semibold text-sky-700 hover:underline"
						>
							support.lop.physics@gmail.com
						</a>
					</div>
				</div>
			</div>
		);
	}

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

	return (
		<div className="space-y-6">
			<StudentHome
				lessons={lessons}
				groupName={membership?.group?.name ?? null}
				groupSchedule={membership?.group?.schedule ?? null}
				homeworkInfo={homeworkInfo}
			/>
		</div>
	);
};

export default HomePage;
