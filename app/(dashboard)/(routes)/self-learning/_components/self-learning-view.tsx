'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	BookOpen,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Layers,
	PlayCircle,
	Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelfLearningLesson {
	id: string;
	title: string;
	chapterNumber: number | null;
	chapters: {
		id: string;
		title: string;
		isCompleted: boolean;
	}[];
}

export interface SelfLearningChapter {
	number: number;
	title: string;
	subtitle: string;
	description: string;
	lessonCount: number;
	lessons: SelfLearningLesson[];
}

interface SelfLearningViewProps {
	chapters: SelfLearningChapter[];
}

export const SelfLearningView = ({ chapters }: SelfLearningViewProps) => {
	// Default open the first active chapter
	const [expandedChapter, setExpandedChapter] = useState<number | null>(
		chapters.length > 0 ? chapters[0].number : null
	);

	const toggleChapter = (chapterNum: number) => {
		setExpandedChapter((prev) => (prev === chapterNum ? null : chapterNum));
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 pb-12 pt-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
			{/* Page Header with Textbook Cover Styling */}
			<div className="relative overflow-hidden rounded-3xl bg-slate-900 border-2 border-cyan-500/40 text-white p-6 sm:p-8 shadow-lg">
				<div className="absolute right-0 top-0 h-full w-48 pointer-events-none opacity-40">
					<svg
						viewBox="0 0 240 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-full w-full object-cover"
						preserveAspectRatio="none"
					>
						<path d="M40 0C90 60 140 20 240 80V0H40Z" fill="#1e293b" />
						<path d="M90 0C130 75 170 25 240 120V0H90Z" fill="#00aeef" fillOpacity="0.8" />
					</svg>
				</div>
				<div className="relative z-10 space-y-2 max-w-2xl">
					<div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
						<Sparkles className="h-3.5 w-3.5" />
						<span>Curriculum &amp; Self Learning</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
						Self Learning Curriculum
					</h1>
					<p className="text-sm sm:text-base text-slate-300">
						Explore your 3rd Secondary Physics lessons organized by chapter. Select an active chapter below to view lessons and homework segments.
					</p>
				</div>
			</div>

			{/* Active Chapters List */}
			{chapters.length === 0 ? (
				<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
					<BookOpen className="h-10 w-10 text-slate-300 mb-3" />
					<p className="text-base font-semibold text-slate-800">
						No published lessons available yet
					</p>
					<p className="text-xs text-slate-400 mt-1 max-w-sm">
						Your teacher hasn&apos;t published lessons for any chapters yet. Check back soon!
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{chapters.map((chapter) => {
						const isExpanded = expandedChapter === chapter.number;
						const totalLessons = chapter.lessons.length;
						const completedLessons = chapter.lessons.filter((l) =>
							l.chapters.length > 0 && l.chapters.every((c) => c.isCompleted)
						).length;

						return (
							<div
								key={chapter.number}
								className={cn(
									'overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0',
									isExpanded
										? 'border-sky-300 shadow-md ring-1 ring-sky-200'
										: 'border-slate-200 hover:border-slate-300'
								)}
							>
								{/* Chapter Header Card - Click to Toggle */}
								<button
									type="button"
									onClick={() => toggleChapter(chapter.number)}
									className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors cursor-pointer select-none"
								>
									<div className="flex items-start sm:items-center gap-4">
										<div
											className={cn(
												'grid h-12 w-12 shrink-0 place-items-center rounded-xl font-bold text-lg transition-colors',
												isExpanded
													? 'bg-sky-600 text-white shadow-sm'
													: 'bg-sky-50 text-sky-700 border border-sky-100'
											)}
										>
											{chapter.number}
										</div>

										<div className="space-y-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-xs font-bold uppercase tracking-wider text-sky-700">
													CHAPTER {chapter.number}
												</span>
												{chapter.subtitle && (
													<>
														<span className="text-xs text-slate-400">·</span>
														<span className="text-xs font-medium text-slate-600">
															{chapter.subtitle}
														</span>
													</>
												)}
											</div>
											<h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
												CHAPTER {chapter.number} - {chapter.title}
											</h2>
											<p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
												{chapter.description}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3 shrink-0 ml-2">
										<span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
											<Layers className="h-3.5 w-3.5 text-slate-500" />
											<span>
												{totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
											</span>
										</span>

										<div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-transform">
											{isExpanded ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</div>
									</div>
								</button>

								{/* Expanded Lessons List */}
								{isExpanded && (
									<div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-4">
										<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
											<span>Published Lessons ({totalLessons})</span>
											<span>
												{completedLessons} / {totalLessons} Completed
											</span>
										</div>

										<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
											{chapter.lessons.map((lesson, idx) => {
												const firstSegment = lesson.chapters[0];
												const isLessonDone =
													lesson.chapters.length > 0 &&
													lesson.chapters.every((c) => c.isCompleted);
												const segmentsCount = lesson.chapters.length;

												return (
													<div
														key={lesson.id}
														className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all duration-200 ease-out hover:-translate-y-1 hover:border-sky-300 hover:shadow-md active:translate-y-0"
													>
														<div className="space-y-2">
															<div className="flex items-center justify-between text-xs">
																<span className="font-bold text-sky-700 uppercase tracking-wider">
																	Lesson {idx + 1}
																</span>
																{isLessonDone ? (
																	<span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
																		<CheckCircle2 className="h-4 w-4" />
																		<span>Completed</span>
																	</span>
																) : (
																	<span className="text-slate-400 font-medium">
																		{segmentsCount} {segmentsCount === 1 ? 'segment' : 'segments'}
																	</span>
																)}
															</div>

															<h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
																{lesson.title}
															</h3>
														</div>

														<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
															<div className="flex items-center gap-1.5 text-xs text-slate-500">
																<Layers className="h-3.5 w-3.5 text-slate-400" />
																<span>
																	{segmentsCount} {segmentsCount === 1 ? 'part' : 'parts'}
																</span>
															</div>

															{firstSegment ? (
																<Link
																	href={`/courses/${lesson.id}/chapters/${firstSegment.id}`}
																	className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
																>
																	<PlayCircle className="h-3.5 w-3.5" />
																	<span>Open Lesson</span>
																</Link>
															) : (
																<span className="text-xs text-slate-400 italic">
																	No segments yet
																</span>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
