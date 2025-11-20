'use client';

import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        {t('adminDashboard')}
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('staffManagement')}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {t('staffManagementDesc')}
          </p>
        </div>
      </div>

      <div style={{
        background: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #fbbf24'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          🚧 {t('comingSoon')}
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          {t('staffEditorComingSoon')}
        </p>
      </div>
    </div>
  );
}
