'use client';

import { useTranslation } from 'react-i18next';
import styles from './PublicPage.module.css';

export default function PublicPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.content}>{t('example.publicLabel')}</div>
    </div>
  );
}
