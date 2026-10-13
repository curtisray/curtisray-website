// Load only the focused preview; keep the Astro image for unsupported playback.
export function createShelfPreviews(
  rail: HTMLElement,
  reducedMotion: MediaQueryList,
  signal: AbortSignal,
) {
  let focused: HTMLElement | undefined;
  let active: HTMLVideoElement | undefined;
  let control: HTMLButtonElement | undefined;
  let visible = false;

  function sync() {
    const next =
      visible && !document.hidden && !reducedMotion.matches
        ? focused?.querySelector<HTMLVideoElement>('[data-preview-src]')
        : undefined;
    if (next === active) return;
    if (control) control.hidden = true;
    active?.pause();
    active?.removeAttribute('data-playing');
    active = next ?? undefined;
    if (!active) return;
    control =
      focused?.querySelector<HTMLButtonElement>('[data-preview-toggle]') ??
      undefined;
    if (control) {
      control.hidden = false;
      control.textContent = 'Pause preview';
    }
    active.muted = true;
    if (!active.hasAttribute('src')) active.src = active.dataset.previewSrc!;
    const video = active;
    void video.play().catch(() => {
      // Autoplay restrictions and decoding errors leave the static image visible.
      if (active === video && video.paused && control)
        control.textContent = 'Play preview';
    });
  }
  rail.addEventListener(
    'click',
    (event) => {
      const button = (event.target as Element).closest('[data-preview-toggle]');
      if (!button || button !== control || !active) return;
      if (active.paused) {
        void active
          .play()
          .then(() => {
            if (control === button) control.textContent = 'Pause preview';
          })
          .catch(() => {});
      } else {
        active.pause();
        control.textContent = 'Play preview';
      }
    },
    { signal },
  );
  rail.addEventListener(
    'playing',
    (event) => {
      const video = event.target as HTMLVideoElement;
      if (video === active) {
        video.dataset.playing = '';
        if (control) control.textContent = 'Pause preview';
      } else video.pause();
    },
    { capture: true, signal },
  );
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  observer.observe(rail);
  document.addEventListener('visibilitychange', sync, { signal });
  reducedMotion.addEventListener('change', sync, { signal });
  signal.addEventListener('abort', () => {
    observer.disconnect();
    active?.pause();
    active?.removeAttribute('data-playing');
  });
  return (book?: HTMLElement) => {
    focused = book;
    sync();
  };
}
