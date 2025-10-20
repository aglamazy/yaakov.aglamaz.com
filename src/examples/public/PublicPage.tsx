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

type BubbleConfig = {
  size: number;
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
};

const FLOATING_BUBBLES: BubbleConfig[] = [
  { size: 18, left: 18, top: 32, driftX: 24, driftY: 30, duration: 6.2, delay: 0 },
  { size: 22, left: 32, top: 58, driftX: -22, driftY: 36, duration: 7.6, delay: 0.8 },
  { size: 14, left: 46, top: 24, driftX: 18, driftY: 24, duration: 5.4, delay: 0.5 },
  { size: 26, left: 64, top: 68, driftX: -30, driftY: 38, duration: 8.2, delay: 0.9 },
  { size: 18, left: 78, top: 38, driftX: 22, driftY: 32, duration: 6.8, delay: 1.3 },
  { size: 12, left: 52, top: 52, driftX: -16, driftY: 22, duration: 5.1, delay: 1.8 },
  { size: 24, left: 26, top: 72, driftX: 24, driftY: 34, duration: 7.2, delay: 0.2 },
  { size: 15, left: 70, top: 22, driftX: -20, driftY: 24, duration: 5.9, delay: 0.9 },
];

const BACKGROUND_BLOB_BASES = [
  { x: 22, y: 20, strength: 1.2 },
  { x: 76, y: 18, strength: 0.95 },
  { x: 58, y: 72, strength: 1.15 },
  { x: 30, y: 84, strength: 1.05 },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface PublicPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function PublicPage({ heroTitle, heroSubtitle }: PublicPageProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
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
    }, 2000) as unknown as ReturnType<typeof setTimeout>;
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
    }, 320) as unknown as ReturnType<typeof setTimeout>;
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const backdrop = backgroundRef.current;
    if (!backdrop) {
      return undefined;
    }

    const hero = heroSectionRef.current;

    let animationFrame: number | undefined;
    const state = {
      x: 50,
      y: 50,
      targetX: 50,
      targetY: 50,
      influence: 0,
      targetInfluence: 0,
    };

    const setBlobPositions = () => {
      state.x += (state.targetX - state.x) * 0.08;
      state.y += (state.targetY - state.y) * 0.08;
      state.influence += (state.targetInfluence - state.influence) * 0.08;

      const offsetX = ((state.x - 50) / 50) * (4 + state.influence * 6);
      const offsetY = ((state.y - 50) / 50) * (4 + state.influence * 6);

      BACKGROUND_BLOB_BASES.forEach((base, index) => {
        const finalX = clamp(base.x + offsetX * base.strength, 0, 100);
        const finalY = clamp(base.y + offsetY * base.strength, 0, 100);
        backdrop.style.setProperty(`--blob${index + 1}-x`, `${finalX}%`);
        backdrop.style.setProperty(`--blob${index + 1}-y`, `${finalY}%`);
      });

      animationFrame = requestAnimationFrame(setBlobPositions);
    };

    const updatePointer = (event: { clientX: number; clientY: number }) => {
      const viewportWidth = window.innerWidth || 1;
      const viewportHeight = window.innerHeight || 1;
      const relativeX = clamp((event.clientX / viewportWidth) * 100, 0, 100);
      const relativeY = clamp((event.clientY / viewportHeight) * 100, 0, 100);

      let centerX = viewportWidth / 2;
      let centerY = viewportHeight / 2;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      state.targetX = relativeX;
      state.targetY = relativeY;
      state.targetInfluence = Math.min(distance / 220, 1);
    };

    const resetPointer = () => {
      state.targetX = 50;
      state.targetY = 50;
      state.targetInfluence = 0;
    };

    animationFrame = requestAnimationFrame(setBlobPositions);

    const handlePointerMove = (event: PointerEvent) => updatePointer(event);
    const handlePointerDown = (event: PointerEvent) => updatePointer(event);
    const handlePointerUp = () => resetPointer();
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePointer({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePointer({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };
    const handleTouchEnd = () => resetPointer();
    const handleTouchCancel = () => resetPointer();
    const handlePointerLeaveWindow = () => resetPointer();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeaveWindow, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointerleave', handlePointerLeaveWindow);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={backgroundRef} className={styles.backgroundCanvas} aria-hidden="true" />
      <div className={styles.bubbleField} aria-hidden="true">
        {FLOATING_BUBBLES.map((bubble, bubbleIndex) => (
          <span
            key={`${bubble.left}-${bubble.top}-${bubbleIndex}`}
            className={styles.bubble}
            style={
              {
                '--bubble-size': `${bubble.size}px`,
                '--bubble-left': `${bubble.left}%`,
                '--bubble-top': `${bubble.top}%`,
                '--bubble-drift-x': `${bubble.driftX}px`,
                '--bubble-drift-y': `${bubble.driftY}px`,
                '--bubble-duration': `${bubble.duration}s`,
                '--bubble-delay': `${bubble.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
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
          const isHero = section.id === 'hero';
          const title = isHero && heroTitle ? heroTitle : t(section.titleKey);
          const body = isHero && heroSubtitle ? heroSubtitle : t(section.bodyKey);
          const cta = section.ctaKey ? t(section.ctaKey) : null;
          const sectionClass = `${styles.section} ${styles[section.id] ?? ''}`;

          return (
            <section
              key={section.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
                if (isHero) {
                  heroSectionRef.current = el ?? null;
                }
              }}
              className={sectionClass}
              id={section.id}
              data-section-id={section.id}
            >
              <div className={styles.sectionInner}>
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
            return (
              <button
                key={section.id}
                type="button"
                className={`${styles.indicatorButton} ${isActive ? styles.indicatorButtonActive : ''}`}
                onClick={() => scrollToIndex(index)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={t(section.titleKey)}
              >
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
