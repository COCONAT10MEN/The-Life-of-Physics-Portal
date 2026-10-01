'use client';

import * as z from 'zod';
import { api } from '@/frontend/lib/api';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Course } from '@/shared/contracts/courses';
import Image from 'next/image';

import { Button } from '@/frontend/components/ui/button';
import FileUpload from '@/frontend/components/file-upload';
import { useGlobalLoading } from '@/frontend/components/providers/loading-provider';

interface ImageFormProps {
	initialData: Course;
	courseId: string;
}

const formSchema = z.object({
	imageUrl: z.string().min(1, {
		message: 'Image is required',
	}),
});

const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const toggleEdit = () => setIsEditing((prev) => !prev);

	const router = useRouter();
	const { startLoading, stopLoading } = useGlobalLoading();

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		startLoading();

		try {
			await api.patch(`/api/courses/${courseId}`, values);

			toast.success('Lesson updated');
			toggleEdit();
			router.refresh();
		} catch (error) {
			toast.error('Something went wrong');
		} finally {
			stopLoading();
		}
	};

	return (
		<div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors">
			<div className="font-medium flex items-center justify-between text-slate-900 text-sm">
				Lesson image
				<Button variant={'ghost'} onClick={toggleEdit}>
					{isEditing && <>Cancel</>}

					{!isEditing && !initialData.imageUrl && (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add an image
						</>
					)}

					{!isEditing && initialData.imageUrl && (
						<>
							<Pencil className="h-4 w-4 mr-2" />
							Edit image
						</>
					)}
				</Button>
			</div>

			{!isEditing &&
				(!initialData.imageUrl ? (
					<div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
						<ImageIcon className="h-10 w-10 text-slate-500" />
					</div>
				) : (
					<div className="relative aspect-video mt-2">
						<Image
							fill
							alt="Upload"
							src={initialData.imageUrl}
							className="object-cover rounded-md"
						/>
					</div>
				))}

			{isEditing && (
				<div>
					<FileUpload
						endpoint="courseImage"
						onChange={(url) =>
							url ? onSubmit({ imageUrl: url }) : undefined
						}
					/>

					<div className="text-xs text-muted-foreground mt-4">
						16:9 aspect ratio recommended
					</div>
				</div>
			)}
		</div>
	);
};

export default ImageForm;
