import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Petals, addPetals } from "./CoupleScene";

/**
 * Scene 11 — Thank You (with Save the Date, Add to Calendar and Replay
 * Invitation, as in the reference). The couple picture again, cropped to the couple,
 * easing back from 1 to 0.9 as you scroll while petals fall; "Thank You"
 * fades in above them and the rest of the words follow. Monogram + footer
 * come after.
 */
export function ThankYouScene() {
  const { thankYou, couple, wedding, events, venue } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const tz = wedding.timeZone;
  const d = new Date(wedding.dateISO);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...o }).format(d);
  const saveDate = `${part({ day: "2-digit" })} · ${part({ month: "2-digit" })} · ${part({ year: "numeric" })}`;
  const weekday = part({ weekday: "long" });
  // Google Calendar: the muhurtham (with its end time when known)
  const muh = events.find((e) => e.startISO === wedding.dateISO);
  const end = muh?.endISO ? new Date(muh.endISO) : new Date(d.getTime() + 90 * 60000);
  const stamp = (t: Date) => t.toISOString().replace(/[-:]/g, "").replace(/.d{3}/, "");
  const calendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`${first.name} weds ${second.name} – Wedding`)}` +
    `&dates=${stamp(d)}/${stamp(end)}` +
    `&location=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`;
  const pic = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  const build: Build = (tl) => {
    tl.fromTo(pic.current, { scale: 1 }, { scale: 0.9, duration: 2, ease: "none" }, 0)
      .from(head.current!.children, { opacity: 0, y: 16, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 0.2)
      .from(words.current!.children, { opacity: 0, y: 12, duration: 0.3, stagger: 0.12, ease: "power2.out" }, 0.7);
    addPetals(tl, petals.current, 0, 2);
  };

  return (
    <Scene
      id="thankYou"
      labelledBy="thanks-heading"
      className="cobalt"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />}
    >
      <div className="relative mx-auto flex h-full max-w-[34rem] flex-col items-center px-gutter pb-[max(1rem,2svh)] pt-[max(1.25rem,4svh)] text-center">
        <div ref={head}>
          <h2 id="thanks-heading" className="font-script font-normal text-[#f3cf73] text-[clamp(2.8rem,13vw,4.6rem)] leading-none">
            Thank You
          </h2>
          <p className="mt-1 text-[1rem] italic text-[#fbf2dc]">{thankYou.message}</p>
        </div>

        {/* the couple facing the temple */}
        <div className="relative mt-3 w-full min-h-0 flex-1 overflow-hidden rounded-t-[999px] border-2 border-[#f3cf73]/80 shadow-2xl bg-[#fffdfa]">
          <div ref={pic} data-layer className="absolute inset-0">
            <img
              src="/media/thank-you-temple.webp"
              alt={`${first.name} and ${second.name} facing the sacred temple`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-bottom"
              draggable={false}
            />
          </div>
        </div>

        {/* save the date (as in the reference): the day, add to calendar, replay the invitation */}
        <div ref={words} className="mt-3 w-full">
          <div className="parchment frieze-border mx-auto max-w-[22rem] rounded-[6px] px-4 pb-3 pt-3">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.4em] text-maroon">Save the Date</p>
            <p className="mt-1 text-[clamp(1.6rem,7vw,2.1rem)] tabular-nums leading-none tracking-[0.08em] text-accent">{saveDate}</p>
            <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.28em] text-ink">
              {weekday} · {wedding.city.split(",")[0]}
            </p>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-block rounded-full bg-maroon px-5 py-2 text-[0.66rem] uppercase tracking-[0.2em] text-[#fbf2dc]"
            >
              Add to Calendar
            </a>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("invitation:replay"))}
            className="mt-3 rounded-full border border-[#fbf2dc]/50 px-5 py-2 text-[0.66rem] uppercase tracking-[0.24em] text-[#fbf2dc]"
          >
            Replay Invitation
          </button>
        </div>
      </div>
      <Petals refs={petals} z="z-30" />
    </Scene>
  );
}
