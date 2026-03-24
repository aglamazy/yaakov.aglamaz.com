import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const description = 'Terms and conditions of use for this website.';
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}/terms`;
  }

  return {
    title: 'Terms and Conditions',
    description,
    alternates: {
      canonical: `/${resolvedLocale}/terms`,
      languages,
    },
    openGraph: {
      title: 'Terms and Conditions',
      description,
      url: `${BASE_URL}/${resolvedLocale}/terms`,
    },
  };
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
