import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Wish } from "@/lib/wishes";

interface AllWishesModalProps {
  wishes: Wish[];
  isOpen: boolean;
  onClose: () => void;
}

/** "View all wishes": a simple scrollable list of every palm leaf, for guests who want to read them all. */
export function AllWishesModal({ wishes, isOpen, onClose }: AllWishesModalProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const back = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      back?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="aw-layer" role="dialog" aria-modal="true" aria-labelledby="all-wishes-title" onClick={onClose}>
      <div className="aw-panel" onClick={(e) => e.stopPropagation()}>
        <div className="aw-head">
          <h3 id="all-wishes-title" className="aw-title">
            All blessings
          </h3>
          <p className="aw-sub">
            {wishes.length} {wishes.length === 1 ? "blessing" : "blessings"} from family and friends
          </p>
          <button ref={closeBtn} type="button" onClick={onClose} className="aw-close" aria-label="Close the list of blessings">
            ✕
          </button>
        </div>
        <ul className="aw-list">
          {wishes.map((w) => (
            <li key={w.id} className="pl-leaf pl-leaf--list">
              <span className="pl-msg">{w.message}</span>
              <span className="pl-name">
                <span className="pl-dot" aria-hidden />
                {w.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
