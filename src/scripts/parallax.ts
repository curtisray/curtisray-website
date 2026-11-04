import { motionTokens } from '../design/motion';
import type { scroll as motionScroll } from 'motion';

const blocks = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
if (blocks.length) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const controller = new AbortController();
  const active = new Map<HTMLElement, () => void>();
  let observer: IntersectionObserver | undefined;
  let version = 0;

  const clear = () => {
    observer?.disconnect();
    observer = undefined;
    active.forEach((stop) => stop());
    active.clear();
    blocks.forEach((block) => block.style.removeProperty('--parallax-y'));
  };
  const startBlock = (block: HTMLElement, scroll: typeof motionScroll) => {
    if (active.has(block)) return;
    const kind = block.dataset
      .parallax as keyof typeof motionTokens.parallax.distance;
    const distance =
      motionTokens.parallax.distance[kind] ??
      motionTokens.parallax.distance.text;
    const amplitude =
      distance * (mobile.matches ? motionTokens.parallax.mobileScale : 1);
    const stop = scroll(
      (progress: number) => {
        block.style.setProperty(
          '--parallax-y',
          `${(progress * 2 - 1) * amplitude}px`,
        );
      },
      { target: block, offset: ['start end', 'end start'] },
    );
    active.set(block, stop);
  };
  async function sync() {
    const currentVersion = ++version;
    clear();
    if (reduced.matches || document.hidden) return;
    const { scroll } = await import('motion');
    if (
      currentVersion !== version ||
      controller.signal.aborted ||
      reduced.matches ||
      document.hidden
    )
      return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const block = entry.target as HTMLElement;
          if (entry.isIntersecting) startBlock(block, scroll);
          else {
            active.get(block)?.();
            active.delete(block);
            block.style.removeProperty('--parallax-y');
          }
        });
      },
      { rootMargin: '100px 0px' },
    );
    blocks.forEach((block) => observer!.observe(block));
  }
  const refresh = () => {
    void sync().catch(clear);
  };
  reduced.addEventListener('change', refresh, { signal: controller.signal });
  mobile.addEventListener('change', refresh, { signal: controller.signal });
  document.addEventListener('visibilitychange', refresh, {
    signal: controller.signal,
  });
  window.addEventListener(
    'pagehide',
    () => {
      ++version;
      clear();
    },
    { signal: controller.signal },
  );
  window.addEventListener('pageshow', refresh, { signal: controller.signal });
  refresh();
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      ++version;
      controller.abort();
      clear();
    });
}
