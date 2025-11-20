import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/edgeAuth';
import { ACCESS_TOKEN } from '@/auth/cookies';
import I18nProvider from '@/components/I18nProvider';
import ClientLayoutShell from '@/components/ClientLayoutShell';
import { getUserFromToken } from '@/utils/serverAuth';
import { resolveLocaleForPrivateRoutes } from '@/utils/resolveLocale';
import { translationRepository } from '@/repositories/TranslationRepository';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN)?.value;

  if (!token) {
    redirect('/login?redirect=/admin');
  }

  try {
    const claims = await verifyAccessToken(token);

    // Check if user needs credential setup
    const needsCredentialSetup = Boolean((claims as any)?.needsCredentialSetup);
    if (needsCredentialSetup) {
      redirect('/welcome/credentials');
    }

    // Get user data for SSR
    const userToken = await getUserFromToken();
    const userData = userToken ? {
      user_id: userToken.sub!,
      email: userToken.email!,
      name: userToken.name || userToken.email!,
      needsCredentialSetup: userToken.needsCredentialSetup || false,
    } : null;

    // Resolve locale with priority: query param > Accept-Language
    const { baseLocale, resolvedLocale } = await resolveLocaleForPrivateRoutes();

    // Load translations from Firebase Storage for SSR
    let translations = await translationRepository.getTranslations(baseLocale);

    // Convert to i18next format
    const translationsFlat: Record<string, string> = {};
    Object.entries(translations).forEach(([key, entry]) => {
      translationsFlat[key] = entry.text;
    });

    // Build resources for i18next
    const resources = {
      [baseLocale]: {
        common: translationsFlat,
      },
    };

    return (
      <>
        {/* Inject server-side data for client-side hydration */}
        <script
          id="__USER__"
          dangerouslySetInnerHTML={{
            __html: `window.__USER__=${JSON.stringify(userData ?? null)};`,
          }}
        />
        <script
          id="__TRANSLATIONS__"
          dangerouslySetInnerHTML={{
            __html: `window.__TRANSLATIONS__=${JSON.stringify(resources)};`,
          }}
        />
        <I18nProvider
          initialLocale={baseLocale}
          resolvedLocale={resolvedLocale}
          resources={resources}
        >
          <ClientLayoutShell>{children}</ClientLayoutShell>
        </I18nProvider>
      </>
    );
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    redirect('/login?redirect=/admin');
  }
}
