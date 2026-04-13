import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com';
const LOCALES = ['he', 'en', 'tr', 'ar'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  // Use a stable lastmod date — updating this on every build causes Google
  // to distrust lastmod values when the content hasn't actually changed.
  const CONTENT_LAST_MODIFIED = '2026-04-13';

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
      lastModified: CONTENT_LAST_MODIFIED,
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
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.3,
      alternates: { languages },
    });
  }

  // Contact pages
  for (const locale of LOCALES) {
    const languages: Record<string, string> = {};
    for (const alt of LOCALES) {
      languages[alt] = `${BASE_URL}/${alt}/contact`;
    }
    languages['x-default'] = `${BASE_URL}/he/contact`;

    entries.push({
      url: `${BASE_URL}/${locale}/contact`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages },
    });
  }

  return entries;
}
