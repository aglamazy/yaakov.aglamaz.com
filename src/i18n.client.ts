'use client';
import { createInstance, type i18n as I18nType, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import nextI18NextConfig from '../next-i18next.config.js';
import { DEFAULT_LOCALE, DEFAULT_RESOURCES } from './i18n';
import { clientTranslationService } from './services/ClientTranslationService';
import { expandCamelCaseWithExceptions } from './utils/camelCaseExpander';

interface CreateI18nOptions {
  locale: string;
  resources?: Resource;
}

export function createI18nInstance({ locale, resources }: CreateI18nOptions): I18nType {
  const instance = createInstance();
  instance.use(initReactI18next);

  // Never fallback to DEFAULT_LOCALE (Hebrew) - use parseMissingKeyHandler instead
  // This ensures camelCase expansion works for missing keys in all locales
  const fallbackLng = false;

  instance.init({
    ...nextI18NextConfig.i18n,
    lng: locale,
    fallbackLng,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    resources: resources ?? DEFAULT_RESOURCES,
    initImmediate: false,
    // Return auto-expanded key as fallback
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      // For English, auto-expand immediately (synchronous)
      if (locale === 'en') {
        const expanded = expandCamelCaseWithExceptions(key);
        // Save to backend asynchronously
        if (typeof window !== 'undefined') {
          clientTranslationService.getTranslation(locale, key);
        }
        return expanded;
      }
      // For other languages, return expanded English as temporary fallback
      return expandCamelCaseWithExceptions(key);
    },
    // Custom backend using Firebase Storage
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      // Handle missing translations asynchronously (only in browser)
      if (typeof window === 'undefined') return;

      const targetLocale = Array.isArray(lngs) ? lngs[0] : lngs;
      console.log('[i18n.client missingKeyHandler] key:', key, 'lngs:', lngs, 'targetLocale:', targetLocale, 'current locale:', locale);

      clientTranslationService.getTranslation(targetLocale, key).then(translation => {
        // Add the translation to i18next resources
        instance.addResource(targetLocale, ns, key, translation);
        // Trigger re-render
        instance.emit('languageChanged', targetLocale);
      });
    },
  });

  // Preload translations from Firebase Storage (client-side only)
  if (typeof window !== 'undefined') {
    clientTranslationService.preload(locale).then(translations => {
      if (translations && typeof translations === 'object') {
        Object.entries(translations).forEach(([key, entry]) => {
          if (entry && entry.text) {
            instance.addResource(locale, 'common', key, entry.text);
          }
        });
      }
    }).catch(error => {
      console.error('[i18n] Failed to preload translations:', error);
    });
  }

  return instance;
}
