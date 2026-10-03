'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  BookOpen,
  FileText,
  Percent,
  Calendar
} from 'lucide-react';

export default function GradesPage() {
  const { currentUser, t, language, refreshKey } = useApp();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentUser, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments?role=${currentUser.role}&userId=${currentUser.id}`);
      setAssignments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLecturer = currentUser.role === 'LECTURER';

  // For Student calculations
  const studentSubmissions = assignments
    .map((a) => ({
      assignment: a,
      submission: a.userSubmission,
    }))
    .filter((item) => item.submission);

  const gradedList = studentSubmissions.filter((s) => s.submission.status === 'GRADED');
  const totalScoreObtained = gradedList.reduce((acc, curr) => acc + (curr.submission.mark || 0), 0);
  const totalMaxMarks = gradedList.reduce((acc, curr) => acc + (curr.assignment.maxMarks || 100), 0);
  const overallAvg = totalMaxMarks > 0 ? Math.round((totalScoreObtained / totalMaxMarks) * 100) : 0;

  // For Lecturer calculations
  const allSubmissionsList = assignments.flatMap((a) =>
    (a.submissions || []).map((sub: any) => ({
      assignment: a,
      submission: sub,
    }))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-pmu-600 dark:text-pmu-400" />
          {t('myGradesTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isLecturer
            ? t('gradesSubtitleLecturer')
            : t('gradesSubtitleStudent')}
        </p>
      </div>

      {/* STUDENT View: Summary Stats */}
      {!isLecturer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('overallAverage')}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {gradedList.length > 0 ? `${overallAvg}%` : '-'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('gradedAssignments')}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {gradedList.length} / {assignments.length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('statusPendingGrade')}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {studentSubmissions.filter((s) => s.submission.status === 'PENDING_GRADE').length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Grades Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
            {isLecturer ? t('studentGradingList') : t('gradeBreakdown')}
          </h3>
          <span className="text-xs font-mono font-medium text-slate-500">
            {isLecturer ? `${allSubmissionsList.length} ${t('recordsCount')}` : `${assignments.length} ${t('tasksCount')}`}
          </span>
        </div>

        {/* MOBILE VIEW (< md): Card-based List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {!isLecturer && assignments.map((a) => {
            const sub = a.userSubmission;
            return (
              <div key={a.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                      {a.course?.code}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {a.title}
                    </h4>
                  </div>
                  <div>
                    {sub ? <StatusBadge status={sub.status} /> : (
                      <span className="text-xs font-semibold text-slate-400">{t('statusNotSubmitted')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">{t('marksObtained')}</span>
                  <div className="font-bold">
                    {sub && sub.mark !== null ? (
                      <span className="text-pmu-600 dark:text-pmu-400 text-base font-black">
                        {sub.mark} <span className="text-xs text-slate-400 font-normal">/ {a.maxMarks}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">-</span>
                    )}
                  </div>
                </div>

                {sub && sub.feedback && (
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                    <p className="font-bold text-pmu-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-pmu-600 dark:text-blue-400" /> {t('lecturerFeedback')}:
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {sub.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {isLecturer && allSubmissionsList.map((item, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.submission.student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                    alt={item.submission.student?.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-pmu-400/40"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {item.submission.student?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.submission.student?.codeNo}
                    </div>
                  </div>
                </div>
                <div>
                  {item.submission.mark !== null ? (
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
                      {item.submission.mark} / {item.assignment.maxMarks}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold text-xs border border-amber-200 dark:border-amber-800">
                      {t('statusPendingGrade')}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {item.assignment.title}
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-mono font-bold text-pmu-600 dark:text-pmu-400">{item.assignment.course?.code}</span>
                  <span>{t('submittedAt')}: {new Date(item.submission.submittedAt).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US')}</span>
                </div>
              </div>

              {item.submission.feedback && (
                <div className="text-xs p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{t('lecturerFeedback')}:</span>
                  {item.submission.feedback}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW (>= md): Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                {isLecturer ? (
                  <>
                    <th className="p-4">{t('student')}</th>
                    <th className="p-4">{t('courseAndTask')}</th>
                    <th className="p-4">{t('submittedAt')}</th>
                    <th className="p-4">{t('marks')}</th>
                    <th className="p-4">{t('lecturerFeedback')}</th>
                  </>
                ) : (
                  <>
                    <th className="p-4">{t('courses')}</th>
                    <th className="p-4">{t('assignmentTitle')}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4">{t('marksFull')}</th>
                    <th className="p-4">{t('lecturerFeedback')}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* STUDENT TABLE */}
              {!isLecturer && assignments.map((a) => {
                const sub = a.userSubmission;
                return (
                  <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-pmu-600 dark:text-pmu-400 text-xs">
                      {a.course?.code}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                      {a.title}
                    </td>
                    <td className="p-4">
                      {sub ? <StatusBadge status={sub.status} /> : (
                        <span className="text-xs font-semibold text-slate-400">{t('statusNotSubmitted')}</span>
                      )}
                    </td>
                    <td className="p-4 font-bold">
                      {sub && sub.mark !== null ? (
                        <span className="text-pmu-600 dark:text-pmu-400 text-base font-black">
                          {sub.mark} <span className="text-xs text-slate-400 font-normal">/ {a.maxMarks}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                      {sub && sub.feedback ? (
                        <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-slate-700 dark:text-slate-200">
                          {sub.feedback}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">{t('noFeedbackYet')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* LECTURER TABLE */}
              {isLecturer && allSubmissionsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.submission.student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                        alt={item.submission.student?.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {item.submission.student?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.submission.student?.codeNo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {item.assignment.title}
                    </div>
                    <div className="text-[11px] font-mono text-pmu-600 dark:text-pmu-400 font-bold">
                      {item.assignment.course?.code}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-mono">
                    {new Date(item.submission.submittedAt).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US')}
                  </td>
                  <td className="p-4 font-bold text-pmu-600 dark:text-pmu-400">
                    {item.submission.mark !== null ? (
                      <span className="font-mono">{item.submission.mark} / {item.assignment.maxMarks}</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold">{t('statusPendingGrade')}</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                    {item.submission.feedback || <span className="text-slate-400 italic">{t('noFeedbackYet')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
