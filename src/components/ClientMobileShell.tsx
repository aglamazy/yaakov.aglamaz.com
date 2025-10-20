'use client';

import React, { useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import LoginPage from '@/components/LoginPage';
import PendingMemberContent from '@/components/PendingMemberContent';
import NotMemberContent from '@/components/NotMemberContent';
import SweepableContainer from '@/components/mobile/SweepableContainer';
import SweepableElement from '@/components/mobile/SweepableElement';
import ShimmerImagePreview from '@/components/mobile/ShimmerImagePreview';
import styles from './ClientLayoutShell.module.css';
import type { TFunction } from 'i18next';

interface ModalControls {
  isLoginOpen: boolean;
  closeLogin: () => void;
  isPendingOpen: boolean;
  closePending: () => void;
  isApplyOpen: boolean;
  closeApply: () => void;
}

interface ClientMobileShellProps extends ModalControls {
  t: TFunction;
  presentationModeActive: boolean;
}

export default function ClientMobileShell({
  t,
  presentationModeActive,
  isLoginOpen,
  closeLogin,
  isPendingOpen,
  closePending,
  isApplyOpen,
  closeApply,
}: ClientMobileShellProps) {
  const baseClass = styles.mobileContainer;
  const containerClassName = presentationModeActive ? `${baseClass} ${styles.presentationActive}` : baseClass;

  const indicatorLabel = useMemo(
    () => (t('mobileSections', { defaultValue: 'Mobile sections' }) as string) || 'Mobile sections',
    [t]
  );

  const shimmerGraphic = useMemo(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#1e3a8a" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="#0b1120" />
        <circle cx="280" cy="320" r="220" fill="#1d4ed8" opacity="0.38" />
        <circle cx="880" cy="260" r="260" fill="#0ea5e9" opacity="0.22" />
        <circle cx="620" cy="580" r="260" fill="#38bdf8" opacity="0.18" />
        <rect width="1200" height="800" fill="url(#grad)" opacity="0.28" />
      </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  const shimmerLabel = t('loadingPreview', { defaultValue: 'Loading Preview' }) as string;
  const featuresLabel = t('mobileFeatureHighlights', { defaultValue: 'Highlights' }) as string;
  const storyLabel = t('mobileStorySpotlight', { defaultValue: 'Story Spotlight' }) as string;
  const contactLabel = t('contactUs');

  return (
    <div className={containerClassName}>
      <main className={styles.mobileMain}>
        <SweepableContainer indicatorLabel={indicatorLabel}>
          <SweepableElement label={featuresLabel}>
            <div className={styles.mobilePanel}>
              <ShimmerImagePreview src={shimmerGraphic} alt={featuresLabel} caption={shimmerLabel} />
            </div>
          </SweepableElement>
          <SweepableElement label={storyLabel}>
            <div className={styles.mobilePanel}>
              <ShimmerImagePreview src={shimmerGraphic} alt={storyLabel} caption={storyLabel} />
            </div>
          </SweepableElement>
          <SweepableElement label={contactLabel as string}>
            <div className={styles.mobilePanel}>
              <ShimmerImagePreview src={shimmerGraphic} alt={contactLabel as string} caption={t('contactUs')} />
            </div>
          </SweepableElement>
        </SweepableContainer>
      </main>
      <Modal isOpen={isLoginOpen} onClose={closeLogin}>
        <LoginPage/>
      </Modal>
      <Modal isOpen={isPendingOpen} onClose={closePending} isClosable={false}>
        <PendingMemberContent/>
      </Modal>
      <Modal isOpen={isApplyOpen} onClose={closeApply}>
        <NotMemberContent/>
      </Modal>
    </div>
  );
}
