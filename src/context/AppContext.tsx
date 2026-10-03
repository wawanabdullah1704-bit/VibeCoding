'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  codeNo: string;
  role: 'STUDENT' | 'LECTURER';
  department: string;
  avatar: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'student-hafiz',
    name: 'Ahmad Hafiz Bin Rizwan',
    email: 'hafiz.20dit22f1001@student.pmu.edu.my',
    codeNo: '20DIT22F1001',
    role: 'STUDENT',
    department: 'JTMK - Diploma Teknologi Maklumat (Software)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'student-aina',
    name: 'Nur Aina Binti Zulkifli',
    email: 'aina.20dit22f1002@student.pmu.edu.my',
    codeNo: '20DIT22F1002',
    role: 'STUDENT',
    department: 'JTMK - Diploma Teknologi Maklumat (Software)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'lecturer-azman',
    name: 'Dr. Azman Bin Rosli',
    email: 'azman@pmu.edu.my',
    codeNo: 'PMU-LECT-0101',
    role: 'LECTURER',
    department: 'JTMK - Jabatan Teknologi Maklumat & Komunikasi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'lecturer-norazlina',
    name: 'Pn. Norazlina Binti Hassan',
    email: 'norazlina@pmu.edu.my',
    codeNo: 'PMU-LECT-0102',
    role: 'LECTURER',
    department: 'JTMK - Jabatan Teknologi Maklumat & Komunikasi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.BM) => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default Hafiz
  const [language, setLanguage] = useState<Language>('BM');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const t = (key: keyof typeof translations.BM): string => {
    return translations[language][key] || translations['BM'][key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
