/** Date/time helpers. Always format in the wedding's time zone, not the guest's. */

const fmt = (iso: string, timeZone: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(new Date(iso));

export const formatDay = (iso: string, tz: string) => fmt(iso, tz, { weekday: "long", day: "numeric", month: "long" });

const time = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export const formatTimeRange = (startISO: string, tz: string, endISO?: string) =>
  endISO ? `${time(startISO, tz)} – ${time(endISO, tz)}` : time(startISO, tz);

/** Opens Google Maps (app on phones) searching for the given place. */
export const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** WhatsApp chat link with a pre-filled message. phone: E.164 like +919876543210. */
export const waLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export const formatDayMonth = (iso: string, tz: string) => fmt(iso, tz, { day: "numeric", month: "long" });

/** Google Maps directions to a place (opens the app on phones). */
export const directionsUrl = (query: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

/** Keyless Google Maps embed for an iframe. */
export const mapEmbedUrl = (query: string) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

/** Google Calendar "add event" link for the wedding (ends 90 minutes later when no end is known). */
export function calendarUrl(title: string, startISO: string, location: string, endISO?: string) {
  const start = new Date(startISO);
  const end = endISO ? new Date(endISO) : new Date(start.getTime() + 90 * 60000);
  const stamp = (t: Date) => t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(location)}`
  );
}
