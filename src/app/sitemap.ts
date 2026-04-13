import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';
const LOCALES = ['he', 'en', 'tr', 'ar'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = '2026-04-13';

  const entries: MetadataRoute.Sitemap = [];

  // Home pages (one per locale)
  for (const locale of LOCALES) {
    const languages: Record<string, string> = {};
    for (const alt of LOCALES) {
      languages[alt] = `${BASE_URL}/${alt}`;
    }
    languages['x-default'] = `${BASE_URL}/he`;

    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages },
    });
  }

  // Terms pages
  for (const locale of LOCALES) {
    const languages: Record<string, string> = {};
    for (const alt of LOCALES) {
      languages[alt] = `${BASE_URL}/${alt}/terms`;
    }
    languages['x-default'] = `${BASE_URL}/he/terms`;

    entries.push({
      url: `${BASE_URL}/${locale}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
      alternates: { languages },
    });
  }

  // Note: /contact pages are intentional 308 redirects to /{locale}#contact
  // and should NOT be in the sitemap.

  return entries;
}
