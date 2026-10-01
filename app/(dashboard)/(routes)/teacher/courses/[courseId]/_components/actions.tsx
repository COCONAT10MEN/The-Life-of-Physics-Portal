'use client';

import ConfirmModal from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGlobalLoading } from '@/components/providers/loading-provider';

interface ActionsProps {
	disabled: boolean;
	courseId: string;
	isPublished: boolean;
}

const Actions = ({ disabled, courseId, isPublished }: ActionsProps) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { startLoading, stopLoading } = useGlobalLoading();

	const onClick = async () => {
		try {
			setIsLoading(true);
			startLoading();

			if (isPublished) {
				await axios.patch(`/api/courses/${courseId}/unpublish`);

				toast.success('Lesson unpublished');
			} else {
				await axios.patch(`/api/courses/${courseId}/publish`);

				toast.success('Lesson published');
			}

			router.refresh();
		} catch {
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
			stopLoading();
		}
	};

	const onDelete = async () => {
		try {
			setIsLoading(true);
			startLoading();

			await axios.delete(`/api/courses/${courseId}`);

			toast.success('Lesson deleted');

			router.refresh();
			router.push(`/teacher/courses`);
		} catch {
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
			stopLoading();
		}
	};

	return (
		<div className="flex items-center gap-x-2">
			<Button
				onClick={onClick}
				disabled={disabled || isLoading}
				variant={'outline'}
				size={'sm'}
			>
				{isPublished ? 'Unpublish' : 'Publish'}
			</Button>

			<ConfirmModal onConfirm={onDelete}>
				<Button size={'sm'} disabled={isLoading}>
					<Trash className="w-4 h-4" />
				</Button>
			</ConfirmModal>
		</div>
	);
};

export default Actions;
