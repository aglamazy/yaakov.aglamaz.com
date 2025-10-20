const requiredAdminEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const requiredClientEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
];

let adminEnvChecked = false;
let clientEnvChecked = false;

function ensureEnv(keys: string[], context: string) {
  const missing = keys.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
  if (missing.length) {
    throw new Error(`Missing ${context} Firebase environment variables: ${missing.join(', ')}`);
  }
}

export function ensureFirebaseAdminEnv() {
  if (adminEnvChecked) return;
  ensureEnv(requiredAdminEnv, 'admin');
  adminEnvChecked = true;
}

export function ensureFirebaseClientEnv() {
  if (clientEnvChecked) return;
  ensureEnv(requiredClientEnv, 'client');
  clientEnvChecked = true;
}

