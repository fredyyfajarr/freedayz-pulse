import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import { Suspense } from 'react';
import { ThemeProvider, Theme } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SidebarProvider } from '@/context/SidebarContext';
import AppLayoutClient from '@/components/layout/AppLayoutClient';
import { Language } from '@/context/translations';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Freedayzz Pulse',
  description: 'Running Analytics & Telemetry Lab',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawTheme = cookieStore.get('freedayzz_theme')?.value;
  const initialTheme: Theme = rawTheme === 'light' ? 'light' : 'dark';
  const rawLang = cookieStore.get('freedayzz_lang')?.value;
  const initialLang: Language = rawLang === 'ID' ? 'ID' : 'EN';
  const rawSidebar = cookieStore.get('freedayzz_sidebar')?.value;
  const initialSidebarOpen: boolean = rawSidebar !== 'false';

  return (
    <html 
      lang={initialLang.toLowerCase()} 
      suppressHydrationWarning 
      className={`${geistSans.variable} ${geistMono.variable} h-full ${initialTheme}`}
      data-theme={initialTheme}
    >
      <body className="min-h-full flex flex-col bg-[#f6f8fc] dark:bg-[#06070d] text-slate-900 dark:text-zinc-100 antialiased selection:bg-violet-700 selection:text-white transition-colors duration-200">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('freedayzz_theme') || '${initialTheme}';
                var root = document.documentElement;
                if (t === 'light') {
                  root.classList.remove('dark');
                  root.classList.add('light');
                  root.setAttribute('data-theme', 'light');
                } else {
                  root.classList.remove('light');
                  root.classList.add('dark');
                  root.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
        <ThemeProvider initialTheme={initialTheme}>
          <LanguageProvider initialLanguage={initialLang}>
            <SidebarProvider initialDesktopOpen={initialSidebarOpen}>
              <Suspense fallback={<div className="min-h-screen bg-[#f6f8fc] dark:bg-[#06070d]" />}>
                <AppLayoutClient>{children}</AppLayoutClient>
              </Suspense>
            </SidebarProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
