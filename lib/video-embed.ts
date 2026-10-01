export const getEmbeddableVideoUrl = (videoUrl?: string | null) => {
	if (!videoUrl) return null;

	try {
		const url = new URL(videoUrl);
		if (!['http:', 'https:'].includes(url.protocol)) return null;

		const host = url.hostname.replace(/^www\./, '');
		if (host === 'youtu.be') {
			const id = url.pathname.split('/').filter(Boolean)[0];
			return id ? `https://www.youtube.com/embed/${id}` : null;
		}

		if (host === 'youtube.com' || host === 'm.youtube.com') {
			if (url.pathname === '/watch') {
				const id = url.searchParams.get('v');
				return id ? `https://www.youtube.com/embed/${id}` : null;
			}

			if (url.pathname.startsWith('/embed/')) return url.toString();
		}

		if (host === 'drive.google.com') {
			const match = url.pathname.match(/\/file\/d\/([^/]+)/);
			if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
			if (url.pathname.includes('/preview')) return url.toString();
		}

		return url.toString();
	} catch {
		return null;
	}
};
