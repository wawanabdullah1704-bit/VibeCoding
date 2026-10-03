'use client';

import React, { useState, useEffect } from 'react';
import { useApp, DEMO_USERS } from '@/context/AppContext';
import Modal from '@/components/Modal';
import {
  Users,
  Plus,
  BookOpen,
  UserCheck,
  Shield,
  Layers,
  FolderGit2
} from 'lucide-react';

export default function GroupsPage() {
  const { currentUser, t, refreshKey, triggerRefresh } = useApp();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Create Group Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentUser, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentUser.role === 'LECTURER') {
        const [gRes, cRes, aRes] = await Promise.all([
          fetch(`/api/groups?lecturerId=${currentUser.id}`),
          fetch(`/api/courses?role=LECTURER&userId=${currentUser.id}`),
          fetch(`/api/assignments?role=LECTURER&userId=${currentUser.id}`),
        ]);
        setGroups(await gRes.json());
        const cData = await cRes.json();
        setCourses(cData);
        setAssignments(await aRes.json());

        if (cData.length > 0) setCourseId(cData[0].id);
      } else {
        const gRes = await fetch(`/api/groups?studentId=${currentUser.id}`);
        setGroups(await gRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (sid: string) => {
    if (selectedStudentIds.includes(sid)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== sid));
    } else {
      setSelectedStudentIds([...selectedStudentIds, sid]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !courseId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          assignmentId: assignmentId || null,
          name: groupName,
          studentIds: selectedStudentIds,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setGroupName('');
        setSelectedStudentIds([]);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLecturer = currentUser.role === 'LECTURER';
  const studentsList = DEMO_USERS.filter((u) => u.role === 'STUDENT');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-pmu-600 dark:text-pmu-400" />
            {t('groupsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLecturer
              ? t('groupsSubtitleLecturer')
              : t('groupsSubtitleStudent')}
          </p>
        </div>

        {isLecturer && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pmu-600/30 transition-all shrink-0 min-h-[44px] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('createGroup')}
          </button>
        )}
      </div>

      {/* Groups Display */}
      {groups.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            {t('noGroupAssigned')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isLecturer
              ? t('noGroupsDescLecturer')
              : t('noGroupsDescStudent')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pmu-500/40 transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-mono font-bold text-xs">
                    {group.course?.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1 truncate group-hover:text-pmu-600 dark:group-hover:text-pmu-400 transition-colors">
                    {group.name}
                  </h3>
                  {group.assignment && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-pmu-600 dark:text-pmu-400 shrink-0" />
                      <span>{t('assignments')}: <strong>{group.assignment.title}</strong></span>
                    </p>
                  )}
                </div>

                <div className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-mono font-bold text-xs shrink-0 shadow-xs">
                  {group.members?.length || 0} {t('membersCount')}
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('groupMembers')} ({group.members?.length || 0})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.members?.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5"
                    >
                      <img
                        src={m.student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                        alt={m.student?.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-pmu-500/40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {m.student?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {m.student?.codeNo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Group (Lecturer) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('createGroup')}
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('course')}
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pmu-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('relatedAssignmentOptional')}
            </label>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pmu-500"
            >
              <option value="">{t('noAssignmentGeneral')}</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('groupName')}
            </label>
            <input
              type="text"
              required
              placeholder={t('groupNamePlaceholder')}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pmu-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('selectStudentsForGroup')}
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
              {studentsList.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <label
                    key={st.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-700 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentToggle(st.id)}
                        className="rounded text-pmu-600 focus:ring-pmu-500"
                      />
                      <span className="text-xs font-medium">{st.name} ({st.codeNo})</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-pmu-600 hover:bg-pmu-700 text-white font-bold text-xs shadow-md shadow-pmu-600/25 min-h-[44px] active:scale-95"
            >
              {submitting ? t('creatingGroup') : t('createGroup')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
