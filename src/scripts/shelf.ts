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
  const hoverPreview = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 761px)',
  );
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
  function previewBook(book: HTMLDetailsElement | undefined) {
    if (!book || book.open) return;
    // Hover must never hide a panel containing keyboard focus.
    if (
      books.some(
        (item) => item !== book && item.contains(document.activeElement),
      )
    )
      return;
    book.open = true;
  }
  // React only to actual pointer movement: moving panel edges must not
  // trigger a chain of previews beneath a stationary cursor.
  let pointerPosition = '';
  shelf.querySelector('.shelf-books')?.addEventListener(
    'pointermove',
    (event) => {
      const pointer = event as PointerEvent;
      if (!hoverPreview.matches || pointer.pointerType !== 'mouse') return;
      const position = `${pointer.clientX},${pointer.clientY}`;
      if (position === pointerPosition) return;
      pointerPosition = position;
      const target = pointer.target as Element;
      previewBook(
        target.closest<HTMLDetailsElement>('[data-project]') ?? undefined,
      );
    },
    { signal },
  );
  links.forEach((link) => {
    const book = books.find(
      (item) => item.dataset.project === link.dataset.projectLink,
    );
    link.addEventListener(
      'pointerenter',
      (event) => {
        if (hoverPreview.matches && event.pointerType === 'mouse')
          previewBook(book);
      },
      { signal },
    );
    link.addEventListener('focus', () => previewBook(book), { signal });
  });
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
