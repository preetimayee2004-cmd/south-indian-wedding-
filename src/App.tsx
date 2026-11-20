import { useEffect, useLayoutEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MusicToggle } from "@/components/layout/MusicToggle";
import { Footer } from "@/components/layout/Footer";
import { Loader, usePreload } from "@/components/layout/Loader";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { Opening } from "@/components/opening/Opening";
import { SECTION_REGISTRY } from "@/components/sections";
import { SCENES } from "@/components/scenes";
import { DevTokens } from "@/components/dev/DevTokens";
import { useWedding } from "@/context/WeddingContext";
import { IntroContext } from "@/context/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap, refreshSoon } from "@/lib/gsap";
import { watchFit } from "@/lib/fitText";

const skipIntroByUrl = () => new URLSearchParams(window.location.search).has("nointro");

export default function App() {
  const { sections, opening, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  // every screen size uses the same scenes (they size themselves to the screen)
  const scenes = !reduced;
  const [showOpening, setShowOpening] = useState(() => opening.enabled && !skipIntroByUrl());
  const [revealed, setRevealed] = useState(!showOpening);
  // The hero picture and the couple scene's three layers are decoded before anything animates.
  const artReady = usePreload([
    // the hero file this screen will actually show (the 2× one only on wide or sharp screens)
    window.innerWidth * window.devicePixelRatio > 1493 ? media.invitation.replace(/\.webp$/, "@2x.webp") : media.invitation,
    media.coupleWalk.bg.replace(/\.webp$/, "@2x.webp"),
    media.coupleWalk.bride,
    media.coupleWalk.groom,
  ]);

  // long names or details never get cut: marked lines shrink just enough to fit (lib/fitText)
  useEffect(() => watchFit(), []);

  // "Replay Invitation" (thank-you page): back to the top and the envelope opens again
  useEffect(() => {
    const replay = () => {
      window.scrollTo(0, 0);
      if (!opening.enabled) return;
      setRevealed(false);
      setShowOpening(true);
    };
    window.addEventListener("invitation:replay", replay);
    return () => window.removeEventListener("invitation:replay", replay);
  }, [opening.enabled]);

  // Sections well off screen go to sleep: their looping CSS animations pause.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("zz", !e.isIntersecting)), { rootMargin: "100% 0px" });
    document.querySelectorAll(".sec").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scenes]);

  // html.motion switches on the scene hand-overs in CSS (overlaps, no gold rules).
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("motion", scenes);
    refreshSoon(100);
  }, [scenes]);

  // Reduced motion: no pinning — each section simply fades in once.
  useEffect(() => {
    if (!reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".sec > *").forEach((el) =>
        gsap.from(el, { opacity: 0, duration: 0.6, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <IntroContext.Provider value={revealed}>
      <AppShell inert={!revealed}>
        {import.meta.env.DEV && <DevTokens />}
        {sections
          .filter((s) => s.enabled)
          .map(({ id }) => {
            const scene = scenes ? SCENES[id] : undefined;
            const Component = scene?.Component ?? SECTION_REGISTRY[id];
            return (
              <SectionBoundary key={`${id}-${scenes}`} id={id} enter={scene?.enter} z={scene?.z}>
                <Component />
              </SectionBoundary>
            );
          })}
        <Footer />
      </AppShell>
      {revealed && <MusicToggle />}
      <Loader done={artReady} />
      {showOpening && artReady && (
        <Opening
          onReveal={() => {
            window.scrollTo(0, 0);
            setRevealed(true);
          }}
          onDone={() => setShowOpening(false)}
        />
      )}
    </IntroContext.Provider>
  );
}
