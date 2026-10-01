export type SegmentContentType = 'VIDEO_EXPLANATION' | 'HOMEWORK_ASSIGNMENT';

export function resolveSegmentContentType(segment: {
	contentType?: string | null;
	solutionVideoUrl?: string | null;
	videoUrl?: string | null;
	title?: string | null;
}): SegmentContentType {
	if (segment.contentType === 'HOMEWORK_ASSIGNMENT') return 'HOMEWORK_ASSIGNMENT';
	if (segment.contentType === 'VIDEO_EXPLANATION') return 'VIDEO_EXPLANATION';

	// If it has a solution video and NO main video URL
	if (segment.solutionVideoUrl && !segment.videoUrl) {
		return 'HOMEWORK_ASSIGNMENT';
	}

	// Check title keywords
	const title = (segment.title || '').toLowerCase();
	if (
		title.includes('homework') ||
		title.includes('assignment') ||
		title.includes('hw')
	) {
		return 'HOMEWORK_ASSIGNMENT';
	}

	return 'VIDEO_EXPLANATION';
}
