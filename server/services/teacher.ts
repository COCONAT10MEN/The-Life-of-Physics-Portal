import 'server-only';

import { getDbUser } from '@/server/services/user';

export const isAdminOrTeacher = async (
	userId?: string | null,
	sessionClaims?: unknown
) => {
	if (!userId) return false;

	if (userId === process.env.NEXT_PUBLIC_TEACHER_ID) {
		return true;
	}

	try {
		const user = await getDbUser(userId);
		if (user && (user.role === 'ADMIN' || user.role === 'TEACHER')) {
			return true;
		}
		return false;
	} catch (error) {
		console.error('[STAFF_AUTHORIZATION_CHECK]', error);
		return false;
	}
};

export const isTeacher = isAdminOrTeacher;
