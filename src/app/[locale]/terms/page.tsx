import Link from 'next/link';
import TermsEn from '@/components/legal/TermsContent.en';
import TermsHe from '@/components/legal/TermsContent.he';
import TermsTr from '@/components/legal/TermsContent.tr';
import TermsAr from '@/components/legal/TermsContent.ar';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';

export const revalidate = 3600;

// Metadata (title, description, robots, alternates, OG, Twitter) is defined
// in the sibling layout.tsx to avoid duplication and conflicting values.

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
