import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { GoldCorners, GoldDivider } from "@/components/ui/GoldDivider";
import { Petals, addPetals } from "./CoupleScene";

/**
 * Scene 11 — Thank You (with Save the Date, Add to Calendar and Replay
 * Invitation). On deep maroon silk inside a gold frame: the couple facing the
 * temple in a gold-rimmed arch, easing back from 1 to 0.92 as you scroll while
 * petals fall; "Thank You" fades in above them, the Save the Date plaque
 * rises over the foot of the arch.
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
  const stamp = (t: Date) => t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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
    tl.fromTo(pic.current, { scale: 1 }, { scale: 0.92, duration: 2, ease: "none" }, 0)
      .from(head.current!.children, { opacity: 0, y: 16, duration: 0.4, stagger: 0.12, ease: "power2.out" }, 0.2)
      .from(words.current!.children, { opacity: 0, y: 12, duration: 0.3, stagger: 0.12, ease: "power2.out" }, 0.7);
    addPetals(tl, petals.current, 0, 2);
  };

  return (
    <Scene id="thankYou" labelledBy="thanks-heading" className="pm-silk" build={build}>
      {/* the gold frame around the whole screen, with filigree corners */}
      <span aria-hidden className="pm-frame" />
      <GoldCorners />

      <div className="relative z-[2] mx-auto flex h-full max-w-[34rem] flex-col items-center px-[1.6rem] pb-[max(1.4rem,3svh)] pt-[max(1.6rem,4.5svh)] text-center">
        <div ref={head}>
          <p className="pm-eyebrow">॥ शुभमस्तु ॥</p>
          <h2 id="thanks-heading" className="pm-script-title mt-1">Thank You</h2>
          <p className="pm-lede mt-1">{thankYou.message}</p>
          <GoldDivider className="mt-2" />
        </div>

        {/* the couple facing the temple, in a gold-rimmed arch */}
        <div className="ty-arch relative mt-3 w-full max-w-[19.5rem] min-h-0 flex-1">
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

        {/* save the date: the day, add to calendar, replay the invitation */}
        <div ref={words} className="relative z-10 -mt-8 w-full">
          <div className="ty-date mx-auto max-w-[20rem]">
            <p className="ty-date-label">Save the Date</p>
            <p className="ty-date-num">{saveDate}</p>
            <p className="ty-date-sub">
              {weekday} · {wedding.city.split(",")[0]}
            </p>
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn--solid mt-3">
              Add to Calendar
            </a>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new Event("invitation:replay"))} className="pm-btn pm-btn--ghost mt-3">
            ↺&nbsp; Replay Invitation
          </button>
        </div>
      </div>
      <Petals refs={petals} z="z-30" />
    </Scene>
  );
}
