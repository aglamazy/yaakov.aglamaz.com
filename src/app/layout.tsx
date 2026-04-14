import './globals.css';
import I18nProvider from '../components/I18nProvider';
import I18nGate from '../components/I18nGate';
import { fetchSiteInfo } from '../firebase/admin';
import type { Metadata } from 'next';

const GOOGLE_VERIFICATION = (process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '').trim();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteInfo = await fetchSiteInfo();
    const siteName = (siteInfo as any)?.name || 'Portfolio';
    const description = `${siteName} — personal portfolio and professional profile`;
    return {
      metadataBase: new URL(BASE_URL),
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description,
      icons: {
        icon: '/favicon.svg',
      },
      ...(GOOGLE_VERIFICATION ? { verification: { google: GOOGLE_VERIFICATION } } : {}),
      openGraph: {
        type: 'website',
        siteName,
        title: siteName,
        description,
        url: BASE_URL,
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
      alternates: {
        canonical: '/he',
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      metadataBase: new URL(BASE_URL),
      title: 'Portfolio',
      description: 'Personal portfolio and professional profile',
      icons: { icon: '/favicon.svg' },
      ...(GOOGLE_VERIFICATION ? { verification: { google: GOOGLE_VERIFICATION } } : {}),
      alternates: { canonical: '/he' },
      openGraph: {
        type: 'website',
        title: 'Portfolio',
        description: 'Personal portfolio and professional profile',
        url: BASE_URL,
        images: [
          {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: 'Portfolio',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Portfolio',
        description: 'Personal portfolio and professional profile',
        images: [`${BASE_URL}/og-image.png`],
      },
    };
  }
}

// Revalidate every hour for fresh Firebase data (ISR).
// Previously headers() forced all routes dynamic, blocking pre-rendering.
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: siteInfo injection moved to section-specific layouts (/admin, /[locale])
  // where locale context is available for proper localization

  const siteInfo = await fetchSiteInfo().catch(() => null);
  const siteName = (siteInfo as any)?.name || 'Portfolio';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: BASE_URL,
    inLanguage: ['he', 'en', 'tr', 'ar'],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    sameAs: [],
  };

  return (
    <html dir="auto" lang="he">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
