import 'server-only';

import { db } from '@/server/db';

import type { PeerMember } from '@/shared/contracts/dashboard';

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

export async function getGroupMembership(userId: string, dbUserId?: string) {
	const membership = await db.userGroup.findFirst({
		where: {
			OR: [
				...(dbUserId ? [{ userId: dbUserId }] : []),
				{ userId },
			],
		},
		include: {
			group: true,
		},
	});
	return membership;
}

export async function getGroupPeers(groupId: string, targetUserId: string, userId: string): Promise<PeerMember[]> {
	const userGroups = await db.userGroup.findMany({
		where: { groupId: groupId },
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
	return peers;
}
