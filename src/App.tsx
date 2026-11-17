import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MusicToggle } from "@/components/layout/MusicToggle";
import { Footer } from "@/components/layout/Footer";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { Opening } from "@/components/opening/Opening";
import { SECTION_REGISTRY } from "@/components/sections";
import { DesktopJourney } from "@/components/desktop/DesktopJourney";
import { DevTokens } from "@/components/dev/DevTokens";
import { useWedding } from "@/context/WeddingContext";
import { IntroContext } from "@/context/IntroContext";
import { useIsDesktop } from "@/hooks/useMediaQuery";

const skipIntroByUrl = () => new URLSearchParams(window.location.search).has("nointro");

export default function App() {
  const { sections, opening } = useWedding();
  const desktop = useIsDesktop(); // ≥1024px: full-screen journey; below: the mobile layout
  const [showOpening, setShowOpening] = useState(() => opening.enabled && !skipIntroByUrl());
  const [revealed, setRevealed] = useState(!showOpening);

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
              const Component = SECTION_REGISTRY[id];
              return (
                <SectionBoundary key={id} id={id}>
                  <Component />
                </SectionBoundary>
              );
            })
        )}
        <Footer />
      </AppShell>
      {revealed && <MusicToggle />}
      {showOpening && (
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
