import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryImage } from "@/config/types";

interface Props {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/**
 * Full-screen photo viewer: swipe or arrow keys to move, Esc / ✕ to close.
 * Focus is trapped inside and returned to the opening photo on close.
 * Neighbouring photos are preloaded so swiping never shows a blank frame.
 */
export function Lightbox({ images, index, onIndex, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);
  const [shown, setShown] = useState(false);
  const n = images.length;
  const img = images[index];

  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  // Open: lock scroll, focus close, remember the trigger to restore later.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    closeBtn.current?.focus();
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(raf);
      html.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const im = new Image();
      im.src = images[(i + n) % n].src;
    });
  }, [index, images, n]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      const f = dialog.current!.querySelectorAll<HTMLElement>("button");
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-white";

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${n}`}
      onKeyDown={onKey}
      className={`fixed inset-0 z-[60] flex flex-col bg-[rgb(26_21_19/0.94)] text-white transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="text-[0.72rem] tabular-nums tracking-[0.3em] text-white/70">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </p>
        <button ref={closeBtn} type="button" onClick={onClose} className={btn} aria-label="Close photo viewer">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex flex-1 touch-pan-y items-center justify-center px-3 py-4"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="max-h-full max-w-full select-none rounded-sm object-contain shadow-2xl animate-[lbIn_0.45s_cubic-bezier(0.22,1,0.36,1)]"
          draggable={false}
        />
      </div>

      <div className="flex items-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => go(-1)} className={btn} aria-label="Previous photo">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <p className="min-h-[1.5em] flex-1 text-center font-script text-[1.6rem] leading-tight text-white/95" aria-live="polite">
          {img.caption ?? ""}
        </p>
        <button type="button" onClick={() => go(1)} className={btn} aria-label="Next photo">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
