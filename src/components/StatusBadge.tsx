'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, Award, AlertCircle, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { t } = useApp();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  switch (status) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-sm ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {t('statusApproved')}
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shadow-sm ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {t('statusPending')}
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 line-through ${sizeClasses}`}>
          <XCircle className="w-3 h-3" />
          {t('statusRejected')}
        </span>
      );
    case 'GRADED':
      return (
        <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-sm ${sizeClasses}`}>
          <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          {t('statusGraded')}
        </span>
      );
    case 'PENDING_GRADE':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shadow-sm ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {t('statusPendingGrade')}
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 shadow-sm ${sizeClasses}`}>
          <Send className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          {t('statusSubmitted')}
        </span>
      );
    case 'OVERDUE':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shadow-sm ${sizeClasses}`}>
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {t('statusOverdue')}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
