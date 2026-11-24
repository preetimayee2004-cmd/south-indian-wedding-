import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useWedding } from "@/context/WeddingContext";
import { fetchWishes, addWish, subscribeWishes, validateWish, WISH_LIMITS, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { AllWishesModal } from "./wishes/AllWishesModal";
import { useAudio } from "@/context/AudioContext";

/** How many of the latest wishes ride on the wall (the rest are in "View All Wishes"). */
const ON_WALL = 12;
/** Below this many, the cards simply stand in a centred row (no marquee). */
const MARQUEE_FROM = 4;

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
function BlessingCard({ wish, tilt, fresh, hidden }: { wish: Wish; tilt: number; fresh?: boolean; hidden?: boolean }) {
  const cls = `ww-card ${fresh ? "ww-card--new" : ""}`;
  const initial = wish.name.trim().charAt(0).toUpperCase() || "✦";
  return (
    <figure className={cls} data-wish={hidden ? undefined : wish.id} style={{ ["--tilt" as string]: `${tilt}deg` }} aria-hidden={hidden || undefined}>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`ww-corner ww-corner--${c}`} />
      ))}
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
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const wallRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /** The new wish flies from the composer onto the wall, a brass pin drops on it and hearts burst. */
  const flyToWall = (w: Wish) => {
    const card = document.querySelector<HTMLElement>(`[data-wish="${CSS.escape(w.id)}"]`);
    const from = formRef.current?.getBoundingClientRect();
    if (reduced || !card || !from) {
      playSfx("pin");
      playSfx("sweet", { volume: 0.5, delay: 0.15 });
      return;
    }
    wallRef.current?.classList.add("is-landing");
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
    const sy = from.top + from.height * 0.35 - fh / 2;
    const ex = to.left + to.width / 2 - fw / 2;
    const ey = to.top + to.height / 2 - fh / 2;
    const lift = Math.min(160, Math.abs(ey - sy) * 0.5 + 60);
    playSfx("whoosh", { volume: 0.4 });
    const done = () => {
      fly.remove();
      card.style.visibility = "";
      wallRef.current?.classList.remove("is-landing");
    };
    gsap
      .timeline({ onComplete: done })
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
          const n = 10 + Math.floor(Math.random() * 5);
          for (let i = 0; i < n; i++) {
            const h = document.createElement("span");
            h.className = `ww-heart ${i % 2 ? "ww-heart--rose" : "ww-heart--gold"}`;
            h.textContent = "♥";
            document.body.appendChild(h);
            const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
            const d = 50 + Math.random() * 70;
            gsap.fromTo(
              h,
              { x: box.left + box.width / 2, y: box.top + 6, scale: 0.5, autoAlpha: 1 },
              { x: `+=${Math.cos(a) * d}`, y: `+=${Math.sin(a) * d - 30}`, scale: 0.8 + Math.random() * 0.6, autoAlpha: 0, duration: 1.2, ease: "power2.out", onComplete: () => h.remove() },
            );
          }
        });
      }, undefined, 0.9)
      // the real card takes its place underneath as the flyer fades
      .call(() => void (card.style.visibility = ""), undefined, 1.45)
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
    const cleanName = guestName.trim() || "Well-wisher";
    const problem = validateWish(cleanName, guestMessage);
    if (problem) {
      setValidationError(problem);
      return;
    }
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
      setGuestName("");
    } catch (err) {
      console.error("Failed to add wish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onWall = wishes.slice(0, ON_WALL);
  const marquee = onWall.length >= MARQUEE_FROM;
  const count = wishes.length;
  // the marquee runs at the same reading speed however many cards there are
  const duration = `${Math.max(30, onWall.length * 9)}s`;

  return (
    <section id="wishingWall" aria-labelledby="wishing-wall-heading" className="wishing-wall-scene">
      {/* a few slow falling petals: jasmine and marigold */}
      <div className="ww-petals" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`ww-petal ${i % 2 ? "ww-petal--marigold" : "ww-petal--jasmine"} ww-petal--${i}`} />
        ))}
      </div>

      <Container className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
        {/* heading */}
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
                <BlessingCard key={w.id} wish={w} tilt={i % 2 ? 0.6 : -0.6} fresh={w.id === newlyAddedId} />
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
            <span className="sr-only">Your name</span>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" maxLength={WISH_LIMITS.name} className="ww-input" autoComplete="name" />
          </label>
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

        <div className="mt-5 md:mt-6">
          <button type="button" onClick={() => setIsModalOpen(true)} className="ww-view-all">
            View All Wishes <span aria-hidden="true">›</span>
          </button>
        </div>

        <AllWishesModal wishes={wishes} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Container>
    </section>
  );
}
