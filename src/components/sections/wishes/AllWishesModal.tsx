import { useEffect } from "react";
import type { Wish } from "@/lib/wishes";

function LotusCrest({ className = "w-7 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2 C16 2, 19 8, 19 13 C19 15.5, 17.5 17, 16 17 C14.5 17, 13 15.5, 13 13 C13 8, 16 2, 16 2 Z"
        fill="#d4a347"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C17.5 6, 23 10, 23 14 C23 16.5, 21 17.5, 19 17 C18 15, 17 12, 16 10"
        fill="#e6be65"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 6 C14.5 6, 9 10, 9 14 C9 16.5, 11 17.5, 13 17 C14 15, 15 12, 16 10"
        fill="#e6be65"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 10 C18 10, 27 12, 28 16 C28 18, 25 18.5, 22 17.5 C20 16, 18 13.5, 16 12"
        fill="#f3d485"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <path
        d="M16 10 C14 10, 5 12, 4 16 C4 18, 7 18.5, 10 17.5 C12 16, 14 13.5, 16 12"
        fill="#f3d485"
        stroke="#9a6b18"
        strokeWidth="0.8"
      />
      <ellipse cx="16" cy="18" rx="8" ry="1.5" fill="#c49028" />
    </svg>
  );
}

function FloralAccent({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="#c49028" className={className} aria-hidden="true">
      <circle cx="8" cy="4" r="1.8" />
      <circle cx="8" cy="12" r="1.8" />
      <circle cx="4" cy="8" r="1.8" />
      <circle cx="12" cy="8" r="1.8" />
      <circle cx="8" cy="8" r="1.2" fill="#fff" />
    </svg>
  );
}

interface AllWishesModalProps {
  wishes: Wish[];
  isOpen: boolean;
  onClose: () => void;
}

export function AllWishesModal({ wishes, isOpen, onClose }: AllWishesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-wishes-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[86vh] flex flex-col rounded-2xl overflow-hidden border-2 border-[#d4a347] bg-[#fbf5e6] shadow-[0_20px_60px_rgba(40,10,12,0.45)] text-[#3a1f16]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 text-center border-b border-[#d4a347]/30 bg-gradient-to-b from-[#fffaf0] to-[#f8ecd2]">
          <LotusCrest className="w-8 h-6 mx-auto mb-1 text-[#b8860b]" />
          <h3 id="all-wishes-title" className="font-serif font-bold text-xl md:text-2xl text-[#5c181f] tracking-wide">
            Royal Book of Blessings
          </h3>
          <p className="text-xs md:text-sm font-serif italic text-[#7a3a20] mt-1">
            {wishes.length} heartfelt blessings from our beloved family &amp; friends
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-[#7c1a22] text-[#fbebd0] border border-[#d4a347] hover:scale-110 transition-transform"
            aria-label="Close blessings book"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Wishes Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-[#f8eed7]/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishes.map((wish) => (
              <div
                key={wish.id}
                className="relative rounded-xl border border-[#c69538]/50 bg-gradient-to-b from-[#fffcf7] to-[#faedd3] p-4 text-center shadow-[0_2px_10px_rgba(160,110,40,0.06)] flex flex-col justify-between"
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-75">
                  <LotusCrest className="w-5 h-3.5" />
                </div>
                <div className="pt-3">
                  <div className="flex items-center justify-center gap-1.5 text-[#5c181f] font-serif font-bold text-xs uppercase tracking-wider">
                    <span className="w-4 h-4 rounded-full bg-[#f4deb1] text-[#7c1a22] inline-flex items-center justify-center text-[10px]">
                      ♡
                    </span>
                    <span>{wish.name}</span>
                  </div>
                  <p className="font-serif italic text-sm text-[#4a261b] mt-2 leading-relaxed">
                    &ldquo;{wish.message}&rdquo;
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#c69538]/20 flex items-center justify-center">
                  <FloralAccent className="w-2.5 h-2.5 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#d4a347]/30 bg-gradient-to-t from-[#fffaf0] to-[#f8ecd2] text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full font-serif font-bold text-xs uppercase tracking-[0.16em] text-[#fbebd0] bg-gradient-to-r from-[#7c1a22] to-[#540d13] border border-[#d4a347] hover:brightness-110 transition-all shadow-md"
          >
            Close Book
          </button>
        </div>
      </div>
    </div>
  );
}
