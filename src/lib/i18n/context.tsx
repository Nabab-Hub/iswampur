'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SupportedLanguage, BilingualText } from '@/types';
import { bn } from '@/messages/bn';
import { en } from '@/messages/en';

interface LanguageContextType {
  lang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: typeof bn;
  resolveBilingual: (text?: BilingualText | null) => string;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>('bn');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('iswampur_lang') as SupportedLanguage;
      if (savedLang === 'en' || savedLang === 'bn') {
        setLangState(savedLang);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem('iswampur_lang', newLang);
      document.cookie = `iswampur_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }

    // Refresh server components so server-rendered parts update immediately
    startTransition(() => {
      router.refresh();
    });
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
  };

  const resolveBilingual = (text?: BilingualText | null): string => {
    if (!text) return '';
    if (lang === 'en') {
      if (text.en && text.en.trim() !== '') return text.en;
      return text.bn || '';
    }
    return text.bn || text.en || '';
  };

  const dictionary = lang === 'en' ? en : bn;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        toggleLanguage,
        t: dictionary,
        resolveBilingual,
        isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
