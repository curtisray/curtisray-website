const line = document.querySelector<HTMLElement>('.scroll-progress');
if (line) {
  const root = document.documentElement;
  const mobile = window.matchMedia('(max-width: 760px)');
  const controller = new AbortController();
  const { signal } = controller;
  let pageHeight = 0;
  let viewportHeight = window.innerHeight;
  let frame = 0;
  root.classList.add('has-scroll-progress');

  function paint() {
    frame = 0;
    if (mobile.matches) return;
    const position = Math.max(0, window.scrollY);
    const range = Math.max(1, pageHeight - viewportHeight);
    const progress = Math.min(1, position / range);
    line!.style.transform = `scaleY(${progress})`;
  }
  function schedule() {
    if (!mobile.matches && !frame) frame = requestAnimationFrame(paint);
  }
  function measure() {
    viewportHeight = window.innerHeight;
    pageHeight = root.scrollHeight;
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
