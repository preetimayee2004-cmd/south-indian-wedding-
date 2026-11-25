import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { scrollToTarget } from "@/lib/smooth";
import { useWedding } from "@/context/WeddingContext";
import { fetchWishes, addWish, subscribeWishes, validateWish, WISH_LIMITS, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { AllWishesModal } from "./wishes/AllWishesModal";
import { useAudio } from "@/context/AudioContext";
import { KolamBand, JasmineFall } from "./rsvp/KolamBorder";
import { useAcceptedThisVisit } from "@/hooks/useAcceptedThisVisit";
import { useFitToScreen } from "@/hooks/useFitToScreen";

/** How many of the latest wishes ride on the wall (the rest are in "View All Wishes"). */
const ON_WALL = 12;
/** Below this many, the cards simply stand in a centred row (no marquee). */
const MARQUEE_FROM = 4;
/** On phones one card fills the screen, so the wall slides on its own from two cards. */
const MARQUEE_FROM_PHONE = 2;

function LotusCrest({ className = "w-7 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" className={className} aria-hidden="true">
      <path d="M16 2C16 2 19 8 19 13C19 15.5 17.5 17 16 17C14.5 17 13 15.5 13 13C13 8 16 2 16 2Z" fill="#d4a347" stroke="#9a6b18" strokeWidth="0.8" />
      <path d="M16 6C17.5 6 23 10 23 14C23 16.5 21 17.5 19 17C18 15 17 12 16 10" fill="#e6be65" stroke="#9a6b18" strokeWidth="0.8" />
      <path d="M16 6C14.5 6 9 10 9 14C9 16.5 11 17.5 13 17C14 15 15 12 16 10" fill="#e6be65" stroke="#9a6b18" strokeWidth="0.8" />
      <path d="M16 10C18 10 27 12 28 16C28 18 25 18.5 22 17.5C20 16 18 13.5 16 12" fill="#f3d485" stroke="#9a6b18" strokeWidth="0.8" />
      <path d="M16 10C14 10 5 12 4 16C4 18 7 18.5 10 17.5C12 16 14 13.5 16 12" fill="#f3d485" stroke="#9a6b18" strokeWidth="0.8" />
      <ellipse cx="16" cy="18" rx="8" ry="1.5" fill="#c49028" />
    </svg>
  );
}

/** One framed blessing card: a big gold quote mark, the message, a gold rule and the guest's signature. */
function BlessingCard({ wish, tilt, fresh, hidden, pinned }: { wish: Wish; tilt: number; fresh?: boolean; hidden?: boolean; pinned?: boolean }) {
  const cls = `ww-card ${fresh ? "ww-card--new" : ""} ${pinned ? "ww-card--pinned" : ""}`;
  const initial = wish.name.trim().charAt(0).toUpperCase() || "✦";
  return (
    <figure className={cls} data-wish={hidden ? undefined : wish.id} style={{ ["--tilt" as string]: `${tilt}deg` }} aria-hidden={hidden || undefined}>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`ww-corner ww-corner--${c}`} />
      ))}
      {pinned && (
        <span className="ww-pinned-tag" role="status">
          <span className="ww-pinned-pin" aria-hidden />
          Your blessing is pinned here
        </span>
      )}
      <span className="ww-quote" aria-hidden>
        &ldquo;
      </span>
      <blockquote className="ww-message">{wish.message}</blockquote>
      <span className="ww-rule" aria-hidden />
      <figcaption className="ww-sign">
        <span className="ww-medallion" aria-hidden>
          {initial}
        </span>
        <span className="ww-name">{wish.name}</span>
      </figcaption>
    </figure>
  );
}

