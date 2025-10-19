'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import SweepableContainer from '@/components/mobile/SweepableContainer';
import SweepableElement from '@/components/mobile/SweepableElement';
import styles from './SweepableExample.module.css';

export default function SweepableExample() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.viewport}>
        <SweepableContainer indicatorLabel={t('example.sweep.indicatorLabel')}>
          <SweepableElement
            label={t('example.sweep.redLabel')}
            background="#D92D20"
          >
            <div className={styles.placeholder}>{t('example.sweep.redLabel')}</div>
          </SweepableElement>
          <SweepableElement
            label={t('example.sweep.greenLabel')}
            background="#12B76A"
          >
            <div className={styles.placeholder}>{t('example.sweep.greenLabel')}</div>
          </SweepableElement>
          <SweepableElement
            label={t('example.sweep.blueLabel')}
            background="#2563EB"
          >
            <div className={styles.placeholder}>{t('example.sweep.blueLabel')}</div>
          </SweepableElement>
        </SweepableContainer>
      </div>
    </div>
  );
}
