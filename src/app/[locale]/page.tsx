import type { Metadata } from 'next';
import Link from 'next/link';
import PublicPage from './components/PublicPage/PublicPage';
import { fetchStaffProfile, fetchSiteInfo } from '@/firebase/admin';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, DEFAULT_RESOURCES } from '@/i18n';

// Allow ISR: pre-render at build time, revalidate every hour for fresh Firebase data.
// force-dynamic was preventing pre-rendering, which made pages invisible to Google.
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const [staff, siteInfo] = await Promise.all([
    fetchStaffProfile().catch(() => null),
    fetchSiteInfo().catch(() => null),
  ]);
  const name = staff?.name || (siteInfo as any)?.name || 'Portfolio';
  const position = staff?.position || '';

  const descTemplates: Record<string, { withPos: string; withoutPos: string }> = {
    he: {
      withPos: `${name} — ${position}. צפו בתיק עבודות, כישורים ופרויקטים.`,
      withoutPos: `${name} — תיק עבודות אישי. צפו בכישורים, פרויקטים וצרו קשר.`,
    },
    en: {
      withPos: `${name} — ${position}. View portfolio, skills, and projects.`,
      withoutPos: `${name} — personal portfolio. View skills, projects, and get in touch.`,
    },
    tr: {
      withPos: `${name} — ${position}. Portföyü, yetenekleri ve projeleri görüntüleyin.`,
      withoutPos: `${name} — kişisel portföy. Yetenekleri, projeleri görüntüleyin ve iletişime geçin.`,
    },
    ar: {
      withPos: `${name} — ${position}. عرض الملف الشخصي والمهارات والمشاريع.`,
      withoutPos: `${name} — ملف شخصي. عرض المهارات والمشاريع والتواصل.`,
    },
  };
  const tpl = descTemplates[resolvedLocale] || descTemplates.en;
  const description = position ? tpl.withPos : tpl.withoutPos;

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

function getTranslation(locale: string, key: string): unknown {
  const resource = (DEFAULT_RESOURCES[locale]?.common ?? DEFAULT_RESOURCES['en']?.common ?? {}) as Record<string, unknown>;
  const parts = key.split('.');
  let current: unknown = resource;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return current;
}

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const staff = await fetchStaffProfile().catch(() => null);

  const heroTitle = staff?.name ?? 'name';
  const heroSubtitle = staff?.position ?? 'position';

  // Pre-resolve translations server-side so content is in initial HTML for crawlers
  const t = (key: string) => {
    const val = getTranslation(resolvedLocale, key);
    return typeof val === 'string' ? val : key;
  };
  const serverTranslations = {
    aboutTitle: t('publicPortfolio.aboutTitle'),
    aboutBody: t('publicPortfolio.aboutBody'),
    skillsTitle: t('publicPortfolio.skillsTitle'),
    skillsBody: t('publicPortfolio.skillsBody'),
    projectsTitle: t('publicPortfolio.projectsTitle'),
    projectsBody: t('publicPortfolio.projectsBody'),
    contactTitle: t('publicPortfolio.contactTitle'),
    contactBody: t('publicPortfolio.contactBody'),
    heroCta: t('publicPortfolio.heroCta'),
    contactCta: t('publicPortfolio.contactCta'),
    skillsList: getTranslation(resolvedLocale, 'publicPortfolio.skillsList') as string[],
    projectsList: getTranslation(resolvedLocale, 'publicPortfolio.projectsList') as Array<{ title: string; summary: string }>,
  };

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
      <PublicPage heroTitle={heroTitle} heroSubtitle={heroSubtitle} serverTranslations={serverTranslations} />
      <footer style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
        <Link href={`/${resolvedLocale}/contact`} style={{ textDecoration: 'underline' }}>
          {t('publicPortfolio.contactTitle')}
        </Link>
        {' · '}
        <Link href={`/${resolvedLocale}/terms`} style={{ textDecoration: 'underline' }}>
          {getTranslation(resolvedLocale, 'termsAndConditions') as string || 'Terms & Conditions'}
        </Link>
        {' · '}
        {SUPPORTED_LOCALES.filter(l => l !== resolvedLocale).map((loc, i) => (
          <span key={loc}>
            {i > 0 && ' · '}
            <Link href={`/${loc}`}>{loc.toUpperCase()}</Link>
          </span>
        ))}
      </footer>
    </>
  );
}
