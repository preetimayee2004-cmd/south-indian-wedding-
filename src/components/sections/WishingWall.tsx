import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { backendReady } from "@/lib/supabase";
import { fetchWishes, subscribeWishes, type Wish } from "@/lib/wishes";
import { Container } from "@/components/layout/Container";
import { WishRows } from "./wishes/WishRows";
import { WishComposer } from "./wishes/WishComposer";

type Load = "loading" | "ready" | "error";

/** DEV ONLY (?wishdemo): sample leaves to review the design before Supabase is connected. Stripped from production. */
const DEMO: Wish[] = import.meta.env.DEV
  ? [
      "May your home always be full of laughter and filter coffee.",
      "Wishing you both a lifetime of love, patience and adventure.",
      "Two wonderful people, one beautiful journey. Congratulations!",
      "May the sacred thread bind you in joy for all seven lifetimes.",
      "So happy for you both — see you at the muhurtham!",
      "Blessings from all of us in Coimbatore. Stay this happy always.",
      "Here's to many more rainy evenings under one umbrella.",
    ].map((message, i) => ({ id: `demo-${i}`, name: ["Priya", "Arjun", "Lakshmi Aunty", "Vikram", "Deepa", "The Iyer family", "Sneha"][i], message, created_at: "" }))
  : [];
const demoMode = () => import.meta.env.DEV && !backendReady && new URLSearchParams(window.location.search).has("wishdemo");

/**
 * Section 06 — Wishing Wall.
 * Guests' blessings drift past on palm leaves in two opposing rows; a new
 * blessing drops into the wall the moment it's saved (and live for everyone
 * else via Supabase realtime). Not connected: dev shows setup steps,
 * production hides the section (no dead form).
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
    if (!backendReady) return;
    let live = true;
    fetchWishes(weddingId)
      .then((rows) => live && (setWishes(rows), setLoad("ready")))
      .catch(() => live && setLoad("error"));
    const off = subscribeWishes(weddingId, (w) => add(w, true));
    return () => {
      live = false;
      off();
    };
  }, [weddingId, add]);

  useLayoutEffect(() => {
    if (reduced || !head.current || !wall.current) return; // section may render nothing (no backend in production)
    const ctx = gsap.context(() => {
      gsap.from(head.current!.children, {
        autoAlpha: 0,
        y: 16,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: head.current, start: "top 85%", once: true },
      });
      // Rows sweep in from opposite sides.
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

  if (!backendReady && !import.meta.env.DEV) return null;

  return (
    <section id="wishingWall" aria-labelledby="wishes-heading" className="relative isolate overflow-x-clip py-section">
      <Container>
        <div ref={head} className="text-center">
          <p className="eyebrow">Blessings</p>
          <h2 id="wishes-heading" className="script-heading mt-2 text-script-lg">
            Wishing Wall
          </h2>
          <p className="mx-auto mt-3 max-w-[20rem] italic text-ink-soft md:max-w-[28rem]">
            Leave a few words for {couple.bride.name} &amp; {couple.groom.name}. Every blessing is kept.
          </p>
        </div>

        <div ref={wall} className="mt-10 min-h-[9rem]" aria-label="Blessings from guests" role="region">
          {demoMode() ? (
            <>
              <p className="mb-4 text-center text-[0.7rem] uppercase tracking-[0.24em] text-accent">Dev preview · sample blessings</p>
              <WishRows wishes={DEMO} freshIds={fresh} reduced={reduced} />
            </>
          ) : !backendReady ? (
            <div className="mx-auto max-w-[26rem] rounded-xl border border-dashed border-accent/50 bg-paper p-5 text-[0.9rem] text-ink-soft">
              <p className="font-medium text-accent">Dev only — Wishing Wall not connected</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Create a Supabase project.</li>
                <li>Run <code>supabase/migrations/001_wishes.sql</code> in its SQL Editor.</li>
                <li>Copy <code>.env.example</code> to <code>.env.local</code> and add the URL + anon key.</li>
              </ol>
              <p className="mt-2">In production this section stays hidden until connected.</p>
            </div>
          ) : load === "loading" ? (
            <div className="flex justify-center gap-4" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-24 w-[16.5rem] shrink-0 animate-pulse rounded-[2.25rem] bg-[#efe0bd]/60 max-md:[&:nth-child(n+2)]:hidden" />
              ))}
            </div>
          ) : load === "error" ? (
            <p className="text-center text-ink-soft">Blessings couldn't be loaded just now — yours will still be saved.</p>
          ) : wishes.length === 0 ? (
            <p className="text-center font-script text-[1.8rem] text-accent/80">Be the first to bless the couple</p>
          ) : (
            <WishRows wishes={wishes} freshIds={fresh} reduced={reduced} />
          )}
        </div>

        <div className="mt-12">
          <WishComposer weddingId={weddingId} onSent={(w) => add(w, true)} disabled={!backendReady} />
        </div>
      </Container>
    </section>
  );
}
