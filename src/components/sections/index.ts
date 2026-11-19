import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { Invitation } from "./Invitation";
import { CoupleStill } from "@/components/scenes/CoupleScene";
import { Gallery } from "./Gallery";
import { Family } from "./Family";
import { WishingWall } from "./WishingWall";
import { Rsvp } from "./Rsvp";
import { TravelStay } from "./TravelStay";
import { Contact } from "./Contact";
import { ThankYou } from "./ThankYou";
import { LoveNote } from "./LoveNote";
import { ClosingScene } from "@/components/scenes/ClosingScene";

/** Events live inside the invitation's temple frame, so they have no section of their own. */
const InsideFrame: ComponentType = () => null;

/** Maps config section ids to components. Order comes from config.sections. */
export const SECTION_REGISTRY: Record<SectionId, ComponentType> = {
  invitation: Invitation,
  events: InsideFrame,
  couple: CoupleStill,
  gallery: Gallery,
  family: Family,
  wishingWall: WishingWall,
  rsvp: Rsvp,
  travelStay: TravelStay,
  contact: Contact,
  thankYou: ThankYou,
  loveNote: LoveNote,
  closing: ClosingScene,
};
