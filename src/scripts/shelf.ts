import { motionTokens } from '../design/motion';

const shelf = document.querySelector<HTMLElement>('.work-shelf');
if (shelf) {
  const controller = new AbortController();
  const { signal } = controller;
  const books = [
    ...shelf.querySelectorAll<HTMLDetailsElement>('[data-project]'),
  ];
  const links = [
    ...shelf.querySelectorAll<HTMLAnchorElement>('[data-project-link]'),
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<
    HTMLDetailsElement,
    ReturnType<(typeof import('motion'))['animate']>
  >();

  function syncNavigation() {
    links.forEach((link) => {
      const selected = books.some(
        (book) =>
          book.open && book.dataset.project === link.dataset.projectLink,
      );
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  books.forEach((book) =>
    book.addEventListener(
      'toggle',
      async () => {
        syncNavigation();
        animations.get(book)?.stop();
        if (book.open && !reducedMotion.matches) {
          const { animate } = await import('motion');
          if (signal.aborted || !book.open || reducedMotion.matches) return;
          const panel = book.querySelector<HTMLElement>('.book-panel')!;
          animations.set(
            book,
            animate(
              panel,
              { opacity: [0, 1], x: [8, 0] },
              {
                duration: motionTokens.standard,
                ease: motionTokens.ease,
              },
            ),
          );
        }
      },
      { signal },
    ),
  );
  // Preserve normal anchor behavior, modifiers, history, and native details semantics.
  links.forEach((link) =>
    link.addEventListener(
      'click',
      (event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const book = books.find(
          (item) => item.dataset.project === link.dataset.projectLink,
        );
        if (book) book.open = true;
      },
      { signal },
    ),
  );
  function openHashBook() {
    const book = books.find((item) => `#${item.id}` === location.hash);
    if (book) book.open = true;
  }
  openHashBook();
  syncNavigation();
  window.addEventListener('hashchange', openHashBook, { signal });
  reducedMotion.addEventListener(
    'change',
    () => {
      animations.forEach((animation) => animation.complete());
    },
    { signal },
  );
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      controller.abort();
      animations.forEach((animation) => animation.stop());
    });
}
