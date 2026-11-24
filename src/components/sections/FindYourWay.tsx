import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Container } from "@/components/layout/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { directionsUrl, mapEmbedUrl } from "@/lib/format";
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

function Corners() {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`fw-corner fw-corner--${c}`} />
      ))}
    </>
  );
}

/** "Monday, 15 Feb 2027 · Muhurtham 7:00 – 8:30 AM", from the config. */
function dateLine(iso: string, timeZone: string, muhurtham?: string) {
  const d = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "short", year: "numeric" }).formatToParts(new Date(iso));
  const p = (t: string) => d.find((x) => x.type === t)?.value ?? "";
  const day = `${p("weekday")}, ${p("day")} ${p("month")} ${p("year")}`;
  return muhurtham ? `${day} · Muhurtham ${muhurtham}` : day;
}

/**
 * Our Venue & Travel: a featured venue card (an arched window with the venue — the map loads
 * only when asked for), Getting There and Where to Stay, the family to call, and a closing
 * ribbon — all on the cream temple corridor, every detail from wedding.config.ts.
 */
export function FindYourWay() {
  const { venue, wedding, travelNotes = [], stay = [], contacts } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [showMap, setShowMap] = useState(false);
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
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
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
  }, [reduced]);

  return (
    <section ref={root} id="travelStay" aria-labelledby="fw-heading" className="fw-section">
      <Container className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* heading */}
        <header className="fw-head" data-rise>
          <p className="fw-eyebrow">॥ Find your way to us ॥</p>
          <h2 id="fw-heading" className="fw-title">
            Our Venue &amp; Travel
          </h2>
          <GoldDivider className="mt-3" />
          <p className="fw-sub">Everything you need to be part of our celebrations.</p>
        </header>

        {/* the maroon silk stage, framed in gold, that holds every card */}
        <div className="fw-stage">
          <span aria-hidden className="fw-stage-frame" />
          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`fw-stage-corner fw-corner--${c}`} />
          ))}

        {/* the venue */}
        <article className="fw-card fw-venue" data-rise>
          <Corners />
          <div className="fw-window">
            <div className="fw-window-inner">
              {showMap ? (
                <iframe title={`Map showing ${venue.name}`} src={mapEmbedUrl(query)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="fw-map" allowFullScreen />
              ) : (
                <>
                  <img src="/media/mandap-venue.webp" alt={`An illustration of ${venue.name}`} className="fw-venue-art" loading="lazy" decoding="async" draggable={false} />
                  <button type="button" className="fw-btn fw-btn--ghost fw-map-btn" onClick={() => setShowMap(true)}>
                    <PinIcon className="h-3.5 w-3.5" /> View on map
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="fw-venue-text">
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
                Get Directions
              </a>
              <button type="button" className="fw-btn fw-btn--ghost" onClick={copy}>
                {copied ? "Copied ✓" : "Copy Address"}
              </button>
              <span role="status" aria-live="polite" className="sr-only">
                {copied ? "Address copied" : ""}
              </span>
            </div>
          </div>
        </article>

        {/* getting there + where to stay */}
        <div className="fw-pair">
          {travelNotes.length > 0 && (
            <article className="fw-card fw-list-card" data-rise>
              <Corners />
              <h3 className="fw-card-title">Getting There</h3>
              <ul className="fw-list">
                {travelNotes.map((note) => (
                  <li key={note} className="fw-travel-row">
                    <span className="fw-medal" aria-hidden>
                      {travelIcon(note)}
                    </span>
                    <span className="fw-travel-text">{note}</span>
                  </li>
                ))}
              </ul>
              <a className="fw-btn fw-btn--ghost fw-card-cta" href={directionsUrl(query)} target="_blank" rel="noopener noreferrer">
                Plan your route
              </a>
            </article>
          )}
          {stay.length > 0 && (
            <article className="fw-card fw-list-card" data-rise>
              <Corners />
              <h3 className="fw-card-title">Where to Stay</h3>
              <ul className="fw-list">
                {stay.map((s) => (
                  <li key={s.name} className="fw-stay-row">
                    <div className="fw-stay-top">
                      <span className="fw-stay-name">{s.name}</span>
                      {s.distance && <span className="fw-pill">{s.distance}</span>}
                    </div>
                    {s.note && <p className="fw-stay-note">{s.note}</p>}
                    {s.url && (
                      <a className="fw-link" href={s.url} target="_blank" rel="noopener noreferrer">
                        View ›
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        {/* need help? */}
        {contacts.length > 0 && (
          <div className="fw-help" data-rise>
            <h3 className="fw-help-title">Need help? Call us</h3>
            <ul className="fw-contacts">
              {contacts.map((c) => (
                <li key={c.name} className="fw-contact">
                  <span className="fw-initial" aria-hidden>
                    {c.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="fw-contact-who">
                    <span className="fw-contact-name">{c.name}</span>
                    {c.role && <span className="fw-contact-role">{c.role}</span>}
                  </span>
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
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>

        {/* closing ribbon */}
        <div className="fw-ribbon-wrap" data-rise>
          <p className="fw-ribbon">We can&rsquo;t wait to celebrate with you!</p>
          <svg aria-hidden viewBox="0 0 24 22" className="fw-heart">
            <path d="M12 20.5S2.5 14.6 2.5 8.2A4.7 4.7 0 0 1 12 5.6a4.7 4.7 0 0 1 9.5 2.6c0 6.4-9.5 12.3-9.5 12.3Z" fill="#d4a54a" stroke="#9a6b18" strokeWidth=".8" />
          </svg>
        </div>
      </Container>
    </section>
  );
}
