import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { SECTION_REGISTRY } from "@/components/sections";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { InvitationFrame } from "@/components/frame/InvitationFrame";
import { CoupleFrame } from "@/components/sections/CoupleFrame";
import { HeroScene } from "./scenes/HeroScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { FamilyScene } from "./scenes/FamilyScene";
import { ContactScene, LoveNoteScene, RsvpScene, ThankYouScene, TravelScene, WishesScene } from "./scenes/ClosingScenes";

/** The sharp gold line under the dancers, before the temple frame begins. */
const Rule: ComponentType = () => <div className="section-rule" aria-hidden />;
const InsideFrame: ComponentType = () => null;

/** Laptop scenes per section (a section not listed falls back to its phone layout). */
const DESKTOP_SCENES: Partial<Record<SectionId, ComponentType[]>> = {
  invitation: [HeroScene, Rule, InvitationFrame],
  events: [InsideFrame], // shown inside the temple frame
  couple: [CoupleFrame],
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
