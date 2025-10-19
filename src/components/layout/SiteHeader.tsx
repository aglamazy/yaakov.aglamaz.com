'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ISite } from '@/entities/Site';
import { getLocalizedSiteName } from '@/utils/siteName';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  siteInfo: ISite | null;
}

export default function SiteHeader({ siteInfo }: SiteHeaderProps) {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  const brand =
    getLocalizedSiteName(siteInfo ?? undefined, i18n.language) ||
    t('example.nav.defaultSiteName');

  const navItems = [
    { href: '/', label: t('example.nav.public') },
    { href: '/app', label: t('example.nav.private') },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.brand}>{brand}</div>
      <nav className={styles.nav} aria-label={t('example.nav.aria')}>
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href;
          const className = isActive
            ? `${styles.navLink} ${styles.navLinkActive}`
            : styles.navLink;

          return (
            <Link
              key={href}
              href={href}
              className={className}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
