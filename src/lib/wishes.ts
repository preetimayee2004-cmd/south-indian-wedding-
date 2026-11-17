import { getSupabase } from "./supabase";

export interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export const WISH_LIMITS = { name: 60, message: 280, minMessage: 2 } as const;
const COLUMNS = "id,name,message,created_at";
const COOLDOWN_KEY = "wedding:lastWish";
const COOLDOWN_MS = 60_000;

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
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("wishes")
    .select(COLUMNS)
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Wish[];
}

/** Saves for real; resolves only once the database has stored the row. */
export async function addWish(weddingId: string, name: string, message: string): Promise<Wish> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("wishes")
    .insert({ wedding_id: weddingId, name: name.trim(), message: message.trim() })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  markSent();
  return data as Wish;
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
