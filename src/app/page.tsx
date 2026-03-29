import { permanentRedirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/i18n';

// Root page redirects to default locale (308 permanent for SEO)
export default function RootPage() {
  permanentRedirect(`/${DEFAULT_LOCALE}`);
}
