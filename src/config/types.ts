/**
 * Shape of a single wedding's content. One config file = one wedding.
 * Optional fields that are missing must render nothing (no empty blocks).
 */

export type SectionId =
  | "invitation" // hero + live countdown
  | "couple" // couple intro + our story milestones
  | "events"
  | "gallery"
  | "family"
  | "wishingWall"
  | "rsvp"
  | "travelStay"
  | "contact"
  | "thankYou"
  | "loveNote"
  | "closing"; // the city's landmark rising at the very end

export interface Person {
  name: string; // short display name, e.g. "Meenakshi"
  fullName?: string;
  photo?: string;
  parents?: string; // "D/o Smt. … & Shri …"
}

export interface StoryMilestone {
  date?: string;
  title: string;
  text: string;
  photo?: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  description?: string;
  startISO: string; // with timezone offset
  endISO?: string;
  venue?: string;
  /** Google Maps search text; shows a Directions link when set. */
  mapsQuery?: string;
  dressCode?: string;
  /** Up to 3 swatches shown beside the dress code. */
  dressColors?: string[];
  /** Photo/illustration; replaces the line icon when set. */
  image?: string;
  icon?: EventIcon;
  /** This event's own accent colour. Defaults to the theme accent. */
  tone?: string;
}

export type EventIcon = "diya" | "kalash" | "garland" | "agni";

export interface FamilyMember {
  name: string;
  relation: string;
  photo?: string;
}

