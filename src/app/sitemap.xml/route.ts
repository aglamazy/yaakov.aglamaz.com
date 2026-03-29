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

    const urls: { loc: string; lastmod?: string }[] = [];
    urls.push({ loc: `${base}/` });
    urls.push({ loc: `${base}/he` });
    urls.push({ loc: `${base}/en` });
    urls.push({ loc: `${base}/tr` });
    urls.push({ loc: `${base}/ar` });
    urls.push({ loc: `${base}/he/terms` });
    urls.push({ loc: `${base}/en/terms` });
    urls.push({ loc: `${base}/tr/terms` });

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
      { path: '/terms', locales: ['he', 'en', 'tr'] }, // terms pages
    ];

    const hreflangMap = new Map<string, { locale: string; href: string }[]>();
    for (const group of localeGroups) {
      const alternates = group.locales.map((loc) => ({
        locale: loc,
        href: `${base}/${loc}${group.path}`,
      }));
      // Add x-default pointing to the root or default locale
      alternates.push({
        locale: 'x-default',
        href: group.path ? `${base}/he${group.path}` : `${base}/`,
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
