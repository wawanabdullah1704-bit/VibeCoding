'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/Modal';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Building2,
  ArrowRight,
  Lock,
  Layers
} from 'lucide-react';

export default function CoursesPage() {
  const { currentUser, t, refreshKey, triggerRefresh, language } = useApp();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('DNS3A');
  const [newDept, setNewDept] = useState('JTMK');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentUser, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentUser.role === 'LECTURER') {
        const [cRes, eRes] = await Promise.all([
          fetch(`/api/courses?role=LECTURER&userId=${currentUser.id}`),
          fetch(`/api/enrollments?lecturerId=${currentUser.id}`),
        ]);
        setCourses(await cRes.json());
        setEnrollments(await eRes.json());
      } else {
        const res = await fetch(`/api/courses?role=STUDENT&userId=${currentUser.id}`);
        setCourses(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollRequest = async (courseId: string) => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          studentId: currentUser.id,
        }),
      });

      if (res.ok) {
        alert(t('enrollRequestSent'));
        triggerRefresh();
      } else {
        const data = await res.json();
        alert(data.error || (language === 'BM' ? 'Gagal membuat permohonan.' : 'Failed to submit application.'));
      }
    } catch (err) {
      console.error(err);
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          name: newName,
          section: newSection,
          department: newDept,
          lecturerId: currentUser.id,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewCode('');
        setNewName('');
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLecturer = currentUser.role === 'LECTURER';

  const filteredCourses = courses.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingEnrollments = enrollments.filter((e) => e.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-pmu-600 dark:text-pmu-400" />
            {t('navCourses')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isLecturer
              ? (language === 'BM' ? 'Urus kursus pengajaran, bilik kuliah maya dan kelulusan pendaftaran pelajar.' : 'Manage courses, virtual classrooms, and student enrollment approvals.')
              : (language === 'BM' ? 'Daftar dan masuk ke halaman bilik kursus anda untuk mengakses nota serta latihan.' : 'Enroll and enter your course rooms to access lecture notes and assignments.')}
          </p>
        </div>

        {isLecturer && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pmu-600/30 transition-all min-h-[44px] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('createCourse')}
          </button>
        )}
      </div>

      {/* LECTURER: Pending Student Enrollments Section */}
      {isLecturer && pendingEnrollments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              {t('pendingRequests')} ({pendingEnrollments.length})
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              {t('needAction')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingEnrollments.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={item.student.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {item.student.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {item.student.codeNo} • <span className="font-bold text-pmu-600">{item.course.code}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApproveEnrollment(item.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    title={t('approve')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('pass')}</span>
                  </button>
                  <button
                    onClick={() => handleApproveEnrollment(item.id, 'REJECTED')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                    title={t('reject')}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={t('searchCoursesPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-pmu-500/50"
        />
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredCourses.map((c) => {
          const isApproved = c.enrollmentStatus === 'APPROVED';
          const isPending = c.enrollmentStatus === 'PENDING';

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-pmu-500/40 dark:hover:border-pmu-500/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    {c.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {t('courseSection')} {c.section}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-pmu-600 dark:group-hover:text-pmu-400 transition-colors">
                  {c.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-pmu-600 dark:text-pmu-400" />
                    <span>{t('lecturer')}: <strong className="text-slate-700 dark:text-slate-200">{c.lecturer?.name || 'Dr. Azman Bin Rosli'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('department')}: {c.department}</span>
                  </div>
                  {isLecturer && (
                    <div className="flex items-center gap-2 text-pmu-700 dark:text-pmu-300 font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      <span>{c.enrollments?.length || 0} {t('studentsEnrolled')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isLecturer || isApproved ? (
                  <Link
                    href={`/courses/${c.id}`}
                    className="w-full py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pmu-600/25 transition-all min-h-[44px] active:scale-95"
                  >
                    <span>{t('enterCourse')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : isPending ? (
                  <div className="space-y-1.5 text-center">
                    <div className="w-full py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 font-bold text-xs flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      {t('awaitingApprovalMsg')}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t('materialsUnlockedMsg')}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnrollRequest(c.id)}
                    className="w-full py-2.5 rounded-xl border-2 border-pmu-600 text-pmu-600 hover:bg-pmu-600 hover:text-white dark:border-pmu-400 dark:text-pmu-400 dark:hover:bg-pmu-500 dark:hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    {t('enrollCourse')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Course */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('createCourse')}
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('courseCode')} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'BM' ? 'cth. DFC30133' : 'e.g. DFC30133'}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('courseName')} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'BM' ? 'cth. Web Programming & Development' : 'e.g. Web Programming & Development'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('courseSection')}
              </label>
              <input
                type="text"
                required
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('department')}
              </label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
              >
                <option value="JTMK">JTMK (Teknologi Maklumat)</option>
                <option value="JKE">JKE (Elektrik & Elektronik)</option>
                <option value="JKM">JKM (Mekanikal)</option>
                <option value="JP">JP (Perdagangan)</option>
                <option value="JKA">JKA (Kejuruteraan Awam)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {submitting ? (language === 'BM' ? 'Menyimpan...' : 'Saving...') : t('createCourse')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
