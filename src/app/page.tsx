import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/i18n';

// Root page redirects to default locale
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
