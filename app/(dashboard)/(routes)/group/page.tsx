import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Users, MessageCircle } from 'lucide-react';

import { db } from '@/lib/db';
import { getUpcomingGroupSessions } from '@/lib/group-schedule';
import { isTeacher } from '@/lib/teacher';
import { getDbUser } from '@/lib/user';
import GroupRosterView, { type PeerMember } from './_components/group-roster-view';

function formatTimeAgo(date: Date): string {
	const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
	if (seconds < 60) return 'just now';
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days === 1) return 'yesterday';
	if (days < 30) return `${days} days ago`;
	return `${Math.floor(days / 30)} mo ago`;
}

const GroupPage = async () => {
	const { userId, sessionClaims } = auth();

	if (!userId) {
		return redirect('/');
	}

	const isStaff = await isTeacher(userId, sessionClaims);
	if (isStaff) {
		return redirect('/home');
	}

	const dbUser = await getDbUser(userId);
	const targetUserId = dbUser ? dbUser.id : userId;

	const membership = await db.userGroup.findFirst({
		where: {
			OR: [
				...(dbUser ? [{ userId: dbUser.id }] : []),
				{ userId },
			],
		},
		include: {
			group: true,
		},
	});

	if (!membership || !membership.group) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-12 animate-in fade-in-50 duration-200">
				<div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-center space-y-4">
					<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700">
						<Users className="h-8 w-8" />
					</div>
					<div className="space-y-1">
						<h1 className="text-2xl font-bold text-slate-950">
							No Study Group Assigned Yet
						</h1>
						<p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
							You have registered successfully, but Mrs. Ghada has not assigned you to an active study group cohort yet.
						</p>
					</div>

					<div className="pt-4 flex justify-center">
						<a
							href="https://wa.me/201156102015"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
						>
							<MessageCircle className="h-4 w-4 fill-current" />
							<span>Contact Assistant on WhatsApp (+20 115 610 2015)</span>
						</a>
					</div>
				</div>
			</div>
		);
	}

	// 1. Fetch upcoming session for this group
	const upcomingSessions = getUpcomingGroupSessions(
		membership.group.name,
		membership.group.schedule
	);
	const nextSession = upcomingSessions[0]
		? {
				date: upcomingSessions[0].date.toISOString(),
				dayLabel: upcomingSessions[0].dayLabel,
				timeLabel: upcomingSessions[0].timeLabel,
				fullFormatted: upcomingSessions[0].fullFormatted,
		  }
		: null;

	// 2. Fetch all enrolled peers in the same study group
	const userGroups = await db.userGroup.findMany({
		where: { groupId: membership.groupId },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					submissions: {
						orderBy: { createdAt: 'desc' },
						take: 1,
						include: {
							chapter: {
								select: {
									title: true,
									course: { select: { title: true } },
								},
							},
						},
					},
				},
			},
		},
		orderBy: { user: { name: 'asc' } },
	});

	const peers: PeerMember[] = userGroups.map((ug) => {
		const u = ug.user;
		const sub = u.submissions[0] || null;
		const isCurrentUser = u.id === targetUserId || u.id === userId;

		return {
			id: u.id,
			name: u.name || u.email.split('@')[0],
			email: u.email,
			role: u.role,
			isCurrentUser,
			latestSubmission: sub
				? {
						id: sub.id,
						status: sub.status,
						createdAt: sub.createdAt.toISOString(),
						chapterTitle: sub.chapter.title,
						courseTitle: sub.chapter.course?.title,
						timeAgo: formatTimeAgo(sub.createdAt),
				  }
				: null,
		};
	});

	return (
		<GroupRosterView
			groupName={membership.group.name}
			nextSession={nextSession}
			peers={peers}
		/>
	);
};

export default GroupPage;
