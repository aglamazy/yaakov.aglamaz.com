/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep firebase-admin and its transitive dependencies as external (not bundled).
  // Turbopack only traces statically-imported files; firebase-admin loads many
  // sub-packages lazily via require(), so without this setting Vercel serverless
  // functions are missing those files at runtime → HTTP 500.
  serverExternalPackages: ['firebase-admin'],

  async headers() {
    return [
      {
        // Public locale pages — signal crawlers to index and cache
        source: '/:locale(he|en|tr|ar)/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
        ],
      },
      {
        // Locale root pages
        source: '/:locale(he|en|tr|ar)',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Vary', value: 'Accept-Language' },
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
