'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './PublicPage.module.css';

// Extracted from PublicPage.tsx 2026-06-01 to enable dynamic-import
// (ssr:false) — keeps the bubble physics + ~250 LOC of animation code out
// of the initial JS bundle. PublicPage stays server-render-friendly for
// the content body; bubbles lazy-load after first paint.

type BubbleConfig = {
  size: number;
  initialX: number;
  initialY: number;
  velocityX: number;
  velocityY: number;
  speedVariance: number;
  colors: {
    inner: string;
    outer: string;
  };
};

const BUBBLE_COUNT = 10;
const MAX_BUBBLE_SIZE = 46;
const MIN_BUBBLE_SIZE = 18;
const MAX_BUBBLE_VELOCITY = 0.065;
const MIN_BUBBLE_VELOCITY = 0.025;
const BLOW_PROBABILITY = 0.5;
const RETURN_EASING = 0.0085;
const BOOST_FACTOR = 20;

const createBubbleConfigs = (count: number, maxSize: number, maxVelocity: number): BubbleConfig[] => {
  const minSize = Math.min(MIN_BUBBLE_SIZE, maxSize * 0.45);
  const minVelocity = Math.min(MIN_BUBBLE_VELOCITY, maxVelocity * 0.35);

  return Array.from({ length: count }, () => {
    const size = minSize + Math.random() * (maxSize - minSize);
    const angle = Math.random() * Math.PI * 2;
    const speed = minVelocity + Math.random() * (maxVelocity - minVelocity);
    const baseHue = Math.floor(Math.random() * 360);
    const hueOffset = 35 + Math.random() * 25;
    const inner = `hsla(${baseHue}, 85%, ${65 + Math.random() * 10}%, 0.95)`;
    const outer = `hsla(${(baseHue + hueOffset) % 360}, 70%, ${35 + Math.random() * 10}%, 0.55)`;
    return {
      size,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      speedVariance: speed * 0.6,
      colors: {
        inner,
        outer,
      },
    } satisfies BubbleConfig;
  });
};

