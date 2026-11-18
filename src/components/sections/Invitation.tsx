import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { InvitationFrame } from "@/components/frame/InvitationFrame";
import { artProps } from "@/lib/art";

function useDateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/**
 * Section 01 — Invitation, still version (phones with reduced motion; the
 * animated phone version is scenes/InvitationStage). The names on the
 * cobalt sky with the temple standing at the bottom, then the invitation
 * inside the temple frame. No pinning; the page fades each section in.
 */
export function Invitation() {
  const { guestName } = useGuest();
  const { couple, wedding, media } = useWedding();
  const date = useDateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  return (
    <section id="invitation" aria-labelledby="couple-names" className="relative isolate">
      <div className="cobalt relative overflow-hidden" style={{ minHeight: "100svh" }}>
        <img
          {...artProps(media.invitation, "100vw")}
          data-hero
          alt="A colourful gopuram against a deep blue sky, with a flowering tree in front"
          fetchPriority="high"
          className="absolute bottom-0 left-0 w-full"
          draggable={false}
        />
        <div className="relative z-10 flex flex-col items-center px-gutter text-center text-white [text-shadow:0_2px_16px_rgb(0_30_90/0.55)]" style={{ paddingTop: "max(3.75rem, 8svh)" }}>
          {wedding.blessing && <p className="text-[0.8rem] tracking-[0.32em]">{wedding.blessing}</p>}
          <p className="mt-3 font-script text-[clamp(1.9rem,min(8.5vw,5svh),2.8rem)] leading-tight">Dear {guestName},</p>
          <p className="mt-1.5 max-w-[19rem] text-[1rem] italic leading-snug">{wedding.invitationLine}</p>
          <h1 id="couple-names" className="mt-3 font-script font-normal leading-[0.95]">
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{first.name}</span>
            <span className="block text-[clamp(1.5rem,min(6.5vw,4svh),2.6rem)]">&amp;</span>
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{second.name}</span>
          </h1>
          <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.3em]">
            {date.day} {date.month} {date.year} · {wedding.city.split(",")[0]}
          </p>
        </div>
        <ScrollCue href="#invitation-frame" className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2" />
      </div>
      <div className="section-rule" aria-hidden />
      <InvitationFrame />
    </section>
  );
}
