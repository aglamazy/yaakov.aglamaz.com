import { permanentRedirect } from 'next/navigation';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  permanentRedirect(`/${resolvedLocale}#contact`);
}