export function WishingWall() {
  const { id: weddingId } = useWedding();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const { guestName, isPersonalized } = useGuest();
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const phone = useMediaQuery("(max-width: 767px)");
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const accepted = useAcceptedThisVisit(); // flowers fall here only once the RSVP is accepted in this visit
  const wallRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  // one screen tall, like the gallery: the content scales down to fit when it is taller
  useFitToScreen(sectionRef, fitRef);

  /** A little burst of rose and gold hearts rising from a point on the screen. */
  const burstHearts = (x: number, y: number, n: number, spread = 70) => {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = `ww-heart ${i % 2 ? "ww-heart--rose" : "ww-heart--gold"}`;
      h.textContent = "♥";
      document.body.appendChild(h);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const d = spread * (0.7 + Math.random() * 0.9);
      gsap.fromTo(
        h,
        { x, y, scale: 0.5, autoAlpha: 1 },
        { x: `+=${Math.cos(a) * d}`, y: `+=${Math.sin(a) * d - 30}`, scale: 0.8 + Math.random() * 0.7, autoAlpha: 0, duration: 1.1 + Math.random() * 0.4, ease: "power2.out", onComplete: () => h.remove() },
      );
    }
  };

  /** Hearts burst out of the Send button the moment it is pressed. */
  const heartsFromButton = () => {
    const b = sendBtnRef.current?.getBoundingClientRect();
    if (b) burstHearts(b.left + b.width / 2, b.top + b.height / 2, 14, 80);
  };

  /** The wall stops and starts again from the beginning, so the new wish (always first) is in view. */
  const holdWall = () => {
    const wall = wallRef.current;
    const track = wall?.querySelector<HTMLElement>(".ww-track");
    wall?.classList.add("is-landing");
    if (track) {
      track.style.animation = "none";
      void track.offsetWidth;
      track.style.animation = "";
    }
    if (wall) wall.scrollLeft = 0;
  };

  /** Show where the wish was pinned for a few seconds, then let the wall move on. */
  const showPinned = (w: Wish) => {
    setPinnedId(w.id);
    window.setTimeout(() => {
      setPinnedId((p) => (p === w.id ? null : p));
      wallRef.current?.classList.remove("is-landing");
    }, 4200);
  };

  /**
   * After sending: the page glides up to the wall, the wish flies from the composer onto its
   * spot, a brass pin drops on it, hearts burst, and the card glows with "Pinned here" for a moment.
   */
  const flyToWall = (w: Wish) => {
    holdWall();
    const wall = wallRef.current;
    if (wall) {
      const r = wall.getBoundingClientRect();
      const y = window.scrollY + r.top - Math.max(16, (window.innerHeight - r.height) / 2);
      scrollToTarget(y, { min: 700, max: 700 });
    }
    window.setTimeout(() => fly(w), wall ? 760 : 0);
  };

  const fly = (w: Wish) => {
    const card = document.querySelector<HTMLElement>(`[data-wish="${CSS.escape(w.id)}"]`);
    const from = formRef.current?.getBoundingClientRect();
    if (reduced || !card || !from) {
      playSfx("pin");
      playSfx("sweet", { volume: 0.5, delay: 0.15 });
      showPinned(w);
      return;
    }
    card.style.visibility = "hidden";
    const to = card.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "ww-fly";
    fly.setAttribute("aria-hidden", "true");
    const name = document.createElement("strong");
    name.textContent = w.name;
    const line = document.createElement("span");
    line.textContent = w.message.split("\n")[0].slice(0, 60);
    fly.append(line, name);
    document.body.appendChild(fly);
    const fw = fly.offsetWidth;
    const fh = fly.offsetHeight;
    const sx = from.left + from.width / 2 - fw / 2;
    // the composer may be below the screen by now: start from the bottom edge
    const sy = Math.min(window.innerHeight - fh - 12, from.top + from.height * 0.35 - fh / 2);
    const ex = to.left + to.width / 2 - fw / 2;
    const ey = to.top + to.height / 2 - fh / 2;
    const lift = Math.min(160, Math.abs(ey - sy) * 0.5 + 60);
    playSfx("whoosh", { volume: 0.4 });
    gsap
      .timeline({ onComplete: () => fly.remove() })
      .fromTo(fly, { x: sx, y: sy, rotate: -6, scale: 0.9, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0)
      .to(
        fly,
        {
          motionPath: { path: [{ x: sx, y: sy }, { x: (sx + ex) / 2, y: Math.min(sy, ey) - lift }, { x: ex, y: ey }], curviness: 1.2 },
          rotate: 4,
          scale: Math.max(0.6, to.width / fw),
          duration: 0.9,
          ease: "power2.inOut",
        },
        0,
      )
      .call(() => {
        // the brass pin drops onto the card, and hearts burst up
        const pin = document.createElement("span");
        pin.className = "ww-fly-pin";
        fly.appendChild(pin);
        gsap.fromTo(pin, { y: -46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.25, ease: "power2.in" });
        gsap.delayedCall(0.22, () => {
          playSfx("pin");
          playSfx("sweet", { volume: 0.5, delay: 0.12 });
          const box = fly.getBoundingClientRect();
          burstHearts(box.left + box.width / 2, box.top + 6, 10 + Math.floor(Math.random() * 5));
        });
      }, undefined, 0.9)
      // the real card takes its place underneath as the flyer fades, and shows where it was pinned
      .call(() => {
        card.style.visibility = "";
        showPinned(w);
      }, undefined, 1.45)
      .to(fly, { autoAlpha: 0, duration: 0.25 }, 1.45);
  };

  useEffect(() => {
    let active = true;
    fetchWishes(weddingId)
      .then((data) => {
        if (active && data) setWishes(data);
      })
      .catch(() => {});
    // new blessings from other guests appear live (when the backend is set up)
    const stop = subscribeWishes(weddingId, (w) => setWishes((prev) => (prev.some((p) => p.id === w.id) ? prev : [w, ...prev])));
    return () => {
      active = false;
      stop();
    };
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // no name to type: a personal invite link signs it with the guest's name
    const cleanName = (isPersonalized && guestName?.trim()) || "Well-wisher";
    const problem = validateWish(cleanName, guestMessage);
    if (problem) {
      setValidationError(problem);
      return;
    }
    heartsFromButton();
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const createdWish = await addWish(weddingId, cleanName, guestMessage);
      flushSync(() => {
        setNewlyAddedId(createdWish.id);
        setWishes((prev) => [createdWish, ...prev.filter((w) => w.id !== createdWish.id)]);
      });
      flyToWall(createdWish); // flies onto the wall, pinned with a "tik" and two soft tings
      setGuestMessage("");
    } catch (err) {
      console.error("Failed to add wish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onWall = wishes.slice(0, ON_WALL);
  const marquee = onWall.length >= (phone ? MARQUEE_FROM_PHONE : MARQUEE_FROM);
  const count = wishes.length;
  // the marquee runs at the same reading speed however many cards there are
  const duration = `${Math.max(30, onWall.length * 9)}s`;

  return (
    <section ref={sectionRef} id="wishingWall" aria-labelledby="wishing-wall-heading" className="wishing-wall-scene ww-velvet">
      {/* the same velvet as the RSVP above, with half as much falling jasmine */}
      {accepted && <JasmineFall density={0.4} fromTop slow />}

      <div ref={fitRef} className="ww-fit">
      <Container className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
        {/* heading */}
        {/* a bird kolam band above the heading */}
        <span aria-hidden className="ww-band">
          <KolamBand className="kb-solo" />
        </span>
        <header className="ww-head">
          <p className="ww-eyebrow">॥ आशीर्वाद ॥</p>
          <h2 id="wishing-wall-heading" className="wishing-title-text">
            Wishing Wall
          </h2>
          <GoldDivider className="mt-3" />
          <p className="wishing-subtitle-text mt-2">Leave a little love and a blessing for our new beginning.</p>
          {count > 0 && (
            <p className="ww-count" aria-live="polite">
              {count} {count === 1 ? "blessing" : "blessings"} so far
            </p>
          )}
        </header>

        {/* the lovebirds, fading softly into the wall */}
        <div className="wishing-lovebirds-container mt-2 md:mt-3">
          <img src="/media/wishing-lovebirds-clean.webp" alt="Two lovebirds sitting on a blossoming floral branch" className="wishing-lovebirds-art ww-lovebirds" draggable={false} />
        </div>

        {/* the latest blessings: an endless slow marquee on desktop, a swipe row on phones */}
        {onWall.length > 0 && (
          <div ref={wallRef} className={`ww-wall ${marquee ? "ww-wall--marquee" : "ww-wall--still"}`} role="region" aria-label="Blessings from guests">
            <div className="ww-track" style={{ ["--ww-dur" as string]: duration }}>
              {onWall.map((w, i) => (
                <BlessingCard key={w.id} wish={w} tilt={i % 2 ? 0.6 : -0.6} fresh={w.id === newlyAddedId} pinned={w.id === pinnedId} />
              ))}
              {/* the second copy makes the marquee seamless (desktop only; hidden from screen readers) */}
              {marquee &&
                onWall.map((w, i) => (
                  <div key={`dup-${w.id}`} className="ww-dup">
                    <BlessingCard wish={w} tilt={i % 2 ? 0.6 : -0.6} hidden />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* leave your blessing */}
        <form ref={formRef} onSubmit={handleSubmit} className="ww-composer" noValidate>
          <span className="ww-composer-crest" aria-hidden="true">
            <LotusCrest className="h-6 w-10" />
          </span>
          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`ww-corner ww-corner--${c}`} />
          ))}
          <h3 className="ww-composer-title">Leave your blessing</h3>
          <label className="ww-field">
            <span className="sr-only">Your blessing</span>
            <textarea
              value={guestMessage}
              onChange={(e) => {
                setGuestMessage(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Write your blessing…"
              maxLength={WISH_LIMITS.message}
              rows={3}
              className="ww-input ww-textarea"
              aria-invalid={validationError ? true : undefined}
              aria-describedby="ww-help"
            />
          </label>
          <div id="ww-help" className="ww-help">
            <span className="ww-error" role="alert">
              {validationError ?? ""}
            </span>
            <span className="ww-counter">
              {guestMessage.length} / {WISH_LIMITS.message}
            </span>
          </div>
          <button ref={sendBtnRef} type="submit" disabled={isSubmitting || !guestMessage.trim()} className="ww-send">
            {isSubmitting ? "Sending…" : "Send Blessing ✦"}
          </button>
        </form>

        {/* and one below the form */}
        <span aria-hidden className="ww-band ww-band--below">
          <KolamBand className="kb-solo" />
        </span>

        <div className="mt-5 md:mt-6">
          <button type="button" onClick={() => setIsModalOpen(true)} className="ww-view-all">
            View All Wishes <span aria-hidden="true">›</span>
          </button>
        </div>

      </Container>
      </div>
      {/* outside the scaled content, so the full-screen modal is not scaled with it */}
      <AllWishesModal wishes={wishes} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
