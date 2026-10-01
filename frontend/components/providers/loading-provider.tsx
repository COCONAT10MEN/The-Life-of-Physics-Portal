'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { AnimatePresence } from 'framer-motion';
import LoadingOverlay from '@/frontend/components/loading-overlay';

interface LoadingContextValue {
	isLoading: boolean;
	message: string;
	startLoading: (customMessage?: string) => void;
	stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('Loading page...');
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const timerRef = useRef<number | null>(null);

	// Stop loading when route completes transition
	useEffect(() => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setIsLoading(false);
	}, [pathname, searchParams]);

	const startLoading = useCallback((customMessage = 'Saving changes...') => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
		}
		setMessage(customMessage);
		setIsLoading(true);
	}, []);

	const stopLoading = useCallback(() => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setIsLoading(false);
	}, []);

	// Intercept link clicks globally for route transitions
	useEffect(() => {
		const handleDocumentClick = (e: MouseEvent) => {
			const anchor = (e.target as HTMLElement)?.closest('a');
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (!href) return;

			// Skip external links, hash fragments, protocols, new tabs, downloads
			if (
				href.startsWith('#') ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:') ||
				href.startsWith('javascript:') ||
				anchor.target === '_blank' ||
				anchor.hasAttribute('download') ||
				e.defaultPrevented ||
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.altKey
			) {
				return;
			}

			try {
				const targetUrl = new URL(href, window.location.href);
				const currentUrl = new URL(window.location.href);

				// Only trigger for same-origin navigation to a different page/search
				if (
					targetUrl.origin === currentUrl.origin &&
					(targetUrl.pathname !== currentUrl.pathname ||
						targetUrl.search !== currentUrl.search)
				) {
					setMessage('Loading page...');
					setIsLoading(true);

					// Safety timeout to avoid getting stuck if navigation is cancelled
					if (timerRef.current) {
						window.clearTimeout(timerRef.current);
					}
					timerRef.current = window.setTimeout(() => {
						setIsLoading(false);
						timerRef.current = null;
					}, 8000);
				}
			} catch {
				// invalid URL format, ignore
			}
		};

		document.addEventListener('click', handleDocumentClick, { capture: true });
		return () => {
			document.removeEventListener('click', handleDocumentClick, {
				capture: true,
			});
		};
	}, []);

	const value = useMemo(
		() => ({ isLoading, message, startLoading, stopLoading }),
		[isLoading, message, startLoading, stopLoading]
	);

	return (
		<LoadingContext.Provider value={value}>
			{children}
			<AnimatePresence>
				{isLoading && <LoadingOverlay message={message} key="global-loading-overlay" />}
			</AnimatePresence>
		</LoadingContext.Provider>
	);
};

export const useGlobalLoading = () => {
	const context = useContext(LoadingContext);

	if (!context) {
		throw new Error('useGlobalLoading must be used inside LoadingProvider.');
	}

	return context;
};
