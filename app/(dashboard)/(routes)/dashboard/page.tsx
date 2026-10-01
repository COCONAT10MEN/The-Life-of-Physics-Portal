import { redirect } from 'next/navigation';

export default function DashboardRedirectPage() {
	return redirect('/home');
}
