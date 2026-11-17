import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { ArchPortrait } from "./couple/ArchPortrait";
import { EdgeFade } from "@/components/ui/EdgeFade";
import { StoryThread } from "./couple/StoryThread";

const IMG_RATIO = "768 / 1376";

/**
 * Section 02 — The Couple.
 * Part 1: the mandapam arch. Bride and groom appear inside its glowing opening;
 *   their portraits rise like a curtain lifting and the names come into focus.
 *   Content is positioned in % of the artwork (config media.coupleArch), and
 *   sized in container-query units, so it stays inside the arch on every screen.
 * Part 2: Our Story as a growing sacred thread (see StoryThread).
 */
export function Couple() {
  const { couple, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const arch = media.coupleArch;
  const people = couple.order === "bride-first" ? [couple.bride, couple.groom] : [couple.groom, couple.bride];
  const story = couple.story ?? [];

  const stageWrap = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLImageElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = storyRef.current;
    if (reduced) {
      root?.querySelectorAll(".story-knot-core").forEach((k) => k.classList.add("!bg-accent"));
      return;
    }
    const ctx = gsap.context(() => {
      // Approach: the arch widens around you as the section scrolls in.
      gsap.fromTo(
        art.current,
        { scale: 1.14 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: stageWrap.current, start: "top bottom", end: "top top", scrub: true } },
      );

      // Inside the arch: glow → heading focuses → portraits rise → names.
      const q = gsap.utils.selector(content);
      gsap.set(q(".portrait-reveal"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".portrait-img"), { scale: 1.25 });
      gsap.set(q(".focus-in"), { autoAlpha: 0, filter: "blur(6px)" });
      gsap.set(q(".name-in"), { autoAlpha: 0, y: 10 });
      gsap.set(glow.current, { autoAlpha: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: stageWrap.current, start: "top 45%", once: true } })
        .to(glow.current, { autoAlpha: 1, duration: 1.2, ease: "sine.out" }, 0)
        .to(q(".focus-in"), { autoAlpha: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out", stagger: 0.12 }, 0.1)
        .to(q(".portrait-reveal"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut", stagger: 0.2 }, 0.35)
        .to(q(".portrait-img"), { scale: 1, duration: 1.6, ease: "power2.out", stagger: 0.2 }, 0.35)
        .to(q(".name-in"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1 }, 1.1);

      // Our Story: thread grows with scroll; knots light as it reaches them.
      if (root && story.length) {
        gsap.fromTo(
          root.querySelector(".story-line"),
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.querySelector(".story"), start: "top 72%", end: "bottom 72%", scrub: 0.4 } },
        );
        root.querySelectorAll<HTMLElement>(".story-item").forEach((item) => {
          const core = item.querySelector(".story-knot-core");
          gsap.set(item, { autoAlpha: 0.25 });
          ScrollTrigger.create({
            trigger: item,
            start: "top 72%",
            onEnter: () => {
              core?.classList.add("!bg-accent");
              gsap.to(item, { autoAlpha: 1, duration: 0.6, ease: "power1.out" });
            },
            onLeaveBack: () => {
              core?.classList.remove("!bg-accent");
              gsap.to(item, { autoAlpha: 0.25, duration: 0.4 });
            },
          });
        });
        gsap.fromTo(
          root.querySelector(".story-intro"),
          { autoAlpha: 0, letterSpacing: "0.04em" },
          { autoAlpha: 1, letterSpacing: "0em", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: root, start: "top 80%", once: true } },
        );
      }
    });
    return () => ctx.revert();
  }, [reduced, story.length]);

  return (
    <section id="couple" aria-labelledby="couple-heading" className="relative isolate">
      {/* ── Part 1: inside the mandapam arch ── */}
      <div ref={stageWrap} className="relative overflow-hidden bg-[#efe3cf]" style={{ height: "max(100svh, 640px)" }}>
        <EdgeFade top bottom />
        <img src={media.couple} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl md:block" />
        <div
          className="absolute left-1/2 top-0 h-full -translate-x-1/2"
          style={{ aspectRatio: IMG_RATIO, containerType: "size" }}
        >
          <img
            ref={art}
            src={media.couple}
            alt="A carved mandapam archway hung with bells, jasmine and marigold garlands"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div
            ref={glow}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: `${arch.top - 6}%`,
              left: `${arch.left - 4}%`,
              width: `${arch.width + 8}%`,
              height: `${arch.height + 8}%`,
              background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgb(255 246 220 / 0.85), transparent 70%)",
            }}
          />

          <div
            ref={content}
            className="absolute flex flex-col items-center text-center"
            style={{ top: `${arch.top}%`, left: `${arch.left}%`, width: `${arch.width}%`, height: `${arch.height}%` }}
          >
            <p className="focus-in uppercase text-ink-soft" style={{ fontSize: "1.2cqh", letterSpacing: "0.3em" }}>
              ॥ Vadhu · Varan ॥
            </p>
            <h2 id="couple-heading" className="focus-in script-heading leading-none" style={{ fontSize: "4.4cqh", marginTop: "1cqh" }}>
              The Couple
            </h2>

            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start" style={{ marginTop: "2.4cqh", columnGap: "1cqh" }}>
              {people.map((p, i) => (
                <div key={p.name} className="contents">
                  {i === 1 && (
                    <span className="name-in script-heading self-center leading-none" style={{ fontSize: "3.4cqh", marginTop: "-3cqh" }} aria-hidden>
                      &amp;
                    </span>
                  )}
                  <figure className="flex min-w-0 flex-col items-center">
                    <ArchPortrait person={p} className="w-full" />
                    <figcaption className="name-in [text-shadow:0_0_6px_rgb(255_250_240),0_0_2px_rgb(255_250_240)]">
                      <span className="block font-script leading-none text-accent" style={{ fontSize: "3.3cqh", marginTop: "1.2cqh" }}>
                        {p.name}
                      </span>
                      {p.parents && (
                        <span className="mt-[0.6cqh] block leading-snug text-ink-soft" style={{ fontSize: "1.32cqh" }}>
                          {p.parents}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Part 2: Our Story ── */}
      {(couple.intro || story.length > 0) && (
        <div ref={storyRef} className="py-section">
          <Container>
            <div className="text-center">
              <p className="eyebrow">Our story</p>
              <h3 className="script-heading mt-2 text-script-lg">How it began</h3>
              {couple.intro && (
                <p className="story-intro mx-auto mt-4 max-w-[22rem] text-xl italic leading-snug text-ink-soft md:max-w-[30rem]">
                  {couple.intro}
                </p>
              )}
            </div>
            {story.length > 0 && <StoryThread items={story} />}
          </Container>
        </div>
      )}
    </section>
  );
}
