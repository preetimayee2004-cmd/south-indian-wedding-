import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import type { Enter } from "@/components/scene/Scene";
import { WishingWall } from "@/components/sections/WishingWall";
import { Contact } from "@/components/sections/Contact";
import { LoveNote } from "@/components/sections/LoveNote";
import { InvitationStage } from "./InvitationStage";
import { EventsSlider } from "./EventsSlider";
import { CoupleScene } from "./CoupleScene";
import { JourneyScene } from "./JourneyScene";
import { FamiliesScene } from "./FamiliesScene";
import { RsvpScene } from "./RsvpScene";
import { TravelScene } from "./TravelScene";
import { ThankYouScene } from "./ThankYouScene";
import { ClosingScene } from "./ClosingScene";

/** A normal-scrolling section: a parchment card on the hero's cobalt sky, led in by a scalloped hem. */
function sheet(Component: ComponentType): ComponentType {
  const Sheet = () => (
    <div className="cobalt relative px-3 py-5">
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />
      <div className="parchment frieze-border mx-auto max-w-[44rem] overflow-hidden rounded-[6px]">
        <Component />
      </div>
    </div>
  );
  Sheet.displayName = `Sheet(${Component.displayName ?? Component.name})`;
  return Sheet;
}


export interface SceneEntry {
  Component: ComponentType;
  /** How it arrives: rises over the pinned scene before it (cover), is uncovered as that scene lifts away (lift), or simply follows (flow). */
  enter: Enter;
  /** Stacking order; a "cover" sits above its predecessor, a "lift" below it. */
  z: number;
}

/**
 * Phones/tablets with motion: every section as a pinned 100svh scene (or a
 * parchment sheet for the ones that are mostly reading/typing). Order still
 * comes from config.sections.
 */
export const SCENES: Record<SectionId, SceneEntry> = {
  invitation: { Component: InvitationStage, enter: "flow", z: 10 }, // hero → the arch with the invitation, countdown, destination
  events: { Component: EventsSlider, enter: "flow", z: 12 }, // one event at a time, sliding sideways
  couple: { Component: CoupleScene, enter: "flow", z: 14 }, // bride and groom walk in from both sides and meet
  gallery: { Component: JourneyScene, enter: "flow", z: 18 }, // the love-story runway
  family: { Component: FamiliesScene, enter: "cover", z: 16 }, // rises over the couple scene; lotus plants grow
  rsvp: { Component: RsvpScene, enter: "cover", z: 40 },
  wishingWall: { Component: sheet(WishingWall), enter: "flow", z: 50 },
  travelStay: { Component: TravelScene, enter: "flow", z: 60 }, // the venue
  contact: { Component: sheet(Contact), enter: "flow", z: 55 },
  thankYou: { Component: ThankYouScene, enter: "cover", z: 80 }, // thank you, save the date, replay
  loveNote: { Component: sheet(LoveNote), enter: "cover", z: 90 },
  closing: { Component: ClosingScene, enter: "flow", z: 92 },
};
