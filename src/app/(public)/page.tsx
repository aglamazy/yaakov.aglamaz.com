import PublicPage from '@/examples/public/PublicPage';
import { fetchStaffProfile } from '@/firebase/admin';

export const dynamic = 'force-static';

export default async function PublicLandingPage() {
  const staff = await fetchStaffProfile();

  const heroTitle = staff?.name ?? 'name';
  const heroSubtitle = staff?.position ?? 'position';

  return <PublicPage heroTitle={heroTitle} heroSubtitle={heroSubtitle} />;
}
