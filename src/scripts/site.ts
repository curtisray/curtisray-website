import Lenis from 'lenis';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
let lenis: Lenis | undefined;
const controller = new AbortController();
const { signal } = controller;

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
window.addEventListener('pagehide', () => lenis?.destroy(), { signal });
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
    controller.abort();
  });
