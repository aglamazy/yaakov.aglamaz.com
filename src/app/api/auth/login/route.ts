import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, adminAuth } from '@/firebase/admin';
import { signAccessToken, signRefreshToken } from '@/auth/service';
import { setAuthCookies } from '@/auth/cookies';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    initAdmin();
    const decoded = await adminAuth().verifyIdToken(idToken);

    // Build app claims for JWT
    const appClaims = {
      userId: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.email || '',
      role: 'admin', // Default role, can be customized later
      needsCredentialSetup: false,
    };

    const accessMin = 60; // 60 minutes
    const refreshDays = 30; // 30 days

    const accessToken = signAccessToken(appClaims, accessMin);
    const refreshToken = signRefreshToken(
      { userId: decoded.uid, email: decoded.email || '' },
      refreshDays
    );

    const response = NextResponse.json({ success: true });
    setAuthCookies(response, accessToken, refreshToken, accessMin, refreshDays);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
