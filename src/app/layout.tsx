import './globals.css';
import I18nProvider from '../components/I18nProvider';
import I18nGate from '../components/I18nGate';
import { fetchSiteInfo } from '../firebase/admin';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

const GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
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
      verification: {
        google: GOOGLE_VERIFICATION,
      },
      openGraph: {
        type: 'website',
        siteName,
        title: siteName,
        description,
        url: BASE_URL,
      },
      alternates: {
        canonical: '/he',
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    throw error;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: siteInfo injection moved to section-specific layouts (/admin, /[locale])
  // where locale context is available for proper localization

  // Get locale from proxy header
  const headerStore = await headers();
  const locale = headerStore.get('x-locale') || 'he';

  // Set RTL direction for Hebrew and Arabic
  const rtlLocales = ['he', 'ar'];
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  const siteInfo = await fetchSiteInfo().catch(() => null);
  const siteName = (siteInfo as any)?.name || 'Portfolio';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: BASE_URL,
    inLanguage: ['he', 'en', 'tr', 'ar'],
  };

  return (
    <html dir={dir} lang={locale}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
