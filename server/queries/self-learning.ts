import 'server-only';

import { db } from '@/server/db';

import type { SelfLearningChapter, SelfLearningLesson } from '@/shared/contracts/dashboard';

const CURRICULUM_CHAPTERS = [
	{
		number: 1,
		title: "Electric Current & Ohm's Law",
		subtitle: "DC Circuits & Kirchhoff's Laws",
		description:
			"Electric current intensity, potential difference, Ohm's law, resistance, and Kirchhoff's laws.",
	},
	{
		number: 2,
		title: 'Magnetic Effects of Electric Current',
		subtitle: 'Magnetic Force & Torque',
		description:
			'Magnetic flux, straight wires, circular coils, solenoids, magnetic force, torque, and measuring instruments.',
	},
	{
		number: 3,
		title: 'Electromagnetic Induction',
		subtitle: "Faraday's Law & Transformers",
		description:
			"Faraday's law, Lenz's rule, mutual and self induction, AC generators (dynamos), and electrical transformers.",
	},
	{
		number: 4,
		title: 'Alternating Current Circuits',
		subtitle: 'RLC & Resonant Circuits',
		description:
			'AC source with resistors, inductors, capacitors, RLC circuits, and resonant circuits.',
	},
	{
		number: 5,
		title: 'Duality of Wave and Particle',
		subtitle: 'Photons & Photoelectric Effect',
		description:
			'Blackbody radiation, photoelectric effect, Compton effect, and de Broglie matter waves.',
	},
	{
		number: 6,
		title: 'Atomic Spectra',
		subtitle: 'Bohr Model & X-Rays',
		description:
			"Bohr's hydrogen atom model, emission and absorption spectra, and X-rays production.",
	},
	{
		number: 7,
		title: 'Lasers',
		subtitle: 'Coherent Light & Laser Principles',
		description:
			'Stimulated and spontaneous emission, laser production principles, and Helium-Neon laser applications.',
	},
	{
		number: 8,
		title: 'Modern Electronics',
		subtitle: 'Semiconductors & Logic Gates',
		description:
			'Semiconductors, p-n junction diodes, transistors, logic gates, and digital electronics.',
	},
];

export async function getSelfLearningChapters(userId: string): Promise<SelfLearningChapter[]> {
	const courses = await db.course.findMany({
		where: {
			isPublished: true,
		},
		include: {
			chapters: {
				where: { isPublished: true },
				orderBy: { position: 'asc' },
				include: {
					userProgresses: {
						where: { userId },
						select: { isCompleted: true },
					},
				},
			},
		},
		orderBy: [{ chapterNumber: 'asc' }, { createdAt: 'asc' }],
	});

	// Transform to SelfLearningLesson
	const lessons: SelfLearningLesson[] = courses.map((course) => ({
		id: course.id,
		title: course.title,
		chapterNumber: course.chapterNumber,
		chapters: course.chapters.map((chapter) => ({
			id: chapter.id,
			title: chapter.title,
			isCompleted: chapter.userProgresses[0]?.isCompleted ?? false,
		})),
	}));

	// Group by chapter number and AUTO-FILTER EMPTY CHAPTERS (100% English)
	const chapters: SelfLearningChapter[] = CURRICULUM_CHAPTERS.map(
		(currChapter) => {
			const chapterLessons = lessons.filter(
				(l) => l.chapterNumber === currChapter.number
			);
			return {
				...currChapter,
				lessonCount: chapterLessons.length,
				lessons: chapterLessons,
			};
		}
	).filter((chapter) => chapter.lessonCount > 0); // AUTO-FILTER: ONLY render chapters with >= 1 published lesson!
	return chapters;
}
