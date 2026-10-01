import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { getDbUser } from '@/server/services/user';
import { AdminUsersView } from '@/frontend/features/admin/users/admin-users-view';

const AdminUsersPage = async () => {
	const { userId } = auth();

	if (!userId) {
		return redirect('/');
	}

	const dbUser = await getDbUser(userId);
	if (!dbUser || dbUser.role === 'STUDENT' || (dbUser.role as string) === 'student') {
		return redirect('/');
	}

	return <AdminUsersView />;
};

export default AdminUsersPage;
