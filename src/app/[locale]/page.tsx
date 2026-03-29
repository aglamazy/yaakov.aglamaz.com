import type { Metadata } from 'next';
import PublicPage from './components/PublicPage/PublicPage';
import { fetchStaffProfile, fetchSiteInfo } from '@/firebase/admin';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

export async function generateMetadata(): Promise<Metadata> {
  const [staff, siteInfo] = await Promise.all([
    fetchStaffProfile().catch(() => null),
    fetchSiteInfo().catch(() => null),
  ]);
  const name = staff?.name || (siteInfo as any)?.name || 'Portfolio';
  const position = staff?.position || '';
  const description = position
    ? `${name} — ${position}. View portfolio, skills, and projects.`
    : `${name} — personal portfolio. View skills, projects, and get in touch.`;
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
    },
  };
}

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const staff = await fetchStaffProfile();

  const heroTitle = staff?.name ?? 'name';
  const heroSubtitle = staff?.position ?? 'position';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: heroTitle,
    description: heroSubtitle,
    url: `${BASE_URL}/${resolvedLocale}`,
    inLanguage: resolvedLocale,
    mainEntity: {
      '@type': 'Person',
      name: heroTitle,
      jobTitle: heroSubtitle,
      url: `${BASE_URL}/${resolvedLocale}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicPage heroTitle={heroTitle} heroSubtitle={heroSubtitle} />
    </>
  );
}
