import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import PublicLayoutShell from '@/components/PublicLayoutShell';
import I18nProvider from '@/components/I18nProvider';
import I18nGate from '@/components/I18nGate';
import { fetchSiteInfo } from '@/firebase/admin';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { assertSerializableDev } from '@/utils/assertSerializableDev';
import { headers } from 'next/headers';
import { findBestMatchingTag, parseAcceptLanguage } from '@/utils/locale';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

const LOCALE_TO_OG: Record<string, string> = {
  he: 'he_IL',
  en: 'en_US',
  tr: 'tr_TR',
  ar: 'ar_SA',
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const siteInfo = await fetchSiteInfo().catch(() => null);
  const siteName = (siteInfo as any)?.name || 'Portfolio';
  const description = `${siteName} — personal portfolio and professional profile`;
  const pageUrl = `${BASE_URL}/${resolvedLocale}`;

  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}`;
  }
  languages['x-default'] = `${BASE_URL}/`;

  return {
    description,
    alternates: {
      canonical: `/${resolvedLocale}`,
      languages,
    },
    openGraph: {
      title: siteName,
      description,
      url: pageUrl,
      locale: LOCALE_TO_OG[resolvedLocale] || resolvedLocale,
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== resolvedLocale).map(
        (l) => LOCALE_TO_OG[l] || l,
      ),
    },
  };
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
