import type { ReactNode } from 'react';
import PublicLayoutShell from '@/components/PublicLayoutShell';
import I18nProvider from '@/components/I18nProvider';
import I18nGate from '@/components/I18nGate';
import { fetchSiteInfo } from '@/firebase/admin';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { assertSerializableDev } from '@/utils/assertSerializableDev';
import { headers } from 'next/headers';
import { findBestMatchingTag, parseAcceptLanguage } from '@/utils/locale';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: paramsLocale } = await params;
  const locale = SUPPORTED_LOCALES.includes(paramsLocale) ? paramsLocale : DEFAULT_LOCALE;
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('accept-language');
  const preferences = parseAcceptLanguage(acceptLanguage);
  const resolvedLocale = findBestMatchingTag(preferences, locale) ?? locale;

  let siteInfo = null;
  try {
    siteInfo = await fetchSiteInfo();
    if (process.env.NODE_ENV !== 'production' && siteInfo) {
      assertSerializableDev(siteInfo, 'siteInfo');
    }
  } catch (error) {
    console.error('Failed to fetch site info:', error);
    // Don't throw - allow page to render without Firebase data
  }

  return (
    <I18nProvider initialLocale={locale}>
      <I18nGate>
        <PublicLayoutShell siteInfo={siteInfo} locale={locale} resolvedLocale={resolvedLocale}>
          {children}
        </PublicLayoutShell>
      </I18nGate>
    </I18nProvider>
  );
}