export default function BubbleField() {
  const bubbleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [bubbleConfigs, setBubbleConfigs] = useState<BubbleConfig[]>([]);

  useEffect(() => {
    // Generate bubbles only on client after mount to avoid hydration mismatch
    setBubbleConfigs(createBubbleConfigs(BUBBLE_COUNT, MAX_BUBBLE_SIZE, MAX_BUBBLE_VELOCITY));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || bubbleConfigs.length === 0) {
      return undefined;
    }

    const wrapCoordinate = (value: number) => {
      const min = -18;
      const max = 118;
      const span = max - min;
      if (value < min) {
        return value + span;
      }
      if (value > max) {
        return value - span;
      }
      return value;
    };

    const speedMultiplier = 1.5;
    const bubbleStates = bubbleConfigs.map((bubble) => {
      const baseVx = bubble.velocityX * speedMultiplier;
      const baseVy = bubble.velocityY * speedMultiplier;
      return {
        x: bubble.initialX,
        y: bubble.initialY,
        vx: baseVx,
        vy: baseVy,
        targetVx: baseVx,
        targetVy: baseVy,
        baseVx,
        baseVy,
        size: bubble.size,
        blown: false,
      };
    });

    const bubbleElements = bubbleRefs.current.map((bubbleEl) => bubbleEl);
    const clickHandlers: Array<((event: MouseEvent) => void) | null> = [];
    const computeTransform = (state: (typeof bubbleStates)[number]) =>
      `translate3d(calc(${state.x}vw - ${state.size / 2}px), calc(${state.y}vh - ${state.size / 2}px), 0)`;

    bubbleElements.forEach((bubbleEl, index) => {
      const state = bubbleStates[index];
      if (!bubbleEl || !state) return;
      bubbleEl.style.willChange = 'transform';
      bubbleEl.style.transform = computeTransform(state);

      const handleClick = () => {
        if (state.blown) return;
        const currentSpeed = Math.hypot(state.vx, state.vy) || Math.hypot(state.baseVx, state.baseVy) || 0.04;
        const trigger = Math.random();
        if (trigger < BLOW_PROBABILITY) {
          state.blown = true;
          bubbleEl.style.pointerEvents = 'none';
          state.vx = 0;
          state.vy = 0;
          state.targetVx = 0;
          state.targetVy = 0;
          state.baseVx = 0;
          state.baseVy = 0;
          const stableTransform = computeTransform(state);
          bubbleEl.style.transform = stableTransform;
          const animation = bubbleEl.animate(
            [
              { transform: `${stableTransform} scale(1)`, opacity: 1 },
              { transform: `${stableTransform} scale(1.9)`, opacity: 0 },
            ],
            { duration: 520, easing: 'ease-out', fill: 'forwards' },
          );
          animation.finished.catch(() => {});
          return;
        }

        const boostedSpeed = currentSpeed * BOOST_FACTOR;
        const dirX = -(state.vx || state.baseVx);
        const dirY = -(state.vy || state.baseVy);
        const directionLength = Math.hypot(dirX, dirY) || 1;
        const normX = dirX / directionLength;
        const normY = dirY / directionLength;

        state.vx = normX * boostedSpeed;
        state.vy = normY * boostedSpeed;
        state.targetVx = state.baseVx;
        state.targetVy = state.baseVy;
      };

      bubbleEl.addEventListener('click', handleClick);
      clickHandlers[index] = handleClick;
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      return undefined;
    }

    const intervalHandles: number[] = bubbleStates.map((state, index) =>
      window.setInterval(() => {
        if (state.blown) return;
        const config = bubbleConfigs[index];
        const range = config.speedVariance;
        const jitterMultiplier = 2;
        const nextTargetVx = (config.velocityX + (Math.random() - 0.5) * range * jitterMultiplier) * speedMultiplier;
        const nextTargetVy = (config.velocityY + (Math.random() - 0.5) * range * jitterMultiplier) * speedMultiplier;
        state.targetVx = nextTargetVx;
        state.targetVy = nextTargetVy;
        state.baseVx = nextTargetVx;
        state.baseVy = nextTargetVy;
      }, 3800 + Math.random() * 3600),
    );

    let animationFrame: number | undefined;

    const step = () => {
      bubbleElements.forEach((bubbleEl, index) => {
        const state = bubbleStates[index];
        if (!bubbleEl || !state || state.blown) return;

        state.vx += (state.targetVx - state.vx) * RETURN_EASING;
        state.vy += (state.targetVy - state.vy) * RETURN_EASING;

        state.x += state.vx;
        state.y += state.vy;

        state.x = wrapCoordinate(state.x);
        state.y = wrapCoordinate(state.y);

        bubbleEl.style.transform = computeTransform(state);
      });

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      intervalHandles.forEach((handle) => {
        window.clearInterval(handle);
      });
      bubbleElements.forEach((bubbleEl, index) => {
        const handler = clickHandlers[index];
        if (bubbleEl && handler) {
          bubbleEl.removeEventListener('click', handler);
        }
      });
    };
  }, [bubbleConfigs]);

  return (
    <div className={styles.bubbleField} aria-hidden="true">
      {bubbleConfigs.map((bubble, bubbleIndex) => (
        <span
          key={`${bubble.initialX}-${bubble.initialY}-${bubble.size}-${bubbleIndex}`}
          className={styles.bubble}
          ref={(element) => {
            bubbleRefs.current[bubbleIndex] = element;
          }}
          style={
            {
              '--bubble-size': `${bubble.size}px`,
              background: `radial-gradient(circle at 35% 30%, ${bubble.colors.inner}, ${bubble.colors.outer})`,
              transform: `translate3d(calc(${bubble.initialX}vw - ${bubble.size / 2}px), calc(${bubble.initialY}vh - ${bubble.size / 2}px), 0)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
