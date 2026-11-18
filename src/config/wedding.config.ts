import type { WeddingConfig } from "./types";

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
    fallbackName: "Guest",
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
    dateISO: "2027-02-14T09:00:00+05:30",
    muhurthamLabel: "9:00 – 10:30 AM",
    city: "Madurai, Tamil Nadu",
    quote: "Two souls, one thread, bound by blessings.",
    blessing: "॥ शुभ विवाह ॥",
    timeZone: "Asia/Kolkata",
    invitationLine: "Together with our families, we joyfully invite you to celebrate the wedding of",
  },

  events: [
    {
      id: "nalangu",
      name: "Nalangu",
      description: "An afternoon of turmeric, sandalwood, songs and playful games.",
      startISO: "2027-02-13T16:00:00+05:30",
      endISO: "2027-02-13T18:00:00+05:30",
      venue: "Bride's Residence",
      dressCode: "Yellow & green",
      dressColors: ["#e2a72e", "#4e7a3c"],
      icon: "kalash",
      tone: "#c98a1b",
    },
    {
      id: "reception",
      name: "Reception",
      description: "Dinner, music and blessings under the lamps.",
      startISO: "2027-02-13T19:00:00+05:30",
      venue: "Sri Meenakshi Mahal",
      mapsQuery: "Meenakshi Amman Temple, Madurai",
      dressCode: "Festive evening wear",
      icon: "diya",
      tone: "#1f6b68",
    },
    {
      id: "muhurtham",
      name: "Muhurtham",
      description: "The sacred thread is tied as the auspicious hour arrives.",
      startISO: "2027-02-14T09:00:00+05:30",
      endISO: "2027-02-14T10:30:00+05:30",
      venue: "Sri Meenakshi Mahal",
      mapsQuery: "Meenakshi Amman Temple, Madurai",
      dressCode: "Traditional silk",
      dressColors: ["#ca4c3d", "#b88a3e"],
      icon: "agni",
      tone: "#ca4c3d",
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

  // SAMPLE photos (the theme artwork) — replace with real photographs.
  // Add as many as you like; order = order along the journey.
  gallery: [
    { src: "/media/couple-scene.webp", alt: "The couple exchanging garlands before the gopuram", caption: "Maalai Maatral", category: "couple" },
    { src: "/media/gopuram-sky.webp", alt: "A gopuram against a clear blue sky", caption: "Where we first met", category: "pre-wedding" },
    { src: "/media/temple-dancers.webp", alt: "Dancers performing in the temple courtyard", caption: "The sangeet rehearsal", category: "family" },
    { src: "/media/mandapam-arch.webp", alt: "A mandapam archway with bells and garlands", caption: "The mandapam, dressed for the day", category: "traditional" },
    { src: "/media/gopuram-frame.webp", alt: "A painted temple gateway with deities", caption: "Blessings from the temple", category: "traditional" },
    { src: "/media/pillar-frame.webp", alt: "Painted temple pillars with marigold garlands", caption: "Garlands for the hall", category: "family" },
  ],

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
    { name: "Ravi", role: "Bride's brother", phone: "+910000000000", whatsapp: true },
    { name: "Anand", role: "Groom's cousin", phone: "+910000000001", whatsapp: true },
  ],

  thankYou: {
    message: "Your presence and blessings mean the world to us.",
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
    // >900px wide screens; used automatically once prepared with scripts/prepare-art.mjs
    invitationWide: { src: "/media/temple-hero-wide.webp", peek: 0.3 },
    couple: "/media/couple-scene.webp",
    coupleWide: "/media/couple-scene-wide.webp",
    events: "/media/pillar-frame.webp",
    family: "/media/gopuram-frame.webp",
    familyParchment: { left: 17, width: 66, top: 34, color: "#efd391" },
    rsvp: "/media/stone-arch.webp",
    rsvpArch: { top: 36, left: 13, width: 74, height: 42 },
    rsvpLamps: [[13, 75.5], [87, 75.5], [5.5, 82.5], [94.5, 82.5]],
    thankYou: "/media/couple-scene.webp",
    gallery: "/media/temple-dancers.webp",
  },

  audio: {
    // Drop an mp3 in /public/audio and set e.g. music: "/audio/nadaswaram.mp3".
    // The music button only appears when a track is configured.
    music: undefined,
    volume: 0.35,
    sfx: {},
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
    { id: "invitation", enabled: true }, // hero + temple frame with the invitation
    { id: "events", enabled: true }, // shown inside the temple frame, under the invitation
    { id: "couple", enabled: true },
    { id: "gallery", enabled: true },
    { id: "family", enabled: true },
    { id: "rsvp", enabled: true },
    { id: "wishingWall", enabled: true },
    { id: "travelStay", enabled: true },
    { id: "contact", enabled: true },
    { id: "thankYou", enabled: true },
    { id: "loveNote", enabled: true },
  ],
};

export default weddingConfig;
