import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useAudio } from "@/context/AudioContext";
import { Container } from "@/components/layout/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { JourneyMap } from "./travel/JourneyMap";
import { directionsUrl } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";

/* ── small gold line icons ── */
const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...ICON} aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON} aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}
function TrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON} aria-hidden>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M8 21l2-4M16 21l-2-4" />
      <circle cx="9" cy="13.5" r=".8" fill="currentColor" />
      <circle cx="15" cy="13.5" r=".8" fill="currentColor" />
    </svg>
  );
}
function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON} aria-hidden>
      <rect x="4" y="3" width="16" height="15" rx="2.5" />
      <path d="M4 11h16M8 18v2M16 18v2" />
      <circle cx="8" cy="14.5" r=".8" fill="currentColor" />
      <circle cx="16" cy="14.5" r=".8" fill="currentColor" />
    </svg>
  );
}
function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON} aria-hidden>
      <path d="M5 16h14M7 11l1.6-4A2 2 0 0 1 10.5 5.7h3a2 2 0 0 1 1.9 1.3L17 11" />
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.4" />
      <circle cx="16.5" cy="17.5" r="1.4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...ICON} aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...ICON} aria-hidden>
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5Z" />
    </svg>
  );
}
/** The icon for a travel note, picked from its words. */
function travelIcon(text: string) {
  const t = text.toLowerCase();
  if (/airport|flight|fly|plane/.test(t)) return <PlaneIcon />;
  if (/railway|station|train|junction/.test(t)) return <TrainIcon />;
  if (/\bbus\b/.test(t)) return <BusIcon />;
  return <CarIcon />;
}

/** A travel note boiled down to a short name and its distance: "Airport · 12 km". */
function shortNote(note: string): { label: string; text: string } {
  const t = note.toLowerCase();
  const name = /airport|flight/.test(t)
    ? "Airport"
    : /railway|station|junction|train/.test(t)
      ? "Railway Station"
      : /\bbus\b/.test(t)
        ? "Bus Stand"
        : /parking|valet/.test(t)
          ? "Parking"
          : note.split(/[—;,.]/)[0].trim();
  const dist = note.match(/\d+(?:\.\d+)?\s?(?:km|m)\b/i)?.[0] ?? (/parking|valet/.test(t) ? "At the venue" : "");
  return { label: dist, text: name };
}

/** The end of the journey: a small temple tower. */
function TempleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...ICON} aria-hidden>
      <path d="M12 2.5v2M9.5 6h5l1 3.5h-7L9.5 6ZM8 9.5h8l1 4H7l1-4ZM6 13.5h12l1 4H5l1-4ZM4 17.5h16V21H4z" />
      <path d="M10.5 21v-2.2a1.5 1.5 0 0 1 3 0V21" />
    </svg>
  );
}

/** A brass temple bell. */
function Bell() {
  return (
    <svg viewBox="0 0 64 76" className="fw-bell-svg" aria-hidden>
      <defs>
        <linearGradient id="fw-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8a5d1f" />
          <stop offset="0.35" stopColor="#f3d27a" />
          <stop offset="0.6" stopColor="#c8952f" />
          <stop offset="1" stopColor="#7a5216" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="6" r="4.5" fill="none" stroke="#c8952f" strokeWidth="2.2" />
      <path d="M28 11h8v5h-8z" fill="#b8892f" />
      <path d="M32 15c-12 0-18 10-18 24 0 9-3 15-8 19h52c-5-4-8-10-8-19 0-14-6-24-18-24Z" fill="url(#fw-brass)" />
      <path d="M6 58h52c0 3-2 5-5 5H11c-3 0-5-2-5-5Z" fill="#9a6a24" />
      <path d="M17 44h30" stroke="#7a5216" strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M20 28c2-5 5-8 9-9" stroke="#fff5d6" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 63v6" stroke="#7a5216" strokeWidth="2" />
      <circle cx="32" cy="71" r="4" fill="#c8952f" />
    </svg>
  );
}

