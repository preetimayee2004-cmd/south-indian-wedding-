import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { backendReady } from "@/lib/supabase";
import { readSaved, type SavedRsvp } from "@/lib/rsvp";
import { formatDayMonth, waLink } from "@/lib/format";
import { RsvpForm } from "./RsvpForm";
import { RsvpConfirmation } from "./RsvpConfirmation";

/** RSVP can work: a backend to save to, or at least a WhatsApp contact. */
export function useRsvpUsable(): boolean {
  const { contacts } = useWedding();
  return backendReady || contacts.some((c) => c.whatsapp && c.phone);
}

/**
 * Everything the RSVP does, shared by the phone and laptop layouts:
 * form → confirmation (remembered), WhatsApp fallback without a backend,
 * and a closed notice after the deadline.
 */
export function RsvpPanel() {
  const { id: weddingId, rsvp, wedding, contacts, couple } = useWedding();
  const { guestName } = useGuest();
  const reduced = usePrefersReducedMotion();
  const [saved, setSaved] = useState<SavedRsvp | null>(() => readSaved(weddingId));
  const [editing, setEditing] = useState(false);

  const closed = rsvp.deadlineISO ? Date.now() > new Date(rsvp.deadlineISO).getTime() : false;
  const deadlineLabel = rsvp.deadlineISO ? formatDayMonth(rsvp.deadlineISO, wedding.timeZone) : undefined;
  const wa = contacts.find((c) => c.whatsapp && c.phone);

  const waText = (yes: boolean) =>
    yes
      ? `Namaste! This is ${guestName}. Joyfully accepting the invitation to ${couple.bride.name} & ${couple.groom.name}'s wedding. We will be __ guests.`
      : `Namaste! This is ${guestName}. Regretfully, I won't be able to attend ${couple.bride.name} & ${couple.groom.name}'s wedding. Sending all my blessings.`;

  if (closed && !saved) {
    return (
      <div className="text-center">
        <p className="script-heading text-[2rem] leading-tight">RSVPs have closed</p>
        <p className="mt-2 text-ink-soft">We'd still love to hear from you{wa ? ` — message ${wa.name}.` : "."}</p>
        {wa && (
          <a
            href={waLink(wa.phone!, `Namaste! This is ${guestName}, about the wedding RSVP.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-paper"
          >
            WhatsApp {wa.name}
          </a>
        )}
      </div>
    );
  }

  if (saved && !editing) return <RsvpConfirmation saved={saved} onChange={() => setEditing(true)} />;

  if (backendReady || (import.meta.env.DEV && new URLSearchParams(window.location.search).has("rsvpform"))) {
    return (
      <RsvpForm
        weddingId={weddingId}
        maxGuests={rsvp.maxAttendees}
        deadlineLabel={deadlineLabel}
        initial={saved}
        reduced={reduced}
        onSaved={(s) => {
          setSaved(s);
          setEditing(false);
        }}
      />
    );
  }

  if (wa) {
    // No backend: a real message to the family instead of a fake "saved".
    return (
      <div className="flex flex-col items-center text-center">
        <p className="script-heading text-[2.2rem] leading-tight">Dear {guestName},</p>
        <p className="mt-1 text-[1.1rem] italic text-ink">will you join us?</p>
        {deadlineLabel && <p className="mt-2 text-[0.66rem] uppercase tracking-[0.24em] text-ink-soft">Kindly respond by {deadlineLabel}</p>}
        <div className="mt-6 flex w-full max-w-[17rem] flex-col gap-3">
          <a
            href={waLink(wa.phone!, waText(true))}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-5 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)]"
          >
            Joyfully accept
          </a>
          <a
            href={waLink(wa.phone!, waText(false))}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/20 px-5 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-ink-soft"
          >
            Regretfully decline
          </a>
        </div>
        <p className="mt-3 text-[0.8rem] text-ink-soft">
          Opens WhatsApp to {wa.name}
          {wa.role ? `, ${wa.role.toLowerCase()}` : ""}.
        </p>
        {import.meta.env.DEV && (
          <p className="mt-3 rounded border border-dashed border-accent/50 px-2 py-1 text-[0.72rem] text-accent">
            Dev only: Supabase not connected — run 002_rsvps.sql and add keys to save RSVPs.
          </p>
        )}
      </div>
    );
  }

  return <p className="text-center text-accent">Dev only: connect Supabase or add a WhatsApp contact to enable RSVP.</p>;
}
