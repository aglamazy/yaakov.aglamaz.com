'use client';

import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface LocaleProviderProps {
  locale: string;
  children: React.ReactNode;
}

const RTL_LANGUAGES = ['he', 'ar'];

export default function LocaleProvider({ locale, children }: LocaleProviderProps) {
  useEffect(() => {
    // Change i18n language when locale changes
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch((error) => {
        console.error('Failed to change language:', error);
      });
    }

    // Update HTML attributes
    const htmlElement = document.documentElement;
    const isRTL = RTL_LANGUAGES.includes(locale);

    htmlElement.lang = locale;
    htmlElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
