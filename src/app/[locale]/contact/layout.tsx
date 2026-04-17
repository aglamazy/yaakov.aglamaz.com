import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { fetchSiteInfo } from '@/firebase/admin';

// Allow ISR: pre-render at build time, revalidate every hour.
// Without this, fetchSiteInfo() can trigger dynamic rendering, blocking Google.
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

const CONTACT_TITLES: Record<string, string> = {
  he: 'צור קשר',
  en: 'Contact',
  tr: 'İletişim',
  ar: 'اتصل بنا',
};

const CONTACT_DESCRIPTIONS: Record<string, string> = {
  he: 'צור קשר — שלח הודעה או מצא את פרטי ההתקשרות שלנו.',
  en: 'Contact — send a message or find our contact details.',
  tr: 'İletişim — mesaj gönderin veya iletişim bilgilerimizi bulun.',
  ar: 'اتصل بنا — أرسل رسالة أو ابحث عن تفاصيل الاتصال الخاصة بنا.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const title = CONTACT_TITLES[resolvedLocale] || CONTACT_TITLES.en;
  const description = CONTACT_DESCRIPTIONS[resolvedLocale] || CONTACT_DESCRIPTIONS.en;
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}/contact`;
  }
  languages['x-default'] = `${BASE_URL}/he/contact`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: `/${resolvedLocale}/contact`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${resolvedLocale}/contact`,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function ContactLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const siteInfo = await fetchSiteInfo().catch(() => null);
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
        name: resolvedLocale.toUpperCase(),
        item: `${BASE_URL}/${resolvedLocale}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: CONTACT_TITLES[resolvedLocale] || CONTACT_TITLES.en,
        item: `${BASE_URL}/${resolvedLocale}/contact`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
