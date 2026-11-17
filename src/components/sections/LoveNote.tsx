import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";

/**
 * Section 11 — A note of love.
 * A cream envelope sealed with a kumkum wax seal drifts down. Tap it: the seal
 * lifts, the flap swings open in 3D, the letter rises out of the pocket and
 * the envelope falls away. Reduced motion: the letter is simply shown open.
 */
export function LoveNote() {
  const { loveNote, couple } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLSpanElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.set(letter.current, { autoAlpha: 0 });
      gsap.from(".note-head > *", { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: ".note-head", start: "top 85%", once: true } });
      gsap.from(".env-group", {
        y: -40,
        rotate: -4,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: stage.current, start: "top 80%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!loveNote) return null;

  const greeting = isPersonalized ? `Dear ${guestName},` : "Dear friend,";
  const signature = loveNote.signature ?? `${couple.bride.name} & ${couple.groom.name}`;

  const letterBody = (
    <>
      <p className="font-script text-[1.9rem] leading-none text-accent">{greeting}</p>
      <p className="mx-auto mt-4 max-w-[17rem] text-[1.08rem] italic leading-relaxed text-ink [text-wrap:pretty]">{loveNote.text}</p>
      <p className="mt-5 text-[0.62rem] uppercase tracking-[0.26em] text-ink-soft">With all our love</p>
      <p className="mt-1 font-script text-[2.2rem] leading-none text-accent">{signature}</p>
    </>
  );
  const paper = "rounded-sm border border-gold/40 bg-paper px-6 pb-7 pt-7 text-center shadow-[0_10px_30px_rgb(42_36_33/0.12)]";

  const openNote = () => {
    if (open) return;
    setOpen(true);
    playSfx("door");
    const rise = () => -(letter.current!.offsetTop - 4);
    gsap
      .timeline()
      .to(hint.current, { autoAlpha: 0, duration: 0.2 })
      .to(seal.current, { scale: 1.3, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
      .to(flap.current, { rotateX: 180, duration: 0.7, ease: "power2.inOut" }, 0.2)
      .set(flap.current, { zIndex: 1 })
      .set(letter.current, { autoAlpha: 1 })
      .to(letter.current, { y: rise, duration: 0.9, ease: "power2.out" })
      .set(clip.current, { zIndex: 30, overflow: "visible" })
      .to(letter.current, { scale: 1.03, duration: 0.5, ease: "power2.out" })
      .to(".env-part", { y: 80, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, "<")
      // close up the empty space the envelope leaves behind
      .to(stage.current, { height: () => letter.current!.offsetHeight + 24, duration: 0.6, ease: "power2.inOut" });
  };

  return (
    <section ref={root} id="loveNote" aria-labelledby="note-heading" className="relative isolate py-section">
      <Container>
        <div className="note-head text-center">
          <p className="eyebrow">Before you go</p>
          <h2 id="note-heading" className="script-heading mt-2 text-script-lg">
            A Note of Love
          </h2>
        </div>

        {reduced ? (
          <div className={`mx-auto mt-10 max-w-[21rem] ${paper}`}>{letterBody}</div>
        ) : (
          <div ref={stage} className="relative mx-auto mt-12 h-[26rem] w-full max-w-[21rem] [perspective:1200px] md:h-[28rem] md:max-w-[24rem]">
            <div className="env-group absolute inset-0">
              {/* back of the envelope */}
              <div className="env-part absolute inset-x-0 bottom-0 h-[13.5rem] rounded-md border border-[#d8c39a] bg-[#eadbb9] md:h-[15rem]" />

              {/* the letter: clipped at the envelope's bottom edge until it's out */}
              <div ref={clip} className="absolute inset-x-3 bottom-3 top-0 z-10 overflow-hidden">
                <div ref={letter} className={`absolute inset-x-0 top-[calc(100%-12rem)] md:top-[calc(100%-13.5rem)] ${paper}`} aria-hidden={!open}>
                  {letterBody}
                </div>
              </div>

              {/* front pocket: side folds + bottom fold */}
              <div
                className="env-part pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[13.5rem] rounded-md md:h-[15rem]"
                style={{
                  background:
                    "linear-gradient(to top right, #efe1c2 49.6%, transparent 50%) left bottom / 51% 100% no-repeat, linear-gradient(to top left, #efe1c2 49.6%, transparent 50%) right bottom / 51% 100% no-repeat, linear-gradient(to top, #f3e7cb 0 46%, transparent 46%)",
                  filter: "drop-shadow(0 -1px 0 rgb(184 147 90 / 0.35))",
                }}
              />

              {/* flap, hinged at the envelope's top edge */}
              <div className="env-part absolute inset-x-0 bottom-0 z-[25] h-[13.5rem] md:h-[15rem] [transform-style:preserve-3d]">
                <div
                  ref={flap}
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[58%] origin-top"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(to bottom, #e8d6ae, #dcc596)" }}
                />
                <span
                  ref={seal}
                  aria-hidden
                  className="absolute left-1/2 top-[58%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent font-script text-[1.3rem] text-paper shadow-[0_3px_8px_rgb(122_46_42/0.45),inset_0_-3px_6px_rgb(0_0_0/0.18)]"
                >
                  {couple.bride.name[0]}&amp;{couple.groom.name[0]}
                </span>
              </div>

              {!open && (
                <button
                  type="button"
                  onClick={openNote}
                  className="absolute inset-x-0 bottom-0 z-40 h-[13.5rem] cursor-pointer rounded-md md:h-[15rem]"
                  aria-label="Open the envelope to read the couple's note"
                />
              )}
            </div>
            <p ref={hint} className="absolute inset-x-0 -bottom-9 text-center text-[0.68rem] uppercase tracking-[0.28em] text-ink-soft">
              Tap to open
            </p>
            {open && (
              <p className="sr-only" role="status">
                {greeting} {loveNote.text} With all our love, {signature}.
              </p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
