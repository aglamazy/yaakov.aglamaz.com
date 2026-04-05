import { NextRequest } from 'next/server';
// import { BlogRepository } from '@/repositories/BlogRepository'; // TODO: Re-enable when blog is implemented

export const dynamic = 'force-dynamic';

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const base = (process.env.NEXT_PUBLIC_APP_URL || `${url.origin}`)?.replace(/\/+$/, '');

    // Use a stable lastmod date — updating this on every request causes Google
    // to distrust lastmod values when the content hasn't actually changed.
    const CONTENT_LAST_MODIFIED = '2026-04-05';

    const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] = [];
    // Root URL — permanent-redirects to /he but must be in sitemap so Google discovers it
    urls.push({ loc: `${base}/`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'weekly', priority: 1.0 });
    urls.push({ loc: `${base}/he`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'weekly', priority: 1.0 });
    urls.push({ loc: `${base}/en`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'weekly', priority: 0.9 });
    urls.push({ loc: `${base}/tr`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'weekly', priority: 0.9 });
    urls.push({ loc: `${base}/ar`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'weekly', priority: 0.9 });
    urls.push({ loc: `${base}/he/terms`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'monthly', priority: 0.5 });
    urls.push({ loc: `${base}/en/terms`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'monthly', priority: 0.5 });
    urls.push({ loc: `${base}/tr/terms`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'monthly', priority: 0.5 });
    urls.push({ loc: `${base}/ar/terms`, lastmod: CONTENT_LAST_MODIFIED, changefreq: 'monthly', priority: 0.5 });

    // TODO: Re-enable when blog is implemented
    // const repo = new BlogRepository();
    // try {
    //   const posts = await repo.getPublicBySite(siteId, 5);
    //   posts.forEach((post) => {
    //     if (!post.id) return;
    //     const lastmod = (post.updatedAt as any)?.toDate?.()?.toISOString?.() ?? undefined;
    //     urls.push({ loc: `${base}/public/blog/${encodeURIComponent(post.id)}`, lastmod });
    //   });
    // } catch (error) {
    //   console.warn('Failed to include blog posts in sitemap', error);
    // }

    // Build hreflang alternate groups for locale pages
    const locales = ['he', 'en', 'tr', 'ar'];
    const localeGroups: { path: string; locales: string[] }[] = [
      { path: '', locales }, // home pages: /he, /en, /tr, /ar
      { path: '/terms', locales }, // terms pages
    ];

    const hreflangMap = new Map<string, { locale: string; href: string }[]>();
    for (const group of localeGroups) {
      const alternates = group.locales.map((loc) => ({
        locale: loc,
        href: `${base}/${loc}${group.path}`,
      }));
      // Add x-default pointing to the default locale variant
      alternates.push({
        locale: 'x-default',
        href: `${base}/he${group.path}`,
      });
      for (const loc of group.locales) {
        hreflangMap.set(`${base}/${loc}${group.path}`, alternates);
      }
    }

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      ...urls.map(u => {
        const lines = [`  <url>`, `    <loc>${xmlEscape(u.loc)}</loc>`];
        if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
        if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
        if (u.priority != null) lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
        const alternates = hreflangMap.get(u.loc);
        if (alternates) {
          for (const alt of alternates) {
            lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${xmlEscape(alt.href)}" />`);
          }
        }
        lines.push('  </url>');
        return lines.join('\n');
      }),
      '</urlset>'
    ].join('\n');

    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (e) {
    console.error('sitemap error', e);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      status: 200,
    });
  }
}