export interface FamilySide {
  title: string; // "The Bride's Family"
  message?: string;
  members: FamilyMember[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  category?: "couple" | "pre-wedding" | "family" | "traditional";
}

export interface Contact {
  name: string;
  role?: string;
  phone?: string; // E.164, e.g. +919876543210
  whatsapp?: boolean;
}

export interface Venue {
  name: string;
  address: string;
  mapsQuery: string; // used for embed + directions link
  image?: string;
}

export interface StayOption {
  name: string;
  note?: string;
  distance?: string;
  url?: string;
}

export interface ThemeTokens {
  accent: string;
  ink: string;
  inkSoft: string;
  ivory: string;
  paper: string;
  gold: string;
  teal: string;
  maroon: string;
  leaf: string;
  line: string;
  fontScript: string;
  fontBody: string;
}

/** Desktop (≥1024px) journey scenes that take their own artwork. */
export type DesktopSlot = "opening" | "invitation" | "couple" | "events" | "gallery" | "family" | "rsvp" | "thankYou";

export interface DesktopArt {
  src: string;
  /** width / height of the image, so layout is right before it loads. */
  ratio: number;
  /** Which part of a tall image to frame: 0 = top, 1 = bottom. Default 0.5. */
  focus?: number;
}

export interface WeddingConfig {
  /** Unique per wedding. Keeps each wedding's wishes and RSVPs separate in the shared database. */
  id: string;
  meta: {
    title: string;
    description: string;
    /** Source image for the link preview; cropped to 1200×630 JPEG at build. */
    ogImage: string;
    /** Public address of the live site, e.g. "https://meenakshi-karthik.in". Required for WhatsApp previews. */
    siteUrl?: string;
  };
  personalization: {
    queryParams: string[]; // first non-empty wins
    fallbackName: string;
  };
  couple: {
    bride: Person;
    groom: Person;
    order: "bride-first" | "groom-first";
    intro?: string;
    story?: StoryMilestone[];
  };
  wedding: {
    dateISO: string; // muhurtham start, drives countdown
    muhurthamLabel?: string; // "9:00 – 10:30 AM"
    city: string;
    quote?: string;
    blessing?: string; // fixed Sanskrit/Hindi accent
    /** IANA zone the dates are shown in, regardless of the guest's own zone. */
    timeZone: string;
    /** Line under the greeting, before the names. */
    invitationLine: string;
    /** Opening invocation, e.g. "॥ श्री गणेशाय नमः ॥". */
    invocation?: string;
    /** Sign-off under the invitation, e.g. "The Sundaram & Raghavan Families". */
    families?: string;
    /** How the city is called in the RSVP line, e.g. "the Temple City". */
    cityNickname?: string;
  };
  /** The love story: the city it began in and the city it lives on in (name + native script). */
  loveStory?: {
    began: { city: string; native?: string; line: string };
    livesOn: { city: string; native?: string; line: string };
  };
  events: WeddingEvent[];
  family?: { bride?: FamilySide; groom?: FamilySide };
  gallery: GalleryImage[];
  rsvp: {
    deadlineISO?: string;
    maxAttendees: number;
    endpoint?: string; // backend / form service, wired in Phase 9
  };
  venue: Venue;
  stay?: StayOption[];
  travelNotes?: string[];
  contacts: Contact[];
  thankYou: { message: string; quote?: string };
  loveNote?: { text: string; signature?: string };
  opening: {
    enabled: boolean;
    tapLabel: string;
  };
  media: {
    /**
     * The temple frame that holds the invitation and events. `top` px of the art
     * (roof, capitals, one carved niche) and `bottom` px (pillar bases) are drawn
     * once; between them the pillar shafts are painted and grow with the content.
     * `side` = width of each pillar band, `clip` = sky trimmed at each edge,
     * `contentTop` = where the text starts on the cream.
     * `tile` (optional) = one carved pillar module cut from the same art
     * (scripts/make-pillar-tile.mjs, same width, cream middle transparent),
     * repeated down the shafts instead of the painted gradient.
     */
    frame: {
      src: string; width: number; height: number; top: number; bottom: number; side: number; clip: number; contentTop: number;
      tile?: { src: string; height: number };
      /** The same art with its sky made transparent (scripts/cut-frame-sky.mjs) + its pillar tile, for the phone scenes where the arch rises over a picture. */
      cut?: { src: string; tile: string };
    };
    /**
     * Laptop/desktop artwork per scene (landscape, ideally 1920×1080 or larger).
     * Any slot left out falls back to the mobile artwork above.
     */
    desktop?: Partial<Record<DesktopSlot, DesktopArt>>;
    /** Clear area inside the RSVP arch (below its printed title), in % of the image. */
    rsvpArch: { top: number; left: number; width: number; height: number };
    /** Lamp flames in the RSVP art, [x%, y%] — they get a soft live flicker. */
    rsvpLamps: [number, number][];
    /** Parchment area of the family gateway art, in % of the image; it continues below as a scroll. */
    familyParchment: { left: number; width: number; top: number; color: string };
    /** Symmetrical entrance art behind the threads; splits open like doors. */
    opening: string;
    /** Hero temple on a flat sky (portrait 3:4); the hero background uses its exact sky colour. */
    invitation: string;
    /**
     * Landscape 16:9 version of the hero temple for screens wider than 900px
     * (the same temple, zoomed out on flat sky). `peek` = how much of the top of
     * the picture shows at the start (finials + roof top), as a fraction of its height.
     * Used only once the file exists (prepared into art-manifest.json).
     */
    invitationWide?: { src: string; peek: number };
    /** The couple scene (landscape), also used by Thank You. */
    couple: string;
    /**
     * The couple scene in layers: the temple background with nobody in it (bg, landscape
     * 1376×768, prepared with scripts/prepare-art.mjs) and the bride and groom as
     * transparent cutouts (scripts/cut-white-bg.mjs), who walk in from both sides and meet.
     */
    coupleWalk: { bg: string; bride: string; groom: string };
    events: string;
    family: string;
    rsvp: string;
    thankYou: string;
    gallery: string;
  };
  audio: {
    music?: string;
    volume: number; // 0–1
    sfx: Partial<Record<"bell" | "thread" | "door" | "tap", string>>;
  };
  theme: ThemeTokens;
  /** Render order. Remove or set enabled:false to hide a section. */
  sections: { id: SectionId; enabled: boolean }[];
}
