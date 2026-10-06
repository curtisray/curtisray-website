import { useRef, useState, type SubmitEvent } from 'react';
import { contact } from '../data/site';

export default function Contact({ id }: { id: string }) {
  const [status, setStatus] = useState('Send me a message.');
  const [sending, setSending] = useState(false);
  const submitting = useRef(false);
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!contact.formEndpoint) {
      setStatus(`Please email me at ${contact.email}.`);
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true;
    setSending(true);
    setStatus('Sending your message…');
    try {
      const response = await fetch(contact.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        form.reset();
        setStatus('Thanks! Your message has been sent.');
      } else {
        const result = await response.json().catch(() => null);
        const messages = Array.isArray(result?.errors)
          ? result.errors
              .map((error: { message?: string }) => error.message)
              .filter(Boolean)
              .join(' ')
          : '';
        setStatus(
          messages || 'Your message could not be sent. Please try again.',
        );
      }
    } catch {
      setStatus(
        'Your message could not be sent. Check your connection and try again.',
      );
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  return (
    <form
      action={contact.formEndpoint || undefined}
      method="post"
      aria-busy={sending}
      aria-describedby={`${id}-status`}
      autoComplete="off"
      onSubmit={submit}
    >
      <div className="contact-heading">
        <span className="eyebrow" id={`${id}-title`}>
          Get in touch
        </span>
        <button
          className="contact-close"
          type="button"
          aria-label="Close contact form"
        >
          ×
        </button>
      </div>
      <label htmlFor={`${id}-name`}>
        Name
        <span className="contact-field">
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="off"
            readOnly={sending}
            required
          />
        </span>
      </label>
      <label htmlFor={`${id}-cell`}>
        Cell (optional)
        <span className="contact-field">
          <input
            id={`${id}-cell`}
            name="cell"
            type="tel"
            autoComplete="off"
            readOnly={sending}
          />
        </span>
      </label>
      <label htmlFor={`${id}-email`}>
        Email
        <span className="contact-field">
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="off"
            readOnly={sending}
            spellCheck={false}
            required
          />
        </span>
      </label>
      <label htmlFor={`${id}-message`}>
        Message
        <span className="contact-field">
          <textarea
            id={`${id}-message`}
            name="message"
            rows={4}
            autoComplete="off"
            readOnly={sending}
            required
          />
        </span>
      </label>
      <div className="contact-send">
        <button className="color-button" type="submit" disabled={sending}>
          {sending ? 'sending…' : 'send message'}
        </button>
      </div>
      <p className="contact-status" id={`${id}-status`} role="status">
        {status}
      </p>
    </form>
  );
}
