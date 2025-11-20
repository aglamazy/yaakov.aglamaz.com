import type { Resource } from 'i18next';
import nextI18NextConfig from '../next-i18next.config.js';
import enCommon from '../public/locales/en/common.json';
import heCommon from '../public/locales/he/common.json';
import trCommon from '../public/locales/tr/common.json';
import arCommon from '../public/locales/ar/common.json';

export const SUPPORTED_LOCALES = nextI18NextConfig?.i18n?.locales ?? ['he', 'en', 'tr', 'ar'];

export const DEFAULT_LOCALE = nextI18NextConfig?.i18n?.defaultLocale ?? 'he';

export const DEFAULT_RESOURCES: Resource = {
  en: { common: enCommon },
  he: { common: heCommon },
  tr: { common: trCommon },
  ar: { common: arCommon },
};
