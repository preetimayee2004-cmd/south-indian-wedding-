import { forwardRef, useId } from "react";
import type { Contact } from "@/config/types";

interface Props {
  contact: Contact;
  callHref?: string;
  waHref?: string;
  onRing: () => void;
}

/**
 * One family contact hanging from the rope like a temple bell.
 * Tap the bell to ring it; Call / WhatsApp sit under the name.
 * `.bell-swing` is the element the section rotates from its cord.
 */
export const BellContact = forwardRef<HTMLDivElement, Props>(function BellContact({ contact: c, callHref, waHref, onRing }, ref) {
  const gid = useId().replace(/:/g, "");
  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-ink transition-colors duration-300 hover:border-accent hover:text-accent active:scale-95";

  return (
    <div className="bell-contact flex flex-col items-center text-center">
      <div ref={ref} className="bell-swing flex origin-top flex-col items-center">
        <span aria-hidden className="block h-8 w-px bg-gold/70" />
        <button
          type="button"
          onClick={onRing}
          aria-label={`Ring the bell for ${c.name}`}
          className="-mt-px rounded-full p-1 focus-visible:outline-offset-4"
        >
          <svg viewBox="0 0 64 76" className="h-[4.25rem] w-[3.6rem]" aria-hidden>
            <defs>
              <linearGradient id={`${gid}b`} x1="0" x2="1">
                <stop offset="0" stopColor="#9a6a24" />
                <stop offset="0.35" stopColor="#e9c46a" />
                <stop offset="0.6" stopColor="#c8952f" />
                <stop offset="1" stopColor="#8a5d1f" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="6" r="4.5" fill="none" stroke="#a87a2c" strokeWidth="2.2" />
            <path d="M28 11h8v5h-8z" fill="#b8892f" />
            <path d="M32 15c-12 0-18 10-18 24 0 9-3 15-8 19h52c-5-4-8-10-8-19 0-14-6-24-18-24Z" fill={`url(#${gid}b)`} />
            <path d="M6 58h52c0 3-2 5-5 5H11c-3 0-5-2-5-5Z" fill="#9a6a24" />
            <path d="M20 28c2-5 5-8 9-9" stroke="#fff5d6" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M32 63v6" stroke="#8a5d1f" strokeWidth="2" />
            <circle cx="32" cy="71" r="4" fill="#b8892f" />
          </svg>
        </button>
      </div>

      <p className="mt-3 font-script text-[1.9rem] leading-none text-accent">{c.name}</p>
      {c.role && <p className="mt-1 text-[0.64rem] uppercase tracking-[0.24em] text-ink-soft">{c.role}</p>}

      <div className="mt-4 flex gap-3">
        {callHref && (
          <a href={callHref} className={btn} aria-label={`Call ${c.name}`}>
            <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
            </svg>
          </a>
        )}
        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`WhatsApp ${c.name}`}>
            <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20Z" />
              <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2L9 9.5Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
});
