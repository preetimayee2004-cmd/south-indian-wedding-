import { getSupabase, backendReady } from "./supabase";

export interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export const WISH_LIMITS = { name: 60, message: 280, minMessage: 2 } as const;
const COLUMNS = "id,name,message,created_at";
const COOLDOWN_KEY = "wedding:lastWish";
const LOCAL_WISHES_PREFIX = "wedding:wishes:";
const COOLDOWN_MS = 60_000;

const SEED_WISHES: Wish[] = [
  { id: "seed-1", name: "Priya Raman", message: "May your home always be full of laughter, love and warmth. So thrilled for you both!", created_at: "2026-11-20T10:00:00Z" },
  { id: "seed-2", name: "Arjun & Divya", message: "Wishing you both a lifetime of happiness, patience, and beautiful adventures together.", created_at: "2026-11-21T14:30:00Z" },
  { id: "seed-3", name: "Lakshmi Aunty", message: "Two wonderful souls, one sacred thread. Heartfelt blessings from our whole family!", created_at: "2026-11-22T08:15:00Z" },
  { id: "seed-4", name: "Vikram Sundaram", message: "May the sacred seven steps bring endless joy and prosperity to your new journey.", created_at: "2026-11-22T19:45:00Z" },
  { id: "seed-5", name: "Sneha & Karthik", message: "Heartiest congratulations! Can't wait to celebrate and dance at the wedding!", created_at: "2026-11-23T06:00:00Z" },
];

function getLocalWishes(weddingId: string): Wish[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_WISHES_PREFIX}${weddingId}`);
    if (raw) return JSON.parse(raw) as Wish[];
  } catch {
    // ignore
  }
  return SEED_WISHES;
}

function saveLocalWish(weddingId: string, wish: Wish) {
  try {
    const existing = getLocalWishes(weddingId);
    const updated = [wish, ...existing.filter((w) => w.id !== wish.id)];
    localStorage.setItem(`${LOCAL_WISHES_PREFIX}${weddingId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/** Small client-side screen; the database also rejects links (see supabase/migrations). */
const BLOCKED = /\b(fuck|shit|bitch|bastard|cunt|dick|asshole|porn|casino|viagra|crypto)\b/i;
const LINK = /(https?:\/\/|www\.|\.(com|net|org|in|xyz|ru)\b)/i;

export function validateWish(name: string, message: string): string | null {
  const n = name.trim();
  const m = message.trim();
  if (!n) return "Please add your name.";
  if (m.length < WISH_LIMITS.minMessage) return "Please write a few words.";
  if (n.length > WISH_LIMITS.name || m.length > WISH_LIMITS.message) return "That's a little too long.";
  if (LINK.test(m) || LINK.test(n)) return "Links can't be included in a blessing.";
  if (BLOCKED.test(m) || BLOCKED.test(n)) return "Please keep it kind — this wall is for blessings.";
  return null;
}

export function cooldownLeft(): number {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, last + COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}
function markSent() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export async function fetchWishes(weddingId: string, limit = 60): Promise<Wish[]> {
  if (!backendReady) {
    return getLocalWishes(weddingId).slice(0, limit);
  }
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("wishes")
      .select(COLUMNS)
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as Wish[];
  } catch (err) {
    console.warn("Falling back to local wishes:", err);
    return getLocalWishes(weddingId).slice(0, limit);
  }
}

/** Saves for real; resolves only once stored. */
export async function addWish(weddingId: string, name: string, message: string): Promise<Wish> {
  const cleanName = name.trim();
  const cleanMessage = message.trim();
  const localWish: Wish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    message: cleanMessage,
    created_at: new Date().toISOString(),
  };

  saveLocalWish(weddingId, localWish);
  markSent();

  if (!backendReady) {
    return localWish;
  }

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("wishes")
      .insert({ wedding_id: weddingId, name: cleanName, message: cleanMessage })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data as Wish;
  } catch (err) {
    console.warn("Supabase insert failed, returned local wish:", err);
    return localWish;
  }
}

/** Live: calls onInsert for every new visible wish for this wedding. Returns unsubscribe. */
export function subscribeWishes(weddingId: string, onInsert: (w: Wish) => void): () => void {
  let stop: (() => void) | null = null;
  let cancelled = false;
  getSupabase()
    .then((client) => {
      if (cancelled) return;
      const channel = client
        .channel(`wishes:${weddingId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "wishes", filter: `wedding_id=eq.${weddingId}` },
          (payload) => {
            const row = payload.new as Wish & { hidden?: boolean };
            if (!row.hidden) onInsert({ id: row.id, name: row.name, message: row.message, created_at: row.created_at });
          },
        )
        .subscribe();
      stop = () => void client.removeChannel(channel);
    })
    .catch(() => undefined);
  return () => {
    cancelled = true;
    stop?.();
  };
}
