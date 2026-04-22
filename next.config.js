/** @type {import('next').NextConfig} */
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
    const localeContentLanguage = (locale) => [
      { key: 'X-Robots-Tag', value: 'index, follow' },
      { key: 'Vary', value: 'Accept-Language' },
      { key: 'Content-Language', value: locale },
    ];

    return [
      // Locale root pages: /he, /en, /tr, /ar
      { source: '/he', headers: localeContentLanguage('he') },
      { source: '/en', headers: localeContentLanguage('en') },
      { source: '/tr', headers: localeContentLanguage('tr') },
      { source: '/ar', headers: localeContentLanguage('ar') },
      // Locale subpages: /he/*, /en/*, /tr/*, /ar/*
      { source: '/he/:path*', headers: localeContentLanguage('he') },
      { source: '/en/:path*', headers: localeContentLanguage('en') },
      { source: '/tr/:path*', headers: localeContentLanguage('tr') },
      { source: '/ar/:path*', headers: localeContentLanguage('ar') },
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
