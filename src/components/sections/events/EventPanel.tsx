import type { WeddingEvent } from "@/config/types";
import { formatDay, formatTimeRange, mapsUrl } from "@/lib/format";
import { EventIcon } from "./EventIcon";

interface Props {
  event: WeddingEvent;
  index: number;
  total: number;
  timeZone: string;
  /** "stage": sized in container units inside the pillar artwork. "flow": normal page flow. */
  variant: "stage" | "flow";
}

/**
 * One ceremony, laid out like a leaf of a palm-leaf manuscript:
 * icon or photo, number, name, day, time, then venue / dress code / note.
 * Each event carries its own tone colour.
 */
export function EventPanel({ event: e, index, total, timeZone, variant }: Props) {
  const tone = e.tone ?? "rgb(var(--c-accent))";
  const stage = variant === "stage";
  // Stage sizes scale with the artwork (cqh); flow sizes are plain rem.
  const s = (cqh: number, rem: number) => (stage ? `${cqh}cqh` : `${rem}rem`);

  return (
    <article className="ev-panel flex h-full flex-col items-center text-center" aria-label={e.name}>
      <div className="ev-mark" style={{ color: tone }}>
        {e.image ? (
          <img
            src={e.image}
            alt=""
            loading="lazy"
            className="rounded-t-[999px] border border-gold/50 object-cover p-[2px]"
            style={{ height: s(10, 6), aspectRatio: "3 / 4" }}
          />
        ) : (
          <EventIcon name={e.icon ?? "diya"} className="ev-icon" style={{ width: s(6.2, 3.5), height: s(6.2, 3.5) }} />
        )}
      </div>

      <p className="tabular-nums text-ink-soft" style={{ fontSize: s(1.25, 0.72), letterSpacing: "0.3em", marginTop: s(1.4, 0.8) }}>
        {String(index + 1).padStart(2, "0")} <span className="opacity-50">/ {String(total).padStart(2, "0")}</span>
      </p>
      <h3 className="font-script font-normal leading-none" style={{ color: tone, fontSize: s(6.4, 3.4), marginTop: s(0.8, 0.4) }}>
        {e.name}
      </h3>
      <p className="uppercase text-ink-soft" style={{ fontSize: s(1.3, 0.75), letterSpacing: "0.24em", marginTop: s(1.6, 0.9) }}>
        {formatDay(e.startISO, timeZone)}
      </p>
      <p className="text-ink" style={{ fontSize: s(2.9, 1.6), marginTop: s(0.4, 0.2) }}>
        {formatTimeRange(e.startISO, timeZone, e.endISO)}
      </p>

      <span aria-hidden className="block h-px bg-gold/50" style={{ width: s(9, 5), margin: `${s(2, 1.1)} 0` }} />

      <dl className="grid w-full gap-y-[0.9em] text-ink" style={{ fontSize: s(1.75, 1) }}>
        {e.venue && (
          <div>
            <dt className="uppercase text-ink-soft" style={{ fontSize: "0.72em", letterSpacing: "0.24em" }}>Venue</dt>
            <dd className="mt-[0.15em] leading-snug">
              {e.venue}
              {e.mapsQuery && (
                <>
                  {" "}
                  <a
                    href={mapsUrl(e.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={stage ? -1 : undefined}
                    className="whitespace-nowrap underline decoration-gold/60 underline-offset-4 hover:text-accent"
                    style={{ color: tone }}
                  >
                    Directions ↗
                  </a>
                </>
              )}
            </dd>
          </div>
        )}
        {e.dressCode && (
          <div>
            <dt className="uppercase text-ink-soft" style={{ fontSize: "0.72em", letterSpacing: "0.24em" }}>Dress code</dt>
            <dd className="mt-[0.15em] flex items-center justify-center gap-2 leading-snug">
              {e.dressColors?.slice(0, 3).map((c) => (
                <span key={c} aria-hidden className="inline-block h-[0.8em] w-[0.8em] rounded-full ring-1 ring-ink/10" style={{ background: c }} />
              ))}
              <span>{e.dressCode}</span>
            </dd>
          </div>
        )}
      </dl>

      {e.description && (
        <p className="italic leading-snug text-ink-soft" style={{ fontSize: s(1.85, 1.05), marginTop: s(2, 1.1), maxWidth: stage ? "92%" : "22rem" }}>
          {e.description}
        </p>
      )}
    </article>
  );
}
