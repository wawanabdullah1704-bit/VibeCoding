import './globals.css';
import React from 'react';
import type { Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'CIDOS PMU 2.0 - Portal Pembelajaran Politeknik Mukah',
  description: 'Sistem Pengurusan Pembelajaran (LMS) CIDOS PMU 2.0 untuk Pelajar & Pensyarah Politeknik Mukah.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} font-sans touch-pan-y bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 min-h-screen antialiased`}>
        <AppProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 max-w-6xl mx-auto w-full overflow-y-auto pb-24 md:pb-8">
                {children}
              </main>
            </div>
            <MobileBottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
