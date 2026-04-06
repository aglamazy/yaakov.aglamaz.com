import { proxy } from '@/proxy';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|locales|sitemap\\.xml|robots\\.txt).*)',
  ],
};

export const middleware = proxy;
