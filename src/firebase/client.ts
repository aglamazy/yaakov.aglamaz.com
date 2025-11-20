import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCustomToken } from 'firebase/auth';
import { apiFetch } from '@/utils/apiFetch';
import { ApiRoute } from '@/entities/Routes';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

export function initFirebase() {
  // Check if all required environment variables are present
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn('[Firebase Client] Firebase configuration is missing. Auth features are disabled.');
    return false;
  }

  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig);
      return true;
    } catch (error) {
      console.error('[Firebase Client] Failed to initialize Firebase:', error);
      return false;
    }
  }
  return true;
}

export const auth = () => {
  if (!getApps().length) {
    console.warn('[Firebase Client] Firebase not initialized. Call initFirebase() first.');
    return null;
  }
  return getAuth();
};

// Only initialize Google provider if Firebase is configured
let _googleProvider: GoogleAuthProvider | null = null;
export const getGoogleProvider = () => {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return null;
  }
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
  }
  return _googleProvider;
};

// Deprecated: Use getGoogleProvider() instead
export const googleProvider = getGoogleProvider();
// export const facebookProvider = new FacebookAuthProvider();

// Ensures Firebase Auth is signed in using a custom token
// derived from the app session (cookies). Always aligns identities.
export async function ensureFirebaseSignedIn(): Promise<void> {
  const a = auth();
  const { token } = await apiFetch<{ token: string }>(ApiRoute.AUTH_ME_FIREBASE_TOKEN, { method: 'POST' });
  await signInWithCustomToken(a, token);
}
