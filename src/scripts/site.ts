import { animate } from 'motion/mini';
import Lenis from 'lenis';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis: Lenis | undefined;
function syncScrolling() {
  lenis?.destroy();
  lenis = reducedMotion.matches ? undefined : new Lenis({ autoRaf: true, anchors: true });
}
syncScrolling();
reducedMotion.addEventListener('change', syncScrolling);

// Native details remain usable before this script loads and without JavaScript.
const books = [...document.querySelectorAll<HTMLDetailsElement>('[data-project]')];
function revealBook(book: HTMLDetailsElement, moveIntoView = false) {
  books.forEach((other) => { if (other !== book) other.open = false; });
  book.open = true;
  if (moveIntoView) {
    if (window.innerWidth <= 760) {
      if (lenis) lenis.scrollTo(book, { offset: -20 });
      else book.scrollIntoView();
    }
  }
}
books.forEach((book) => {
  book.addEventListener('toggle', () => {
    const summary = book.querySelector('summary')!;
    summary.setAttribute('aria-expanded', String(book.open));
    if (book.open && !reducedMotion.matches) {
      const panel = book.querySelector<HTMLElement>('.book-panel')!;
      animate(panel, { opacity: [0, 1] }, { duration: .5, delay: .15 });
    }
  });
});
document.querySelectorAll<HTMLAnchorElement>('[data-project-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const book = books.find((item) => item.dataset.project === link.dataset.projectLink);
    if (!book) return;
    event.preventDefault();
    revealBook(book, true);
  });
});
function openHashBook() {
  const book = books.find((item) => `#${item.id}` === window.location.hash);
  if (book) revealBook(book);
}
openHashBook();
window.addEventListener('hashchange', openHashBook);

// Each bar owns its own composer. Focus returns to its trigger on dismissal.
const contacts = [...document.querySelectorAll<HTMLElement>('[data-contact]')];
const closeHandlers = new Map<HTMLElement, () => void>();
contacts.forEach((contact) => {
  const trigger = contact.querySelector<HTMLButtonElement>('.contact-trigger')!;
  const panel = contact.querySelector<HTMLElement>('.contact-panel')!;
  const form = contact.querySelector<HTMLFormElement>('form')!;
  let animation: ReturnType<typeof animate> | undefined;
  let revision = 0;
  const close = () => {
    revision++;
    animation?.stop();
    panel.hidden = true;
    panel.style.removeProperty('height');
    panel.style.removeProperty('width');
    panel.style.removeProperty('overflow');
    trigger.style.visibility = '';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  };
  closeHandlers.set(contact, close);
  trigger.addEventListener('click', async () => {
    contacts.forEach((other) => { if (other !== contact && !other.querySelector<HTMLElement>('.contact-panel')!.hidden) closeHandlers.get(other)?.(); });
    const current = ++revision;
    panel.hidden = false;
    trigger.style.visibility = 'hidden';
    trigger.setAttribute('aria-expanded', 'true');
    if (!reducedMotion.matches) {
      const height = panel.getBoundingClientRect().height;
      const width = panel.getBoundingClientRect().width;
      panel.style.overflow = 'hidden';
      animation = animate(panel, { width: [trigger.offsetWidth + 'px', width + 'px'], height: [trigger.offsetHeight + 'px', height + 'px'] }, { duration: .5, ease: [.2, .7, .2, 1] });
      await animation.finished;
      if (current !== revision) return;
      panel.style.removeProperty('height');
      panel.style.removeProperty('width');
      panel.style.removeProperty('overflow');
    }
    form.querySelector<HTMLInputElement>('input')!.focus({ preventScroll: true });
  });
  contact.querySelector('.contact-close')!.addEventListener('click', close);
  contact.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); } });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const body = `Name: ${data.get('name')}\nCell: ${data.get('cell') || ''}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    const subject = `Contact from ${data.get('name')}`;
    window.location.href = `mailto:curtisraymaloney@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contact.querySelector<HTMLElement>('.contact-status')!.textContent = 'Email draft prepared. Send it from your email app.';
  });
});
document.addEventListener('pointerdown', (event) => {
  contacts.forEach((contact) => {
    if (!contact.contains(event.target as Node) && !contact.querySelector<HTMLElement>('.contact-panel')!.hidden) closeHandlers.get(contact)?.();
  });
});
const colors = ['#ffeb0f', '#ff99a3', '#e8552a', '#b9d4e3', '#22e3f2', '#f2b8c6'];
let colorIndex = 0;
document.querySelectorAll<HTMLElement>('.color-button').forEach((button) => {
  const on = () => { button.style.backgroundColor = colors[colorIndex++ % colors.length]; button.style.color = '#141414'; };
  const off = () => { button.style.removeProperty('background-color'); button.style.removeProperty('color'); };
  button.addEventListener('pointerenter', on);
  button.addEventListener('pointerleave', off);
  button.addEventListener('focus', on);
  button.addEventListener('blur', off);
});

// Recreate the prototype's collapsing white lines as the black footer enters.
const footer = document.querySelector<HTMLElement>('.site-footer-full');
if (footer) {
  const lines = [...footer.querySelectorAll<HTMLElement>('[data-fline]')];
  let queued = false;
  function drawLines() {
    queued = false;
    const viewport = window.innerHeight;
    const progress = Math.min(1, Math.max(0, 1 - footer!.getBoundingClientRect().top / viewport));
    const distance = reducedMotion.matches ? 0 : Math.pow(1 - progress, 1.6);
    lines.forEach((line, i) => { line.style.transform = `translateY(${i * viewport * .075 * distance}px)`; });
  }
  const queueDraw = () => { if (!queued) { queued = true; requestAnimationFrame(drawLines); } };
  window.addEventListener('scroll', queueDraw, { passive: true });
  window.addEventListener('resize', queueDraw);
  reducedMotion.addEventListener('change', queueDraw);
  drawLines();
}

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy!);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select to copy';
      const range = document.createRange();
      range.selectNodeContents(button.previousElementSibling!);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    window.setTimeout(() => { button.textContent = 'Copy'; }, 1600);
  });
});
window.addEventListener('pagehide', () => lenis?.destroy());
window.addEventListener('pageshow', (event) => { if (event.persisted) syncScrolling(); });
