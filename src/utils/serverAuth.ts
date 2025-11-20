import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/auth/service';
import { ACCESS_TOKEN } from '@/auth/cookies';
import { StaffRepository, type IStaff } from '@/repositories/StaffRepository';
import type { TokenClaims } from '@/auth/tokens';

/**
 * Get the current Firebase Auth user's token claims from cookies.
 * Returns null if no token or invalid token.
 * Server-side only.
 */
export async function getUserFromToken(): Promise<TokenClaims | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN)?.value;

    if (!token) return null;

    const payload = verifyAccessToken(token);
    return payload;
  } catch (error) {
    console.error('[getUserFromToken] failed', error);
    return null;
  }
}

/**
 * Get the current staff member from Firestore using the authenticated user's token.
 * Returns null if no user is authenticated or staff member is not found.
 * Server-side only.
 */
export async function getStaffFromToken(): Promise<IStaff | null> {
  try {
    const user = await getUserFromToken();
    if (!user?.email) return null;

    const staffRepository = new StaffRepository();
    const staff = await staffRepository.getByEmail(user.email);
    return staff;
  } catch (error) {
    console.error('[getStaffFromToken] failed', error);
    return null;
  }
}
