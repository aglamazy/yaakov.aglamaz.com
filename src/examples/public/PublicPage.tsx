'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PublicPage.module.css';

type SectionConfig = {
  id: string;
  titleKey: string;
  bodyKey: string;
  ctaKey?: string;
};

const SECTION_CONFIG: SectionConfig[] = [
  {
    id: 'hero',
    titleKey: 'publicPortfolio.heroTitle',
    bodyKey: 'publicPortfolio.heroSubtitle',
    ctaKey: 'publicPortfolio.heroCta',
  },
  {
    id: 'about',
    titleKey: 'publicPortfolio.aboutTitle',
    bodyKey: 'publicPortfolio.aboutBody',
  },
  {
    id: 'skills',
    titleKey: 'publicPortfolio.skillsTitle',
    bodyKey: 'publicPortfolio.skillsBody',
  },
  {
    id: 'projects',
    titleKey: 'publicPortfolio.projectsTitle',
    bodyKey: 'publicPortfolio.projectsBody',
  },
  {
    id: 'contact',
    titleKey: 'publicPortfolio.contactTitle',
    bodyKey: 'publicPortfolio.contactBody',
    ctaKey: 'publicPortfolio.contactCta',
  },
];

const LANGUAGES = ['he', 'en', 'tr', 'ar'] as const;
const RTL_LANGS = new Set(['he', 'ar']);

