import './globals.css';
import I18nProvider from '../components/I18nProvider';
import I18nGate from '../components/I18nGate';
import { fetchSiteInfo } from '../firebase/admin';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

const GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || '';
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteInfo = await fetchSiteInfo();
    const siteName = (siteInfo as any).name;
    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      icons: {
        icon: '/favicon.svg',
      },
      verification: {
        google: GOOGLE_VERIFICATION,
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

  return (
    <html dir={dir} lang={locale}>
      <body>
        {children}
      </body>
    </html>
  );
}
