import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { scrollToTarget } from "@/lib/smooth";

/** Link to share: the page without personal params, so a forwarded link never carries this guest's name. */
function shareableUrl(dropParams: string[]): string {
  const u = new URL(window.location.href);
  [...dropParams, "nointro", "tokens", "wishdemo", "rsvpform"].forEach((p) => u.searchParams.delete(p));
  u.hash = "";
  return u.toString();
}

/**
 * Closing footer: monogram, date and city, Share (native share sheet on
 * phones, copy link elsewhere) and Back to top.
 */
export function Footer() {
  const { couple, wedding, meta, personalization } = useWedding();
  const [shared, setShared] = useState<"idle" | "copied" | "fail">("idle");

  const date = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(
    new Date(wedding.dateISO),
  );

  const share = async () => {
    const url = shareableUrl(personalization.queryParams);
    try {
      if (navigator.share) {
        await navigator.share({ title: meta.title, text: meta.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("copied");
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return; // user closed the share sheet
      setShared("fail");
    }
    window.setTimeout(() => setShared("idle"), 2400);
  };

  const pill =
    "rounded-full border border-[#fbf2dc]/40 px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#fbf2dc] transition-colors hover:border-[#f3cf73] hover:text-[#f3cf73]";

  return (
    <footer className="cobalt relative z-[95] border-t border-[#f3cf73]/50 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12 text-center">
      <p className="font-script text-[2.6rem] leading-none text-[#f3cf73]">
        {couple.bride.name[0]} <span className="text-[1.6rem] text-[#fbf2dc]">&amp;</span> {couple.groom.name[0]}
      </p>
      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.28em] text-[#fbf2dc]">
        {date} · {wedding.city.split(",")[0]}
      </p>

      <div className="mt-7 flex justify-center gap-3">
        <button type="button" onClick={share} className={pill}>
          {shared === "copied" ? "Link copied ✓" : shared === "fail" ? "Couldn’t share" : "Share invitation"}
        </button>
        <a href="#main" onClick={(e) => (e.preventDefault(), scrollToTarget(0))} className={pill}>
          Back to top ↑
        </a>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {shared === "copied" ? "Invitation link copied" : ""}
      </span>

      <p className="mt-8 text-[0.72rem] text-[#fbf2dc]">Made with love for our families and friends.</p>
    </footer>
  );
}
