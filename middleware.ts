import { NextRequest, NextResponse } from 'next/server';

// Site archived 2026-08-05 (general#16 — decided: archive, keep the domain).
// Every request short-circuits here with a plain placeholder before any of the
// real app's auth/locale/routing logic runs. Revert this file to restore the
// live site if it's ever un-archived.
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'This site is no longer active.' }, { status: 410 });
  }
  return new NextResponse(
    '<!doctype html><html><head><meta charset="utf-8"><title>Yaakov Aglamaz</title></head>' +
      '<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;text-align:center">' +
      '<p>This site is no longer active.</p></body></html>',
    { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
