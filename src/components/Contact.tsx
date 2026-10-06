import { useReducedMotionPreference } from '../design/useReducedMotionPreference';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { motion } from 'motion/react';
import { motionTokens } from '../design/motion';
import { contact } from '../data/site';

export default function Contact({ id }: { id: string }) {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState('Opens a draft in your email app.');
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const details = panel.current?.closest('details');
    if (!details) return;
    const controller = new AbortController();
    const { signal } = controller;
    const syncOpen = () => {
      setOpen(details.open);
      if (
        details.open &&
        (document.activeElement === details.querySelector('summary') ||
          document.activeElement === document.body)
      ) {
        // Touch users choose when to bring up the keyboard.
        const target = window.matchMedia('(pointer: fine)').matches
          ? 'input'
          : 'button';
        panel.current
          ?.querySelector<HTMLElement>(target)
          ?.focus({ preventScroll: true });
      }
    };
    syncOpen();
    details.addEventListener('toggle', syncOpen, { signal });
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (!details.contains(event.target as Node)) details.open = false;
      },
      { signal },
    );
    details.addEventListener(
      'focusout',
      (event) => {
        if (
          event.relatedTarget &&
          !details.contains(event.relatedTarget as Node)
        )
          details.open = false;
      },
      { signal },
    );
    return () => controller.abort();
  }, []);

  function close() {
    const details = panel.current!.closest('details')!;
    details.open = false;
    details.querySelector('summary')?.focus({ preventScroll: true });
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Contact from ${data.get('name')}`;
    const body = `Name: ${data.get('name')}\nCell: ${data.get('cell') || ''}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('Email draft prepared. Send it from your email app.');
  }

  return (
    <motion.div
      ref={panel}
      className="contact-panel"
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      data-lenis-prevent
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
      initial={false}
      animate={
        open
          ? { opacity: 1, y: 0, scale: 1 }
          : {
              opacity: 0,
              y: reducedMotion ? 0 : 6,
              scale: reducedMotion ? 1 : 0.98,
            }
      }
      transition={{
        duration: reducedMotion ? 0 : motionTokens.standard,
        ease: motionTokens.ease,
      }}
    >
      <form action={`mailto:${contact.email}`} method="get" onSubmit={submit}>
        <div className="contact-heading">
          <span className="eyebrow" id={`${id}-title`}>
            Get in touch
          </span>
          <button
            className="contact-close"
            type="button"
            aria-label="Close contact form"
            onClick={close}
          >
            ×
          </button>
        </div>
        <label htmlFor={`${id}-name`}>
          Name
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </label>
        <label htmlFor={`${id}-cell`}>
          Cell (optional)
          <input id={`${id}-cell`} name="cell" type="tel" autoComplete="tel" />
        </label>
        <label htmlFor={`${id}-email`}>
          Email
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
          />
        </label>
        <label htmlFor={`${id}-message`}>
          Message
          <textarea id={`${id}-message`} name="message" rows={4} required />
        </label>
        <div className="contact-send">
          <button className="color-button" type="submit">
            prepare email
          </button>
        </div>
        <p className="contact-status" role="status">
          {status}
        </p>
      </form>
    </motion.div>
  );
}
