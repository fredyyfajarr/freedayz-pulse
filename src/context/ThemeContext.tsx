'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ 
  children,
  initialTheme = 'dark'
}: { 
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    let t: Theme = initialTheme;
    try {
      const saved = localStorage.getItem('freedayzz_theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        t = saved;
      }
    } catch {
      // Ignore
    }
    setThemeState(t);
    applyThemeClass(t);
    try {
      document.cookie = `freedayzz_theme=${t}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }
  }, [initialTheme]);

  const applyThemeClass = (t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('freedayzz_theme', t);
      document.cookie = `freedayzz_theme=${t}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }
    applyThemeClass(t);
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext) || defaultThemeContext;
}
