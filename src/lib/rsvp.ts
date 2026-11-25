import { backendReady, getSupabase } from "./supabase";

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

/** No backend set up yet: keep the answer on this device so the guest still gets their pass. */
export function saveLocalRsvp(weddingId: string, r: RsvpInput): SavedRsvp {
  const saved: SavedRsvp = { name: r.name.trim(), attending: r.attending, guests: r.attending ? r.guests : 0, message: r.message?.trim() || undefined, at: new Date().toISOString() };
  try {
    localStorage.setItem(savedKey(weddingId), JSON.stringify(saved));
  } catch {
    /* ignore */
  }
  return saved;
}

/** A stable id from a guest code (the ?guest= link), shaped like a uuid, so the same guest always counts once. */
function idFromCode(weddingId: string, code: string): string {
  const text = `${weddingId}:${code.trim().toLowerCase()}`;
  let h = "";
  for (let seed = 0; seed < 4; seed++) {
    let x = 0x811c9dc5 ^ seed;
    for (let i = 0; i < text.length; i++) x = Math.imul(x ^ text.charCodeAt(i), 0x01000193) >>> 0;
    h += x.toString(16).padStart(8, "0");
  }
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/**
 * Saves for real. Resolves only after Supabase confirms the insert. With a guest code the answer
 * is filed under that guest (repeat taps, other devices: still one answer); otherwise under this browser.
 */
export async function submitRsvp(weddingId: string, r: RsvpInput, guestCode?: string): Promise<SavedRsvp> {
  const supabase = await getSupabase();
  const row = {
    wedding_id: weddingId,
    respondent_id: guestCode ? idFromCode(weddingId, guestCode) : respondentId(),
    name: r.name.trim(),
    attending: r.attending,
    guests: r.attending ? r.guests : 0,
    message: r.message?.trim() || null,
  };
  // No .select(): guests have no read access to RSVPs, by design.
  const { error } = await supabase.from("rsvps").insert(row);
  if (error) throw error;
  // (nothing is kept on this device: the backend keeps one answer per guest)
  return { name: row.name, attending: row.attending, guests: row.guests, message: row.message ?? undefined, at: new Date().toISOString() };
}

/** Forget this device's saved answer (Undo). */
export function forgetRsvp(weddingId: string) {
  try {
    localStorage.removeItem(savedKey(weddingId));
  } catch {
    /* ignore */
  }
}

/** How many have accepted, and their first names (latest first), for the wall of lamps. */
export interface LampWall {
  count: number;
  names: string[];
}

/**
 * Guests can't read the RSVP table, so the count comes from a small database function that
 * returns only the number and first names (see supabase/migrations/003_rsvp_lamp_wall.sql).
 * Resolves null when that isn't available — the wall of lamps is then simply not shown.
 */
export async function fetchLampWall(weddingId: string): Promise<LampWall | null> {
  if (!backendReady) return null;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("rsvp_lamp_wall", { p_wedding_id: weddingId });
    if (error || !data) return null;
    const row = (Array.isArray(data) ? data[0] : data) as { count?: number; names?: string[] } | undefined;
    if (!row || typeof row.count !== "number") return null;
    return { count: row.count, names: (row.names ?? []).map((n) => n.split(/\s+/)[0]).filter(Boolean) };
  } catch {
    return null;
  }
}
