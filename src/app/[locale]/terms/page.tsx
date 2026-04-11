import type { Metadata } from 'next';
import TermsEn from '@/components/legal/TermsContent.en';
import TermsHe from '@/components/legal/TermsContent.he';
import TermsTr from '@/components/legal/TermsContent.tr';
import TermsAr from '@/components/legal/TermsContent.ar';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

const titleByLocale: Record<string, string> = {
  he: 'תנאי שימוש',
  en: 'Terms & Conditions',
  tr: 'Kullanım Koşulları',
  ar: 'الشروط والأحكام',
};

const descriptionByLocale: Record<string, string> = {
  he: 'תנאי השימוש ומדיניות הפרטיות של האתר',
  en: 'Website terms of use and privacy policy',
  tr: 'Web sitesi kullanım koşulları ve gizlilik politikası',
  ar: 'شروط استخدام الموقع وسياسة الخصوصية',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const title = titleByLocale[resolvedLocale] || titleByLocale.en;
  const description = descriptionByLocale[resolvedLocale] || descriptionByLocale.en;

  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}/terms`;
  }
  languages['x-default'] = `${BASE_URL}/he/terms`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${resolvedLocale}/terms`,
      languages,
    },
    robots: { index: true, follow: true },
  };
}

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const lang = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  switch (lang) {
    case 'he':
      return <TermsHe />;
    case 'tr':
      return <TermsTr />;
    case 'ar':
      return <TermsAr />;
    case 'en':
    default:
      return <TermsEn />;
  }
}
