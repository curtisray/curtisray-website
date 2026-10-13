import { animate } from 'motion';
import { motionTokens } from '../design/motion';

interface MagnetOptions {
  container: Window | HTMLElement;
  axis: 'x' | 'y';
  targets: () => number[];
  enabled?: () => boolean;
  range?: () => number;
  write?: (position: number) => void;
}

/** A shared, interruptible settle after native scrolling and momentum finish. */
export function createScrollMagnet({
  container,
  axis,
  targets,
  enabled = () => true,
  range = () => Infinity,
  write,
}: MagnetOptions) {
  const controller = new AbortController();
  const { signal } = controller;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isPage = container === window;
  const read = () =>
    isPage
      ? window.scrollY
      : (container as HTMLElement)[axis === 'x' ? 'scrollLeft' : 'scrollTop'];
  const move =
    write ??
    ((position: number) => {
      if (isPage) window.scrollTo({ top: position, behavior: 'instant' });
      else
        (container as HTMLElement)[axis === 'x' ? 'scrollLeft' : 'scrollTop'] =
          position;
    });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pull: ReturnType<typeof animate> | undefined;
  let touching = false;
  let holdingPointer = false;
  let keyboardMode = false;
  let pending = false;
  const blocked = () =>
    Boolean(
      document.activeElement?.closest(
        'input, textarea, select, [contenteditable], [data-lenis-prevent]',
      ),
    );
  function interrupt() {
    clearTimeout(timer);
    pull?.stop();
    pull = undefined;
    pending = false;
  }
  function schedule() {
    clearTimeout(timer);
    if (
      !pending ||
      touching ||
      holdingPointer ||
      pull ||
      keyboardMode ||
      !enabled() ||
      blocked()
    )
      return;
    timer = setTimeout(() => {
      pending = false;
      const positions = targets();
      if (!positions.length || !enabled() || blocked()) return;
      const start = read();
      const target = positions.reduce((best, value) =>
        Math.abs(value - start) < Math.abs(best - start) ? value : best,
      );
      if (Math.abs(target - start) < 1 || Math.abs(target - start) > range())
        return;
      if (reducedMotion.matches) {
        move(target);
        return;
      }
      pull = animate(start, target, {
        duration: motionTokens.slow * 2,
        ease: motionTokens.settleEase,
        onUpdate: move,
        onComplete: () => {
          pull = undefined;
        },
      });
    }, 180);
  }
  const passive = { signal, passive: true };
  container.addEventListener(
    'scroll',
    () => {
      if (pull) return;
      pending = true;
      schedule();
    },
    passive,
  );
  container.addEventListener(
    'pointerdown',
    () => {
      holdingPointer = true;
      keyboardMode = false;
      interrupt();
    },
    passive,
  );
  const releasePointer = () => {
    holdingPointer = false;
    schedule();
  };
  window.addEventListener('pointerup', releasePointer, passive);
  window.addEventListener('pointercancel', releasePointer, passive);
  container.addEventListener(
    'touchstart',
    () => {
      touching = true;
      keyboardMode = false;
      interrupt();
    },
    passive,
  );
  const releaseTouch = (event: TouchEvent) => {
    touching = event.touches.length > 0;
    schedule();
  };
  window.addEventListener('touchend', releaseTouch, passive);
  window.addEventListener('touchcancel', releaseTouch, passive);
  container.addEventListener(
    'wheel',
    () => {
      keyboardMode = false;
      interrupt();
    },
    passive,
  );
  container.addEventListener(
    'keydown',
    () => {
      keyboardMode = true;
      interrupt();
    },
    { signal },
  );
  reducedMotion.addEventListener('change', interrupt, { signal });
  window.addEventListener('resize', interrupt, { signal });
  window.addEventListener('pagehide', interrupt, { signal });
  return () => {
    interrupt();
    controller.abort();
  };
}
