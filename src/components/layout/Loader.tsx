import { useEffect, useState } from "react";
import { gsap, refreshSoon } from "@/lib/gsap";

/** Loads and decodes images; resolves when all are ready (or after `timeout` ms). */
export function usePreload(srcs: string[], timeout = 8000): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const each = srcs.map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img.decode().catch(() => undefined);
    });
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      refreshSoon(50); // the scenes measure the pictures
    };
    Promise.all(each).then(finish);
    const t = window.setTimeout(finish, timeout);
    return () => {
      done = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcs.join("|")]);
  return ready;
}

/** A simple full-screen loader on parchment: a turning gold ring and a word. */
export function Loader({ done }: { done: boolean }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const tw = gsap.to("#site-loader", { opacity: 0, duration: 0.5, ease: "power1.out", onComplete: () => setGone(true) });
    return () => void tw.kill();
  }, [done]);
  if (gone) return null;
  return (
    <div id="site-loader" role="status" aria-live="polite" className="parchment fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4">
      <span aria-hidden className="block h-12 w-12 animate-spin rounded-full border-[3px] border-gold/25 border-t-accent motion-reduce:animate-none" />
      <p className="text-eyebrow uppercase text-ink">Loading the invitation…</p>
    </div>
  );
}
