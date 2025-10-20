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

const HERO_BLOB_BASES = [
  { x: 20, y: 20, strength: 1.05 },
  { x: 80, y: 15, strength: 0.9 },
  { x: 60, y: 70, strength: 1.1 },
  { x: 32, y: 82, strength: 0.85 },
];

const HERO_BUBBLES = [
  { id: 1, left: 18, top: 32, size: 12, driftX: '18px', driftY: '-26px', duration: 14, delay: 0 },
  { id: 2, left: 64, top: 26, size: 14, driftX: '-22px', driftY: '-18px', duration: 16, delay: 1.8 },
  { id: 3, left: 42, top: 64, size: 10, driftX: '16px', driftY: '20px', duration: 13, delay: 0.6 },
  { id: 4, left: 78, top: 58, size: 8, driftX: '10px', driftY: '-18px', duration: 11, delay: 2.4 },
  { id: 5, left: 28, top: 58, size: 9, driftX: '-18px', driftY: '24px', duration: 17, delay: 1.2 },
  { id: 6, left: 54, top: 18, size: 11, driftX: '22px', driftY: '18px', duration: 15, delay: 3.2 },
  { id: 7, left: 84, top: 34, size: 7, driftX: '-12px', driftY: '16px', duration: 12, delay: 0.9 },
  { id: 8, left: 12, top: 48, size: 9, driftX: '24px', driftY: '-16px', duration: 18, delay: 2.9 },
  { id: 9, left: 48, top: 82, size: 8, driftX: '-20px', driftY: '-22px', duration: 16, delay: 1.5 },
  { id: 10, left: 70, top: 74, size: 10, driftX: '18px', driftY: '18px', duration: 19, delay: 0.3 },
  { id: 11, left: 32, top: 20, size: 7, driftX: '-14px', driftY: '14px', duration: 12, delay: 2.1 },
  { id: 12, left: 58, top: 48, size: 9, driftX: '16px', driftY: '-14px', duration: 15, delay: 3.6 },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface PublicPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function PublicPage({ heroTitle, heroSubtitle }: PublicPageProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    const hero = heroSectionRef.current;
    if (!hero) {
      return undefined;
    }

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

      const offsetX = ((state.x - 50) / 50) * (3 + state.influence * 4);
      const offsetY = ((state.y - 50) / 50) * (3 + state.influence * 4);

      HERO_BLOB_BASES.forEach((base, index) => {
        const finalX = clamp(base.x + offsetX * base.strength, 0, 100);
        const finalY = clamp(base.y + offsetY * base.strength, 0, 100);

        hero.style.setProperty(`--blob${index + 1}-x`, `${finalX}%`);
        hero.style.setProperty(`--blob${index + 1}-y`, `${finalY}%`);
      });

      animationFrame = requestAnimationFrame(setBlobPositions);
    };

    const updatePointer = (event: { clientX: number; clientY: number }) => {
      const rect = hero.getBoundingClientRect();
      const relativeX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const relativeY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      state.targetX = relativeX;
      state.targetY = relativeY;
      state.targetInfluence = Math.min(distance / 200, 1);
    };

    const resetPointer = () => {
      state.targetX = 50;
      state.targetY = 50;
      state.targetInfluence = 0;
    };

    animationFrame = requestAnimationFrame(setBlobPositions);

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event);
    };

    const handlePointerUp = () => {
      resetPointer();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePointer({ clientX: touch.clientX, clientY: touch.clientY } as PointerEvent);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePointer({ clientX: touch.clientX, clientY: touch.clientY } as PointerEvent);
      }
    };

    const handleTouchEnd = () => {
      resetPointer();
    };

    const handleTouchCancel = () => {
      resetPointer();
    };

    hero.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero.addEventListener('pointerdown', handlePointerDown, { passive: true });
    hero.addEventListener('pointerup', handlePointerUp, { passive: true });
    hero.addEventListener('pointerleave', handlePointerUp, { passive: true });
    hero.addEventListener('pointercancel', handlePointerUp, { passive: true });
    hero.addEventListener('pointerout', handlePointerUp, { passive: true });
    hero.addEventListener('touchmove', handleTouchMove, { passive: true });
    hero.addEventListener('touchstart', handleTouchStart, { passive: true });
    hero.addEventListener('touchend', handleTouchEnd, { passive: true });
    hero.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerdown', handlePointerDown);
      hero.removeEventListener('pointerup', handlePointerUp);
      hero.removeEventListener('pointerleave', handlePointerUp);
      hero.removeEventListener('pointercancel', handlePointerUp);
      hero.removeEventListener('pointerout', handlePointerUp);
      hero.removeEventListener('touchmove', handleTouchMove);
      hero.removeEventListener('touchstart', handleTouchStart);
      hero.removeEventListener('touchend', handleTouchEnd);
      hero.removeEventListener('touchcancel', handleTouchCancel);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    };
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
              {isHero ? (
                <>
                  <div className={`${styles.sectionInner} ${styles.heroInner}`}>
                    <div className={styles.heroContent}>
                      <h2 className={styles.heroTitle}>{title}</h2>
                      <p className={`${styles.sectionBody} ${styles.heroBody}`}>{body}</p>
                      {cta ? (
                        <button
                          type="button"
                          className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}
                          onClick={() => scrollToIndex(index + 1)}
                        >
                          {cta}
                        </button>
                      ) : null}
                    </div>

                    <div className={styles.heroScene} aria-hidden="true">
                      <div className={styles.heroSceneBackdrop} />
                      <div className={styles.heroSceneGlow} />
                      <div className={styles.heroBubbles}>
                        {HERO_BUBBLES.map((bubble) => (
                          <span
                            key={bubble.id}
                            className={styles.heroBubble}
                            style={{
                              '--bubble-left': `${bubble.left}%`,
                              '--bubble-top': `${bubble.top}%`,
                              '--bubble-size': `${bubble.size}px`,
                              '--bubble-drift-x': bubble.driftX,
                              '--bubble-drift-y': bubble.driftY,
                              '--bubble-duration': `${bubble.duration}s`,
                              '--bubble-delay': `${bubble.delay}s`,
                            } as CSSProperties}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.swipeHint} ${styles.heroSwipeHint}`} aria-hidden="true">
                    <span className={styles.swipeArrow} />
                    <span className={styles.swipeLabel}>{t('publicPortfolio.swipeHint')}</span>
                  </div>
                </>
              ) : (
                <div className={styles.sectionInner}>
                  <h2 className={styles.sectionTitle}>{title}</h2>
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

                  {cta && section.id === 'contact' ? (
                    <button type="button" className={`${styles.ctaButton} ${styles.ctaGhost}`} onClick={() => scrollToIndex(0)}>
                      {cta}
                    </button>
                  ) : null}
                </div>
              )}
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
