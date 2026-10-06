import { motionTokens } from '../design/motion';

const controller = new AbortController();
const { signal } = controller;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const colors = [
  'var(--color-accent)',
  'var(--color-accent-pink)',
  'var(--color-accent-blue)',
];
type Animation = ReturnType<(typeof import('motion'))['animate']>;
const active = new Set<Animation>();
const cleanups: (() => void)[] = [];
let motion: Promise<typeof import('motion')> | undefined;
const loadMotion = () => (motion ??= import('motion'));

for (const details of document.querySelectorAll<HTMLDetailsElement>(
  '.contact',
)) {
  const trigger = details.querySelector<HTMLElement>('summary')!;
  const panel = details.querySelector<HTMLElement>('.contact-panel')!;
  const form = panel.querySelector<HTMLFormElement>('form')!;
  let color = 0;
  let version = 0;
  let animations: Animation[] = [];

  function reset() {
    delete details.dataset.opening;
    panel.style.removeProperty('width');
    panel.style.removeProperty('height');
    panel.style.removeProperty('overflow');
    form.style.removeProperty('width');
    form.style.removeProperty('opacity');
    form.style.removeProperty('transform');
    trigger.style.removeProperty('opacity');
  }
  function stop() {
    animations.forEach((animation) => {
      animation.stop();
      active.delete(animation);
    });
    animations = [];
    reset();
  }
  function close() {
    ++version;
    stop();
    // Hide before moving focus: touch browsers can otherwise paint the stale overlay.
    panel.hidden = true;
    details.open = false;
    trigger.focus({ preventScroll: true });
  }
  // Native delegation works even before the form's React island has hydrated.
  details.addEventListener(
    'click',
    (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest('.contact-close')
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      close();
    },
    { signal },
  );
  details.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || !details.open) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    },
    { signal },
  );
  cleanups.push(stop);
  trigger.addEventListener(
    'pointerenter',
    () => {
      if (details.open) return;
      details.style.setProperty(
        '--contact-highlight',
        colors[color++ % colors.length],
      );
      void loadMotion();
    },
    { signal },
  );
  trigger.addEventListener(
    'focus',
    () => {
      void loadMotion();
    },
    { signal },
  );
  // Freeze the chosen color before focus or pointer movement changes the button.
  trigger.addEventListener(
    'click',
    () => {
      if (!details.open) {
        const highlight = getComputedStyle(details)
          .getPropertyValue('--contact-highlight')
          .trim();
        panel.style.setProperty(
          '--contact-background',
          highlight || 'var(--color-accent)',
        );
      }
    },
    { signal },
  );
  details.addEventListener(
    'toggle',
    async () => {
      const current = ++version;
      stop();
      panel.hidden = !details.open;
      if (!details.open || reducedMotion.matches) return;
      const target = panel.getBoundingClientRect();
      const source = trigger.getBoundingClientRect();
      // Only the absolute overlay changes dimensions; the page and form never reflow.
      form.style.width = `${target.width - 2}px`;
      details.dataset.opening = '';
      panel.style.width = `${source.width}px`;
      panel.style.height = `${source.height}px`;
      panel.style.overflow = 'hidden';
      try {
        const { animate } = await loadMotion();
        if (signal.aborted || current !== version || !details.open) return;
        if (reducedMotion.matches) {
          reset();
          return;
        }
        animations = [
          animate(
            panel,
            {
              width: [source.width, target.width],
              height: [source.height, target.height],
            },
            {
              duration: motionTokens.slow,
              ease: motionTokens.ease,
            },
          ),
          animate(
            form,
            { opacity: [0, 1], y: [6, 0] },
            {
              delay: motionTokens.quick,
              duration: motionTokens.standard,
              ease: motionTokens.ease,
            },
          ),
          animate(
            trigger,
            { opacity: [1, 0] },
            { duration: motionTokens.quick },
          ),
        ];
        animations.forEach((animation) => active.add(animation));
        await Promise.all(animations.map((animation) => animation.finished));
        if (current === version) stop();
      } catch (error) {
        if (current === version) stop();
        console.error('Contact animation could not load', error);
      }
    },
    { signal },
  );
}
reducedMotion.addEventListener(
  'change',
  () => {
    if (reducedMotion.matches)
      active.forEach((animation) => animation.complete());
  },
  { signal },
);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    controller.abort();
    cleanups.forEach((cleanup) => cleanup());
  });
