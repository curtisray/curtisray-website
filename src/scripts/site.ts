import Lenis from 'lenis';
import { cubicBezier } from 'motion';
import { motionTokens } from '../design/motion';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
let lenis: Lenis | undefined;
const controller = new AbortController();
const { signal } = controller;
const sectionStarts = document.querySelector('.hero')
  ? [
      ...document.querySelectorAll<HTMLElement>(
        '.developer-overview, .work-shelf, .site-footer-full',
      ),
    ]
  : [];
let settleTimer: ReturnType<typeof setTimeout> | undefined;
let wheelIntent = false;
let snapping = false;
let pointerDown = false;

function clearMagnet() {
  clearTimeout(settleTimer);
  if (snapping) lenis?.scrollTo(window.scrollY, { immediate: true });
  wheelIntent = false;
  snapping = false;
}

function settleSection() {
  if (
    !lenis ||
    !wheelIntent ||
    snapping ||
    pointerDown ||
    !sectionStarts.length
  )
    return;
  wheelIntent = false;
  const active = document.activeElement;
  if (
    active?.closest(
      'input, textarea, select, [contenteditable], [data-lenis-prevent]',
    )
  )
    return;
  const maximum = document.documentElement.scrollHeight - innerHeight;
  const targets = [
    0,
    ...sectionStarts.map((section) =>
      Math.min(maximum, section.getBoundingClientRect().top + scrollY),
    ),
  ];
  const nearest = targets.reduce((best, target) =>
    Math.abs(target - scrollY) < Math.abs(best - scrollY) ? target : best,
  );
  const distance = Math.abs(nearest - scrollY);
  // Only the final few pixels attract: never pull through a section's content.
  if (distance < 2 || distance > Math.min(80, innerHeight * 0.08)) return;
  snapping = true;
  lenis.scrollTo(nearest, {
    duration: motionTokens.slow * 2,
    easing: cubicBezier(...motionTokens.settleEase),
    lock: false,
    onComplete: () => {
      snapping = false;
    },
  });
}

window.addEventListener(
  'wheel',
  (event) => {
    if (
      !lenis ||
      innerWidth <= 760 ||
      event.ctrlKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    )
      return;
    const target = event.target as Element;
    if (
      target.closest(
        'input, textarea, select, [contenteditable], [data-lenis-prevent]',
      )
    )
      return;
    // A new wheel gesture always takes control back from a settling animation.
    snapping = false;
    wheelIntent = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settleSection, 200);
  },
  { signal, passive: true },
);
window.addEventListener(
  'scroll',
  () => {
    if (!wheelIntent || snapping) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settleSection, 160);
  },
  { signal, passive: true },
);
window.addEventListener(
  'pointerdown',
  () => {
    pointerDown = true;
    clearMagnet();
  },
  { signal, passive: true },
);
window.addEventListener(
  'pointerup',
  () => {
    pointerDown = false;
  },
  { signal, passive: true },
);
window.addEventListener('keydown', clearMagnet, { signal });

function syncScrolling() {
  clearMagnet();
  lenis?.destroy();
  // Touch scrolling stays native; wheel scrolling retains the site's Lenis feel.
  lenis =
    !reducedMotion.matches && finePointer.matches
      ? new Lenis({ autoRaf: true, anchors: true })
      : undefined;
}
syncScrolling();
reducedMotion.addEventListener('change', syncScrolling, { signal });
finePointer.addEventListener('change', syncScrolling, { signal });
window.addEventListener(
  'pagehide',
  () => {
    clearMagnet();
    lenis?.destroy();
  },
  { signal },
);
window.addEventListener(
  'pageshow',
  (event) => {
    if (event.persisted) syncScrolling();
  },
  { signal },
);

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    clearMagnet();
    lenis?.destroy();
    controller.abort();
  });
