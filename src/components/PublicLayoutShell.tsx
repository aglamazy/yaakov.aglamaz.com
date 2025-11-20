'use client';

import React, { useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import LoginPage from '@/components/LoginPage';
import { useLoginModalStore } from '@/store/LoginModalStore';
import { useSiteStore } from '@/store/SiteStore';
import type { ISite } from '@/entities/Site';
import styles from './PublicLayoutShell.module.css';

interface PublicLayoutShellProps {
  siteInfo: ISite | null;
  locale: string;
  resolvedLocale: string;
  children: React.ReactNode;
}

export default function PublicLayoutShell({ siteInfo, locale, resolvedLocale, children }: PublicLayoutShellProps) {
  const { isOpen, close } = useLoginModalStore();
  const setSiteInfo = useSiteStore((s) => s.setSiteInfo);

  useEffect(() => {
    if (siteInfo) {
      setSiteInfo(siteInfo);
    }
  }, [siteInfo, setSiteInfo]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
      <Modal isOpen={isOpen} onClose={close}>
        <LoginPage />
      </Modal>
    </div>
  );
}
