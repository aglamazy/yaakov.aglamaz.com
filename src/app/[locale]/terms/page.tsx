import TermsEn from '@/components/legal/TermsContent.en';
import TermsHe from '@/components/legal/TermsContent.he';
import TermsTr from '@/components/legal/TermsContent.tr';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';

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
    case 'en':
    default:
      return <TermsEn />;
  }
}
