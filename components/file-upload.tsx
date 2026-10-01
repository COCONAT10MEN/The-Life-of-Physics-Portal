'use client';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { UploadDropzone } from '@/lib/uploadthing';
import { useGlobalLoading } from '@/components/providers/loading-provider';
import toast from 'react-hot-toast';

interface FileUploadProps {
	onChange: (url?: string, metadata?: { size?: number; key?: string; name?: string }) => Promise<void> | void;
	endpoint: keyof OurFileRouter;
}

const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
	const { startLoading, stopLoading } = useGlobalLoading();

	return (
		<UploadDropzone
			appearance={{
				container: 'rounded-md border border-slate-200 bg-white',
				uploadIcon: 'text-slate-950',
				label: 'text-slate-700',
				allowedContent: 'text-slate-500',
				button: 'bg-slate-950 text-white hover:bg-slate-800',
			}}
			endpoint={endpoint}
			onBeforeUploadBegin={(files) => {
				startLoading();
				return files;
			}}
			onClientUploadComplete={async (res) => {
				const file = res?.[0];
				const fileUrl = file?.url;

				if (!fileUrl) {
					toast.error('Upload completed without a file URL. Please try again.');
					stopLoading();
					return;
				}

				try {
					await onChange(fileUrl, { size: file?.size, key: file?.key, name: file?.name });
				} finally {
					stopLoading();
				}
			}}
			onUploadError={(error: Error) => {
				toast.error(error.message);
				stopLoading();
			}}
			onUploadAborted={stopLoading}
		/>
	);
};

export default FileUpload;
