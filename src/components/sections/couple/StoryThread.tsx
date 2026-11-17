import type { StoryMilestone } from "@/config/types";

/**
 * Our Story as a sacred thread: a turmeric thread grows down the page as you
 * scroll and each milestone's knot lights up when the thread reaches it.
 * Mobile: thread on the left. md+: thread in the centre, milestones alternate.
 * Animated by the parent via `.story-line`, `.story-item`, `.story-knot`.
 */
export function StoryThread({ items }: { items: StoryMilestone[] }) {
  return (
    <ol className="story relative mx-auto mt-12 max-w-[34rem] md:max-w-[48rem]">
      {/* track + growing thread */}
      <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px bg-line md:left-1/2" />
      <span
        aria-hidden
        className="story-line absolute bottom-2 left-[10px] top-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#e2a72e] via-[#d98b2b] to-accent md:left-[calc(50%-1px)]"
      />

      {items.map((m, i) => {
        const right = i % 2 === 1; // md+ alternation
        return (
          <li
            key={`${m.title}-${i}`}
            className={`story-item relative pb-12 pl-10 last:pb-0 md:w-1/2 md:pl-0 ${
              right ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"
            }`}
          >
            <span
              aria-hidden
              className={`story-knot absolute left-[3px] top-[0.55rem] grid h-[19px] w-[19px] place-items-center rounded-full border border-gold/60 bg-ivory ${
                right ? "md:-left-[9px]" : "md:left-auto md:-right-[10px]"
              }`}
            >
              <span className="story-knot-core h-[7px] w-[7px] rotate-45 bg-line" />
            </span>

            {m.date && <p className="font-script text-[2rem] leading-none text-accent">{m.date}</p>}
            <h4 className="mt-2 text-[0.8rem] font-medium uppercase tracking-[0.24em] text-ink">{m.title}</h4>
            <p className="mt-2 text-ink-soft">{m.text}</p>
            {m.photo && (
              <img
                src={m.photo}
                alt=""
                loading="lazy"
                decoding="async"
                className={`mt-4 aspect-[4/5] w-36 rounded-t-[999px] border border-gold/40 object-cover p-[3px] ${right ? "" : "md:ml-auto"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
