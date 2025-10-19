import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchSiteInfo } from '@/firebase/admin';
import InviteSignupModal from './InviteSignupModal';

interface InvitePageParams {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageParams) {
  const { token } = params;

  let siteInfo = null;
  try {
    siteInfo = await fetchSiteInfo();
  } catch (error) {
    console.error('[invite][page] failed to load site info', error);
    throw error;
  }

  if (!siteInfo) {
    throw new Error('Site information is unavailable');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream-50 to-sage-50">
      <Header siteInfo={siteInfo} />
      <main className="flex-1">
        <InviteSignupModal token={token} />
      </main>
      <Footer siteInfo={siteInfo} />
    </div>
  );
}
