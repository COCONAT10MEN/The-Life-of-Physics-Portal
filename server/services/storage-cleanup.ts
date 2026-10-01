import 'server-only';

import { db } from '@/server/db';
import { UTApi } from 'uploadthing/server';

// Total file storage cap: 2 GB (2 * 1024 * 1024 * 1024 bytes)
export const STORAGE_CAP_BYTES = 2 * 1024 * 1024 * 1024;

// Auto-pruning triggers when total usage exceeds 1.8 GB
export const PRUNE_THRESHOLD_BYTES = Math.floor(1.8 * 1024 * 1024 * 1024);

// Target deletion amount: ~1 GB (50% of capacity)
export const TARGET_PRUNE_AMOUNT_BYTES = 1 * 1024 * 1024 * 1024;

// Fallback estimated size (2 MB) for records uploaded without explicit fileSize
export const DEFAULT_ESTIMATED_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Extract uploadthing file key from url (e.g. https://utfs.io/f/abc-123 or https://uploadthing.com/f/...)
 */
export function extractUploadthingKey(url: string): string | null {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		const segments = parsed.pathname.split('/').filter(Boolean);
		// Usually /f/<key>
		if (segments.length >= 2 && segments[0] === 'f') {
			return segments[1];
		}
		return segments[segments.length - 1] || null;
	} catch {
		const parts = url.split('/');
		return parts[parts.length - 1] || null;
	}
}

/**
 * Returns current total storage consumption across submissions and course attachments
 */
export async function getStorageUsage() {
	try {
		const [submissions, attachments] = await Promise.all([
			db.submission.findMany({
				select: { id: true, fileSize: true, fileUrl: true, createdAt: true },
			}),
			db.attachment.findMany({
				select: { id: true, fileSize: true, url: true, createdAt: true },
			}),
		]);

		let totalBytes = 0;

		submissions.forEach((s) => {
			totalBytes += s.fileSize && s.fileSize > 0 ? s.fileSize : DEFAULT_ESTIMATED_FILE_SIZE;
		});

		attachments.forEach((a) => {
			totalBytes += a.fileSize && a.fileSize > 0 ? a.fileSize : DEFAULT_ESTIMATED_FILE_SIZE;
		});

		const totalGigabytes = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(3));
		const percentageUsed = Number(((totalBytes / STORAGE_CAP_BYTES) * 100).toFixed(1));
		const isNearLimit = totalBytes >= PRUNE_THRESHOLD_BYTES;

		return {
			totalBytes,
			totalGigabytes,
			percentageUsed,
			capBytes: STORAGE_CAP_BYTES,
			thresholdBytes: PRUNE_THRESHOLD_BYTES,
			isNearLimit,
			submissionsCount: submissions.length,
			attachmentsCount: attachments.length,
		};
	} catch (error) {
		console.error('[STORAGE_USAGE_CALCULATION_ERROR]', error);
		return {
			totalBytes: 0,
			totalGigabytes: 0,
			percentageUsed: 0,
			capBytes: STORAGE_CAP_BYTES,
			thresholdBytes: PRUNE_THRESHOLD_BYTES,
			isNearLimit: false,
			submissionsCount: 0,
			attachmentsCount: 0,
		};
	}
}

/**
 * Auto-pruning logic: If storage exceeds 1.8 GB (or force = true),
 * purges the oldest 50% (~1 GB) of uploaded files from both cloud storage & Prisma DB.
 */
