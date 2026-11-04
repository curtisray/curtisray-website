import { animate, cubicBezier, type AnimationPlaybackControls } from 'motion';
import { motionTokens } from '../design/motion';

type Rect = { left: number; top: number; width: number; height: number };
type Card = {
  element: HTMLElement;
  row: HTMLElement;
  background: HTMLElement;
  white: HTMLElement;
  media: HTMLAnchorElement;
  info: HTMLElement;
  trigger: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  state: 'closed' | 'open' | 'closing';
  animation?: AnimationPlaybackControls;
  progress: number;
  layout?: {
    resting: { background: Rect; media: Rect };
    expanded: {
      background: Rect;
      white: Rect;
      media: Rect;
      info: Rect;
      trigger: Rect;
    };
  };
  version: number;
};
const section = document.querySelector<HTMLElement>('.selected-work');
if (section) {
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 760px)');
  let active: Card | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let suppressed: Card | undefined;
  let focusFrame = 0;
  const neighborAnimations = new Map<Card, AnimationPlaybackControls>();
  const cards: Card[] = [
    ...section.querySelectorAll<HTMLElement>('[data-work-card]'),
  ].map((element) => ({
    element,
    row: element.closest<HTMLElement>('[data-work-row]')!,
    background: element.querySelector<HTMLElement>('.work-piece-background')!,
    white: element.querySelector<HTMLElement>('.work-card-white')!,
    media: element.querySelector<HTMLAnchorElement>('.work-card-media')!,
    info: element.querySelector<HTMLElement>('.work-card-info')!,
    trigger: element.querySelector<HTMLButtonElement>('.work-card-trigger')!,
    closeButton: element.querySelector<HTMLButtonElement>('.work-card-close')!,
    state: 'closed',
    progress: 0,
    version: 0,
  }));
  const ease = cubicBezier(...motionTokens.ease);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const mix = (from: number, to: number, progress: number) =>
    from + (to - from) * progress;
  const setRect = (element: HTMLElement, rect: Rect) => {
    Object.entries(rect).forEach(([key, value]) =>
      element.style.setProperty(key, `${value}px`),
    );
  };
  const mixRect = (from: Rect, to: Rect, progress: number): Rect => ({
    left: mix(from.left, to.left, progress),
    top: mix(from.top, to.top, progress),
    width: mix(from.width, to.width, progress),
    height: mix(from.height, to.height, progress),
  });
  function stop(card: Card) {
    ++card.version;
    card.animation?.stop();
    card.animation = undefined;
  }
  // One geometric progress value drives both directions with the same ease.
  // Keep the white inset intact until the return is almost complete.
  function render(card: Card, progress: number) {
    if (!card.layout) return;
    card.progress = clamp(progress);
    const { resting, expanded: target } = card.layout;
    const geometry = card.progress;
    const copyStart = ease(motionTokens.standard / motionTokens.workCard);
    const copyEnd = ease((2 * motionTokens.standard) / motionTokens.workCard);
    const white = ease(clamp(geometry / 0.35));
    const copy = ease(clamp((geometry - copyStart) / (copyEnd - copyStart)));
    setRect(
      card.background,
      mixRect(resting.background, target.background, geometry),
    );
    const border = target.white.left - target.background.left;
    const whiteRest = {
      left: resting.background.left + border,
      top: resting.background.top + border,
      width: resting.background.width - 2 * border,
      height: resting.background.height - 2 * border,
    };
    const whiteRect = mixRect(whiteRest, target.white, geometry);
    setRect(card.white, whiteRect);
    setRect(card.closeButton, {
      left: whiteRect.left + whiteRect.width - 52,
      top: whiteRect.top + 8,
      width: 44,
      height: 44,
    });
    card.closeButton.style.opacity = String(copy);
    setRect(card.media, mixRect(resting.media, target.media, geometry));
    setRect(card.trigger, mixRect(resting.media, target.trigger, geometry));
    setRect(card.info, target.info);
    card.white.style.opacity = String(white);
    card.info.style.opacity = String(copy);
    card.info.style.transform = `translateY(${8 * (1 - copy)}px)`;
    card.element.style.setProperty(
      '--parallax-weight',
      String(1 - ease(clamp(geometry / copyStart))),
    );
  }
  function finishOpen(card: Card) {
    if (document.activeElement === card.trigger) {
      const target = mobile.matches
        ? card.closeButton
        : card.info.querySelector<HTMLAnchorElement>('.work-card-project-link');
      target?.focus({ preventScroll: true });
    }
    card.trigger.hidden = true;
  }
  function play(card: Card, target: 0 | 1, immediate = false) {
    stop(card);
    const version = card.version;
    const from = card.progress;
    const finish = () => {
      if (card.version !== version) return;
      render(card, target);
      if (target === 0) restore(card);
      else finishOpen(card);
    };
    if (immediate || reduced.matches || Math.abs(target - from) < 0.0001) {
      finish();
      return;
    }
    card.animation = animate(from, target, {
      duration: motionTokens.workCard * Math.abs(target - from),
      ease: motionTokens.ease,
      onUpdate: (value) => render(card, value),
      onComplete: finish,
    });
  }
  function rest(card: Card) {
    const width = card.element.offsetWidth,
      height = card.element.offsetHeight;
    const value = getComputedStyle(section!)
      .getPropertyValue('--work-layer-offset')
      .trim();
    const parsed = parseFloat(value);
    const layer = value.endsWith('rem')
      ? parsed * parseFloat(getComputedStyle(document.documentElement).fontSize)
      : parsed;
    return {
      background: {
        left: 0,
        top: layer,
        width: width - layer,
        height: height - layer,
      },
      media: {
        left: layer,
        top: 0,
        width: width - layer,
        height: height - layer,
      },
    };
  }
  function slotRect(card: Card) {
    const origin = card.row.getBoundingClientRect();
    return {
      left: origin.left + card.element.offsetLeft,
      top: origin.top + card.element.offsetTop,
      width: card.element.offsetWidth,
      height: card.element.offsetHeight,
    };
  }
  function packing(card: Card) {
    const gutter = parseFloat(getComputedStyle(section!).paddingLeft);
    const available = document.documentElement.clientWidth - 2 * gutter;
    const slot = slotRect(card);
    if (mobile.matches) {
      const width = Math.min(680, available);
      return {
        width,
        left: Math.max(
          gutter,
          Math.min(
            gutter + available - width,
            slot.left + slot.width / 2 - width / 2,
          ),
        ),
        positions: cards.map((peer) => ({ peer, x: 0, scale: 1 })),
      };
    }
    const gap =
      parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5;
    const peerWidth = cards
      .filter((peer) => peer !== card && peer.row === card.row)
      .reduce((total, peer) => total + peer.element.offsetWidth, 0);
    // Keep neighboring projects visible when a full-size row cannot fit.
    const peerScale = Math.min(
      1,
      Math.max(0.2, (available - 560 - 2 * gap) / peerWidth),
    );
    const width = Math.min(680, available - peerWidth * peerScale - 2 * gap);
    const spacing = (available - width - peerWidth * peerScale) / 2;
    let cursor = gutter;
    let left = gutter;
    const positions = cards.map((peer) => {
      if (peer.row !== card.row) return { peer, x: 0, scale: 1 };
      const peerSlot = slotRect(peer);
      const selected = peer === card;
      if (selected) left = cursor;
      const position = {
        peer,
        x: selected ? 0 : cursor - peerSlot.left,
        scale: selected ? 1 : peerScale,
      };
      cursor += (selected ? width : peerSlot.width * peerScale) + spacing;
      return position;
    });
    return { width, left, positions };
  }
  function arrangeNeighbors(card?: Card, immediate = false, from = 0, to = 1) {
    const positions = card
      ? packing(card).positions
      : cards.map((peer) => ({ peer, x: 0, scale: 1 }));
    positions.forEach(({ peer, x, scale }) => {
      neighborAnimations.get(peer)?.stop();
      neighborAnimations.set(
        peer,
        animate(
          peer.element,
          { x, scale, '--work-peer-scale': scale },
          {
            duration:
              immediate || reduced.matches
                ? 0
                : motionTokens.workCard * Math.abs(to - from),
            ease: motionTokens.ease,
          },
        ),
      );
    });
  }
  function expanded(card: Card) {
    const slot = slotRect(card);
    const gutter = parseFloat(getComputedStyle(section!).paddingLeft);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const border = rem,
      padding = mobile.matches ? rem : 1.5 * rem,
      gap = padding;
    const planned = packing(card);
    const width = planned.width;
    const height = Math.max(
      160,
      Math.min(mobile.matches ? 700 : 560, innerHeight - 2 * gutter),
    );
    const left = planned.left - slot.left;
    const top =
      Math.max(
        gutter,
        Math.min(
          innerHeight - gutter - height,
          slot.top + (slot.height - height) / 2,
        ),
      ) - slot.top;
    const background = { left, top, width, height };
    const white = {
      left: left + border,
      top: top + border,
      width: width - 2 * border,
      height: height - 2 * border,
    };
    const header = mobile.matches ? 44 : 0;
    const innerWidth = white.width - 2 * padding,
      contentHeight = white.height - 2 * padding - header;
    const mediaWidth = mobile.matches
      ? innerWidth
      : Math.min(270, innerWidth * 0.42);
    const mediaHeight = mobile.matches
      ? Math.min(220, contentHeight * 0.34)
      : contentHeight;
    const media = {
      left: white.left + padding,
      top: white.top + padding + header,
      width: mediaWidth,
      height: mediaHeight,
    };
    const info = mobile.matches
      ? {
          left: media.left,
          top: media.top + media.height + gap,
          width: innerWidth,
          height: contentHeight - media.height - gap,
        }
      : {
          left: media.left + media.width + gap,
          top: media.top,
          width: innerWidth - media.width - gap,
          height: contentHeight,
        };
    const trigger = media;
    return { background, white, media, info, trigger };
  }
  function restore(card: Card) {
    card.state = 'closed';
    card.progress = 0;
    card.layout = undefined;
    delete card.element.dataset.open;
    delete card.element.dataset.closing;
    card.element.style.removeProperty('--parallax-weight');
    for (const element of [
      card.background,
      card.media,
      card.trigger,
      card.white,
      card.info,
      card.closeButton,
    ]) {
      for (const property of [
        'left',
        'top',
        'width',
        'height',
        'opacity',
        'transform',
      ])
        element.style.removeProperty(property);
    }
    card.white.hidden = true;
    card.info.hidden = true;
    card.closeButton.hidden = true;
  }
  function close(card: Card, immediate = false, updateNeighbors = true) {
    clearTimeout(leaveTimer);
    if (card.state === 'closed') return;
    if (active === card) {
      active = undefined;
      if (updateNeighbors)
        arrangeNeighbors(undefined, immediate, card.progress, 0);
    }
    card.state = 'closing';
    delete card.element.dataset.open;
    card.element.dataset.closing = '';
    card.trigger.hidden = false;
    card.trigger.setAttribute('aria-expanded', 'false');
    card.trigger.setAttribute(
      'aria-label',
      `Show ${card.element.dataset.title} details`,
    );
    card.info.inert = true;
    card.info.setAttribute('aria-hidden', 'true');
    if (document.activeElement === card.closeButton)
      card.trigger.focus({ preventScroll: true });
    card.closeButton.hidden = true;
    play(card, 0, immediate);
  }
  function open(card: Card, explicit = false) {
    clearTimeout(leaveTimer);
    if (card.state === 'open' || (!explicit && suppressed === card)) return;
    if (active && active !== card) {
      if (!explicit && active.element.contains(document.activeElement)) return;
      close(active, false, false);
    }
    // Reuse the original endpoints on reversal instead of remeasuring or
    // resetting opacity, so interrupted hovers resume the identical path.
    if (!card.layout) {
      card.layout = { resting: rest(card), expanded: expanded(card) };
      card.info.scrollTop = 0;
    }
    active = card;
    arrangeNeighbors(card, false, card.progress, 1);
    card.state = 'open';
    card.element.dataset.open = '';
    delete card.element.dataset.closing;
    card.white.hidden = false;
    card.info.hidden = false;
    card.info.inert = false;
    card.info.removeAttribute('aria-hidden');
    card.closeButton.hidden = !mobile.matches;
    card.trigger.setAttribute('aria-expanded', 'true');
    card.trigger.setAttribute(
      'aria-label',
      `Hide ${card.element.dataset.title} details`,
    );
    render(card, card.progress);
    play(card, 1);
  }
  cards.forEach((card) => {
    card.trigger.hidden = false;
    card.media.tabIndex = -1;
    card.media.setAttribute('aria-hidden', 'true');
    syncMediaLink(card);
    card.closeButton.addEventListener(
      'click',
      () => {
        suppressed = card;
        close(card);
        card.trigger.focus({ preventScroll: true });
      },
      { signal },
    );
    card.trigger.addEventListener(
      'click',
      () => {
        if (card.state === 'open') {
          suppressed = card;
          close(card);
        } else open(card, true);
      },
      { signal },
    );
    card.element.addEventListener(
      'pointerenter',
      (event) => {
        if (hover.matches && event.pointerType === 'mouse') open(card);
      },
      { signal },
    );
    card.element.addEventListener(
      'pointerleave',
      () => {
        if (suppressed === card) suppressed = undefined;
        if (hover.matches)
          leaveTimer = setTimeout(() => {
            if (
              card.state === 'open' &&
              !card.element.contains(document.activeElement)
            )
              close(card);
          }, motionTokens.quick * 1000);
      },
      { signal },
    );
    card.element.addEventListener(
      'focusout',
      () => {
        cancelAnimationFrame(focusFrame);
        focusFrame = requestAnimationFrame(() => {
          if (
            card.state === 'open' &&
            !card.element.contains(document.activeElement) &&
            !card.element.matches(':hover')
          )
            close(card);
        });
      },
      { signal },
    );
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || !active) return;
      const card = active;
      event.preventDefault();
      suppressed = card;
      close(card);
      card.trigger.focus({ preventScroll: true });
    },
    { signal },
  );
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (active && !active.element.contains(event.target as Node))
        close(active);
    },
    { signal },
  );
  function resize() {
    arrangeNeighbors(active, true);
    cards.forEach((card) => {
      syncMediaLink(card);
      if (card.state === 'open') {
        if (!mobile.matches && document.activeElement === card.closeButton)
          card.info
            .querySelector<HTMLAnchorElement>('.work-card-project-link')
            ?.focus({ preventScroll: true });
        card.closeButton.hidden = !mobile.matches;
        stop(card);
        card.layout = { resting: rest(card), expanded: expanded(card) };
        render(card, 1);
        finishOpen(card);
      } else if (card.state === 'closing') close(card, true);
    });
  }
  function syncMediaLink(card: Card) {
    if (mobile.matches) card.media.removeAttribute('href');
    else
      card.media.setAttribute(
        'href',
        card.info
          .querySelector<HTMLAnchorElement>('.work-card-project-link')!
          .getAttribute('href')!,
      );
  }
  window.addEventListener('resize', resize, { signal });
  reduced.addEventListener('change', resize, { signal });
  window.addEventListener(
    'pagehide',
    () => cards.forEach((card) => close(card, true)),
    { signal },
  );
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      controller.abort();
      clearTimeout(leaveTimer);
      cancelAnimationFrame(focusFrame);
      neighborAnimations.forEach((animation) => animation.stop());
      cards.forEach((card) => {
        stop(card);
        restore(card);
        card.element.style.removeProperty('transform');
        card.element.style.removeProperty('--work-peer-scale');
        card.trigger.hidden = true;
        card.media.removeAttribute('tabindex');
        card.media.removeAttribute('aria-hidden');
        card.media.setAttribute(
          'href',
          card.info
            .querySelector<HTMLAnchorElement>('.work-card-project-link')!
            .getAttribute('href')!,
        );
      });
    });
}