/* gold stars twinkling in the dark around the content: [left %, top %, size px, delay s] */
const STARS: [number, number, number, number][] = [
  [6, 18, 9, 0], [93, 22, 11, 1.2], [4, 41, 7, 2.1], [95, 47, 8, 0.7], [7, 63, 10, 1.7], [92, 70, 7, 2.6], [5, 86, 8, 0.4], [94, 90, 10, 1.9],
];

/** Each contact bell rings at its own pitch (playback rates on one bell sound). */
const BELL_PITCH = [1, 0.8909, 1.1225, 0.7937];

/** Ring a bell: restart its swing. */
function ring(e: MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.classList.remove("is-ringing", "is-swaying");
  void el.offsetWidth;
  el.classList.add("is-ringing");
}

/** "Monday, 15 Feb 2027 · Muhurtham 7:00 – 8:30 AM", from the config. */
function dateLine(iso: string, timeZone: string, muhurtham?: string) {
  const d = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "short", year: "numeric" }).formatToParts(new Date(iso));
  const p = (t: string) => d.find((x) => x.type === t)?.value ?? "";
  const day = `${p("weekday")}, ${p("day")} ${p("month")} ${p("year")}`;
  return muhurtham ? `${day} · Muhurtham ${muhurtham}` : day;
}

/**
 * Our Venue & Travel, on dark maroon silk, read top to bottom: the heading, the mandap
 * illustration glowing under it, the venue (name, address, date, directions), how to get
 * there (with where to stay), the family to call, and a gold closing ribbon. Every detail
 * comes from wedding.config.ts.
 */
