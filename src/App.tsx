import { useEffect, useLayoutEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MusicToggle } from "@/components/layout/MusicToggle";
import { Footer } from "@/components/layout/Footer";
import { Loader, usePreload } from "@/components/layout/Loader";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { Opening } from "@/components/opening/Opening";
import { SECTION_REGISTRY } from "@/components/sections";
import { SCENES } from "@/components/scenes";
import { DesktopJourney } from "@/components/desktop/DesktopJourney";
import { DevTokens } from "@/components/dev/DevTokens";
import { useWedding } from "@/context/WeddingContext";
import { IntroContext } from "@/context/IntroContext";
import { useIsDesktop, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap, refreshSoon } from "@/lib/gsap";
import { startSmoothScroll, stopSmoothScroll } from "@/lib/smooth";

const skipIntroByUrl = () => new URLSearchParams(window.location.search).has("nointro");

export default function App() {
  const { sections, opening, media } = useWedding();
  const desktop = useIsDesktop(); // ≥1024px: full-screen journey; below: the phone scenes
  const reduced = usePrefersReducedMotion();
  const scenes = !desktop && !reduced; // pinned, layered scroll scenes
  const [showOpening, setShowOpening] = useState(() => opening.enabled && !skipIntroByUrl());
  const [revealed, setRevealed] = useState(!showOpening);
  // Both scene pictures are decoded before anything animates.
  const artReady = usePreload([media.invitation, media.couple].map((s) => s.replace(/\.webp$/, "@2x.webp")));

  // Lenis smooth scrolling (off for reduced motion).
  useEffect(() => {
    if (reduced) return;
    startSmoothScroll();
    return () => stopSmoothScroll();
  }, [reduced]);

  // html.motion switches on the scene hand-overs in CSS (overlaps, no gold rules).
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("motion", scenes);
    refreshSoon(100);
  }, [scenes]);

  // Reduced motion: no pinning — each section simply fades in once.
  useEffect(() => {
    if (!reduced || desktop) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".sec > *").forEach((el) =>
        gsap.from(el, { opacity: 0, duration: 0.6, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
      );
    });
    return () => ctx.revert();
  }, [reduced, desktop]);

  return (
    <IntroContext.Provider value={revealed}>
      <AppShell inert={!revealed}>
        {import.meta.env.DEV && <DevTokens />}
        {desktop ? (
          <DesktopJourney key="desktop" />
        ) : (
          sections
            .filter((s) => s.enabled)
            .map(({ id }) => {
              const scene = scenes ? SCENES[id] : undefined;
              const Component = scene?.Component ?? SECTION_REGISTRY[id];
              return (
                <SectionBoundary key={`${id}-${scenes}`} id={id} enter={scene?.enter} z={scene?.z}>
                  <Component />
                </SectionBoundary>
              );
            })
        )}
        <Footer />
      </AppShell>
      {revealed && <MusicToggle />}
      <Loader done={artReady} />
      {showOpening && artReady && (
        <Opening
          desktop={desktop}
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
