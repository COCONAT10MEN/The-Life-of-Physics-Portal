import { Course } from '@prisma/client';

interface RecommendCourse {
	id: string;
	courseId: string;
	categoryId: string;
	views: number;
	createdAt: Date;
	updatedAt: Date;
	course: Course;
}

export { type RecommendCourse };
