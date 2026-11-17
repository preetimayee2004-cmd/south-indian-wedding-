import { useEffect, useRef, useState } from "react";
import { directionsUrl, mapEmbedUrl } from "@/lib/format";

/**
 * Google map in an arch-topped window (warm-toned to sit with the palette).
 * The iframe only loads when the window nears the screen, to keep the first
 * load light. Below: Get directions + Copy address.
 */
export function MapWindow({ query, address, venueName }: { query: string; address: string; venueName: string }) {
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
      { rootMargin: "400px 0px" },
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
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:sepia(0.22)_saturate(0.85)]"
              allowFullScreen
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[0.7rem] uppercase tracking-[0.24em] text-ink-soft">Loading map…</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a
          href={directionsUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-accent px-6 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-paper shadow-[0_6px_18px_rgb(202_76_61/0.28)] transition-transform active:scale-95"
        >
          Get directions ↗
        </a>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-ink/20 px-6 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-accent hover:text-accent"
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
