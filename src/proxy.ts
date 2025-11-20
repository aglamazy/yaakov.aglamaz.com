import { ACCESS_TOKEN } from '@/auth/cookies';
import { verifyAccessToken } from 'src/lib/edgeAuth';
import { NextRequest, NextResponse } from 'next/server';

// Helper to add locale header to response
function addLocaleHeader(response: NextResponse, request: NextRequest): NextResponse {
  // Try to get locale from query param first
  let locale = request.nextUrl.searchParams.get('locale');

  // If not in query param, try to extract from URL path (e.g., /he, /ar, /en, /tr)
  if (!locale) {
    const pathSegments = request.nextUrl.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    if (firstSegment && ['he', 'en', 'tr', 'ar'].includes(firstSegment)) {
      locale = firstSegment;
    }
  }

  if (locale) {
    response.headers.set('x-locale', locale);
  }
  return response;
}

const PUBLIC_PATHS = [
  '/',
  '/he',
  '/en',
  '/tr',
  '/ar',
  '/login',
  '/contact',
  '/favicon.ico',
  '/_next',
  '/locales',
  '/auth-gate',
  '/sitemap.xml',
  '/robots.txt',
  '/terms',
];

const PUBLIC_REDIRECT_PATHS = ['/', '/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Only skip auth for public paths when no token is present
  if (!token && isPublic) {
    return addLocaleHeader(NextResponse.next(), request);
  }

  const isApi = pathname.startsWith('/api');

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized (middleware)' }, { status: 401 });
    }
    return NextResponse.rewrite(new URL('/auth-gate', request.url));
  }

  try {
    const claims = await verifyAccessToken(token);
    const needsCredentialSetup = Boolean((claims as any)?.needsCredentialSetup);
    const isCredentialPage = pathname === '/welcome/credentials' || pathname.startsWith('/welcome/credentials/');
    const isCredentialApi = pathname.startsWith('/api/auth/credentials');
    const isLogoutApi = pathname === '/api/auth/logout';

    if (!needsCredentialSetup && isCredentialPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (needsCredentialSetup) {
      if (isApi) {
        if (isCredentialApi || isLogoutApi) {
          return addLocaleHeader(NextResponse.next(), request);
        }
        return NextResponse.json({ error: 'Credentials setup required' }, { status: 403 });
      }

      if (!isCredentialPage) {
        return NextResponse.redirect(new URL('/welcome/credentials', request.url));
      }
    }

    if (PUBLIC_REDIRECT_PATHS.includes(pathname)) {
      const target = needsCredentialSetup ? '/welcome/credentials' : '/admin';
      return NextResponse.redirect(new URL(target, request.url));
    }

    return addLocaleHeader(NextResponse.next(), request);
  } catch {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized (api)' }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/auth-gate';

    const headers = new Headers(request.headers);
    headers.set('x-auth-gate', '1');

    return NextResponse.rewrite(url, { request: { headers } });
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|locales).*)',
  ],
};
