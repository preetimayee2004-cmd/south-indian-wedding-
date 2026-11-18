import { useEffect, useRef, useState } from "react";
import { directionsUrl, mapEmbedUrl } from "@/lib/format";

/**
 * Google map in an arch-topped window (warm-toned to sit with the palette).
 * The iframe starts loading a screen before the section arrives (never at
 * page load), so it is already showing when the section comes into view. Below: Get directions + Copy address.
 */
export function MapWindow({ query, address, venueName, compact }: { query: string; address: string; venueName: string; compact?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" }, // a screen ahead, so the map is there as soon as the section is in view
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${venueName}, ${address}`);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  return (
    <div className="map-window">
      <div className="rounded-t-[999px] border border-gold/60 p-[5px]">
        <div ref={box} className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] border border-gold/30 bg-[#efe4cf] md:aspect-[5/6]">
          {load ? (
            <iframe
              title={`Map showing ${venueName}`}
              src={mapEmbedUrl(query)}
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:sepia(0.22)_saturate(0.85)]"
              allowFullScreen
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[0.7rem] uppercase tracking-[0.24em] text-ink-soft">Loading map…</span>
          )}
        </div>
      </div>

      <div className={compact ? "mt-3 flex flex-col items-stretch gap-2" : "mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"}>
        <a
          href={directionsUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full bg-accent text-center uppercase text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)] transition-transform active:scale-95 ${compact ? "px-3 py-2.5 text-[0.6rem] tracking-[0.14em]" : "px-6 py-3 text-[0.72rem] tracking-[0.2em]"}`}
        >
          Open in Google Maps
        </a>
        <button
          type="button"
          onClick={copy}
          className={`rounded-full border border-ink/30 uppercase text-ink transition-colors hover:border-accent hover:text-accent ${compact ? "px-3 py-2.5 text-[0.6rem] tracking-[0.14em]" : "px-6 py-3 text-[0.72rem] tracking-[0.2em]"}`}
        >
          {copied === "ok" ? "Copied ✓" : copied === "fail" ? "Couldn’t copy" : "Copy address"}
        </button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied === "ok" ? "Address copied" : ""}
      </span>
    </div>
  );
}
