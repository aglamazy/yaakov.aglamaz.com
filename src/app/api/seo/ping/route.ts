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
  const secret = req.headers.get('x-ping-secret') ?? req.nextUrl.searchParams.get('secret');
  const pingSecret = process.env.PING_SECRET;
  if (pingSecret && secret !== pingSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
