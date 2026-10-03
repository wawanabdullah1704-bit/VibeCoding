'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import {
  BookOpen,
  ClipboardList,
  Award,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, t, refreshKey, triggerRefresh, language } = useApp();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentUser, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentUser.role === 'LECTURER') {
        const [cRes, eRes, aRes, nRes] = await Promise.all([
          fetch(`/api/courses?role=LECTURER&userId=${currentUser.id}`),
          fetch(`/api/enrollments?lecturerId=${currentUser.id}`),
          fetch(`/api/assignments?role=LECTURER&userId=${currentUser.id}`),
          fetch(`/api/notes?role=LECTURER&userId=${currentUser.id}`),
        ]);
        setCourses(await cRes.json());
        setEnrollments(await eRes.json());
        setAssignments(await aRes.json());
        setNotes(await nRes.json());
      } else {
        const [cRes, aRes, nRes] = await Promise.all([
          fetch(`/api/courses?role=STUDENT&userId=${currentUser.id}`),
          fetch(`/api/assignments?role=STUDENT&userId=${currentUser.id}`),
          fetch(`/api/notes?role=STUDENT&userId=${currentUser.id}`),
        ]);
        setCourses(await cRes.json());
        setAssignments(await aRes.json());
        setNotes(await nRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, status }),
      });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isLecturer = currentUser.role === 'LECTURER';

  // Derived stats for Student
  const approvedCourses = courses.filter((c) => c.enrollmentStatus === 'APPROVED');
  const pendingAssignments = assignments.filter((a) => !a.userSubmission);
  const gradedSubmissions = assignments.filter((a) => a.userSubmission && a.userSubmission.status === 'GRADED');
  const avgGrade =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((acc, a) => acc + (a.userSubmission.mark || 0), 0) / gradedSubmissions.length
        )
      : null;

  // Derived stats for Lecturer
  const pendingEnrollments = enrollments.filter((e) => e.status === 'PENDING');
  const allSubmissions = assignments.flatMap((a) => a.submissions || []);
  const pendingGradeSubmissions = allSubmissions.filter((s) => s.status === 'PENDING_GRADE');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Modern PMU Royal Blue Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pmu-900 via-pmu-800 to-pmu-950 text-white p-5 sm:p-7 shadow-lg shadow-pmu-900/20 border border-pmu-700/40">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/10 text-sky-200 border border-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>{currentUser.role === 'LECTURER' ? t('portalLecturer') : t('portalStudent')}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {t('welcome')}, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/80 max-w-xl leading-relaxed">
              {isLecturer
                ? (language === 'BM' ? 'Selamat kembali ke sistem CIDOS PMU. Semak permohonan pendaftaran kursus dan pemarkahan tugasan amali anda.' : 'Welcome back to CIDOS PMU. Review student enrollment requests and grade assignments.')
                : (language === 'BM' ? 'Pilih kursus yang anda daftari untuk membaca nota kuliah terkini dan menghantar tugasan sebelum tarikh tamat.' : 'Select your enrolled courses to read the latest lecture notes and submit assignments on time.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-pmu-900 hover:bg-sky-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-black/10 transition-all min-h-[44px] active:scale-95"
            >
              <span>{isLecturer ? (language === 'BM' ? 'Urus Kursus' : 'Manage Courses') : (language === 'BM' ? 'Buka Kursus Saya' : 'Open My Courses')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid with Vivid Accents & Depth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Courses */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('statCourses')}
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {isLecturer ? courses.length : approvedCourses.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {isLecturer ? (language === 'BM' ? 'Kursus Aktif Diajar' : 'Active Courses Taught') : (language === 'BM' ? 'Kursus Berdaftar' : 'Enrolled Courses')}
          </p>
        </div>

        {/* Stat 2: Pending Assignments / Reviews */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isLecturer ? t('statPendingGrades') : t('statPendingAssignments')}
            </p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {isLecturer ? pendingGradeSubmissions.length : pendingAssignments.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {isLecturer ? (language === 'BM' ? 'Skrip pelajar menunggu' : 'Student submissions pending') : (language === 'BM' ? 'Perlu diselesaikan segera' : 'Needs immediate completion')}
          </p>
        </div>

        {/* Stat 3: Completed / Approvals */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isLecturer ? t('statPendingEnrollments') : (language === 'BM' ? 'Tugasan Dinilai' : 'Graded Assignments')}
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {isLecturer ? pendingEnrollments.length : gradedSubmissions.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {isLecturer ? (language === 'BM' ? 'Menunggu pengesahan' : 'Awaiting approval') : (language === 'BM' ? 'Telah diberi markah' : 'Graded with feedback')}
          </p>
        </div>

        {/* Stat 4: Average / Materials */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isLecturer ? (language === 'BM' ? 'Jumlah Bahan' : 'Total Materials') : t('statAverageGrade')}
            </p>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {isLecturer ? notes.length : avgGrade !== null ? `${avgGrade}%` : '-'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {isLecturer ? t('uploadedNotesStat') : t('assignmentRecordStat')}
          </p>
        </div>
      </div>

      {/* Main Grid: Pending Items & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Pending Requests or Assignments */}
        <div className="lg:col-span-2 space-y-5">
          {/* LECTURER: Pending Student Enrollments */}
          {isLecturer && (
            <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pmu-600 dark:text-pmu-400" />
                  {t('pendingRequests')} ({pendingEnrollments.length})
                </h3>
                <Link
                  href="/courses"
                  className="text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline flex items-center gap-0.5"
                >
                  {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pendingEnrollments.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-500">
                    {t('noPendingEnrollments')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingEnrollments.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={item.student.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-pmu-500/30"
                        />
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {item.student.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.student.codeNo} • <span className="font-semibold text-pmu-600 dark:text-pmu-400">{item.course.code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleApproveEnrollment(item.id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all min-h-[38px] active:scale-95"
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => handleApproveEnrollment(item.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[38px]"
                        >
                          {t('reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STUDENT: Pending Assignments */}
          {!isLecturer && (
            <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-pmu-600 dark:text-pmu-400" />
                  {t('statPendingAssignments')} ({pendingAssignments.length})
                </h3>
                <Link
                  href="/courses"
                  className="text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline flex items-center gap-0.5"
                >
                  {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pendingAssignments.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t('allAssignmentsDone')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-pmu-300 dark:hover:border-pmu-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pmu-50 text-pmu-700 dark:bg-pmu-950 dark:text-pmu-300 border border-pmu-200 dark:border-pmu-800">
                            {a.course.code}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {a.title}
                          </h4>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {t('dueBefore')}: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(a.dueDate).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <Link
                        href={`/courses/${a.courseId}?tab=assignments`}
                        className="px-4 py-2 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-pmu-600/25 transition-all min-h-[40px] shrink-0 active:scale-95"
                      >
                        {t('submitAssignmentBtn')} &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Lecture Notes */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pmu-600 dark:text-pmu-400" />
                {t('recentLectureNotes')}
              </h3>
              <Link
                href="/courses"
                className="text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline flex items-center gap-0.5"
              >
                {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.slice(0, 4).map((note) => (
                <Link
                  key={note.id}
                  href={`/courses/${note.courseId}?tab=notes`}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-pmu-500/60 dark:hover:border-pmu-400/60 transition-all bg-slate-50/40 dark:bg-slate-800/20 flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-pmu-600 dark:text-pmu-400">
                      {note.course?.code}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-pmu-600 dark:group-hover:text-pmu-400 transition-colors">
                      {note.title}
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      {note.fileSize} • {note.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Course Shortcuts & Academic Notice */}
        <div className="space-y-5">
          {/* Active Courses List */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('myCourses')}
              </h3>
              <Link
                href="/courses"
                className="text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline"
              >
                {t('viewAll')}
              </Link>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-pmu-500/50 dark:hover:border-pmu-400/50 transition-all space-y-2 group bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {t('courseSection')} {c.section}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-pmu-600 dark:group-hover:text-pmu-400 transition-colors">
                    {c.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="truncate max-w-[140px]">
                      {c.lecturer?.name || 'Dr. Azman'}
                    </span>
                    <span className="font-bold text-[11px] text-pmu-600 dark:text-pmu-400 flex items-center group-hover:translate-x-0.5 transition-transform">
                      {t('enterCourseAction')} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Academic Info Notice */}
          <div className="p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-sky-50 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-pmu-800 dark:text-sky-300">
              <AlertCircle className="w-4 h-4 text-pmu-600 dark:text-sky-400" />
              {t('importantNoticeTitle')}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('importantNoticeContent')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
