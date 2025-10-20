# Example App Boilerplate

This project provides a stripped-down Next.js 14 boilerplate that keeps auth, i18n, and Firebase helpers in place while showcasing a simple public page and an authenticated sweepable experience.

## Development

1. Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials.
2. Install dependencies with `npm install` (requires internet access).
3. Run the development server using `npm run dev`.

### Google Search Console verification

To verify the site with Google Search Console using a meta tag, set the environment variable with your verification token:

```
GOOGLE_SITE_VERIFICATION=<The tag>
```

The app exposes this value via Next.js metadata in `src/app/layout.tsx`. Do not hardcode verification tokens in source; use env vars instead. Alternatively, DNS verification (Domain property) is recommended for broader coverage.

## Structure

- Public side: `/` renders a mobile-first, snap-scrolling portfolio sampler powered by i18n placeholders (`src/app/(public)/components/PublicPage/PublicPage.tsx`).
- Private side: `/app` requires authentication and renders a sweepable view with red, green, and blue placeholders (`src/examples/private/SweepableExample.tsx`).
- Supporting pieces: Firebase auth/session helpers, JWT utilities, and site configuration are intact for reuse.
