import { forwardRef } from "react";

/**
 * Bold "SCROLL DOWN" with a double arrow that keeps flowing downwards.
 * A solid ivory pill so it reads clearly over sky, stone or carvings.
 */
export const ScrollCue = forwardRef<HTMLAnchorElement, { href: string; className?: string }>(function ScrollCue({ href, className = "" }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      className={`group z-10 flex flex-col items-center gap-1 rounded-full bg-paper/95 px-6 pb-2.5 pt-3 text-accent shadow-[0_10px_30px_-8px_rgb(42_36_33/0.45)] ring-1 ring-gold/40 transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      aria-label="Scroll down"
    >
      <span className="text-[0.78rem] font-bold uppercase tracking-[0.3em]">Scroll down</span>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 5l6 6 6-6" className="motion-safe:animate-[chevron_1.6s_ease-in-out_infinite]" />
        <path d="M6 12l6 6 6-6" className="motion-safe:animate-[chevron_1.6s_ease-in-out_0.25s_infinite]" />
      </svg>
    </a>
  );
});
