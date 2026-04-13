import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import PublicLayoutShell from '@/components/PublicLayoutShell';
import I18nProvider from '@/components/I18nProvider';
import I18nGate from '@/components/I18nGate';
import { fetchSiteInfo } from '@/firebase/admin';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { assertSerializableDev } from '@/utils/assertSerializableDev';

// Allow ISR: pre-render at build time, revalidate every hour for fresh Firebase data.
// force-dynamic was preventing pre-rendering, which made pages invisible to Google.
export const revalidate = 3600;

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
  const descriptionByLocale: Record<string, string> = {
    he: `${siteName} — תיק עבודות אישי ופרופיל מקצועי`,
    en: `${siteName} — personal portfolio and professional profile`,
    tr: `${siteName} — kişisel portföy ve profesyonel profil`,
    ar: `${siteName} — ملف شخصي وسيرة مهنية`,
  };
  const description = descriptionByLocale[resolvedLocale] || descriptionByLocale.en;
  const pageUrl = `${BASE_URL}/${resolvedLocale}`;

  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}`;
  }
  languages['x-default'] = `${BASE_URL}/he`;

  return {
    description,
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
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
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [`${BASE_URL}/og-image.png`],
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
  // Use URL locale directly — accept-language negotiation via headers() forced
  // dynamic rendering which prevented pre-rendering and hurt Google indexing.
  const resolvedLocale = locale;

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

  const siteName = (siteInfo as any)?.name || 'Portfolio';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: siteName,
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale.toUpperCase(),
        item: `${BASE_URL}/${locale}`,
      },
    ],
  };

  return (
    <I18nProvider initialLocale={locale}>
      <I18nGate>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <PublicLayoutShell siteInfo={siteInfo} locale={locale} resolvedLocale={resolvedLocale}>
          {children}
        </PublicLayoutShell>
      </I18nGate>
    </I18nProvider>
  );
}
