/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep firebase-admin and its transitive dependencies as external (not bundled).
  // Turbopack only traces statically-imported files; firebase-admin loads many
  // sub-packages lazily via require(), so without this setting Vercel serverless
  // functions are missing those files at runtime → HTTP 500.
  serverExternalPackages: ['firebase-admin'],
};

module.exports = nextConfig;
