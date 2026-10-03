'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, currentUser } = useApp();

  const navItems = [
    { href: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { href: '/courses', label: t('navCourses'), icon: BookOpen },
    { href: '/groups', label: t('navGroups'), icon: Users },
    { href: '/grades', label: t('navGrades'), icon: Award },
  ];

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 flex flex-col justify-between hidden md:flex transition-colors min-h-[calc(100vh-3.5rem)] shadow-2xs">
      <div className="p-4 space-y-5">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shadow-xs">
          <div className="text-[10px] font-mono font-semibold uppercase text-pmu-600 dark:text-pmu-400 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pmu-600 dark:bg-pmu-400" />
            {currentUser.role === 'LECTURER' ? t('roleLecturer') : t('roleStudent')}
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
            {currentUser.name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {currentUser.codeNo}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <div className="px-2 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
            {t('mainMenu')}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-pmu-600 text-white shadow-md shadow-pmu-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 leading-tight">
          <p className="font-bold text-slate-800 dark:text-slate-200">{t('politeknikMukah')}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{t('systemTitle')}</p>
        </div>
      </div>
    </aside>
  );
}
