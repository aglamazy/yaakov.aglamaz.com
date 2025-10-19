'use client';

import React, { useEffect } from 'react';
import type { ISite } from '@/entities/Site';
import SiteHeader from './SiteHeader';
import styles from './SiteShell.module.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSiteStore } from '@/store/SiteStore';

interface SiteShellProps {
  siteInfo: ISite | null;
  children: React.ReactNode;
}

export default function SiteShell({ siteInfo, children }: SiteShellProps) {
  const setSiteInfo = useSiteStore((state) => state.setSiteInfo);

  useEffect(() => {
    setSiteInfo(siteInfo ?? null);
  }, [siteInfo, setSiteInfo]);

  return (
    <ErrorBoundary>
      <div className={styles.shell}>
        <SiteHeader siteInfo={siteInfo} />
        <main className={styles.content}>{children}</main>
      </div>
    </ErrorBoundary>
  );
}
