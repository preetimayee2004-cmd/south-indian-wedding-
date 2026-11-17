import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once .env.local provides VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. */
export const backendReady = Boolean(url && key && !url.includes("YOUR-PROJECT"));

let client: Promise<SupabaseClient> | null = null;

/**
 * The Supabase client, loaded on first use so its ~50 KB isn't part of the
 * first page load (only the Wishing Wall and RSVP need it).
 */
export function getSupabase(): Promise<SupabaseClient> {
  if (!backendReady) return Promise.reject(new Error("not-configured"));
  client ??= import("@supabase/supabase-js").then(({ createClient }) => createClient(url!, key!, { auth: { persistSession: false } }));
  return client;
}
