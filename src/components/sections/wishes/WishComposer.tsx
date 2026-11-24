import { useEffect, useId, useState } from "react";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { addWish, cooldownLeft, validateWish, WISH_LIMITS, type Wish } from "@/lib/wishes";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "error"; text: string };

function friendlyError(e: unknown): string {
  const msg = (e as { message?: string; code?: string })?.message ?? "";
  if (msg === "not-configured") return "The wishing wall isn't connected yet.";
  if (/wishes_no_links/.test(msg)) return "Links can't be included in a blessing.";
  if (/check constraint/.test(msg)) return "Please check the length of your name and message.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "You seem to be offline. Please try again in a moment.";
  return "Something went wrong while sending. Please try again.";
}

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  dx: `${Math.round(Math.cos((i / 10) * Math.PI * 2) * (60 + (i % 3) * 18))}px`,
  dy: `${Math.round(Math.sin((i / 10) * Math.PI * 2) * (40 + (i % 2) * 20) - 30)}px`,
  rot: `${i * 47}deg`,
  color: i % 2 ? "#e2a72e" : "#ca4c3d",
}));

/**
 * Leave-a-blessing form. Submits to Supabase and only reports success after
 * the row is stored. Name is pre-filled for personalised links. Honeypot +
 * one-minute cooldown keep casual spam out; the database rejects links.
 */
export function WishComposer({ weddingId, onSent, disabled }: { weddingId: string; onSent: (w: Wish) => void; disabled?: boolean }) {
  const { guestName, isPersonalized } = useGuest();
  const { playSfx } = useAudio();
  const uid = useId();
  const [name, setName] = useState(isPersonalized ? guestName : "");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [wait, setWait] = useState(() => Math.ceil(cooldownLeft() / 1000));

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait(Math.ceil(cooldownLeft() / 1000)), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return setStatus({ kind: "sent", name }); // bots: pretend, store nothing
    const problem = validateWish(name, message);
    if (problem) return setStatus({ kind: "error", text: problem });
    if (cooldownLeft() > 0) return setWait(Math.ceil(cooldownLeft() / 1000));
    setStatus({ kind: "sending" });
    try {
      const saved = await addWish(weddingId, name, message);
      onSent(saved);
      playSfx("pin");
      setStatus({ kind: "sent", name: saved.name });
      setMessage("");
      setWait(Math.ceil(cooldownLeft() / 1000));
    } catch (err) {
      setStatus({ kind: "error", text: friendlyError(err) });
    }
  };

  const sending = status.kind === "sending";
  const blocked = disabled || sending || wait > 0;
  const field =
    "mt-1.5 w-full rounded-none border-0 border-b border-gold/60 bg-transparent px-0 py-2 text-[1.05rem] text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-0";

  return (
    <form onSubmit={submit} noValidate className="relative mx-auto max-w-[26rem] rounded-2xl border border-gold/40 bg-paper/80 px-6 pb-7 pt-6 shadow-[0_8px_30px_rgb(42_36_33/0.06)]">
      <p className="text-center text-[0.68rem] uppercase tracking-[0.28em] text-ink-soft">Leave a blessing</p>

      <label htmlFor={`${uid}-name`} className="mt-5 block text-[0.7rem] uppercase tracking-[0.22em] text-ink-soft">
        Your name
      </label>
      <input
        id={`${uid}-name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={WISH_LIMITS.name}
        autoComplete="name"
        className={field}
        placeholder="e.g. Priya Raman"
        disabled={disabled}
      />

      <label htmlFor={`${uid}-msg`} className="mt-5 block text-[0.7rem] uppercase tracking-[0.22em] text-ink-soft">
        Your blessing
      </label>
      <textarea
        id={`${uid}-msg`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={WISH_LIMITS.message}
        rows={3}
        className={`${field} resize-none leading-snug`}
        placeholder="Wishing you a lifetime of…"
        aria-describedby={`${uid}-count`}
        disabled={disabled}
      />
      <p id={`${uid}-count`} className="mt-1 text-right text-[0.7rem] tabular-nums text-ink-soft">
        {message.length} / {WISH_LIMITS.message}
      </p>

      {/* Honeypot: invisible to people, irresistible to bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        name="website"
      />

      <div className="relative mt-5 flex justify-center">
        <button
          type="submit"
          disabled={blocked}
          className="rounded-full bg-accent px-7 py-3 text-[0.75rem] uppercase tracking-[0.24em] text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)] transition-[transform,opacity] duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending…" : wait > 0 && !disabled ? `Send again in ${wait}s` : "Send blessing"}
        </button>
        {status.kind === "sent" && (
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
            {PETALS.map((p, i) => (
              <span
                key={i}
                className="absolute h-2.5 w-1.5 rounded-full motion-reduce:hidden"
                style={{
                  background: p.color,
                  animation: "petal 1.1s ease-out forwards",
                  ["--dx" as string]: p.dx,
                  ["--dy" as string]: p.dy,
                  ["--rot" as string]: p.rot,
                }}
              />
            ))}
          </span>
        )}
      </div>

      <p role="status" aria-live="polite" className={`mt-4 min-h-[1.4em] text-center text-[0.95rem] ${status.kind === "error" ? "text-accent" : "text-ink-soft"}`}>
        {status.kind === "sent" && `Thank you, ${status.name} — your blessing is on the wall.`}
        {status.kind === "error" && status.text}
      </p>
    </form>
  );
}
