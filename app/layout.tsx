import { ClerkProvider, auth } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/components/theme-provider';
import FacebookMessenger from '@/components/facebook-messenger';
import { isTeacher } from '@/lib/teacher';
import { LoadingProvider } from '@/components/providers/loading-provider';
import ScrollToTop from '@/components/scroll-to-top';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'The Life of Physics | 3rd Secondary',
	description: 'The Life of Physics learning platform for 3rd Secondary students.',
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId, sessionClaims } = auth();
	const isStaff = await isTeacher(userId, sessionClaims);

	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={inter.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						forcedTheme="light"
						enableSystem={false}
						disableTransitionOnChange
					>
						<LoadingProvider>
							<ScrollToTop />

							<ToastProvider />

							{children}

							{!isStaff && <FacebookMessenger />}
						</LoadingProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
