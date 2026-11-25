import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { fetchWishes, addWish, subscribeWishes, validateWish, WISH_LIMITS, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { AllWishesModal } from "./wishes/AllWishesModal";
import { PalmLeafString } from "./wishes/PalmLeafString";
import { LampField, DiyaArt } from "./wishes/LampField";
import { LeafViewer } from "./wishes/LeafViewer";
import { useAudio } from "@/context/AudioContext";
import { KolamBand, JasmineFall } from "./rsvp/KolamBorder";
import { RsvpSides } from "./rsvp/RsvpSides";
import { useAcceptedThisVisit } from "@/hooks/useAcceptedThisVisit";
import { useFitToScreen } from "@/hooks/useFitToScreen";
import "@/styles/wishing-wall.css";

/** How many of the latest wishes hang on the thread (all of them are in "View all wishes"). */
const ON_STRING = 12;

const SUGGESTIONS = ["Wishing you a lifetime of love and happiness", "May your home be filled with joy", "Blessings to you both from our family"];

/** "5 blessings and counting": counts up when the section comes on screen, and up by one for each new wish. */
function BlessingCount({ count, reduced }: { count: number; reduced: boolean }) {
  const el = useRef<HTMLSpanElement>(null);
  const val = useRef({ v: 0 });
  const seen = useRef(false);
  const latest = useRef(count);
  latest.current = count;
  const write = (v: number) => {
    const n = Math.round(v);
    if (el.current) el.current.textContent = `${n} ${n === 1 ? "blessing" : "blessings"} and counting`;
  };
  const run = (to: number) => {
    gsap.killTweensOf(val.current);
    if (reduced) {
      val.current.v = to;
      write(to);
      return;
    }
    gsap.to(val.current, { v: to, duration: Math.min(1.6, 0.4 + Math.abs(to - val.current.v) * 0.08), ease: "power1.out", onUpdate: () => write(val.current.v) });
  };
  useEffect(() => {
    write(val.current.v);
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || seen.current) return;
      seen.current = true;
      run(latest.current);
      io.disconnect();
    });
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (seen.current) run(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  return (
    <>
      <span ref={el} aria-hidden />
      <span className="sr-only">
        {count} {count === 1 ? "blessing" : "blessings"} and counting
      </span>
    </>
  );
}

/**
 * The Wishing Wall: the latest wishes as palm-leaf manuscript strips strung on a maroon thread,
 * a short form, and below it two loose rows of small lamps, one for each wish. Sending a
 * blessing lights the lamp on the button; it rises and arcs down into the rows of lamps, a new
 * leaf slides onto the front of the thread, jasmine falls and the count goes up by one.
 */
export function WishingWall() {
  const { id: weddingId } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [landingId, setLandingId] = useState<string | null>(null);
  const [rippleId, setRippleId] = useState<string | null>(null);
  const [open, setOpen] = useState<{ wish: Wish; from: HTMLElement } | null>(null);
  const [btnLit, setBtnLit] = useState(false);
  const [sent, setSent] = useState(false);
  const [shower, setShower] = useState(false);
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 699px)");
  const accepted = useAcceptedThisVisit(); // flowers fall here only once the RSVP is accepted in this visit
  const sectionRef = useRef<HTMLElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const btnLamp = useRef<HTMLSpanElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  // one screen tall, like the gallery: the content above the lamps scales down to fit when it is taller
  useFitToScreen(sectionRef, fitRef);

  const knownName = isPersonalized && guestName?.trim() ? guestName.trim() : null;

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

  useEffect(() => {
    if (sent) doneRef.current?.focus({ preventScroll: true });
  }, [sent]);

  const openWish = (wish: Wish, from: HTMLElement) => {
    playSfx("leaf", { volume: 0.4, gesture: true, owner: sectionRef.current });
    setOpen({ wish, from });
  };

  /** A lit lamp rises from the button, floats down in an arc and lands among the other lamps. */
  const launchLamp = (w: Wish, from: DOMRect | undefined) => {
    const land = () => {
      setLandingId(null);
      setRippleId(w.id);
      window.setTimeout(() => setRippleId((r) => (r === w.id ? null : r)), 1800);
    };
    const target = document.querySelector<HTMLElement>(`[data-lamp="${CSS.escape(w.id)}"] .lp-lamp-art`);
    if (reduced || !target || !from) return land();
    const to = target.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "lp-fly";
    fly.setAttribute("aria-hidden", "true");
    fly.innerHTML = target.outerHTML;
    fly.style.width = `${to.width}px`;
    fly.style.height = `${to.height}px`;
    document.body.appendChild(fly);
    const sx = from.left + from.width / 2 - to.width / 2;
    const sy = from.top + from.height / 2 - to.height / 2;
    const ex = to.left;
    const ey = to.top;
    const peak = Math.min(sy, ey) - Math.min(160, Math.abs(ey - sy) * 0.6 + 70);
    playSfx("whoosh", { volume: 0.35, delay: 0.15 });
    gsap
      .timeline({
        onComplete: () => {
          fly.remove();
          land();
          playSfx("sweet", { volume: 0.45 });
        },
      })
      .fromTo(fly, { x: sx, y: sy, scale: 0.7, opacity: 0 }, { scale: 1.15, opacity: 1, duration: 0.3 }, 0)
      .to(fly, { motionPath: { path: [{ x: sx, y: sy }, { x: sx + (ex - sx) * 0.35, y: peak }, { x: ex, y: ey }], curviness: 1.3 }, scale: 1, duration: 1.5, ease: "power1.inOut" }, 0.1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // no name to type: a personal invite link signs it with the guest's name
    const cleanName = knownName || "Well-wisher";
    const problem = validateWish(cleanName, guestMessage);
    if (problem) {
      setValidationError(problem);
      return;
    }
    setIsSubmitting(true);
    setValidationError(null);
    setBtnLit(true); // the lamp on the button lights
    playSfx("flame", { volume: 0.5, gesture: true, owner: sectionRef.current });
    try {
      const created = await addWish(weddingId, cleanName, guestMessage);
      const from = btnLamp.current?.getBoundingClientRect();
      flushSync(() => {
        setLandingId(created.id);
        setNewId(created.id);
        setWishes((prev) => [created, ...prev.filter((w) => w.id !== created.id)]);
        setSent(true);
        setGuestMessage("");
      });
      launchLamp(created, from);
      setShower(true);
      window.setTimeout(() => setShower(false), 7500);
    } catch (err) {
      console.error("Failed to add wish:", err);
      setBtnLit(false);
      setValidationError("Could not send your blessing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const writeAnother = () => {
    setSent(false);
    setBtnLit(false);
    window.setTimeout(() => textRef.current?.focus({ preventScroll: true }), 0);
  };

  const onString = wishes.slice(0, ON_STRING);

  return (
    <section ref={sectionRef} id="wishingWall" aria-labelledby="wishing-wall-heading" className="wishing-wall-scene ww-velvet ww2">
      {/* flowers only once the RSVP is accepted; a short shower when a blessing is sent */}
      {accepted && <JasmineFall density={0.4} fromTop slow />}
      {shower && <JasmineFall density={0} burst shower={phone ? 22 : 40} />}
      <RsvpSides lit={accepted} variant="wall" />

      <div ref={fitRef} className="ww-fit">
        <Container className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
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
            <p className="ww2-count" aria-live="polite">
              <DiyaArt className="ww2-count-lamp" />
              <BlessingCount count={wishes.length} reduced={reduced} />
              <span aria-hidden className="ww2-sep">
                ·
              </span>
              <button type="button" onClick={() => setIsModalOpen(true)} className="ww2-viewall">
                View all wishes <span aria-hidden="true">›</span>
              </button>
            </p>
          </header>

          {onString.length > 0 && (
            <div className="ww2-string">
              <PalmLeafString wishes={onString} newId={newId} hiddenId={open?.wish.id ?? null} reduced={reduced} onOpen={openWish} />
            </div>
          )}

          {sent ? (
            <div ref={doneRef} className="ww2-done" role="status" tabIndex={-1}>
              <p className="ww2-done-text">Your blessing has been added</p>
              <button type="button" className="ww2-link" onClick={writeAnother}>
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ww2-form" noValidate>
              <h3 className="ww2-form-title">Leave your blessing</h3>
              {knownName && (
                <p className="ww2-from">
                  From <span>{knownName}</span>
                </p>
              )}
              <div className="ww2-chips" role="group" aria-label="Suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="ww2-chip"
                    onClick={() => {
                      setGuestMessage(s);
                      setValidationError(null);
                      textRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="ww2-field">
                <span className="sr-only">Your blessing</span>
                <textarea
                  ref={textRef}
                  value={guestMessage}
                  onChange={(e) => {
                    setGuestMessage(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Write your blessing..."
                  maxLength={WISH_LIMITS.message}
                  rows={2}
                  className="ww2-leafbox"
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
              <button type="submit" disabled={isSubmitting || !guestMessage.trim()} className="ww2-send">
                <span ref={btnLamp} className="ww2-send-lamp">
                  <DiyaArt lit={btnLit} />
                </span>
                {isSubmitting ? "Sending…" : "Send blessing"}
              </button>
            </form>
          )}
        </Container>
      </div>

      <LampField wishes={wishes} landingId={landingId} rippleId={rippleId} reduced={reduced} onOpen={openWish} />

      {open && <LeafViewer key={open.wish.id} wish={open.wish} from={open.from} reduced={reduced} onClose={() => setOpen(null)} />}
      <AllWishesModal wishes={wishes} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
