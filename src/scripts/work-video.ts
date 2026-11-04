// A user-supplied preview loop, independent of the pending project motion design.
function createWorkPreview(video: HTMLVideoElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const shouldPlay = () => visible && !document.hidden && !reduced.matches;
  function sync() {
    if (shouldPlay()) {
      if (!video.hasAttribute('src')) video.src = video.dataset.workVideo!;
      video.muted = true;
      void video.play().catch(() => {
        video.removeAttribute('data-playing');
      });
    } else {
      video.pause();
      if (reduced.matches) video.removeAttribute('data-playing');
    }
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  observer.observe(video);
  video.addEventListener(
    'playing',
    () => {
      if (!shouldPlay()) {
        video.pause();
        return;
      }
      video.dataset.playing = '';
    },
    { signal },
  );
  video.addEventListener(
    'error',
    () => {
      video.removeAttribute('data-playing');
    },
    { signal },
  );
  reduced.addEventListener('change', sync, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  window.addEventListener('pagehide', () => video.pause(), { signal });
  window.addEventListener('pageshow', sync, { signal });
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      observer.disconnect();
      controller.abort();
      video.pause();
    });
}

document
  .querySelectorAll<HTMLVideoElement>('[data-work-video]')
  .forEach(createWorkPreview);
