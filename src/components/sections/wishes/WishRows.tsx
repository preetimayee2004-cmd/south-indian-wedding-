import { useEffect, useRef } from "react";
import type { Wish } from "@/lib/wishes";
import { PalmLeaf } from "./PalmLeaf";

const MARQUEE_MIN = 6;

/**
 * A river of blessings: two rows drifting in opposite directions, pausing on
 * hover/touch/focus and whenever off-screen. Few wishes (or reduced motion):
 * one row you can swipe through.
 */
export function WishRows({ wishes, freshIds, reduced }: { wishes: Wish[]; freshIds: Set<string>; reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  // Pause animations while the wall is off-screen (saves battery on phones).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-offscreen", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced || wishes.length < MARQUEE_MIN) {
    return (
      <div ref={root} className="wish-row -mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-4 [scrollbar-width:thin] md:justify-center">
        {wishes.map((w) => (
          <div key={w.id} className="snap-center">
            <PalmLeaf wish={w} fresh={freshIds.has(w.id)} />
          </div>
        ))}
      </div>
    );
  }

  const rows = [wishes.filter((_, i) => i % 2 === 0), wishes.filter((_, i) => i % 2 === 1)];
  return (
    <div
      ref={root}
      className="group/wall relative left-1/2 w-screen -translate-x-1/2 space-y-5 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      onPointerDown={(e) => e.currentTarget.toggleAttribute("data-held", true)}
      onPointerUp={(e) => e.currentTarget.toggleAttribute("data-held", false)}
      onPointerLeave={(e) => e.currentTarget.toggleAttribute("data-held", false)}
    >
      {rows.map((row, r) => (
        <div key={r} className="wish-row">
          <div
            className="flex w-max gap-5 group-hover/wall:[animation-play-state:paused] group-focus-within/wall:[animation-play-state:paused] group-data-[held]/wall:[animation-play-state:paused] group-data-[offscreen]/wall:[animation-play-state:paused]"
            style={{ animation: `marquee ${Math.max(40, row.length * 9)}s linear infinite ${r === 1 ? "reverse" : ""}` }}
          >
            {[0, 1].map((copy) =>
              row.map((w) => <PalmLeaf key={`${copy}-${w.id}`} wish={w} fresh={copy === 0 && freshIds.has(w.id)} hidden={copy === 1} />),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
