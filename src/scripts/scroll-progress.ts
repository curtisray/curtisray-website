const line = document.querySelector<HTMLElement>('.scroll-progress');
const footer = document.querySelector<HTMLElement>('.site-footer');
if (line && footer) {
  const root = document.documentElement;
  const controller = new AbortController();
  const { signal } = controller;
  let footerTop = 0;
  let viewportHeight = window.innerHeight;
  let frame = 0;
  root.classList.add('has-scroll-progress');

  function paint() {
    frame = 0;
    const position = Math.max(0, window.scrollY);
    const range = Math.max(1, footerTop - viewportHeight);
    const progress = Math.min(1, position / range);
    // Clip the growing line at the footer's top as it enters the viewport.
    const available = Math.max(
      0,
      Math.min(1, (footerTop - position) / viewportHeight),
    );
    line!.style.transform = `scaleY(${Math.min(progress, available)})`;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function measure() {
    viewportHeight = window.innerHeight;
    footerTop = footer!.getBoundingClientRect().top + window.scrollY;
    schedule();
  }
  // Geometry is measured on layout changes, never during ordinary scrolling.
  const observer = new ResizeObserver(measure);
  observer.observe(document.body);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', measure, { signal });
  window.addEventListener('pageshow', measure, { signal });
  measure();
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      root.classList.remove('has-scroll-progress');
      line.style.removeProperty('transform');
    });
}
