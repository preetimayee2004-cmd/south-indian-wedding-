import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import type { Wish } from "@/lib/wishes";

/**
 * One wish, lifted off the thread (or out of the pond) and opened larger in the centre with the
 * full wish and name, on a dimmed background. Tap outside (or Escape) and it goes back.
 */
export function LeafViewer({ wish, from, reduced, onClose }: { wish: Wish; from: HTMLElement | null; reduced: boolean; onClose: () => void }) {
  const back = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  /** Where the leaf came from, as a transform from its place in the centre. */
  const origin = () => {
    const a = from?.getBoundingClientRect();
    const b = leaf.current?.getBoundingClientRect();
    if (!a || !b || !a.width || !b.width) return null;
    const rot = from ? new DOMMatrix(getComputedStyle(from.closest("li") ?? from).transform).b : 0;
    return {
      x: a.left + a.width / 2 - (b.left + b.width / 2),
      y: a.top + a.height / 2 - (b.top + b.height / 2),
      scale: a.width / b.width,
      rotate: Math.asin(Math.max(-1, Math.min(1, rot))) * (180 / Math.PI),
    };
  };

  useLayoutEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    if (reduced) return;
    const o = origin();
    gsap.fromTo(back.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    if (o) gsap.fromTo(leaf.current, { ...o, opacity: 0.6 }, { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "power3.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const done = () => {
      onClose();
      from?.focus({ preventScroll: true });
    };
    const o = reduced ? null : origin();
    if (!o) return done();
    gsap.to(back.current, { opacity: 0, duration: 0.35 });
    gsap.to(leaf.current, { ...o, duration: 0.42, ease: "power2.in", onComplete: done });
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="lv-layer" role="dialog" aria-modal="true" aria-label={`Blessing from ${wish.name}`} onClick={close}>
      <div ref={back} className="lv-dim" />
      <div ref={leaf} className="pl-leaf pl-leaf--big" onClick={(e) => e.stopPropagation()}>
        <span className="pl-msg">{wish.message}</span>
        <span className="pl-name">
          <span className="pl-dot" aria-hidden />
          {wish.name}
        </span>
        <button ref={closeBtn} type="button" className="lv-close" onClick={close} aria-label="Close and put the leaf back">
          ✕
        </button>
      </div>
    </div>,
    document.body,
  );
}