export async function checkAndPruneStorageIfNeeded(force = false) {
	try {
		const usage = await getStorageUsage();

		if (!force && !usage.isNearLimit) {
			return {
				pruned: false,
				message: `Storage usage is within safe bounds: ${usage.totalGigabytes} GB / 2 GB (${usage.percentageUsed}%).`,
				usage,
			};
		}

		console.warn(
			`[STORAGE_LIMIT_ALERT] Total storage reached ${usage.totalGigabytes} GB (${usage.percentageUsed}%). Initiating automated 50% oldest file purge...`
		);

		// Fetch all candidates ordered by oldest first
		const [oldestSubmissions, oldestAttachments] = await Promise.all([
			db.submission.findMany({
				orderBy: { createdAt: 'asc' },
				select: {
					id: true,
					fileUrl: true,
					fileKey: true,
					fileSize: true,
					createdAt: true,
				},
			}),
			db.attachment.findMany({
				orderBy: { createdAt: 'asc' },
				select: {
					id: true,
					url: true,
					fileKey: true,
					fileSize: true,
					createdAt: true,
				},
			}),
		]);

		interface CandidateFile {
			id: string;
			type: 'SUBMISSION' | 'ATTACHMENT';
			url: string;
			key: string | null;
			size: number;
			createdAt: Date;
		}

		const allFiles: CandidateFile[] = [
			...oldestSubmissions.map((s) => ({
				id: s.id,
				type: 'SUBMISSION' as const,
				url: s.fileUrl,
				key: s.fileKey || extractUploadthingKey(s.fileUrl),
				size: s.fileSize && s.fileSize > 0 ? s.fileSize : DEFAULT_ESTIMATED_FILE_SIZE,
				createdAt: s.createdAt,
			})),
			...oldestAttachments.map((a) => ({
				id: a.id,
				type: 'ATTACHMENT' as const,
				url: a.url,
				key: a.fileKey || extractUploadthingKey(a.url),
				size: a.fileSize && a.fileSize > 0 ? a.fileSize : DEFAULT_ESTIMATED_FILE_SIZE,
				createdAt: a.createdAt,
			})),
		];

		// Sort all files by oldest creation date first
		allFiles.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

		let accumulatedBytes = 0;
		const filesToPurge: CandidateFile[] = [];

		for (const file of allFiles) {
			filesToPurge.push(file);
			accumulatedBytes += file.size;
			// Stop when we reach target prune amount (~1 GB)
			if (accumulatedBytes >= TARGET_PRUNE_AMOUNT_BYTES) {
				break;
			}
		}

		if (filesToPurge.length === 0) {
			return {
				pruned: false,
				message: 'No files available to purge.',
				usage,
			};
		}

		// 1. Delete from remote storage provider (Uploadthing UTApi)
		const remoteKeysToDelete = filesToPurge
			.map((f) => f.key)
			.filter((k): k is string => Boolean(k));

		if (remoteKeysToDelete.length > 0) {
			try {
				const utapi = new UTApi();
				await utapi.deleteFiles(remoteKeysToDelete);
				console.log(
					`[STORAGE_CLEANUP] Deleted ${remoteKeysToDelete.length} files from Uploadthing storage.`
				);
			} catch (remoteError) {
				console.error('[STORAGE_CLEANUP_REMOTE_DELETE_WARN]', remoteError);
			}
		}

		// 2. Delete corresponding records from Prisma database
		const submissionIds = filesToPurge
			.filter((f) => f.type === 'SUBMISSION')
			.map((f) => f.id);
		const attachmentIds = filesToPurge
			.filter((f) => f.type === 'ATTACHMENT')
			.map((f) => f.id);

		if (submissionIds.length > 0) {
			await db.submission.deleteMany({
				where: { id: { in: submissionIds } },
			});
		}

		if (attachmentIds.length > 0) {
			await db.attachment.deleteMany({
				where: { id: { in: attachmentIds } },
			});
		}

		const purgedGB = (accumulatedBytes / (1024 * 1024 * 1024)).toFixed(2);
		const logMessage = `Automated Storage Cleanup: Purged ${purgedGB} GB (${filesToPurge.length} oldest uploads) from system.`;
		console.log(`[STORAGE_CLEANUP_SUCCESS] ${logMessage}`);

		return {
			pruned: true,
			purgedBytes: accumulatedBytes,
			purgedFilesCount: filesToPurge.length,
			message: logMessage,
			newUsage: await getStorageUsage(),
		};
	} catch (error) {
		console.error('[STORAGE_PRUNE_ENGINE_ERROR]', error);
		return {
			pruned: false,
			error: 'Failed to execute storage cleanup engine.',
		};
	}
}
