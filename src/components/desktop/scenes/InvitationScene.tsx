import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { Ornament } from "@/components/ui/Ornament";
import { Countdown } from "@/components/sections/invitation/Countdown";
import { Scene } from "../Scene";
import { desktopArt } from "../art";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** Desktop scene 2 — the invitation itself, written inside the glowing arch. */
export function InvitationScene() {
  const config = useWedding();
  const { couple, wedding, venue } = config;
  const { guestName } = useGuest();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  return (
    <Scene id="invitation" labelledBy="invite-heading" art={desktopArt(config, "invitation")} veil="center">
      <div className="mx-auto max-w-[40rem] text-center">
        <p data-reveal className="font-script text-[clamp(2.4rem,3.2vw,3.2rem)] leading-none text-accent">
          Dear {guestName},
        </p>
        <p data-reveal className="mx-auto mt-4 max-w-[30rem] text-[1.2rem] italic leading-snug text-ink">
          {wedding.invitationLine}
        </p>
        <h2 id="invite-heading" data-reveal className="mt-6 font-script font-normal leading-[0.95] text-accent">
          <span className="text-[clamp(3.6rem,5.4vw,5.6rem)]">{first.name}</span>
          <span className="mx-4 text-[clamp(2rem,3vw,3rem)] text-gold">&amp;</span>
          <span className="text-[clamp(3.6rem,5.4vw,5.6rem)]">{second.name}</span>
        </h2>

        <div data-reveal className="mx-auto mt-8 grid max-w-[30rem] grid-cols-[1fr_auto_1fr] items-center gap-6">
          <span className="border-y border-gold/50 py-2.5 text-[0.82rem] uppercase tracking-[0.22em] text-ink-soft">{date.weekday}</span>
          <span className="text-[4.5rem] leading-none text-accent">{date.day}</span>
          <span className="border-y border-gold/50 py-2.5 text-[0.82rem] uppercase tracking-[0.22em] text-ink-soft">
            {date.month} {date.year}
          </span>
        </div>
        {wedding.muhurthamLabel && (
          <p data-reveal className="mt-4 text-[1.05rem] text-ink">
            <span className="text-ink-soft">Muhurtham</span> · {wedding.muhurthamLabel}
          </p>
        )}
        <div data-reveal className="mt-6 flex justify-center">
          <Ornament className="text-gold" />
        </div>
        <p data-reveal className="mt-5 text-[0.9rem] uppercase tracking-[0.26em] text-ink">{venue.name}</p>
        <p data-reveal className="mt-1 text-ink-soft">{wedding.city}</p>
      </div>
    </Scene>
  );
}

/** Desktop scene 3 — counting the days, on plain parchment. */
export function CountdownScene() {
  const { wedding } = useWedding();
  return (
    <Scene id="countdown" labelledBy="countdown-heading">
      <div className="w-full max-w-[34rem] text-center">
        <p data-reveal className="eyebrow">The auspicious hour</p>
        <h2 id="countdown-heading" data-reveal className="script-heading mt-2 text-[clamp(3rem,4.4vw,4.4rem)] leading-none">
          Counting the Days
        </h2>
        <div data-reveal className="mt-10">
          <Countdown targetISO={wedding.dateISO} label="Until the muhurtham" />
        </div>
        {wedding.quote && (
          <p data-reveal className="mx-auto mt-10 max-w-[26rem] text-[1.35rem] italic leading-snug text-ink-soft">
            “{wedding.quote}”
          </p>
        )}
      </div>
    </Scene>
  );
}
