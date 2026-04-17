import Link from 'next/link';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, DEFAULT_RESOURCES } from '@/i18n';
import { fetchSiteInfo } from '@/firebase/admin';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

function getTranslation(locale: string, key: string): string {
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
  return typeof current === 'string' ? current : key;
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const siteInfo = await fetchSiteInfo().catch(() => null);
  const siteName = (siteInfo as any)?.name || 'Portfolio';

  const title = getTranslation(resolvedLocale, 'publicPortfolio.contactTitle');
  const body = getTranslation(resolvedLocale, 'publicPortfolio.contactBody');
  const cta = getTranslation(resolvedLocale, 'publicPortfolio.contactCta');
  const backLabel = getTranslation(resolvedLocale, 'publicPortfolio.aboutTitle');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: title,
    url: `${BASE_URL}/${resolvedLocale}/contact`,
    inLanguage: resolvedLocale,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ fontSize: '1.125rem', maxWidth: '40rem', marginBottom: '2rem', color: '#4b5563' }}>
          {body}
        </p>
        <a
          href={`/${resolvedLocale}#contact`}
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          {cta}
        </a>
        <nav style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <Link href={`/${resolvedLocale}`} style={{ textDecoration: 'underline' }}>
            ← {backLabel}
          </Link>
          {' · '}
          <Link href={`/${resolvedLocale}/terms`} style={{ textDecoration: 'underline' }}>
            {getTranslation(resolvedLocale, 'termsAndConditions') || 'Terms'}
          </Link>
          {' · '}
          {SUPPORTED_LOCALES.filter(l => l !== resolvedLocale).map((loc, i) => (
            <span key={loc}>
              {i > 0 && ' · '}
              <Link href={`/${loc}/contact`}>{loc.toUpperCase()}</Link>
            </span>
          ))}
        </nav>
      </main>
    </>
  );
}
