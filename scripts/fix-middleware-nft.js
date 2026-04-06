/**
 * Next.js 16 with Turbopack bundles middleware into edge chunks and does not
 * emit a top-level middleware.js or middleware.js.nft.json.  Vercel's deploy
 * step still expects the nft.json file to exist.  This script reads the
 * middleware-manifest.json, creates a stub middleware.js (re-exporting the
 * edge bundle), and writes the nft.json that lists the bundled chunk files.
 */
const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..', '.next', 'server');
const nftPath = path.join(serverDir, 'middleware.js.nft.json');
const stubPath = path.join(serverDir, 'middleware.js');
const manifestPath = path.join(serverDir, 'middleware-manifest.json');

// If middleware.js.nft.json already exists, nothing to do
if (fs.existsSync(nftPath)) {
  console.log('middleware.js.nft.json already exists, skipping.');
  process.exit(0);
}

if (!fs.existsSync(manifestPath)) {
  console.log('No middleware-manifest.json found, skipping.');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entry = manifest.middleware && manifest.middleware['/'];

if (!entry) {
  console.log('No middleware entry in manifest, skipping.');
  process.exit(0);
}

// Collect all files referenced by the middleware
const files = (entry.files || []).map(f => path.join('..', '.next', f));

// Write a stub middleware.js so the nft.json has something to reference
if (!fs.existsSync(stubPath)) {
  fs.writeFileSync(stubPath, '// stub for Vercel deploy compatibility\n');
}

// Write the nft.json
fs.writeFileSync(nftPath, JSON.stringify({ version: 1, files }, null, 2) + '\n');
console.log(`Created ${path.basename(nftPath)} with ${files.length} traced files.`);
