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
  const mobile = window.matchMedia('(max-width: 760px)');
  const rail = shelf.querySelector<HTMLElement>('.shelf-books')!;
  const track = shelf.querySelector<HTMLElement>('.shelf-track')!;
  let selectedBook = books.find((book) => book.open) ?? books[0];
  let stopMobileScroll: (() => void) | undefined;
  let mobileResize: ResizeObserver | undefined;
  let mobileVersion = 0;
  const hoverPreview = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 761px)',
  );
  const animations = new Map<
    HTMLDetailsElement,
    ReturnType<(typeof import('motion'))['animate']>
  >();

  function syncNavigation() {
    links.forEach((link) => {
      const selected = mobile.matches
        ? selectedBook?.dataset.project === link.dataset.projectLink
        : books.some(
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
        if (book.open && !mobile.matches) selectedBook = book;
        syncNavigation();
        animations.get(book)?.stop();
        if (book.open && !reducedMotion.matches && !mobile.matches) {
          const { animate } = await import('motion');
          if (
            signal.aborted ||
            !book.open ||
            reducedMotion.matches ||
            mobile.matches
          )
            return;
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
    if (mobile.matches) return;
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
    if (book) {
      selectedBook = book;
      book.open = true;
      if (mobile.matches) centerBook(book);
    }
  }
  function centerBook(book: HTMLDetailsElement) {
    rail.scrollLeft =
      book.offsetLeft + book.offsetWidth / 2 - rail.clientWidth / 2;
  }
  async function syncMobileShelf() {
    const version = ++mobileVersion;
    stopMobileScroll?.();
    mobileResize?.disconnect();
    track
      .querySelectorAll('[data-carousel-clone]')
      .forEach((copy) => copy.remove());
    books.forEach((book) => {
      animations.get(book)?.stop();
      const panel = book.querySelector<HTMLElement>('.book-panel')!;
      panel.style.removeProperty('opacity');
      panel.style.removeProperty('transform');
      book.style.removeProperty('--book-scale');
    });
    if (!mobile.matches) {
      rail.removeAttribute('tabindex');
      rail.scrollLeft = 0;
      books.forEach((book) => {
        book.open = book === selectedBook;
      });
      books.forEach((book) => book.setAttribute('name', 'selected-work'));
      syncNavigation();
      return;
    }
    // Every card stays readable and focusable in the horizontal strip.
    books.forEach((book) => book.removeAttribute('name'));
    books.forEach((book) => {
      book.open = true;
    });
    rail.setAttribute('tabindex', '0');
    // Buffer one complete collection on each side. Copies are visual only
    // for assistive technology; their image links still support pointer clicks.
    function cloneBooks() {
      const fragment = document.createDocumentFragment();
      books.forEach((book) => {
        const copy = book.cloneNode(true) as HTMLDetailsElement;
        copy.dataset.carouselClone = '';
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('id');
        copy
          .querySelectorAll('[id]')
          .forEach((item) => item.removeAttribute('id'));
        copy
          .querySelectorAll('[aria-controls]')
          .forEach((item) => item.removeAttribute('aria-controls'));
        copy
          .querySelectorAll('a, summary')
          .forEach((item) => item.setAttribute('tabindex', '-1'));
        fragment.append(copy);
      });
      return fragment;
    }
    track.prepend(cloneBooks());
    track.append(cloneBooks());
    const cards = [...track.querySelectorAll<HTMLDetailsElement>('.work-book')];
    centerBook(selectedBook);
    let centers: number[] = [];
    let cycleWidth = 0;
    let loopStart = 0;
    const update = () => {
      if (!cycleWidth) return;
      const lower = loopStart - cycleWidth / books.length / 2;
      if (rail.scrollLeft < lower || rail.scrollLeft >= lower + cycleWidth) {
        const offset =
          (((rail.scrollLeft - lower) % cycleWidth) + cycleWidth) % cycleWidth;
        rail.scrollLeft = lower + offset;
      }
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let nearest = 0;
      cards.forEach((book, index) => {
        const distance = Math.abs(centers[index] - center);
        if (distance < Math.abs(centers[nearest] - center)) nearest = index;
        const strength = Math.max(0, 1 - distance / rail.clientWidth);
        book.style.setProperty(
          '--book-scale',
          String(reducedMotion.matches ? 1 : 0.82 + 0.18 * strength),
        );
      });
      selectedBook = books[nearest % books.length];
      syncNavigation();
    };
    let measuredWidth = rail.clientWidth;
    const measure = () => {
      if (rail.clientWidth !== measuredWidth) {
        measuredWidth = rail.clientWidth;
        centerBook(selectedBook);
      }
      centers = cards.map((book) => book.offsetLeft + book.offsetWidth / 2);
      cycleWidth = centers[books.length * 2] - centers[books.length];
      loopStart = centers[books.length] - rail.clientWidth / 2;
      update();
    };
    measure();
    mobileResize = new ResizeObserver(measure);
    mobileResize.observe(rail);
    const { scroll } = await import('motion');
    if (signal.aborted || version !== mobileVersion || !mobile.matches) return;
    stopMobileScroll = scroll(update, { container: rail, axis: 'x' });
  }
  rail.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element;
      if (!mobile.matches || target.closest('a')) return;
      const copy = target.closest<HTMLDetailsElement>('[data-carousel-clone]');
      if (!copy || !target.closest('summary')) return;
      event.preventDefault();
      const original = books.find(
        (book) => book.dataset.project === copy.dataset.project,
      );
      if (original) centerBook(original);
    },
    { signal },
  );
  books.forEach((book) => {
    book.querySelector('summary')?.addEventListener(
      'click',
      (event) => {
        if (!mobile.matches) return;
        event.preventDefault();
        centerBook(book);
      },
      { signal },
    );
    book.addEventListener(
      'focusin',
      () => {
        if (mobile.matches) centerBook(book);
      },
      { signal },
    );
  });
  mobile.addEventListener('change', syncMobileShelf, { signal });
  void syncMobileShelf();
  openHashBook();
  syncNavigation();
  window.addEventListener('hashchange', openHashBook, { signal });
  reducedMotion.addEventListener(
    'change',
    () => {
      animations.forEach((animation) => animation.complete());
      void syncMobileShelf();
    },
    { signal },
  );
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      controller.abort();
      ++mobileVersion;
      stopMobileScroll?.();
      mobileResize?.disconnect();
      animations.forEach((animation) => animation.stop());
    });
}
