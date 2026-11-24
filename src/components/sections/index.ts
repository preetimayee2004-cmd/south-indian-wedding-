import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { Invitation } from "./Invitation";
import { CoupleStill } from "@/components/scenes/CoupleScene";
import { LoveStoryStill } from "@/components/scenes/gallery/LoveStoryBoard";
import { Family } from "./Family";
import { WishingWall } from "./WishingWall";
import { Rsvp } from "./Rsvp";
import { TravelStay } from "./TravelStay";
import { Contact } from "./Contact";
import { ThankYouScene as ThankYou } from "@/components/scenes/ThankYouScene";
import { LoveNote } from "./LoveNote";
import { ClosingScene } from "@/components/scenes/ClosingScene";

/** Events live inside the invitation's temple frame, so they have no section of their own. */
const InsideFrame: ComponentType = () => null;

/** Maps config section ids to components. Order comes from config.sections. */
export const SECTION_REGISTRY: Record<SectionId, ComponentType> = {
  invitation: Invitation,
  events: InsideFrame,
  couple: CoupleStill,
  gallery: LoveStoryStill,
  family: Family,
  wishingWall: WishingWall,
  rsvp: Rsvp,
  travelStay: TravelStay,
  contact: Contact,
  thankYou: ThankYou,
  loveNote: LoveNote,
  closing: ClosingScene,
};
