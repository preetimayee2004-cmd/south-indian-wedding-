import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { SECTION_REGISTRY } from "@/components/sections";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { HeroScene } from "./scenes/HeroScene";
import { CountdownScene, InvitationScene } from "./scenes/InvitationScene";
import { CoupleScene } from "./scenes/CoupleScene";
import { EventsScene } from "./scenes/EventsScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { FamilyScene } from "./scenes/FamilyScene";
import { ContactScene, LoveNoteScene, RsvpScene, ThankYouScene, TravelScene, WishesScene } from "./scenes/ClosingScenes";

/** Desktop scenes per section (a section not listed falls back to its mobile layout). */
const DESKTOP_SCENES: Partial<Record<SectionId, ComponentType[]>> = {
  invitation: [HeroScene, InvitationScene, CountdownScene],
  couple: [CoupleScene],
  events: [EventsScene],
  gallery: [GalleryScene],
  family: [FamilyScene],
  wishingWall: [WishesScene],
  rsvp: [RsvpScene],
  travelStay: [TravelScene],
  contact: [ContactScene],
  thankYou: [ThankYouScene],
  loveNote: [LoveNoteScene],
};

/**
 * Laptop/desktop (≥1024px): the invitation as one continuous, full-screen
 * camera journey of scenes that dissolve into each other. Same config,
 * same order and visibility as mobile.
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
