import { useEffect, useState } from "react";
import { gsap, refreshSoon } from "@/lib/gsap";

/**
 * Ready when the hero picture (the <img data-hero> the page itself shows) has
 * loaded and decoded — the only image the first screen needs. The sky colour
 * and the envelope are drawn in CSS, so they are ready at once. Waiting for
 * the page's own <img> (not a separate Image()) means the file is fetched once,
 * at the size the browser chose from its srcset. Gives up after `timeout` ms.
 */
export function useHeroReady(timeout = 6000): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    let poll = 0;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      refreshSoon(50); // the scenes measure the pictures
    };
    const wait = () => {
      const img = document.querySelector<HTMLImageElement>("img[data-hero]");
      if (!img) {
        poll = window.setTimeout(wait, 30); // the scenes mount on the same render (a timer, so a background tab works too)
        return;
      }
      if (img.complete && img.naturalWidth) return void img.decode().catch(() => undefined).then(finish);
      img.addEventListener("load", () => void img.decode().catch(() => undefined).then(finish), { once: true });
      img.addEventListener("error", finish, { once: true });
    };
    wait();
    const t = window.setTimeout(finish, timeout);
    return () => {
      done = true;
      window.clearTimeout(poll);
      window.clearTimeout(t);
    };
  }, [timeout]);
  return ready;
}

/** A simple full-screen loader on the sky: a turning gold ring and a word. */
export function Loader({ done }: { done: boolean }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const tw = gsap.to("#site-loader", { opacity: 0, duration: 0.4, ease: "power1.out", onComplete: () => setGone(true) });
    return () => void tw.kill();
  }, [done]);
  if (gone) return null;
  return (
    <div id="site-loader" role="status" aria-live="polite" className="cobalt fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4">
      <span aria-hidden className="block h-12 w-12 animate-spin rounded-full border-[3px] border-[#f3cf73]/25 border-t-[#f3cf73] motion-reduce:animate-none" />
      <p className="text-eyebrow uppercase text-[#fbf2dc]">Loading the invitation…</p>
    </div>
  );
}
