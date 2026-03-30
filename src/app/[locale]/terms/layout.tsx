import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { fetchSiteInfo } from '@/firebase/admin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

const TERMS_TITLES: Record<string, string> = {
  he: 'תנאי שימוש',
  en: 'Terms and Conditions',
  tr: 'Kullanım Koşulları',
  ar: 'الشروط والأحكام',
};

const TERMS_DESCRIPTIONS: Record<string, string> = {
  he: 'תנאי שימוש באתר — קרא את התנאים וההגבלות לשימוש באתר זה.',
  en: 'Terms and conditions of use — read the terms and conditions for using this website.',
  tr: 'Kullanım koşulları — bu web sitesini kullanım şartlarını ve koşullarını okuyun.',
  ar: 'شروط وأحكام الاستخدام — اقرأ الشروط والأحكام لاستخدام هذا الموقع.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const title = TERMS_TITLES[resolvedLocale] || TERMS_TITLES.en;
  const description = TERMS_DESCRIPTIONS[resolvedLocale] || TERMS_DESCRIPTIONS.en;
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}/terms`;
  }
  languages['x-default'] = `${BASE_URL}/he/terms`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${resolvedLocale}/terms`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${resolvedLocale}/terms`,
    },
  };
}

export default async function TermsLayout({ children }: { children: ReactNode }) {
  const siteInfo = await fetchSiteInfo().catch(() => null);
  const siteName = (siteInfo as any)?.name || 'Portfolio';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms and Conditions',
    description: 'Terms and conditions of use for this website.',
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
