import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { SECTION_REGISTRY } from "@/components/sections";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { InvitationFrame } from "@/components/frame/InvitationFrame";
import { TempleHeroScene } from "@/components/scenes/TempleHeroScene";
import { CoupleScene } from "@/components/scenes/CoupleScene";
import { ThankYouScene } from "@/components/scenes/ThankYouScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { FamilyScene } from "./scenes/FamilyScene";
import { ContactScene, LoveNoteScene, RsvpScene, TravelScene, WishesScene } from "./scenes/ClosingScenes";

/** The pinned temple hero; the temple frame then rises over it on a scalloped parchment edge. */
const Hero: ComponentType = () => (
  <>
    <TempleHeroScene tail={1} />
    <div className="parchment relative z-[1]" style={{ marginTop: "-100svh" }}>
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f5e8c9" }} />
      <InvitationFrame />
    </div>
  </>
);
const InsideFrame: ComponentType = () => null;

/** Laptop scenes per section (a section not listed falls back to its phone layout). */
const DESKTOP_SCENES: Partial<Record<SectionId, ComponentType[]>> = {
  invitation: [Hero],
  events: [InsideFrame], // shown inside the temple frame
  couple: [CoupleScene],
  gallery: [GalleryScene],
  family: [FamilyScene],
  rsvp: [RsvpScene],
  wishingWall: [WishesScene],
  travelStay: [TravelScene],
  contact: [ContactScene],
  thankYou: [ThankYouScene],
  loveNote: [LoveNoteScene],
};

/**
 * Laptop/desktop (≥1024px): the same order as phones, each section a
 * full-screen scene ending on a crisp gold line.
 */
export function DesktopJourney() {
  const { sections } = useWedding();
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map(({ id }) => {
          const scenes = DESKTOP_SCENES[id];
          const Fallback = SECTION_REGISTRY[id];
          return (
            <SectionBoundary key={id} id={id}>
              {scenes ? scenes.map((S, i) => <S key={i} />) : <Fallback />}
            </SectionBoundary>
          );
        })}
    </>
  );
}
