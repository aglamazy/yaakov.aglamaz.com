import type { Metadata } from 'next';
import Link from 'next/link';
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

const backLabelByLocale: Record<string, string> = {
  he: 'חזרה לאתר',
  en: 'Back to site',
  tr: 'Siteye dön',
  ar: 'العودة إلى الموقع',
};

const contactLabelByLocale: Record<string, string> = {
  he: 'צור קשר',
  en: 'Contact',
  tr: 'İletişim',
  ar: 'اتصل بنا',
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const lang = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const content = (() => {
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
  })();

  return (
    <>
      {content}
      <nav style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
        <Link href={`/${lang}`} style={{ textDecoration: 'underline' }}>
          ← {backLabelByLocale[lang] || backLabelByLocale.en}
        </Link>
        {' · '}
        <Link href={`/${lang}/contact`} style={{ textDecoration: 'underline' }}>
          {contactLabelByLocale[lang] || contactLabelByLocale.en}
        </Link>
        {' · '}
        {SUPPORTED_LOCALES.filter(l => l !== lang).map((loc, i) => (
          <span key={loc}>
            {i > 0 && ' · '}
            <Link href={`/${loc}/terms`}>{loc.toUpperCase()}</Link>
          </span>
        ))}
      </nav>
    </>
  );
}
