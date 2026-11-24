import type { WeddingConfig } from "./types";

/** Who the invitation greets ("Dear Preeti"). A ?guest= link still overrides it. */
const guestName = "Preeti";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE ONLY FILE TO EDIT FOR A NEW WEDDING.
 *  Names, dates, photos, music, colours and section visibility.
 *  Media paths are relative to /public.
 *  All content below is SAMPLE content.
 * ─────────────────────────────────────────────────────────────
 */
const weddingConfig: WeddingConfig = {
  id: "meenakshi-karthik-2027",

  meta: {
    title: "Meenakshi & Karthik — Wedding Invitation",
    description: "With the blessings of our elders, we invite you to our wedding.",
    ogImage: "/media/couple-scene.webp",
    // Set before going live so WhatsApp/Facebook can show the preview image:
    siteUrl: "",
  },

  personalization: {
    // ?guest=Priya%20Raman  (also accepts ?to= or ?name=)
    queryParams: ["guest", "to", "name"],
    fallbackName: guestName,
  },

  couple: {
    bride: { name: "Meenakshi", fullName: "Meenakshi Sundaram", parents: "D/o Smt. Lakshmi & Shri Sundaram" },
    groom: { name: "Karthik", fullName: "Karthik Raghavan", parents: "S/o Smt. Kamala & Shri Raghavan" },
    order: "bride-first",
    intro: "Two families, one sacred thread, and a lifetime of togetherness.",
    story: [
      { date: "2021", title: "First hello", text: "A shared umbrella on a rainy Chennai evening." },
      { date: "2023", title: "The question", text: "Asked on the steps of the temple where it all began." },
      { date: "2027", title: "Forever", text: "Seven steps around the sacred fire." },
    ],
  },

  wedding: {
    dateISO: "2027-02-15T07:00:00+05:30", // the Muhurtham: drives the countdown and every date shown
    muhurthamLabel: "7:00 – 8:30 AM",
    city: "Madurai, Tamil Nadu",
    quote: "Two souls, one thread, bound by blessings.",
    blessing: "॥ शुभ विवाह ॥",
    timeZone: "Asia/Kolkata",
    invitationLine: "With the blessings of our elders, we warmly invite you to the wedding celebrations of",
    invocation: "॥ श्री गणेशाय नमः ॥",
    families: "The Sundaram & Raghavan Families",
    cityNickname: "the Temple City",
  },

  loveStory: {
    began: { city: "Chennai", native: "சென்னை", line: "where two hearts first met" },
    livesOn: { city: "Madurai", native: "மதுரை", line: "forever, together" },
  },

  // The celebrations, in order. `theme` picks each one's colours and ornaments in the events section.
  events: [
    {
      id: "nalangu",
      name: "Nalangu",
      subtitle: "The Turmeric Celebration",
      theme: "nalangu",
      description: "An afternoon of turmeric, sandalwood, songs and playful games.",
      startISO: "2027-02-13T16:00:00+05:30",
      endISO: "2027-02-13T18:00:00+05:30",
      venue: "Bride's Residence",
      dressCode: "Yellow & Green",
      dressColors: ["#e2a72e", "#4e7a3c"],
      icon: "kalash",
      tone: "#c98a1b",
    },
    {
      id: "mehendi",
      name: "Mehendi",
      subtitle: "A Touch of Tradition",
      theme: "mehendi",
      description: "Henna, laughter and beautiful memories shared with loved ones.",
      startISO: "2027-02-13T18:30:00+05:30",
      venue: "Bride's Residence",
      dressCode: "Green / Floral",
      dressColors: ["#2f6b3a", "#e7b8c4"],
      icon: "garland",
      tone: "#2f6b3a",
    },
    {
      id: "sangeet",
      name: "Sangeet",
      subtitle: "An Evening of Music",
      theme: "sangeet",
      description: "An evening filled with music, dancing and unforgettable celebrations.",
      startISO: "2027-02-14T19:00:00+05:30",
      venue: "Wedding Venue",
      dressCode: "Festive Attire",
      dressColors: ["#7a1f2b", "#c9954f"],
      icon: "diya",
      tone: "#7a1f2b",
    },
    {
      id: "muhurtham",
      name: "Muhurtham",
      subtitle: "The Sacred Union",
      theme: "muhurtham",
      description: "With blessings and sacred vows, two hearts begin their forever.",
      startISO: "2027-02-15T07:00:00+05:30",
      endISO: "2027-02-15T08:30:00+05:30",
      venue: "Wedding Mandapam",
      dressCode: "Traditional Attire",
      dressColors: ["#b3262e", "#c9954f"],
      icon: "agni",
      tone: "#b3262e",
    },
    {
      id: "reception",
      name: "Reception",
      subtitle: "The Celebration Continues",
      theme: "reception",
      description: "Join us for an evening of joy, good wishes and celebration.",
      startISO: "2027-02-15T18:30:00+05:30",
      venue: "Reception Venue",
      dressCode: "Formal / Festive",
      dressColors: ["#d8c08f", "#6d1a2c"],
      icon: "diya",
      tone: "#6d1a2c",
    },
  ],

  family: {
    bride: {
      title: "The Bride's Family",
      message: "We are delighted to welcome Karthik into our family.",
      members: [
        { name: "Smt. Lakshmi Sundaram", relation: "Mother" },
        { name: "Shri Sundaram", relation: "Father" },
        { name: "Ravi Sundaram", relation: "Brother" },
        { name: "Smt. Janaki", relation: "Grandmother" },
      ],
    },
    groom: {
      title: "The Groom's Family",
      message: "With joy, we open our home and hearts to Meenakshi.",
      members: [
        { name: "Smt. Kamala Raghavan", relation: "Mother" },
        { name: "Shri Raghavan", relation: "Father" },
        { name: "Divya Raghavan", relation: "Sister" },
        { name: "Shri Venkataraman", relation: "Grandfather" },
      ],
    },
  },

  // The photo board: up to 6 photos, in order (square-ish WebP photos look best; any size works).
  // Put the files in public/media/gallery/ and list them here (replace them with your own,
  // same names, or change the list).
  gallery: {
    heading: "Moments to Cherish",
    subtitle: "Little memories, one beautiful story",
    ending: "and so it begins...",
    photos: [
      { src: "/media/gallery/photo-1.webp", caption: "When our families said yes", alt: "The couple in cream and gold silk in a carved temple corridor, the gopuram behind them" },
      { src: "/media/gallery/photo-2.webp", caption: "Jasmine for her hair", alt: "He pins jasmine in her hair at sunset, she in a cream saree with a green blouse" },
      { src: "/media/gallery/photo-3.webp", caption: "Our first walk together", alt: "The couple walking hand in hand down a busy street, smiling" },
      { src: "/media/gallery/photo-4.webp", caption: "A promise in red and gold", alt: "The couple close together, she in a red saree, he in black" },
      { src: "/media/gallery/photo-5.webp", caption: "Lighting the lamp together", alt: "The couple in gold lighting a tall brass lamp in the temple" },
      { src: "/media/gallery/photo-6.webp", caption: "Blessings at the temple", alt: "The couple holding a plate of offerings by the temple tank, lamps floating on the water" },
    ],
  },

  rsvp: { deadlineISO: "2027-01-31T23:59:00+05:30", maxAttendees: 6 },

  venue: {
    name: "Sri Meenakshi Mahal",
    address: "North Chitrai Street, Madurai, Tamil Nadu 625001",
    mapsQuery: "Meenakshi Amman Temple, Madurai",
  },

  // SAMPLE stays — add a url to show a "View" link.
  stay: [
    { name: "Heritage Madurai", distance: "4 km from venue", note: "Rooms held for wedding guests — mention the wedding when booking." },
    { name: "The Gateway Pasumalai", distance: "7 km from venue", note: "Hilltop views, shuttle on the wedding day." },
    { name: "Hotel Temple Tower", distance: "600 m from venue", note: "Walk to the mahal." },
  ],
  // Icon is picked from the words: airport/flight → plane, railway/station/train → train, bus → bus, else car.
  travelNotes: [
    "Madurai Airport (IXM) — 12 km, about 30 minutes by taxi.",
    "Madurai Junction railway station — 2 km.",
    "Parking is available at the mahal; valet from 8 AM.",
  ],

  contacts: [
    { name: "Ravi Sundaram", role: "Bride's Brother", phone: "+919876543210", whatsapp: true },
    { name: "Suresh Sundaram", role: "Bride's Uncle", phone: "+919876543211", whatsapp: true },
    { name: "Anand Raghavan", role: "Groom's Cousin", phone: "+919876543212", whatsapp: true },
    { name: "Rajesh Raghavan", role: "Groom's Uncle", phone: "+919876543213", whatsapp: true },
  ],

  thankYou: {
    message: "For your love and blessings, thank you.",
    quote: "Where there is love, there is life.",
  },

  loveNote: {
    text: "Some of you watched us grow up, some of you watched us fall in love, and all of you made us who we are. Thank you for being part of our story — we can't wait to begin this next chapter with you beside us.",
    signature: "Meenakshi & Karthik",
  },

  opening: {
    enabled: true, // add ?nointro to the URL to bypass while reviewing
    tapLabel: "Tap to open",
  },

  media: {
    // The painted arch that frames the invitation (white background cut away by
    // scripts/cut-white-bg.mjs). Roof + capitals (rows 0–top) and base (last
    // `bottom` rows) are drawn once; between them the pillar module
    // (scripts/make-pillar-tile.mjs, rows 497–642) repeats to any height.
    frame: { src: "/media/arch-frame.webp", width: 1376, height: 768, top: 497, bottom: 126, side: 380, clip: 240, contentTop: 400, tile: { src: "/media/arch-tile.webp", height: 145 } },
    // Laptop/desktop scenes. Add landscape art here when ready, e.g.
    // hero: { src: "/media/desktop/hero.webp", ratio: 16 / 9, focus: 0.4 },
    desktop: {},

    opening: "/media/pillar-frame.webp",
    invitation: "/media/temple-hero.webp",
    // the elephants walking across the paving in front of the temple
    procession: { elephant: "/media/elephant.webp" },
    // >900px wide screens; used automatically once prepared with scripts/prepare-art.mjs
    invitationWide: { src: "/media/temple-hero-wide.webp", peek: 0.3 },
    couple: "/media/couple-scene.webp", // landscape 1376×768, cobalt sky
    // the couple scene: empty temple background + the bride and groom cut out (they walk in and meet)
    coupleWalk: { bg: "/media/couple-bg.webp", bride: "/media/couple-bride.webp", groom: "/media/couple-groom.webp" },
    events: "/media/temple-events-bg.webp",
    gallery: "/media/temple-events-bg.webp",
    family: "/media/gopuram-frame.webp",
    familyParchment: { left: 17, width: 66, top: 34, color: "#efd391" },
    rsvp: "/media/stone-arch.webp",
    rsvpArch: { top: 36, left: 13, width: 74, height: 42 },
    rsvpLamps: [[13, 75.5], [87, 75.5], [5.5, 82.5], [94.5, 82.5]],
    thankYou: "/media/thank-you-temple.webp",
  },

  audio: {
    // Background music. A gentle veena + tanpura piece in raga Mohanam is included
    // (generated, royalty-free). To use your own song, put the mp3 in /public/audio
    // and point this at it, e.g. music: "/audio/our-song.mp3". Remove it to hide the song button.
    // The song plays only when the guest taps the song button; the sound effects below always play.
    music: "/audio/music.mp3",
    volume: 0.35,
    sfxVolume: 0.7,
    // Little sounds tied to the animations (all generated, royalty-free). Remove any you don't want.
    sfx: {
      seal: "/audio/sfx/seal.mp3", // the seal cracks
      shimmer: "/audio/sfx/shimmer.mp3", // gold sparks / the finale
      rustle: "/audio/sfx/rustle.mp3", // the envelope flap lifts
      slide: "/audio/sfx/slide.mp3", // the card slides out
      rise: "/audio/sfx/rise.mp3", // the card grows into the sky
      bell: "/audio/sfx/bell.mp3", // temple bell: welcome, contact bells, RSVP, wishes
      tink: "/audio/sfx/tink.mp3", // countdown tiles
      tap: "/audio/sfx/tap.mp3", // small taps
      diya: "/audio/sfx/diya.mp3", // the family lamp
    },
  },

  theme: {
    accent: "#ca4c3d",
    ink: "#3a1f16",
    inkSoft: "#5c3a2b",
    ivory: "#f3e5c4", // parchment — no plain white anywhere
    paper: "#fbf2dc",
    gold: "#b88a3e",
    teal: "#1f6b68",
    maroon: "#7a2e2a",
    leaf: "#4e7a3c",
    line: "#dcc595",
    fontScript: "'Great Vibes', cursive",
    fontBody: "'EB Garamond', Georgia, serif",
  },

  sections: [
    { id: "invitation", enabled: true }, // hero, then the invitation with countdown + destination in the arch
    { id: "events", enabled: true }, // one event at a time, sliding sideways
    { id: "couple", enabled: true }, // the couple glide down and come to rest
    { id: "family", enabled: true }, // meet the bride & groom family
    { id: "gallery", enabled: true }, // our love story: the photo board and paper plane
    { id: "rsvp", enabled: true },
    { id: "wishingWall", enabled: true },
    { id: "travelStay", enabled: true }, // venue, travel & contacts all-in-one in traditional golden frame
    { id: "contact", enabled: false }, // merged into travelStay
    { id: "thankYou", enabled: true }, // thank you, save the date, replay
    { id: "loveNote", enabled: true }, // a note from our hearts
    { id: "closing", enabled: false }, // the city's landmark
  ],
};

export default weddingConfig;
