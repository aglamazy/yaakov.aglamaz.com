import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/login', '/auth-gate', '/welcome/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
