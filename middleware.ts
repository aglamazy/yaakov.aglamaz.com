import { jwtVerify, importSPKI } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// ---------- Auth helpers (inlined to avoid @/ imports that break Turbopack nft tracing) ----------

const ACCESS_TOKEN = 'access_token';
const ALG = 'RS256';
const PUBLIC_KEY_PEM = process.env.JWT_PUBLIC_KEY;

let cachedKey: CryptoKey | undefined;

async function getVerifyKey() {
  if (!PUBLIC_KEY_PEM) throw new Error('JWT_PUBLIC_KEY not set');
  if (!cachedKey) {
    const spki = PUBLIC_KEY_PEM.replace(/\\n/g, '\n').trim();
    cachedKey = await importSPKI(spki, ALG);
  }
  return cachedKey;
}

async function verifyAccessToken<T extends object = Record<string, unknown>>(token: string): Promise<T> {
  const key = await getVerifyKey();
  const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
  return payload as T;
}

// ---------- Locale helper ----------

function addLocaleHeader(response: NextResponse, request: NextRequest): NextResponse {
  let locale = request.nextUrl.searchParams.get('locale');
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

// ---------- Middleware ----------

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (!token && isPublic) {
    return addLocaleHeader(NextResponse.next(), request);
  }

  const isApi = pathname.startsWith('/api');
  const isPublicApi = pathname === '/api/seo/ping';

  if (!token) {
    if (isApi && !isPublicApi) {
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
    '/((?!api|_next/static|_next/image|favicon\\.ico|locales|sitemap\\.xml|robots\\.txt).*)',
  ],
};
