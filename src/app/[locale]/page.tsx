import type { Metadata } from 'next';
import PublicPage from './components/PublicPage/PublicPage';
import { fetchStaffProfile, fetchSiteInfo } from '@/firebase/admin';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const [staff, siteInfo] = await Promise.all([
    fetchStaffProfile().catch(() => null),
    fetchSiteInfo().catch(() => null),
  ]);
  const name = staff?.name || (siteInfo as any)?.name || 'Portfolio';
  const position = staff?.position || '';
  const description = position
    ? `${name} — ${position}. View portfolio, skills, and projects.`
    : `${name} — personal portfolio. View skills, projects, and get in touch.`;
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
    },
  };
}

export default async function PublicLandingPage() {
  const staff = await fetchStaffProfile();

  const heroTitle = staff?.name ?? 'name';
  const heroSubtitle = staff?.position ?? 'position';

  return <PublicPage heroTitle={heroTitle} heroSubtitle={heroSubtitle} />;
}
