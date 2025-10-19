const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');
const readline = require('readline');

const ENV_FILENAME = '.env.local';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function ensureEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    return;
  }

  fs.writeFileSync(envPath, '', { encoding: 'utf8' });
  console.log(`Created ${ENV_FILENAME} file at ${envPath}`);
}

function parseEnvContent(content) {
  const lines = content.split(/\r?\n/);
  const envMap = new Map();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const [key, ...rest] = line.split('=');
    if (!key) {
      continue;
    }

    const value = rest.join('=').trim();
    envMap.set(key.trim(), value);
  }

  return envMap;
}

function serializeEnv(map) {
  const entries = Array.from(map.entries());
  return entries.map(([key, value]) => `${key}=${value}`).join('\n') + (entries.length ? '\n' : '');
}

function loadEnv(envPath) {
  const content = fs.readFileSync(envPath, { encoding: 'utf8' });
  return parseEnvContent(content);
}

function writeEnv(envPath, envMap) {
  const serialized = serializeEnv(envMap);
  fs.writeFileSync(envPath, serialized, { encoding: 'utf8' });
}

function packKeyForEnv(key) {
  return `"${key.replace(/\n/g, '\\n')}"`;
}

function ensureJwtKeys(envMap) {
  const hasPrivate = Boolean(process.env.JWT_PRIVATE_KEY || envMap.get('JWT_PRIVATE_KEY'));
  const hasPublic = Boolean(process.env.JWT_PUBLIC_KEY || envMap.get('JWT_PUBLIC_KEY'));

  if (hasPrivate && hasPublic) {
    return envMap;
  }

  console.log('JWT keys missing. Generating new RSA key pair.');

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  envMap.set('JWT_PRIVATE_KEY', packKeyForEnv(privateKey));
  envMap.set('JWT_PUBLIC_KEY', packKeyForEnv(publicKey));

  console.log('JWT keys written to environment map.');

  return envMap;
}

function ensureFirebaseCredentials(envMap, firebasePath) {
  const requiredKeys = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missingKeys = requiredKeys.filter((key) => !process.env[key] && !envMap.get(key));

  if (!missingKeys.length) {
    return envMap;
  }

  if (!firebasePath) {
    throw new Error(`Missing Firebase credentials: ${missingKeys.join(', ')}. Provide --firebase <path> to a service account JSON.`);
  }

  const absolutePath = path.resolve(process.cwd(), firebasePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Firebase service account file not found at ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, { encoding: 'utf8' });
  let config;
  try {
    config = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to parse Firebase service account JSON: ${error.message}`);
  }

  if (!config.project_id || !config.client_email || !config.private_key) {
    throw new Error('Firebase service account JSON is missing required fields (project_id, client_email, private_key).');
  }

  envMap.set('FIREBASE_PROJECT_ID', config.project_id);
  envMap.set('FIREBASE_CLIENT_EMAIL', config.client_email);
  envMap.set('FIREBASE_PRIVATE_KEY', packKeyForEnv(config.private_key));

  return envMap;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function ensureNextSiteId(envMap) {
  if (process.env.NEXT_SITE_ID || envMap.get('NEXT_SITE_ID')) {
    return envMap;
  }

  console.log('NEXT_SITE_ID is missing.');
  console.log('Hint: create a document in the "sites" collection in Firebase Firestore and use its document ID.');

  let value = '';
  while (!value) {
    // eslint-disable-next-line no-await-in-loop
    const input = await prompt('Enter NEXT_SITE_ID: ');
    value = input.trim();
    if (!value) {
      console.log('NEXT_SITE_ID cannot be empty.');
    }
  }

  envMap.set('NEXT_SITE_ID', value);
  return envMap;
}

async function main() {
  const envPath = path.resolve(process.cwd(), ENV_FILENAME);
  const args = parseArgs(process.argv);
  const firebasePath = args.firebase;

  try {
    ensureEnvFile(envPath);
    const envMap = await ensureNextSiteId(
      ensureFirebaseCredentials(ensureJwtKeys(loadEnv(envPath)), firebasePath),
    );
    writeEnv(envPath, envMap);
    console.log('Configuration complete.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to configurate environment: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to configurate environment: ${message}`);
    process.exit(1);
  });
}

module.exports = { main };