export function FindYourWay() {
  const { venue, wedding, travelNotes = [], stay = [], contacts } = useWedding();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const query = venue.mapsQuery || `${venue.name}, ${venue.address}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${venue.name}, ${venue.address}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to show */
    }
  };

  // the cards fade up, one after another, as the section comes into view
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const leaves = gsap.utils.toArray<HTMLElement>(".fw-leaf", el);
      const bells = gsap.utils.toArray<HTMLElement>(".fw-bell", el);
      // where to stay: each palm leaf starts rolled shut and opens in turn, with a dry leaf rustle
      if (leaves.length) {
        if (!reduced) gsap.set(leaves, { scaleY: 0.08, autoAlpha: 0, transformOrigin: "50% 0%" });
        const open = gsap.timeline({ paused: true });
        leaves.forEach((leaf, i) => {
          if (!reduced) open.to(leaf, { scaleY: 1, autoAlpha: 1, duration: 0.7, ease: "power2.out", clearProps: "transform" }, i * 0.35);
          // a dry palm-leaf rustle as each one unrolls
          open.call(() => playSfx("leaf", { volume: 0.55, rate: 1 + (i % 3) * 0.05, owner: el }), [], i * 0.35);
        });
        gsap.timeline({ scrollTrigger: { trigger: leaves[0].parentElement, start: "top 75%", once: true } }).call(() => void open.play());
      }
      // contact: the bells swing one after another as they come into view, each with its own voice
      if (bells.length) {
        gsap.timeline({ scrollTrigger: { trigger: bells[0], start: "top 80%", once: true } }).call(() => {
          bells.forEach((b, i) =>
            gsap.delayedCall(0.3 * i, () => {
              if (!reduced) b.classList.add("is-swaying");
            }),
          );
        });
      }
      if (reduced) return;
      gsap.from(gsap.utils.toArray<HTMLElement>("[data-rise]", el), {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, playSfx]);

  return (
    <section ref={root} id="travelStay" aria-labelledby="fw-heading" className="fw-section">
      {/* the temple dressing: a gopuram frieze along the top, marigold strings and brass
          lamps hanging from it, a gold frame down the sides, gold stars in the dark */}
      <span aria-hidden className="fw-frieze" />
      <span aria-hidden className="fw-frame" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="fw-sec-corner fw-corner--tl" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="fw-sec-corner fw-corner--tr" />
      {(["l1", "l2", "r1", "r2"] as const).map((k) => (
        <span key={k} aria-hidden className={`fw-strand fw-strand--${k}`} />
      ))}
      {(["l", "r"] as const).map((side) => (
        <span key={side} aria-hidden className={`fw-deepam fw-deepam--${side}`}>
          <span className="fw-deepam-chain" />
          <svg viewBox="-22 -48 44 64">
            <path className="ic-oil-flame" d="M0-44C4-37 4-31 0-27-4-31-4-37 0-44Z" />
            <path d="M-12-26 0-46 12-26" fill="none" stroke="#b8893e" strokeWidth=".9" />
            <path d="M-17-26C-17-17-9-12 0-12S17-17 17-26Z" fill="#c8961e" stroke="#7a5418" strokeWidth=".9" />
            <ellipse cy="-26" rx="17" ry="3.8" fill="#e9c46a" stroke="#7a5418" strokeWidth=".8" />
            <path d="M-7-12H7L4-4H-4Z" fill="#b8862e" stroke="#7a5418" strokeWidth=".7" />
            <path d="M0-4 0 6" stroke="#b8893e" strokeWidth="1.2" />
            <circle cy="9" r="3" fill="#c8961e" stroke="#7a5418" strokeWidth=".7" />
          </svg>
        </span>
      ))}
      {STARS.map(([l, t, z, d], i) => (
        <span key={i} aria-hidden className="fw-star" style={{ left: `${l}%`, top: `${t}%`, width: z, height: z, animationDelay: `${d}s` }} />
      ))}

      <Container className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* 1 · heading */}
        <header className="fw-head" data-rise>
          <p className="fw-eyebrow">॥ Find your way to us ॥</p>
          <h2 id="fw-heading" className="fw-title">
            Our Venue &amp; Travel
          </h2>
          <GoldDivider className="mt-3" />
          <p className="fw-sub">Everything you need to be part of our celebrations.</p>
        </header>

        {/* 2 · the mandap, glowing under the heading */}
        <figure className="fw-hero" data-rise>
          <span aria-hidden className="fw-hero-glow" />
          <img src="/media/mandap-venue-clean.webp" alt={`An illustration of the mandap at ${venue.name}`} className="fw-hero-art" loading="lazy" decoding="async" draggable={false} />
          <span aria-hidden className="fw-hero-floor" />
        </figure>

        {/* 3 · about the venue: name, location, date, buttons */}
        <div className="fw-about" data-rise>
          <p className="fw-kicker">The venue</p>
          <h3 className="fw-venue-name">{venue.name}</h3>
          <p className="fw-address">
            <span className="fw-pin" aria-hidden>
              <PinIcon />
            </span>
            <span>{venue.address}</span>
          </p>
          <p className="fw-date">{dateLine(wedding.dateISO, wedding.timeZone, wedding.muhurthamLabel)}</p>
          <div className="fw-actions">
            <a className="fw-btn fw-btn--solid" href={directionsUrl(query)} target="_blank" rel="noopener noreferrer">
              <PinIcon className="h-4 w-4" /> Get Directions
            </a>
            <button type="button" className="fw-btn fw-btn--ghost" onClick={copy}>
              {copied ? "Copied ✓" : "Copy Address"}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
              {copied ? "Address copied" : ""}
            </span>
          </div>
        </div>

        {/* 4 · travel: the journey as a golden path of stops, ending at the venue */}
        {travelNotes.length > 0 && (
          <div className="fw-block" data-rise>
            <h3 className="fw-block-title">Travel</h3>
            <GoldDivider className="mt-2" />
                        <JourneyMap
              place={wedding.city.split(",")[0]}
              nickname={wedding.cityNickname}
              reduced={reduced}
              stops={[
                ...travelNotes.map((note) => ({ ...shortNote(note), icon: travelIcon(note) })),
                { label: "", text: venue.name, icon: <TempleIcon />, end: true },
              ]}
            />
          </div>
        )}

        {/* where to stay: a palm-leaf (olai) manuscript, one leaf per hotel, bound by a red thread */}
        {stay.length > 0 && (
          <div className="fw-block" data-rise>
            <h3 className="fw-block-title">Where to Stay</h3>
            <GoldDivider className="mt-2" />
            <div className="fw-olai">
              <span aria-hidden className="fw-olai-board" />
              {stay.map((s, i) => (
                <article key={s.name} className="fw-leaf" style={{ ["--tilt" as string]: `${i % 2 ? 0.7 : -0.7}deg` } as CSSProperties}>
                  <span aria-hidden className="fw-leaf-hole fw-leaf-hole--l" />
                  <span aria-hidden className="fw-leaf-hole fw-leaf-hole--r" />
                  <div className="fw-leaf-body">
                    <div className="fw-leaf-top">
                      <h4 className="fw-leaf-name">{s.name}</h4>
                      {s.distance && <span className="fw-leaf-stamp">{s.distance}</span>}
                    </div>
                    {s.note && <p className="fw-leaf-note">{s.note}</p>}
                    {s.url && (
                      <a className="fw-leaf-link" href={s.url} target="_blank" rel="noopener noreferrer">
                        View ›
                      </a>
                    )}
                  </div>
                </article>
              ))}
              <span aria-hidden className="fw-olai-board fw-olai-board--bottom" />
              <span aria-hidden className="fw-olai-thread fw-olai-thread--l" />
              <span aria-hidden className="fw-olai-thread fw-olai-thread--r" />
            </div>
          </div>
        )}

        {/* 5 · contact: temple bells hanging from a gold rod — tap one to ring it */}
        {contacts.length > 0 && (
          <div className="fw-block" data-rise>
            <h3 className="fw-block-title">Contact</h3>
            <GoldDivider className="mt-2" />
            <p className="fw-block-sub">Ring a bell — the family is a call away.</p>
            <ul className="fw-bells">
              {contacts.map((c, i) => (
                <li key={c.name} className="fw-bell-item">
                  <button
                    type="button"
                    className="fw-bell"
                    onClick={(e) => {
                      ring(e);
                      // each bell has its own voice
                      playSfx("bell", { rate: BELL_PITCH[i % BELL_PITCH.length], volume: 0.75, gesture: true, owner: root.current });
                    }}
                    aria-label={`Ring the bell for ${c.name}`}
                  >
                    <span aria-hidden className="fw-bell-chain" />
                    <Bell />
                  </button>
                  <div className="fw-plaque">
                    <p className="fw-plaque-name">{c.name}</p>
                    {c.role && <p className="fw-plaque-role">{c.role}</p>}
                    {c.phone && (
                      <span className="fw-contact-actions">
                        <a className="fw-icon-btn" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} aria-label={`Call ${c.name}`}>
                          <PhoneIcon />
                        </a>
                        {c.whatsapp && (
                          <a className="fw-icon-btn fw-icon-btn--wa" href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${c.name}`}>
                            <ChatIcon />
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* closing ribbon */}
        <div className="fw-ribbon-wrap" data-rise>
          <p className="fw-ribbon">We can&rsquo;t wait to celebrate with you!</p>
          <svg aria-hidden viewBox="0 0 24 22" className="fw-heart">
            <path d="M12 20.5S2.5 14.6 2.5 8.2A4.7 4.7 0 0 1 12 5.6a4.7 4.7 0 0 1 9.5 2.6c0 6.4-9.5 12.3-9.5 12.3Z" fill="#e8c56b" stroke="#9a6b18" strokeWidth=".8" />
          </svg>
        </div>
      </Container>
    </section>
  );
}
