import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://yaakov.aglamaz.com').replace(/\/+$/, '');
const HOST = new URL(BASE_URL).hostname;
const INDEXNOW_KEY = 'yaakov-aglamaz-com-indexnow-a7f3d2b1';
const LOCALES = ['he', 'en', 'tr', 'ar'] as const;

function getAllSiteUrls(): string[] {
  const urls: string[] = [];
  for (const locale of LOCALES) {
    urls.push(`${BASE_URL}/${locale}`);
    urls.push(`${BASE_URL}/${locale}/contact`);
    urls.push(`${BASE_URL}/${locale}/terms`);
  }
  return urls;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel Cron invocations carry user-agent: vercel-cron/1.0. If the
  // CRON_SECRET env var is set, Vercel also signs the request with
  // Authorization: Bearer <CRON_SECRET>. Treat either signal as pre-authorized
  // so the scheduled job in vercel.json can run without PING_SECRET.
  const userAgent = req.headers.get('user-agent') ?? '';
  const isVercelCron =
    userAgent.startsWith('vercel-cron/') ||
    (process.env.CRON_SECRET !== undefined &&
      req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`);

  if (!isVercelCron) {
    const secret = req.headers.get('x-ping-secret') ?? req.nextUrl.searchParams.get('secret');
    const pingSecret = process.env.PING_SECRET;
    if (pingSecret && secret !== pingSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const urls = getAllSiteUrls();
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const indexNowHosts = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  const results = await Promise.allSettled(
    indexNowHosts.map((endpoint) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      }).then((r) => ({ endpoint, status: r.status }))
    )
  );

  const responses = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { endpoint: 'unknown', status: 'error', reason: String((r as PromiseRejectedResult).reason) }
  );

  return NextResponse.json({ submitted: urls.length, urls, responses });
}
