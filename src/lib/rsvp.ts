import { getSupabase } from "./supabase";

export interface RsvpInput {
  name: string;
  attending: boolean;
  guests: number;
  message?: string;
}

export interface SavedRsvp extends RsvpInput {
  at: string;
}

export const RSVP_LIMITS = { name: 80, message: 500 } as const;
const RESPONDENT_KEY = "wedding:respondent";
const savedKey = (weddingId: string) => `wedding:rsvp:${weddingId}`;

/** Stable anonymous id per browser, so the couple sees one (latest) answer per guest. */
function respondentId(): string {
  try {
    let id = localStorage.getItem(RESPONDENT_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(RESPONDENT_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function readSaved(weddingId: string): SavedRsvp | null {
  try {
    const raw = localStorage.getItem(savedKey(weddingId));
    return raw ? (JSON.parse(raw) as SavedRsvp) : null;
  } catch {
    return null;
  }
}

export function validateRsvp(r: RsvpInput, maxGuests: number): string | null {
  if (!r.name.trim()) return "Please tell us your name.";
  if (r.name.trim().length > RSVP_LIMITS.name) return "That name is a little long.";
  if (r.attending && (r.guests < 1 || r.guests > maxGuests)) return `Please choose between 1 and ${maxGuests} guests.`;
  if ((r.message ?? "").length > RSVP_LIMITS.message) return "Your note is a little long.";
  return null;
}

/** Saves for real. Resolves only after Supabase confirms the insert. */
export async function submitRsvp(weddingId: string, r: RsvpInput): Promise<SavedRsvp> {
  const supabase = await getSupabase();
  const row = {
    wedding_id: weddingId,
    respondent_id: respondentId(),
    name: r.name.trim(),
    attending: r.attending,
    guests: r.attending ? r.guests : 0,
    message: r.message?.trim() || null,
  };
  // No .select(): guests have no read access to RSVPs, by design.
  const { error } = await supabase.from("rsvps").insert(row);
  if (error) throw error;
  const saved: SavedRsvp = { name: row.name, attending: row.attending, guests: row.guests, message: row.message ?? undefined, at: new Date().toISOString() };
  try {
    localStorage.setItem(savedKey(weddingId), JSON.stringify(saved));
  } catch {
    /* ignore */
  }
  return saved;
}
