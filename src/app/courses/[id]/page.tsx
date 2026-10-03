'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import {
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  Clock,
  ArrowLeft,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  Lock,
  GraduationCap,
  Building2,
  Calendar,
  MessageSquare,
  Award,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileCode,
  FolderArchive,
  Sparkles
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, t, refreshKey, triggerRefresh, language } = useApp();

  const courseId = params?.id as string;
  const initialTab = searchParams.get('tab') || 'notes';

  const [activeTab, setActiveTab] = useState<'notes' | 'assignments' | 'members'>(
    initialTab === 'assignments' ? 'assignments' : initialTab === 'members' ? 'members' : 'notes'
  );

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter notes
  const [noteCategory, setNoteCategory] = useState('Semua');
  const [noteSearch, setNoteSearch] = useState('');

  // Modals state
  const [isUploadNoteOpen, setIsUploadNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteCat, setNoteCat] = useState('Nota Kuliah');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Submit Work (Student)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittingWork, setSubmittingWork] = useState(false);

  // Create Assignment (Lecturer)
  const [isCreateAssignOpen, setIsCreateAssignOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxMarks, setAssignMaxMarks] = useState(100);
  const [assignIsGroup, setAssignIsGroup] = useState(false);
  const [assignFile, setAssignFile] = useState<File | null>(null);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Grade Submission (Lecturer)
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [gradeMark, setGradeMark] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Expandable submissions for lecturer
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, currentUser, refreshKey]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'assignments' || tabParam === 'notes' || tabParam === 'members') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}?userId=${currentUser.id}&role=${currentUser.role}`);
      if (!res.ok) {
        throw new Error('Gagal memuat data kursus.');
      }
      const data = await res.json();
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Ralat berlaku.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollRequest = async () => {
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
        alert('Permohonan pendaftaran kursus telah dihantar!');
        triggerRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghantar permohonan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;
    setSubmittingNote(true);

    try {
      let fileUrl = '/uploads/sample_note_web_ch1.pdf';
      let fileName = `${noteTitle.replace(/\s+/g, '_')}.pdf`;
      let fileSize = '2.1 MB';

      if (noteFile) {
        const formData = new FormData();
        formData.append('file', noteFile);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          fileUrl = upData.fileUrl;
          fileName = upData.fileName;
          fileSize = upData.fileSize;
        }
      }

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: noteTitle,
          description: noteDesc,
          category: noteCat,
          fileUrl,
          fileName,
          fileSize,
        }),
      });

      if (res.ok) {
        setIsUploadNoteOpen(false);
        setNoteTitle('');
        setNoteDesc('');
        setNoteFile(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm(language === 'BM' ? 'Adakah anda pasti mahu memadamkan nota ini?' : 'Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      if (res.ok) triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle || !assignDueDate) return;
    setSubmittingAssign(true);

    try {
      let fileUrl = '/uploads/soalan_latihan_amali.zip';
      let fileName = `${assignTitle.replace(/\s+/g, '_')}_Soalan.zip`;

      if (assignFile) {
        const formData = new FormData();
        formData.append('file', assignFile);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          fileUrl = upData.fileUrl;
          fileName = upData.fileName;
        }
      }

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: assignTitle,
          description: assignDesc,
          startDate: new Date().toISOString(),
          dueDate: new Date(assignDueDate).toISOString(),
          maxMarks: assignMaxMarks,
          isGroup: assignIsGroup,
          fileUrl,
          fileName,
        }),
      });

      if (res.ok) {
        setIsCreateAssignOpen(false);
        setAssignTitle('');
        setAssignDesc('');
        setAssignDueDate('');
        setAssignFile(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setSubmittingWork(true);

    try {
      let fileUrl = '/uploads/sample_submission.zip';
      let fileName = 'Tugasan_Pelajar.zip';

      if (submissionFile) {
        const formData = new FormData();
        formData.append('file', submissionFile);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          fileUrl = upData.fileUrl;
          fileName = upData.fileName;
        }
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: activeAssignment.id,
          studentId: currentUser.id,
          fileUrl,
          fileName,
          content: submissionContent,
          groupId: activeAssignment.userGroup ? activeAssignment.userGroup.id : null,
        }),
      });

      if (res.ok) {
        setIsSubmitModalOpen(false);
        setActiveAssignment(null);
        setSubmissionContent('');
        setSubmissionFile(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setGrading(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: activeSubmission.id,
          mark: Number(gradeMark),
          feedback: gradeFeedback,
        }),
      });

      if (res.ok) {
        setIsGradeModalOpen(false);
        setActiveSubmission(null);
        setGradeMark(0);
        setGradeFeedback('');
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="w-9 h-9 border-3 border-pmu-200 border-t-pmu-600 rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-500">
          {language === 'BM' ? 'Memuat bilik kursus...' : 'Loading course room...'}
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Kursus Tidak Dijumpai
        </h2>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-pmu-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pmu-600/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Senarai
        </Link>
      </div>
    );
  }

  const isLecturer = currentUser.role === 'LECTURER';
  const isEnrolledAndApproved = course.isEnrolledAndApproved;
  const enrollmentStatus = course.enrollmentStatus;

  // ACCESS RESTRICTION: Student must be approved in this course
  if (!isLecturer && !isEnrolledAndApproved) {
    return (
      <div className="max-w-lg mx-auto py-6 px-3 space-y-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('backToCourses')}
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase font-bold text-pmu-600 dark:text-pmu-400">
              {course.code} • {t('courseSection')} {course.section}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {course.name}
            </h2>
            <p className="text-xs text-slate-500">
              {t('lecturer')}: {course.lecturer?.name} ({course.department})
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              {t('restrictedAccess')}
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {t('restrictedDesc')}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {enrollmentStatus === 'PENDING' ? (
              <div className="w-full py-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-amber-600" />
                {t('awaitingLecturerVerify')}
              </div>
            ) : (
              <button
                onClick={handleEnrollRequest}
                className="w-full py-3 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pmu-600/30 transition-all min-h-[44px] active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {t('enrollCourseNow')}
              </button>
            )}

            <Link
              href="/courses"
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[44px]"
            >
              {t('viewOtherCourses')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED ACCESS OR LECTURER
  const notes = course.notes || [];
  const assignments = course.assignments || [];
  const approvedEnrollments = (course.enrollments || []).filter((e: any) => e.status === 'APPROVED');

  const categories = [
    { id: 'Semua', label: t('catAll') },
    { id: 'Nota Kuliah', label: t('catLecture') },
    { id: 'Tutorial', label: t('catTutorial') },
    { id: 'Silibus', label: t('catSyllabus') },
    { id: 'Slide', label: t('catSlide') },
  ];
  const filteredNotes = notes.filter((n: any) => {
    const matchesSearch =
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      (n.description && n.description.toLowerCase().includes(noteSearch.toLowerCase()));
    const matchesCategory = noteCategory === 'Semua' || n.category === noteCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('backToCourses')}
        </Link>
      </div>

      {/* Course PMU Royal Blue Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pmu-900 via-pmu-800 to-pmu-950 text-white p-5 sm:p-6 shadow-lg shadow-pmu-900/20 border border-pmu-700/50">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="px-2.5 py-0.5 rounded-full bg-white text-pmu-900 font-black shadow-xs">
                {course.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                {t('courseSection')} {course.section}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                {course.department}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {course.name}
            </h1>

            <div className="flex items-center gap-2 pt-1 text-xs text-sky-100/90">
              <img
                src={course.lecturer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={course.lecturer?.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white/30"
              />
              <span>{t('lecturer')}: <strong className="text-white font-semibold">{course.lecturer?.name}</strong></span>
            </div>
          </div>

          {/* Quick Counter Summary */}
          <div className="flex items-center gap-4 text-xs text-sky-100/80 border-t sm:border-t-0 sm:border-l border-white/15 pt-3 sm:pt-0 sm:pl-5">
            <div>
              <div className="font-black text-lg text-white">{notes.length}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">{t('notesCounter')}</div>
            </div>
            <div>
              <div className="font-black text-lg text-white">{assignments.length}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">{t('assignmentsCounter')}</div>
            </div>
            <div>
              <div className="font-black text-lg text-white">{approvedEnrollments.length}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">{t('studentsCounter')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
              activeTab === 'notes'
                ? 'bg-pmu-600 text-white shadow-md shadow-pmu-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('tabNotes')} ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
              activeTab === 'assignments'
                ? 'bg-pmu-600 text-white shadow-md shadow-pmu-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('tabAssignments')} ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
              activeTab === 'members'
                ? 'bg-pmu-600 text-white shadow-md shadow-pmu-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('tabMembers')} ({approvedEnrollments.length})</span>
          </button>
        </div>

        {/* Action Button for Lecturer */}
        {isLecturer && (
          <div className="shrink-0 hidden sm:block">
            {activeTab === 'notes' && (
              <button
                onClick={() => setIsUploadNoteOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pmu-600/25 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                {t('uploadNoteBtn')}
              </button>
            )}
            {activeTab === 'assignments' && (
              <button
                onClick={() => setIsCreateAssignOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pmu-600/25 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {t('createAssignmentBtn')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile action bar for lecturer */}
      {isLecturer && (
        <div className="sm:hidden">
          {activeTab === 'notes' && (
            <button
              onClick={() => setIsUploadNoteOpen(true)}
              className="w-full py-2.5 rounded-xl bg-pmu-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              <Upload className="w-4 h-4" />
              {t('uploadNewNoteBtn')}
            </button>
          )}
          {activeTab === 'assignments' && (
            <button
              onClick={() => setIsCreateAssignOpen(true)}
              className="w-full py-2.5 rounded-xl bg-pmu-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {t('createTaskBtn')}
            </button>
          )}
        </div>
      )}

      {/* TAB 1: NOTA & BAHAN KULIAH */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5 scrollbar-none no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNoteCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    noteCategory === cat.id
                      ? 'bg-pmu-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('searchNotesPlaceholder')}
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pmu-500/50"
              />
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <FileText className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {t('noNotesTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('noNotesDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((n: any) => (
                <div
                  key={n.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-md hover:border-pmu-500/40 transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {n.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{n.fileSize}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/60">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-pmu-600 dark:group-hover:text-pmu-400 transition-colors">
                          {n.title}
                        </h3>
                        {n.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {n.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isLecturer && (
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title={t('deleteNote')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <a
                        href={n.fileUrl}
                        download
                        className="px-3.5 py-1.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-pmu-600/25 min-h-[38px] active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('downloadNoteFile')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LATIHAN & TUGASAN */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <ClipboardList className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {t('noAssignmentsTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('noAssignmentsDesc')}
              </p>
            </div>
          ) : (
            assignments.map((a: any) => {
              const sub = a.userSubmission;
              const isExpanded = expandedAssignmentId === a.id;
              const questionFile = a.fileUrl || '/uploads/soalan_latihan_amali.zip';
              const questionFileName = a.fileName || `${a.title.replace(/\s+/g, '_')}_Soalan.zip`;
              const isZipFolder = questionFileName.toLowerCase().endsWith('.zip') || questionFileName.toLowerCase().includes('folder');

              return (
                <div
                  key={a.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Assignment Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/60">
                          {a.isGroup ? t('taskGroup') : t('taskIndividual')}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {t('fullMarks')}: <strong>{a.maxMarks}</strong>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {a.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {a.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono shrink-0 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {t('dueBefore')}: <strong className="text-slate-800 dark:text-slate-200">{new Date(a.dueDate).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</strong>
                      </span>
                    </div>
                  </div>

                  {/* FEATURE: Question File/Folder Download Area */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-sky-50/50 dark:from-blue-950/40 dark:to-sky-950/20 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-pmu-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800">
                        {isZipFolder ? (
                          <FolderArchive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-pmu-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-pmu-700 dark:text-sky-300 flex items-center gap-1">
                          <span>{isZipFolder ? t('questionZipTitle') : t('questionDocTitle')}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                          {questionFileName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t('questionGuideText')}
                        </div>
                      </div>
                    </div>

                    <a
                      href={questionFile}
                      download={questionFileName}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-pmu-600/30 transition-all min-h-[40px] shrink-0 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('downloadQuestionBtn')}</span>
                    </a>
                  </div>

                  {/* STUDENT VIEW: Status & Submission Action */}
                  {!isLecturer && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {sub ? (
                          sub.status === 'GRADED' ? (
                            <div className="flex items-center gap-2 text-xs">
                              <StatusBadge status="GRADED" />
                              <span className="px-2.5 py-0.5 rounded-md bg-pmu-50 text-pmu-700 dark:bg-pmu-950 dark:text-pmu-300 font-bold font-mono">
                                {t('marksObtained')}: {sub.mark} / {a.maxMarks}
                              </span>
                              {sub.feedback && (
                                <span className="text-slate-500 italic text-[11px]">
                                  &quot;{sub.feedback}&quot;
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <StatusBadge status="PENDING_GRADE" />
                              <span className="text-xs text-slate-500 font-mono">{t('submittedOnDate')} {new Date(sub.submittedAt).toLocaleDateString(language === 'BM' ? 'ms-MY' : 'en-US')}</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" />
                            {t('statusNotSubmitted')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setActiveAssignment(a);
                          setIsSubmitModalOpen(true);
                        }}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 ${
                          sub
                            ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'bg-pmu-600 hover:bg-pmu-700 text-white shadow-md shadow-pmu-600/30'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {sub ? t('updateSubmission') : t('submitWorkBtn')}
                      </button>
                    </div>
                  )}

                  {/* LECTURER VIEW: Submissions & Grading */}
                  {isLecturer && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <button
                        onClick={() => setExpandedAssignmentId(isExpanded ? null : a.id)}
                        className="text-xs font-bold text-pmu-600 dark:text-pmu-400 hover:underline flex items-center gap-1"
                      >
                        <span>{a.submissions?.length || 0} {t('studentsSubmittedCount')}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                          {(!a.submissions || a.submissions.length === 0) ? (
                            <p className="text-xs text-slate-500 py-3 text-center">
                              {t('noSubmissionsYet')}
                            </p>
                          ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                              {a.submissions.map((s: any) => (
                                <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={s.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                      alt={s.student?.name}
                                      className="w-8 h-8 rounded-full object-cover ring-2 ring-pmu-400/40"
                                    />
                                    <div>
                                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                        {s.student?.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono">
                                        {s.student?.codeNo}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {s.fileUrl && (
                                      <a
                                        href={s.fileUrl}
                                        download
                                        className="p-1.5 text-pmu-600 dark:text-pmu-400 hover:bg-pmu-50 dark:hover:bg-pmu-950/60 rounded-lg transition-colors"
                                        title={t('downloadStudentFile')}
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    )}

                                    <button
                                      onClick={() => {
                                        setActiveSubmission(s);
                                        setGradeMark(s.mark || 0);
                                        setGradeFeedback(s.feedback || '');
                                        setIsGradeModalOpen(true);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs ${
                                        s.status === 'GRADED'
                                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                          : 'bg-pmu-600 text-white'
                                      }`}
                                    >
                                      {s.status === 'GRADED' ? `${t('gradedScoreText')}: ${s.mark}/${a.maxMarks}` : t('gradeNowBtn')}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: MAKLUMAT KURSUS & AHLI KELAS */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Lecturer Info */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-pmu-600 dark:text-pmu-400">
              {t('courseLecturerTitle')}
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={course.lecturer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={course.lecturer?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pmu-500"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {course.lecturer?.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {course.lecturer?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-pmu-50 text-pmu-700 dark:bg-pmu-950 dark:text-pmu-300">
                  {course.department}
                </span>
              </div>
            </div>
          </div>

          {/* Enrolled Students List */}
          <div className="md:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('classmatesTitle')} ({approvedEnrollments.length})
            </h3>

            {approvedEnrollments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                {t('noClassmatesYet')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {approvedEnrollments.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3"
                  >
                    <img
                      src={item.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={item.student?.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {item.student?.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.student?.codeNo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Upload Note (Lecturer) */}
      <Modal
        isOpen={isUploadNoteOpen}
        onClose={() => setIsUploadNoteOpen(false)}
        title={t('uploadNote')}
      >
        <form onSubmit={handleUploadNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('noteTitle')} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'BM' ? 'cth. Bab 1: Pengenalan Kepada Web Programming' : 'e.g. Chapter 1: Introduction to Web Programming'}
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('noteCategory')}
            </label>
            <select
              value={noteCat}
              onChange={(e) => setNoteCat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            >
              <option value="Nota Kuliah">{t('catLecture')}</option>
              <option value="Tutorial">{t('catTutorial')}</option>
              <option value="Silibus">{t('catSyllabus')}</option>
              <option value="Slide">{t('catSlide')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('noteDescription')}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'BM' ? 'Penerangan ringkas nota ini...' : 'Brief description of this note...'}
              value={noteDesc}
              onChange={(e) => setNoteDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('noteFile')}
            </label>
            <input
              type="file"
              onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pmu-50 file:text-pmu-700 dark:file:bg-pmu-950 dark:file:text-pmu-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsUploadNoteOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submittingNote}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white text-xs font-bold shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {submittingNote ? t('uploadingNote') : t('saveNote')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Create Assignment with Question File Attachment (Lecturer) */}
      <Modal
        isOpen={isCreateAssignOpen}
        onClose={() => setIsCreateAssignOpen(false)}
        title={t('createAssignment')}
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('assignmentTitle')} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'BM' ? 'cth. Amali 1: Halaman Web Responsif' : 'e.g. Practical 1: Responsive Webpage'}
              value={assignTitle}
              onChange={(e) => setAssignTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('assignmentDesc')}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'BM' ? 'Arahan tugasan...' : 'Assignment instructions...'}
              value={assignDesc}
              onChange={(e) => setAssignDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('attachQuestionFile')}
            </label>
            <input
              type="file"
              onChange={(e) => setAssignFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pmu-50 file:text-pmu-700 dark:file:bg-pmu-950 dark:file:text-pmu-300"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {t('attachQuestionHelp')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('dueDate')} *
              </label>
              <input
                type="datetime-local"
                required
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('maxMarks')}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={assignMaxMarks}
                onChange={(e) => setAssignMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isGroupCourseAssign"
              checked={assignIsGroup}
              onChange={(e) => setAssignIsGroup(e.target.checked)}
              className="w-4 h-4 rounded text-pmu-600 focus:ring-pmu-500"
            />
            <label htmlFor="isGroupCourseAssign" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {t('isGroupAssign')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateAssignOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submittingAssign}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white text-xs font-bold shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {submittingAssign ? t('savingMarks') : t('createAssignment')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Submit Work (Student) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={activeAssignment ? `${t('submit')}: ${activeAssignment.title}` : t('submitWork')}
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-300">
            {t('dueDate')}: <strong>{activeAssignment && new Date(activeAssignment.dueDate).toLocaleString(language === 'BM' ? 'ms-MY' : 'en-US')}</strong>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('submissionText')}
            </label>
            <textarea
              rows={3}
              placeholder={language === 'BM' ? 'Catatan jawapan atau pautan kerja...' : 'Submission notes or work link...'}
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('submissionFile')}
            </label>
            <input
              type="file"
              onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pmu-50 file:text-pmu-700 dark:file:bg-pmu-950 dark:file:text-pmu-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submittingWork}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white text-xs font-bold shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {submittingWork ? t('submittingWork') : t('submitNow')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Grade Submission (Lecturer) */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title={t('gradeSubmission')}
      >
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {activeSubmission?.student?.name}
            </div>
            <div className="text-slate-500 font-mono">
              {activeSubmission?.student?.codeNo}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('marksObtained')}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={gradeMark}
              onChange={(e) => setGradeMark(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('enterFeedback')}
            </label>
            <textarea
              rows={2}
              placeholder={t('feedbackPlaceholder')}
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsGradeModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={grading}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white text-xs font-bold shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {grading ? t('savingMarks') : t('saveMarks')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
