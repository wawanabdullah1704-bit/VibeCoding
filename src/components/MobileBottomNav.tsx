'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useApp();

  const navItems = [
    { href: '/', label: t('home'), icon: LayoutDashboard },
    { href: '/courses', label: t('courses'), icon: BookOpen },
    { href: '/groups', label: t('groups'), icon: Users },
    { href: '/grades', label: t('grades'), icon: Award },
  ];

  return (
    <nav 
      aria-label="Navigasi Mudah Alih"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-surface border-t border-slate-200/80 dark:border-slate-800 shadow-xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.25rem)' }}
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all select-none relative group min-h-[44px] ${
                isActive
                  ? 'text-pmu-600 dark:text-pmu-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-10 h-1 rounded-b-full bg-pmu-600 dark:bg-pmu-400 shadow-sm shadow-pmu-600/50" />
              )}
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-pmu-50 dark:bg-pmu-950/50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className={`text-[11px] tracking-tight truncate max-w-[64px] ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
