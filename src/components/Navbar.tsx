'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp, DEMO_USERS } from '@/context/AppContext';
import { 
  GraduationCap, 
  Moon, 
  Sun, 
  Globe, 
  Menu, 
  X,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Users,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, setCurrentUser, language, setLanguage, t, isDarkMode, toggleDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { href: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { href: '/courses', label: t('navCourses'), icon: BookOpen },
    { href: '/groups', label: t('navGroups'), icon: Users },
    { href: '/grades', label: t('navGrades'), icon: Award },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 glass-surface border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
        {/* Role Demo Strip (Simple & Mobile Friendly) */}
        <div className="bg-slate-900 text-white px-3 sm:px-4 py-1.5 text-xs border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-pmu-400 animate-pulse" />
              <span>DEMO:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none no-scrollbar">
              {DEMO_USERS.map((user) => {
                const isActive = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => setCurrentUser(user)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-pmu-600 text-white font-bold shadow-sm shadow-pmu-600/50 ring-1 ring-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {user.name.split(' ')[0]} ({user.role === 'LECTURER' ? t('roleLecturer') : t('roleStudent')})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo & Hamburger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden active:scale-95"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pmu-700 via-pmu-600 to-sky-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-pmu-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  CIDOS <span className="text-pmu-600 dark:text-pmu-400 font-extrabold">PMU</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Politeknik Mukah Sarawak
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Header Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'BM' ? 'EN' : 'BM')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Tukar Bahasa"
            >
              {language}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              aria-label="Tukar tema gelap/terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Mini Avatar & Name */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-pmu-600/30"
              />
              <div className="hidden lg:block text-left">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-pmu-600 dark:text-pmu-400 font-semibold uppercase tracking-wider">
                  {currentUser.role === 'LECTURER' ? 'Pensyarah' : 'Pelajar'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 animate-fade-in">
          {/* Drawer Header */}
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pmu-600 text-white flex items-center justify-center font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">Menu CIDOS PMU</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info card in drawer */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-pmu-600"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {currentUser.codeNo} • <span className="font-semibold text-pmu-600 dark:text-pmu-400">{currentUser.role === 'LECTURER' ? t('roleLecturer') : t('roleStudent')}</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-pmu-600 text-white shadow-md shadow-pmu-600/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