export default function PublicPage() {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorReady, setIndicatorReady] = useState(false);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorLockedRef = useRef(false);
  const languageFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [languageTransitioning, setLanguageTransitioning] = useState(false);

  const skillsListRaw = t('publicPortfolio.skillsList', { returnObjects: true }) as unknown;
  const projectsListRaw = t('publicPortfolio.projectsList', { returnObjects: true }) as unknown;

  const skillsList = Array.isArray(skillsListRaw) ? (skillsListRaw as string[]) : [];
  const projectsList = Array.isArray(projectsListRaw)
    ? (projectsListRaw as Array<{ title: string; summary: string }>)
    : [];
  const languageLabelsRaw = t('publicPortfolio.language', { returnObjects: true }) as Record<string, string> | string;
  const languageLabels = useMemo(() => {
    if (languageLabelsRaw && typeof languageLabelsRaw === 'object') {
      return languageLabelsRaw;
    }
    return {} as Record<string, string>;
  }, [languageLabelsRaw]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideIndicator = useCallback(() => {
    if (indicatorLockedRef.current) return;
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setIndicatorVisible(false);
    }, 2000);
  }, [clearHideTimer]);

  const activateIndicator = useCallback(
    (options?: { persist?: boolean }) => {
      setIndicatorReady(true);
      setIndicatorVisible(true);
      if (indicatorLockedRef.current) {
        clearHideTimer();
        return;
      }

      if (options?.persist) {
        clearHideTimer();
      } else {
        scheduleHideIndicator();
      }
    },
    [clearHideTimer, scheduleHideIndicator],
  );

  const scrollToIndex = useCallback((index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      activateIndicator();
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activateIndicator]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const index = SECTION_CONFIG.findIndex((section) => section.id === visibleEntry.target.getAttribute('data-section-id'));
          if (index !== -1) {
            setActiveIndex((prev) => (prev === index ? prev : index));
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScrollActivity = () => {
      activateIndicator();
    };

    container.addEventListener('scroll', handleScrollActivity, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScrollActivity);
    };
  }, [activateIndicator]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const handleIndicatorEnter = useCallback(() => {
    indicatorLockedRef.current = true;
    activateIndicator({ persist: true });
  }, [activateIndicator]);

  const handleIndicatorLeave = useCallback(() => {
    indicatorLockedRef.current = false;
    scheduleHideIndicator();
  }, [scheduleHideIndicator]);

  const handleIndicatorFocus = useCallback(() => {
    indicatorLockedRef.current = true;
    activateIndicator({ persist: true });
  }, [activateIndicator]);

  const handleIndicatorBlur = useCallback(() => {
    indicatorLockedRef.current = false;
    scheduleHideIndicator();
  }, [scheduleHideIndicator]);

  const shouldRenderIndicator = indicatorReady || indicatorVisible;

  const normalizedLanguage = useMemo(() => {
    const lang = (i18n.language || '').split('-')[0];
    if (LANGUAGES.includes(lang as (typeof LANGUAGES)[number])) {
      return lang as (typeof LANGUAGES)[number];
    }
    return LANGUAGES[0];
  }, [i18n.language]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = normalizedLanguage;
      document.documentElement.dir = RTL_LANGS.has(normalizedLanguage) ? 'rtl' : 'ltr';
    }
  }, [normalizedLanguage]);

  const currentLanguageLabel = languageLabels[normalizedLanguage] || normalizedLanguage.toUpperCase();

  const scheduleLanguageFadeReset = useCallback(() => {
    if (languageFadeTimerRef.current) {
      clearTimeout(languageFadeTimerRef.current);
    }
    languageFadeTimerRef.current = window.setTimeout(() => {
      setLanguageTransitioning(false);
    }, 320);
  }, []);

  const handleLanguageToggle = useCallback(() => {
    const currentIndex = LANGUAGES.findIndex((lang) => lang === normalizedLanguage);
    const nextLanguage = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    setLanguageTransitioning(true);
    scheduleLanguageFadeReset();

    i18n
      .changeLanguage(nextLanguage)
      .then(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = nextLanguage;
          document.documentElement.dir = RTL_LANGS.has(nextLanguage) ? 'rtl' : 'ltr';
        }
      })
      .catch((error) => {
        console.error('Failed to change language in PublicPage', error);
      });
  }, [i18n, normalizedLanguage, scheduleLanguageFadeReset]);

  useEffect(() => () => {
    if (languageFadeTimerRef.current) {
      clearTimeout(languageFadeTimerRef.current);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.languageSwitcher} ${languageTransitioning ? styles.languageSwitcherActive : ''}`}
        onClick={handleLanguageToggle}
        aria-label={t('publicPortfolio.languageSwitcherLabel')}
      >
        <span className={`${styles.languageLabel} ${languageTransitioning ? styles.languageLabelActive : ''}`}>
          {currentLanguageLabel}
        </span>
      </button>
      <div ref={scrollRef} className={styles.container}>
        {SECTION_CONFIG.map((section, index) => {
          const title = t(section.titleKey);
          const body = t(section.bodyKey);
          const cta = section.ctaKey ? t(section.ctaKey) : null;
          const sectionClass = `${styles.section} ${styles[section.id] ?? ''}`;

          return (
            <section
              key={section.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className={sectionClass}
              id={section.id}
              data-section-id={section.id}
            >
              <div className={styles.sectionInner}>
                <p className={styles.sectionLabel}>{String(index + 1).padStart(2, '0')}</p>
                <h2 className={index === 0 ? styles.heroTitle : styles.sectionTitle}>{title}</h2>
                <p className={styles.sectionBody}>{body}</p>

                {section.id === 'skills' ? (
                  <div className={styles.skillBars}>
                    {skillsList.map((label, skillIndex) => (
                      <div key={`${label}-${skillIndex}`} className={styles.skillBar}>
                        <span className={styles.skillLabel}>{label}</span>
                        <span
                          className={styles.skillMeter}
                          aria-hidden="true"
                          style={{ '--fill-width': `${Math.min(92, 65 + skillIndex * 8)}%` } as CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {section.id === 'projects' ? (
                  <div className={styles.projectGrid}>
                    {projectsList.map((project, projectIndex) => (
                      <article key={`${project.title}-${projectIndex}`} className={styles.projectCard}>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <p className={styles.projectSummary}>{project.summary}</p>
                      </article>
                    ))}
                  </div>
                ) : null}

                {cta && section.id === 'hero' ? (
                  <button
                    type="button"
                    className={styles.ctaButton}
                    onClick={() => scrollToIndex(index + 1)}
                  >
                    {cta}
                  </button>
                ) : null}

                {cta && section.id === 'contact' ? (
                  <button type="button" className={`${styles.ctaButton} ${styles.ctaGhost}`} onClick={() => scrollToIndex(0)}>
                    {cta}
                  </button>
                ) : null}
                {section.id === 'hero' ? (
                  <div className={styles.swipeHint} aria-hidden="true">
                    <span className={styles.swipeArrow} />
                    <span className={styles.swipeLabel}>{t('publicPortfolio.swipeHint')}</span>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {shouldRenderIndicator ? (
        <nav
          className={`${styles.indicator} ${indicatorVisible ? styles.indicatorVisible : ''}`}
          aria-label={t('publicPortfolio.indicatorLabel')}
          onMouseEnter={handleIndicatorEnter}
          onMouseLeave={handleIndicatorLeave}
          onTouchStart={handleIndicatorEnter}
          onTouchEnd={handleIndicatorLeave}
          onFocusCapture={handleIndicatorFocus}
          onBlurCapture={handleIndicatorBlur}
        >
          {SECTION_CONFIG.map((section, index) => {
            const isActive = index === activeIndex;
            const indicatorLabel = String(index + 1).padStart(2, '0');
            return (
              <button
                key={section.id}
                type="button"
                className={`${styles.indicatorButton} ${isActive ? styles.indicatorButtonActive : ''}`}
                onClick={() => scrollToIndex(index)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={t(section.titleKey)}
              >
                <span className={`${styles.indicatorNumber} ${isActive ? styles.indicatorNumberActive : ''}`}>{indicatorLabel}</span>
                <span className={`${styles.indicatorDot} ${isActive ? styles.indicatorDotActive : ''}`} aria-hidden="true" />
                <span className={styles.srOnly}>{t(section.titleKey)}</span>
              </button>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
