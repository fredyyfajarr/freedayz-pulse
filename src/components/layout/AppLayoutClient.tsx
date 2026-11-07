'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDesktopOpen } = useSidebar();
  const pathname = usePathname();

  // Public / standalone flows (Landing, Auth, Onboarding) don't use internal athlete dashboard sidebar
  const isStandalonePage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/onboarding';

  if (isStandalonePage) {
    return (
      <div className="min-h-full flex flex-col w-full">
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col md:flex-row relative">
      {/* Sidebar (Desktop Collapsible Rail/Expanded + Mobile Header & Drawer) */}
      <Sidebar />

      {/* Main Content Area with Clean Dynamic Padding (Zero Floating Overlays) */}
      <div 
        suppressHydrationWarning
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isDesktopOpen ? 'md:pl-72' : 'md:pl-16'
        }`}
      >
        <main className="flex-1 pb-24 md:pb-16 pt-0 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
