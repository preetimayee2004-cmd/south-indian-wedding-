import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { backendReady } from "@/lib/supabase";
import { fetchWishes, subscribeWishes, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { WishRows } from "./wishes/WishRows";
import { WishComposer } from "./wishes/WishComposer";
import { burstHearts } from "@/lib/hearts";

type Load = "loading" | "ready" | "error";

/**
 * Section 06 — Wishing Wall.
 * Guests' blessings drift past on palm leaves in two opposing rows; a new
 * blessing drops into the wall the moment it's saved (and live for everyone
 * else via Supabase realtime).
 */
export function WishingWall() {
  const { id: weddingId, couple } = useWedding();
  const reduced = usePrefersReducedMotion();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const head = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);

  const add = useCallback((w: Wish, mark: boolean) => {
    setWishes((prev) => (prev.some((p) => p.id === w.id) ? prev : [w, ...prev]));
    if (mark) setFresh((s) => new Set(s).add(w.id));
  }, []);

  useEffect(() => {
    let live = true;
    fetchWishes(weddingId)
      .then((rows) => live && (setWishes(rows), setLoad("ready")))
      .catch(() => live && setLoad("ready")); // gracefully shows local/seed wishes

    if (backendReady) {
      const off = subscribeWishes(weddingId, (w) => add(w, true));
      return () => {
        live = false;
        off();
      };
    }
    return () => {
      live = false;
    };
  }, [weddingId, add]);

  useLayoutEffect(() => {
    if (reduced || !head.current || !wall.current) return;
    const ctx = gsap.context(() => {
      gsap.from(head.current!.children, {
        autoAlpha: 0,
        y: 16,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: head.current, start: "top 85%", once: true },
      });
      gsap.from(".wish-row", {
        xPercent: (i: number) => (i % 2 ? 18 : -18),
        autoAlpha: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: wall.current, start: "top 85%", once: true },
      });
    }, wall.current?.parentElement ?? undefined);
    return () => ctx.revert();
  }, [reduced, load]);

  return (
    <section id="wishingWall" aria-labelledby="wishes-heading" className="relative isolate overflow-x-clip py-section">
      <Container>
        <div ref={head} className="text-center">
          <p className="text-[0.95rem] tracking-[0.2em] text-maroon">शुभकामनाएँ</p>
          <h2 id="wishes-heading" className="script-heading mt-2 text-script-lg">
            Wishing Wall
          </h2>
          <p className="mx-auto mt-3 max-w-[20rem] italic text-ink md:max-w-[28rem]">
            Leave your blessings for {couple.bride.name} &amp; {couple.groom.name}
          </p>
        </div>

        <div ref={wall} className="mt-10 min-h-[9rem]" aria-label="Blessings from guests" role="region">
          {load === "loading" ? (
            <div className="flex justify-center gap-4" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-24 w-[16.5rem] shrink-0 animate-pulse rounded-[2.25rem] bg-[#efe0bd]/60 max-md:[&:nth-child(n+2)]:hidden" />
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <p className="text-center font-script text-[1.8rem] text-accent/80">Be the first to bless the couple</p>
          ) : (
            <WishRows wishes={wishes} freshIds={fresh} reduced={reduced} />
          )}
        </div>

        <div className="mt-12">
          <WishComposer weddingId={weddingId} onSent={(w) => (add(w, true), burstHearts(document.activeElement, { puff: true }))} disabled={false} />
        </div>
      </Container>
    </section>
  );
}
