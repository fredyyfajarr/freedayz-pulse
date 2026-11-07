'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, TranslationKey, Language } from './translations';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const defaultContext: LanguageContextType = {
  language: 'EN',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey) => translations.EN[key] || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ 
  children,
  initialLanguage = 'EN'
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('freedayzz_lang') as Language) || initialLanguage;
      if (saved === 'EN' || saved === 'ID') {
        setLanguageState(saved);
        document.cookie = `freedayzz_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('freedayzz_lang', lang);
      document.cookie = `freedayzz_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    const next: Language = language === 'EN' ? 'ID' : 'EN';
    setLanguage(next);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[language];
    if (dict && key in dict) {
      return (dict as any)[key];
    }
    return (translations.EN as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext) || defaultContext;
}
