import { NextRequest } from 'next/server';
import { BlogRepository } from '@/repositories/BlogRepository';

export const dynamic = 'force-dynamic';

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET(req: NextRequest) {
  try {
    const siteId = process.env.NEXT_SITE_ID || '';
    const url = new URL(req.url);
    const base = (process.env.NEXT_PUBLIC_APP_URL || `${url.origin}`)?.replace(/\/+$/, '');

    const repo = new BlogRepository();

    const urls: { loc: string; lastmod?: string }[] = [];
    urls.push({ loc: `${base}/` });
    urls.push({ loc: `${base}/contact` });
    urls.push({ loc: `${base}/terms` });

    try {
      const posts = await repo.getPublicBySite(siteId, 5);
      posts.forEach((post) => {
        if (!post.id) return;
        const lastmod = (post.updatedAt as any)?.toDate?.()?.toISOString?.() ?? undefined;
        urls.push({ loc: `${base}/public/blog/${encodeURIComponent(post.id)}`, lastmod });
      });
    } catch (error) {
      console.warn('Failed to include blog posts in sitemap', error);
    }

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(u => {
        const lines = [`  <url>`, `    <loc>${xmlEscape(u.loc)}</loc>`];
        if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
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
