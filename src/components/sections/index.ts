import type { ComponentType } from "react";
import type { SectionId } from "@/config/types";
import { Invitation } from "./Invitation";
import { Couple } from "./Couple";
import { Events } from "./Events";
import { Gallery } from "./Gallery";
import { Family } from "./Family";
import { WishingWall } from "./WishingWall";
import { Rsvp } from "./Rsvp";
import { TravelStay } from "./TravelStay";
import { Contact } from "./Contact";
import { ThankYou } from "./ThankYou";
import { LoveNote } from "./LoveNote";

/** Maps config section ids to components. Order comes from config.sections. */
export const SECTION_REGISTRY: Record<SectionId, ComponentType> = {
  invitation: Invitation,
  couple: Couple,
  events: Events,
  gallery: Gallery,
  family: Family,
  wishingWall: WishingWall,
  rsvp: Rsvp,
  travelStay: TravelStay,
  contact: Contact,
  thankYou: ThankYou,
  loveNote: LoveNote,
};
