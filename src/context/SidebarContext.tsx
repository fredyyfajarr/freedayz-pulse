'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface SidebarContextType {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  closeMobile: () => void;
  openMobile: () => void;
  setDesktopOpen: (open: boolean) => void;
  mounted: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ 
  children,
  initialDesktopOpen = true,
}: { 
  children: React.ReactNode;
  initialDesktopOpen?: boolean;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(initialDesktopOpen);
  const [mounted, setMounted] = useState(false);

  // Restore desktop preference on client mount safely
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('freedayzz_sidebar');
      if (saved !== null) {
        const val = saved === 'true';
        setIsDesktopOpen(val);
        document.cookie = `freedayzz_sidebar=${val}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleMobile = useCallback(() => setIsMobileOpen(prev => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const openMobile = useCallback(() => setIsMobileOpen(true), []);

  const toggleDesktop = useCallback(() => {
    setIsDesktopOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('freedayzz_sidebar', String(next));
        document.cookie = `freedayzz_sidebar=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const setDesktopOpen = useCallback((open: boolean) => {
    setIsDesktopOpen(open);
    try {
      localStorage.setItem('freedayzz_sidebar', String(open));
      document.cookie = `freedayzz_sidebar=${open}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      isMobileOpen,
      isDesktopOpen,
      toggleMobile,
      toggleDesktop,
      closeMobile,
      openMobile,
      setDesktopOpen,
      mounted,
    }),
    [isMobileOpen, isDesktopOpen, toggleMobile, toggleDesktop, closeMobile, openMobile, setDesktopOpen, mounted]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
