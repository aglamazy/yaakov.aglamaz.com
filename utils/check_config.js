#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to your .env.local file
const envPath = path.join(process.cwd(), '.env.local');

// List of required environment variables
const requiredVars = [
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_PROJECT_ID',
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_FROM_EMAIL',
    'GMAIL_REFRESH_TOKEN',
    'JWT_ISSUER',
    'JWT_KID',
    'JWT_PRIVATE_KEY',
    'JWT_PUBLIC_KEY',
    'NEXT_DEFAULT_LANG',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_SITE_ID',
    'NODE_ENV',
    'OAUTH_AUTHORIZE_URL',
    'OAUTH_CLIENT_ID',
    'OAUTH_SCOPE',
    'OAUTH_TOKEN_URL',
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'SITE_URL',
];

// Read the .env.local file
if (!fs.existsSync(envPath)) {
    console.error(`❌ .env.local file not found at ${envPath}`);
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');

// Parse the file into key-value pairs
const envVars = {};
content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    envVars[key] = rest.join('=').trim();
});

// Check for missing variables
let missing = [];
console.log('🔍 Checking environment variables...\n');

for (const key of requiredVars) {
    if (envVars[key] && envVars[key] !== '') {
        console.log(`✅ ${key}`);
    } else {
        console.log(`❌ ${key}`);
        missing.push(key);
    }
}

if (missing.length > 0) {
    console.error(`\n⚠️  Missing ${missing.length} variable(s):`);
    missing.forEach((k) => console.error(`   - ${k}`));
    process.exit(1);
}

console.log('\n🎉 All required environment variables are present!');
