import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Layer } from "@/components/scene/Layer";
import { RsvpPanel, useRsvpUsable } from "@/components/sections/rsvp/RsvpPanel";

const IMG_RATIO = "768 / 1376";

/**
 * Scene 9 — RSVP. The stone arch; the "Dear Guest" card rises into its clear
 * centre and settles with a slight scale, the lamps glow up, and the main
 * button pulses once.
 */
export function RsvpScene() {
  const { media } = useWedding();
  const usable = useRsvpUsable();
  const arch = media.rsvpArch;
  const box = useRef<HTMLDivElement>(null);
  const lamps = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);

  if (!usable && !import.meta.env.DEV) return null;

  const build: Build = (tl) => {
    tl.fromTo(art.current, { yPercent: 4 }, { yPercent: 0, duration: 0.8, ease: "power1.out" }, 0)
      .from(lamps.current!.children, { autoAlpha: 0, scale: 0.3, duration: 0.3, stagger: 0.08 }, 0.2)
      .fromTo(box.current, { autoAlpha: 0, yPercent: 30, scale: 0.9 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.6, ease: "power2.out" }, 0.3);
    const cta = box.current!.querySelector<HTMLElement>("a.bg-accent, button.bg-accent, button[type=submit]");
    if (cta) tl.to(cta, { scale: 1.08, duration: 0.15, ease: "power1.out", yoyo: true, repeat: 1 }, 1);
    tl.to({}, { duration: 0.3 });
  };

  return (
    <Scene
      id="rsvp"
      label="RSVP"
      className="bg-[#efe2c6]"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#efe2c6" }} />}
    >
      <h2 className="sr-only">RSVP</h2>
      <div className="absolute left-1/2 top-0 h-full -translate-x-1/2" style={{ aspectRatio: IMG_RATIO }}>
      <div ref={art} data-layer className="absolute inset-0">
        <Layer
          src={media.rsvp}
          alt="A carved stone arch hung with flower garlands, brass lamps and a flower rangoli, titled RSVP, Venue and Muhurtham"
          className="absolute inset-0"
        />
        <div ref={lamps} aria-hidden>
          {media.rsvpLamps.map(([x, y], i) => (
            <span
              key={i}
              className="pointer-events-none absolute h-16 w-16 rounded-full mix-blend-screen motion-safe:animate-[flicker_2.6s_ease-in-out_infinite]"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${i * 0.37}s`,
                background: "radial-gradient(circle, rgb(255 214 120 / 0.85) 0%, rgb(255 170 60 / 0.35) 35%, transparent 70%)",
              }}
            />
          ))}
        </div>
        <div
          ref={box}
          data-layer
          className="absolute flex flex-col items-center justify-center overflow-y-auto"
          style={{ top: `${arch.top}%`, left: `${arch.left}%`, width: `${arch.width}%`, height: `${arch.height}%` }}
        >
          <RsvpPanel />
        </div>
      </div>
      </div>
    </Scene>
  );
}
