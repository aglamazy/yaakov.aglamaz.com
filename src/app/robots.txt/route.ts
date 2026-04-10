import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || `${url.origin}`)?.replace(/\/+$/, '');
  const requestBase = url.origin.replace(/\/+$/, '');
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /login',
    'Disallow: /auth-gate',
    'Disallow: /welcome/',
    '',
    `Sitemap: ${canonicalBase}/sitemap.xml`,
  ];
  // If the request comes from a secondary domain (e.g. bubble-labs.com),
  // also reference its own sitemap so Google discovers it for that domain.
  if (requestBase !== canonicalBase) {
    lines.push(`Sitemap: ${requestBase}/sitemap.xml`);
  }
  lines.push('');
  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  });
}

