'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const { t } = useApp();

  useEffect(() => {
    if (courseId) {
      router.replace(`/courses/${courseId}?tab=notes`);
    } else {
      router.replace('/courses');
    }
  }, [courseId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-pmu-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center border border-blue-200/80 dark:border-blue-800">
        <BookOpen className="w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {t('redirectingToCourse')}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          {t('redirectingNotesDesc')}
        </p>
      </div>
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pmu-600 text-white font-bold text-xs shadow-md shadow-pmu-600/25"
      >
        <span>{t('openMyCourses')}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
