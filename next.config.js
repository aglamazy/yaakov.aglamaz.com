/** @type {import('next').NextConfig} */
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com').replace(/\/+$/, '');
const LOCALES = ['he', 'en', 'tr', 'ar'];

// Build an RFC 5988 Link header value for hreflang alternates of a given page,
// e.g. for the homepage: <https://yaakov.aglamaz.com/he>; rel="alternate"; hreflang="he", ...
// Google supports this as an alternative to in-HTML <link rel="alternate"> tags
// and as the only mechanism for non-HTML resources.
function buildHreflangLinkHeader(pathForLocale) {
  const parts = LOCALES.map(
    (loc) => `<${BASE_URL}${pathForLocale(loc)}>; rel="alternate"; hreflang="${loc}"`,
  );
  parts.push(`<${BASE_URL}${pathForLocale('he')}>; rel="alternate"; hreflang="x-default"`);
  return parts.join(', ');
}

// RFC 5988 sitemap discovery link — gives crawlers an HTTP-level pointer to
// the sitemap that doesn't require parsing HTML or robots.txt.
const SITEMAP_LINK = `<${BASE_URL}/sitemap.xml>; rel="sitemap"; type="application/xml"`;

const nextConfig = {
  reactStrictMode: true,
  // Keep firebase-admin and its transitive dependencies as external (not bundled).
  // Turbopack only traces statically-imported files; firebase-admin loads many
  // sub-packages lazily via require(), so without this setting Vercel serverless
  // functions are missing those files at runtime → HTTP 500.
  serverExternalPackages: ['firebase-admin'],

  async headers() {
    // Per-locale Content-Language headers — search engines use this HTTP
    // signal alongside hreflang and html lang to identify page language.
    // Set per-locale here so it's reliable even when middleware doesn't run.
    const localeHeaders = (locale, hreflangLink) => [
      { key: 'X-Robots-Tag', value: 'index, follow' },
      { key: 'Vary', value: 'Accept-Language' },
      { key: 'Content-Language', value: locale },
      { key: 'Link', value: `${hreflangLink}, ${SITEMAP_LINK}` },
    ];

    const homeHreflang = buildHreflangLinkHeader((loc) => `/${loc}`);
    const termsHreflang = buildHreflangLinkHeader((loc) => `/${loc}/terms`);
    const contactHreflang = buildHreflangLinkHeader((loc) => `/${loc}/contact`);

    return [
      // Locale homepages: /he, /en, /tr, /ar
      { source: '/he', headers: localeHeaders('he', homeHreflang) },
      { source: '/en', headers: localeHeaders('en', homeHreflang) },
      { source: '/tr', headers: localeHeaders('tr', homeHreflang) },
      { source: '/ar', headers: localeHeaders('ar', homeHreflang) },
      // Terms pages
      { source: '/he/terms', headers: localeHeaders('he', termsHreflang) },
      { source: '/en/terms', headers: localeHeaders('en', termsHreflang) },
      { source: '/tr/terms', headers: localeHeaders('tr', termsHreflang) },
      { source: '/ar/terms', headers: localeHeaders('ar', termsHreflang) },
      // Contact pages
      { source: '/he/contact', headers: localeHeaders('he', contactHreflang) },
      { source: '/en/contact', headers: localeHeaders('en', contactHreflang) },
      { source: '/tr/contact', headers: localeHeaders('tr', contactHreflang) },
      { source: '/ar/contact', headers: localeHeaders('ar', contactHreflang) },
      // Catch-all for any other locale subpages — keep Content-Language signal
      // and sitemap pointer even if hreflang alternates are page-specific.
      {
        source: '/he/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
          { key: 'Content-Language', value: 'he' },
          { key: 'Link', value: SITEMAP_LINK },
        ],
      },
      {
        source: '/en/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
          { key: 'Content-Language', value: 'en' },
          { key: 'Link', value: SITEMAP_LINK },
        ],
      },
      {
        source: '/tr/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
          { key: 'Content-Language', value: 'tr' },
          { key: 'Link', value: SITEMAP_LINK },
        ],
      },
      {
        source: '/ar/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
          { key: 'Content-Language', value: 'ar' },
          { key: 'Link', value: SITEMAP_LINK },
        ],
      },
      {
        // Root — also expose sitemap pointer so crawlers landing on / discover it
        source: '/',
        headers: [
          { key: 'Link', value: SITEMAP_LINK },
        ],
      },
      {
        // Sitemap — cache aggressively, easy for crawlers to fetch
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
