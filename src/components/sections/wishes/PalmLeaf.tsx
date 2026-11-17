import type { Wish } from "@/lib/wishes";

/**
 * A blessing written on a palm leaf (olai): long cream leaf, faint grain,
 * a binding hole at each end. `fresh` adds a gold glow for a just-sent wish.
 */
export function PalmLeaf({ wish, fresh = false, hidden = false }: { wish: Wish; fresh?: boolean; hidden?: boolean }) {
  return (
    <article
      aria-hidden={hidden || undefined}
      className={`relative w-[16.5rem] shrink-0 rounded-[2.25rem] border border-[#d8bd86] px-9 py-5 text-left shadow-[0_6px_18px_rgb(120_84_30/0.10)] md:w-[19rem] ${
        fresh ? "animate-[leafIn_0.9s_cubic-bezier(0.22,1,0.36,1)] ring-2 ring-gold/60" : ""
      }`}
      style={{
        background:
          "repeating-linear-gradient(to bottom, transparent 0 11px, rgb(150 110 50 / 0.07) 11px 12px), linear-gradient(to bottom, #f4e6c6, #ead6a8)",
      }}
    >
      <span aria-hidden className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-[#b8935a] bg-ivory" />
      <span aria-hidden className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-[#b8935a] bg-ivory" />
      <p className="text-[1.02rem] italic leading-snug text-ink">“{wish.message}”</p>
      <p className="mt-2 font-script text-[1.5rem] leading-none text-accent">— {wish.name}</p>
    </article>
  );
}
