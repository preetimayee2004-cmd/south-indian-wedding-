import { useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { RSVP_LIMITS, submitRsvp, validateRsvp, type SavedRsvp } from "@/lib/rsvp";

type Step = "choose" | "details";

function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? "";
  if (msg === "not-configured") return "RSVP isn't connected yet — nothing was saved.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "You seem to be offline. Please try again in a moment.";
  if (/check constraint/.test(msg)) return "Please check your details and try again.";
  return "Something went wrong while sending. Please try again.";
}

interface Props {
  weddingId: string;
  maxGuests: number;
  deadlineLabel?: string;
  initial?: SavedRsvp | null;
  reduced: boolean;
  onSaved: (s: SavedRsvp) => void;
}

/**
 * Two short steps so it fits inside the arch on a phone:
 *  1. Joyfully accept / Regretfully decline
 *  2. Name (pre-filled from the link), guest count, optional note → Send
 */
export function RsvpForm({ weddingId, maxGuests, deadlineLabel, initial, reduced, onSaved }: Props) {
  const { guestName, isPersonalized, setGuestName } = useGuest();
  const { playSfx } = useAudio();
  const uid = useId();
  const [step, setStep] = useState<Step>("choose");
  const [attending, setAttending] = useState<boolean>(initial?.attending ?? true);
  const [guests, setGuests] = useState(Math.min(Math.max(initial?.guests || 1, 1), maxGuests));
  const [name, setName] = useState(initial?.name ?? (isPersonalized ? guestName : ""));
  const [editName, setEditName] = useState(!name);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const pane = useRef<HTMLDivElement>(null);

  // Each step slides in from the side it was chosen from.
  useLayoutEffect(() => {
    if (reduced || !pane.current) return;
    const t = gsap.fromTo(pane.current, { autoAlpha: 0, x: step === "details" ? 28 : -28 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power2.out" });
    return () => void t.kill();
  }, [step, reduced]);

  const choose = (yes: boolean) => {
    setAttending(yes);
    setError("");
    setStep("details");
    playSfx("tap");
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { name, attending, guests, message };
    const problem = validateRsvp(input, maxGuests);
    if (problem) return setError(problem);
    setSending(true);
    setError("");
    try {
      const saved = await submitRsvp(weddingId, input);
      setGuestName(saved.name);
      playSfx("bell");
      onSaved(saved);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSending(false);
    }
  };

  const pill = "rounded-full px-5 py-3 text-[0.74rem] uppercase tracking-[0.2em] transition-[transform,background-color,color] duration-300 active:scale-95";
  const line =
    "mt-1 w-full border-0 border-b border-gold/60 bg-transparent px-0 py-1.5 text-[1.02rem] text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-0";

  return (
    <div ref={pane} className="w-full">
      {step === "choose" ? (
        <div className="flex flex-col items-center text-center">
          <p className="script-heading text-[2.2rem] leading-tight">Dear {guestName},</p>
          <p className="mt-1 text-[1.1rem] italic text-ink">will you join us?</p>
          {deadlineLabel && (
            <p className="mt-2 text-[0.66rem] uppercase tracking-[0.24em] text-ink-soft">Kindly respond by {deadlineLabel}</p>
          )}
          <div className="mt-6 flex w-full max-w-[17rem] flex-col gap-3">
            <button type="button" onClick={() => choose(true)} className={`${pill} bg-accent text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)]`}>
              Joyfully accept
            </button>
            <button type="button" onClick={() => choose(false)} className={`${pill} border border-ink/20 text-ink-soft hover:border-accent hover:text-accent`}>
              Regretfully decline
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={send} noValidate className="mx-auto flex max-w-[18rem] flex-col">
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="self-start text-[0.68rem] uppercase tracking-[0.22em] text-ink-soft hover:text-accent"
          >
            ‹ {attending ? "Accepting" : "Declining"} · change
          </button>

          {editName ? (
            <>
              <label htmlFor={`${uid}-n`} className="mt-4 text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft">
                Your name
              </label>
              <input
                id={`${uid}-n`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={RSVP_LIMITS.name}
                autoComplete="name"
                className={line}
                placeholder="e.g. Priya Raman"
              />
            </>
          ) : (
            <p className="mt-4 text-[0.95rem] text-ink-soft">
              Responding as <span className="text-ink">{name}</span>{" "}
              <button type="button" onClick={() => setEditName(true)} className="underline decoration-gold/60 underline-offset-4 hover:text-accent">
                edit
              </button>
            </p>
          )}

          {attending && (
            <fieldset className="mt-5">
              <legend className="text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft">Guests, including you</legend>
              <div className="mt-2 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  aria-label="One fewer guest"
                  className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-xl text-ink disabled:opacity-30"
                >
                  −
                </button>
                <output aria-live="polite" className="w-10 text-center text-[2.2rem] leading-none text-accent tabular-nums">
                  {guests}
                </output>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                  disabled={guests >= maxGuests}
                  aria-label="One more guest"
                  className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-xl text-ink disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </fieldset>
          )}

          <label htmlFor={`${uid}-m`} className="mt-5 text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft">
            A note for the couple <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id={`${uid}-m`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={RSVP_LIMITS.message}
            rows={2}
            className={`${line} resize-none leading-snug`}
            placeholder={attending ? "Dietary needs, arrival time…" : "Your wishes…"}
          />

          <button type="submit" disabled={sending} className={`${pill} mt-6 self-center bg-accent text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)] disabled:opacity-60`}>
            {sending ? "Sending…" : "Send RSVP"}
          </button>
          <p role="alert" className="mt-2 min-h-[1.3em] text-center text-[0.9rem] text-accent">
            {error}
          </p>
        </form>
      )}
    </div>
  );
}
