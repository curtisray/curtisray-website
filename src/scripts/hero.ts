import { motionTokens } from '../design/motion';
import type { AnimationPlaybackControls } from 'motion';

const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('.hero');
const sky = hero?.querySelector<HTMLImageElement>('.hero-clouds');
const brand = hero?.querySelector<HTMLElement>('.hero-brand');
const copy = hero?.querySelector<HTMLElement>('.hero-copy');
const contactBar = document.querySelector<HTMLElement>(
  '.site-header .contact-bar',
);

if (hero && sky && brand && copy && contactBar && root.dataset.heroEntrance) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  let animation: AnimationPlaybackControls | undefined;
  let finished = false;
  let afterRender = (callback: () => void) => callback();

  const finish = () => {
    finished = true;
    animation?.cancel();
    const clearMasks = () => {
      for (const element of [sky, brand, copy, contactBar]) {
        element.style.removeProperty('clip-path');
      }
      delete root.dataset.heroEntrance;
    };
    clearMasks();
    // Motion can queue its final style write after the completion promise.
    afterRender(clearMasks);
    listeners.abort();
  };

  reduced.addEventListener('change', finish, { signal: listeners.signal });
  hero.addEventListener('focusin', finish, { signal: listeners.signal });
  contactBar.addEventListener('focusin', finish, { signal: listeners.signal });
  contactBar.addEventListener('pointerdown', finish, {
    signal: listeners.signal,
  });
  window.addEventListener('pagehide', finish, { signal: listeners.signal });

  // Decode the first image before revealing it; retain Astro's static markup.
  Promise.all([import('motion'), sky.decode().catch(() => undefined)])
    .then(([{ animate, frame }]) => {
      afterRender = (callback) => frame.postRender(callback);
      if (
        finished ||
        !root.dataset.heroEntrance ||
        reduced.matches ||
        hero.getBoundingClientRect().bottom <= 0
      ) {
        finish();
        return;
      }

      const duration = motionTokens.slow;
      const boxesAt = duration - motionTokens.quick / 2;
      const revealed = 'inset(0% 0% 0% 0%)';
      animation = animate([
        [
          sky,
          { clipPath: ['inset(0% 0% 0% 100%)', revealed] },
          { duration, ease: motionTokens.ease, at: 0 },
        ],
        [
          brand,
          { clipPath: ['inset(100% 0% 0% 0%)', revealed] },
          { duration, ease: motionTokens.ease, at: boxesAt },
        ],
        [
          copy,
          { clipPath: ['inset(0% 0% 100% 0%)', revealed] },
          { duration, ease: motionTokens.ease, at: boxesAt },
        ],
        [
          contactBar,
          { clipPath: ['inset(0% 100% 0% 0%)', revealed] },
          { duration, ease: motionTokens.ease, at: boxesAt + duration },
        ],
      ]);
      void animation.finished.then(finish);
    })
    .catch(finish);

  if (import.meta.hot) import.meta.hot.dispose(finish);
}
