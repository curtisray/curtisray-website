import Lenis from 'lenis';
import { createScrollMagnet } from './magnet';

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
const mobile = matchMedia('(max-width: 760px)');
const header = document.querySelector<HTMLElement>('.site-header');
const surface = document.querySelector<HTMLElement>('.page-surface');
const headerResize = new ResizeObserver(() => {
  if (header && surface)
    surface.style.setProperty(
      '--mobile-header-height',
      `${header.offsetHeight}px`,
    );
});
if (header) headerResize.observe(header);
const destroyMagnet = createScrollMagnet({
  container: window,
  axis: 'y',
  enabled: () => sectionStarts.length > 0 && !reducedMotion.matches,
  targets: () => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    return [
      0,
      ...sectionStarts.map((section) =>
        Math.max(
          0,
          Math.min(maximum, section.getBoundingClientRect().top + scrollY),
        ),
      ),
    ];
  },
  range: () => {
    // Tall content remains freely scrollable, including zoomed or short screens.
    const current = [
      ...document.querySelectorAll<HTMLElement>(
        '.hero, .developer-overview, .work-shelf, .site-footer-full',
      ),
    ].find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom > 1;
    });
    return mobile.matches &&
      (!current || current.offsetHeight <= innerHeight + 1)
      ? Infinity
      : Math.min(80, innerHeight * 0.08);
  },
  write: (position) => {
    if (lenis) lenis.scrollTo(position, { immediate: true });
    else window.scrollTo({ top: position, behavior: 'instant' });
  },
});

function syncScrolling() {
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
    lenis?.destroy();
    destroyMagnet();
    headerResize.disconnect();
    controller.abort();
  });
