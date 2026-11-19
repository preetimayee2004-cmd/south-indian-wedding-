import type { ReactNode } from "react";
import type { EventTheme } from "@/config/types";

/*
 * The events' architecture: a tall temple doorway in antique gold — a small
 * gopuram crest, a carved lintel with capitals, a cusped arch opening onto an
 * ivory panel, two carved pillars, and a stepped pedestal with a lotus. It stays
 * the same for every event; only each event's own ornaments (ThemeDecor) change.
 */

const G1 = "#e3c172"; // light gold
const G2 = "#c49a4a"; // antique gold
const G3 = "#8f6726"; // shadowed gold
const LINE = "#6e4c1a"; // carved line
const IVORY = "#f8efda";

/** Crest, lintel, capitals and the cusped arch (its opening filled ivory, continuing into the panel). */
export function DoorTop() {
  // a cusped (multi-lobed) arch from the left capital up to the apex and down to the right
  const arch =
    "M56 150V122C56 112 62 106 70 104C70 96 76 90 84 90C86 82 94 77 102 78C108 70 118 67 127 70C136 63 148 62 157 67C166 60 180 58 190 63C194 60 197 58 200 56C203 58 206 60 210 63C220 58 234 60 243 67C252 62 264 63 273 70C282 67 292 70 298 78C306 77 314 82 316 90C324 90 330 96 330 104C338 106 344 112 344 122V150Z";
  return (
    <svg viewBox="0 0 400 150" className="ev-door-top" aria-hidden>
      <defs>
        <linearGradient id="evg-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G1} />
          <stop offset="0.55" stopColor={G2} />
          <stop offset="1" stopColor={G3} />
        </linearGradient>
        <linearGradient id="evg-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={G3} />
          <stop offset="0.5" stopColor={G1} />
          <stop offset="1" stopColor={G3} />
        </linearGradient>
      </defs>
      {/* the crest: a small gopuram */}
      <g stroke={LINE} strokeWidth="0.8" strokeLinejoin="round">
        <path d="M150 50H250L242 40H158Z" fill="url(#evg-v)" />
        <path d="M160 40H240L233 30H167Z" fill="url(#evg-v)" />
        <path d="M169 30H231L225 21H175Z" fill="url(#evg-v)" />
        <path d="M177 21H223C223 12 212 6 200 6S177 12 177 21Z" fill="url(#evg-v)" />
        {[176, 188, 200, 212, 224].map((x) => (
          <path key={x} d={`M${x} 6.5c-2 0-3 1.5-3 3h6c0-1.5-1-3-3-3Zm0-4.5v4.5`} fill={G1} />
        ))}
        {[164, 178, 192, 208, 222, 236].map((x) => (
          <rect key={x} x={x - 3} y="42" width="6" height="6" rx="1" fill={G3} strokeWidth="0.5" />
        ))}
        {[174, 186, 200, 214, 226].map((x) => (
          <rect key={x} x={x - 2.5} y="32" width="5" height="6" rx="1" fill={G3} strokeWidth="0.5" />
        ))}
      </g>
      {/* the lintel, with a row of carved beads */}
      <rect x="0" y="50" width="400" height="20" fill="url(#evg-v)" stroke={LINE} strokeWidth="0.8" />
      <path d="M0 54H400M0 66H400" stroke={LINE} strokeWidth="0.6" strokeOpacity="0.7" />
      {Array.from({ length: 33 }, (_, i) => (
        <circle key={i} cx={6 + i * 12} cy="60" r="2.4" fill={G1} stroke={LINE} strokeWidth="0.5" />
      ))}
      {/* the capitals over the pillars */}
      {[0, 344].map((x) => (
        <g key={x} stroke={LINE} strokeWidth="0.8">
          <path d={`M${x} 70H${x + 56}V84C${x + 50} 86 ${x + 46} 90 ${x + 46} 96H${x + 10}C${x + 10} 90 ${x + 6} 86 ${x} 84Z`} fill="url(#evg-v)" />
          <rect x={x + 4} y="96" width="48" height="8" fill="url(#evg-h)" />
          <path d={`M${x + 8} 104H${x + 48}L${x + 44} 112H${x + 12}Z`} fill={G2} />
          <circle cx={x + 28} cy="78" r="3.2" fill={G1} />
        </g>
      ))}
      {/* the spandrels and the cusped arch opening */}
      <rect x="56" y="70" width="288" height="80" fill="url(#evg-v)" stroke={LINE} strokeWidth="0.8" />
      <path d="M62 74H338" stroke={LINE} strokeWidth="0.5" strokeOpacity="0.6" />
      {[90, 120, 280, 310].map((x) => (
        <path key={x} d={`M${x} 80c-4 0-6 3-6 6 3-1 5-1 6 1 1-2 3-2 6-1 0-3-2-6-6-6Z`} fill={G1} stroke={LINE} strokeWidth="0.5" />
      ))}
      <path d={arch} fill={IVORY} stroke={LINE} strokeWidth="1.2" />
      <path d={arch} fill="none" stroke={G1} strokeWidth="0.6" transform="translate(0 2.4)" strokeOpacity="0.8" />
    </svg>
  );
}

/** A carved pillar (shaft between the capital above and the base below). */
export function Pillar({ side }: { side: "l" | "r" }) {
  return <span aria-hidden className={`ev-pillar ev-pillar--${side}`} />;
}

/** The stepped pedestal with the pillars' bases and a lotus at the centre. */
export function DoorBase() {
  return (
    <svg viewBox="0 0 400 60" className="ev-door-base" aria-hidden>
      <defs>
        <linearGradient id="evb-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G1} />
          <stop offset="1" stopColor={G3} />
        </linearGradient>
      </defs>
      <g stroke={LINE} strokeWidth="0.8">
        {[0, 344].map((x) => (
          <g key={x}>
            <path d={`M${x + 4} 0H${x + 52}L${x + 54} 10H${x + 2}Z`} fill={G2} />
            <rect x={x} y="10" width="56" height="14" fill="url(#evb-v)" />
          </g>
        ))}
        <rect x="-6" y="24" width="412" height="14" rx="2" fill="url(#evb-v)" />
        <rect x="-16" y="38" width="432" height="16" rx="2" fill="url(#evb-v)" />
        <path d="M-4 31H404M-14 46H414" strokeOpacity="0.5" strokeWidth="0.6" />
      </g>
      {/* the lotus on the step */}
      <g transform="translate(200 24)" stroke={LINE} strokeWidth="0.7">
        <path d="M0-20C6-13 6-5 0 2-6-5-6-13 0-20Z" fill={G1} />
        <path d="M-2 1C-12 0-17-6-18-14-10-12-4-7-2 1Z" fill={G2} />
        <path d="M2 1C12 0 17-6 18-14 10-12 4-7 2 1Z" fill={G2} />
        <path d="M-20 2C-10 5 10 5 20 2" fill="none" />
      </g>
    </svg>
  );
}

/* ── Each event's own ornaments ─────────────────────────────────────── */

const svgBox = (cls: string, vb: string, children: ReactNode) => (
  <svg viewBox={vb} className={cls} aria-hidden>
    {children}
  </svg>
);

/** A turmeric bowl with a little heap of turmeric and a flower (Nalangu). */
const TurmericBowl = (cls: string) =>
  svgBox(
    cls,
    "-24 -18 48 30",
    <g stroke="#7a5418" strokeWidth="0.8">
      <path d="M-14-4C-14 4-8 10 0 10S14 4 14-4Z" fill="#c49a4a" />
      <ellipse cy="-4" rx="14" ry="3.6" fill="#e3c172" />
      <path d="M-10-5C-6-11 6-11 10-5Z" fill="#f2b81a" />
      <circle cx="9" cy="-9" r="3.2" fill="#f6efe2" />
      <circle cx="9" cy="-9" r="1.2" fill="#e8a317" />
    </g>,
  );

/** A banana leaf rising beside a pillar (Nalangu). */
const BananaLeaf = (cls: string) =>
  svgBox(
    cls,
    "0 0 40 120",
    <g>
      <path d="M20 120C18 80 4 52 6 20 8 6 16 0 20 0 28 8 36 30 34 62 32 88 24 104 20 120Z" fill="#4e7a3c" />
      <path d="M20 118C20 80 18 40 20 2" stroke="#2f5a26" strokeWidth="1.2" fill="none" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M20 ${16 + i * 11}C14 ${12 + i * 11} 10 ${14 + i * 11} 7 ${18 + i * 11}M20 ${16 + i * 11}C26 ${12 + i * 11} 30 ${14 + i * 11} 33 ${18 + i * 11}`} stroke="#6f9e52" strokeWidth="0.7" fill="none" />
      ))}
    </g>,
  );

/** A small dotted kolam (Nalangu). */
const Kolam = (cls: string) =>
  svgBox(
    cls,
    "-30 -30 60 60",
    <g fill="none" stroke="#c49a4a" strokeWidth="1.1">
      {[-14, 0, 14].flatMap((x) => [-14, 0, 14].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="#c49a4a" stroke="none" />))}
      <path d="M-21 0C-21-12-12-21 0-21S21-12 21 0 12 21 0 21-21 12-21 0Z" />
      <path d="M-7-7C-7-14 7-14 7-7S14 7 7 7-7 14-7 7-14-7-7-7Z" />
    </g>,
  );

/** A henna-style line flourish (Mehendi). */
const HennaVine = (cls: string) =>
  svgBox(
    cls,
    "0 0 30 160",
    <g fill="none" stroke="#2f6b3a" strokeWidth="1.1" strokeLinecap="round">
      <path d="M15 158C6 130 24 110 15 80S6 30 15 2" />
      {Array.from({ length: 7 }, (_, i) => {
        const y = 18 + i * 20;
        const s = i % 2 ? 1 : -1;
        return (
          <g key={i}>
            <path d={`M15 ${y}c${6 * s} -2 ${10 * s} -8 ${8 * s} -13 c${-4 * s} 2 ${-7 * s} 6 ${-8 * s} 13Z`} fill="#2f6b3a" fillOpacity="0.18" />
            <circle cx={15 - 6 * s} cy={y + 6} r="1.4" fill="#e3c172" stroke="none" />
          </g>
        );
      })}
    </g>,
  );

/** A henna mandala (Mehendi). */
const HennaMandala = (cls: string) =>
  svgBox(
    cls,
    "-26 -26 52 52",
    <g fill="none" stroke="#2f6b3a" strokeWidth="1">
      <circle r="4" fill="#e3c172" />
      <circle r="9" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M0-10C4-14 4-20 0-24-4-20-4-14 0-10Z" transform={`rotate(${i * 30})`} fill={i % 2 ? "#2f6b3a" : "none"} fillOpacity="0.2" />
      ))}
    </g>,
  );

/** A festoon of little gold and maroon pennants across the arch (Sangeet). */
const Festoon = (cls: string) =>
  svgBox(
    cls,
    "0 0 300 34",
    <g>
      <path d="M2 4C80 26 220 26 298 4" fill="none" stroke="#8f6726" strokeWidth="1.2" />
      {Array.from({ length: 13 }, (_, i) => {
        const t = (i + 0.5) / 13;
        const x = 2 + t * 296;
        const y = 4 + Math.sin(t * Math.PI) * 15.5;
        return <path key={i} d={`M${x - 6} ${y}H${x + 6}L${x} ${y + 12}Z`} fill={i % 2 ? "#c49a4a" : "#7a1f2b"} stroke="#5e1220" strokeWidth="0.5" />;
      })}
    </g>,
  );

/** A veena-inspired ornament: the music of the evening (Sangeet). */
const Veena = (cls: string) =>
  svgBox(
    cls,
    "-40 -14 80 28",
    <g stroke="#7a1f2b" strokeWidth="1" fill="none">
      <circle cx="-26" cy="2" r="9" fill="#c49a4a" fillOpacity="0.35" />
      <circle cx="26" cy="2" r="6" fill="#c49a4a" fillOpacity="0.35" />
      <path d="M-18 0H22M-18 3H22" />
      <path d="M30-2C34-8 38-8 38-2" />
      {[-10, -2, 6, 14].map((x) => (
        <path key={x} d={`M${x} -2V5`} strokeWidth="0.6" />
      ))}
    </g>,
  );

/** A brass kuthuvilakku with its flame (Muhurtham). */
const Kuthuvilakku = (cls: string) =>
  svgBox(
    cls,
    "-20 -60 40 100",
    <g stroke="#6e4c1a" strokeWidth="0.8">
      <path d="M0-58C3-53 3-49 0-46-3-49-3-53 0-58Z" fill="#f6b532" stroke="#e07a12" />
      <path d="M-14-42H14L10-36H-10Z" fill="#e3c172" />
      <path d="M-3-44H3V-36H-3ZM-2-36H2V20H-2Z" fill="#c49a4a" />
      {[-24, -8, 6].map((y) => (
        <ellipse key={y} cy={y} rx="5" ry="2" fill="#e3c172" />
      ))}
      <path d="M-12 20H12L16 30H-16Z" fill="#c49a4a" />
      <path d="M-18 30H18V36H-18Z" fill="#8f6726" />
    </g>,
  );

/** A jasmine garland hanging from an arch corner, a red rose at the end (Muhurtham). */
const Jasmine = (cls: string) =>
  svgBox(
    cls,
    "0 0 20 120",
    <g>
      <path d="M10 0V108" stroke="#6c8f3c" strokeWidth="0.8" />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx="10" cy={6 + i * 7.4} rx="3.4" ry="4.2" fill="#fffdf4" stroke="#d9cfb6" strokeWidth="0.6" />
      ))}
      <circle cx="10" cy="112" r="5" fill="#b3262e" stroke="#7a1820" strokeWidth="0.7" />
    </g>,
  );

/** A small sacred kumkum dot in a gold ring (Muhurtham). */
const Kumkum = (cls: string) =>
  svgBox(
    cls,
    "-14 -14 28 28",
    <g>
      <circle r="11" fill="none" stroke="#c49a4a" strokeWidth="1" />
      <circle r="5" fill="#b3262e" />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx="0" cy="-11" r="1.4" fill="#e3c172" transform={`rotate(${i * 45})`} />
      ))}
    </g>,
  );

/** A low arrangement of roses, jasmine and leaves in a gold urn (Reception). */
const Bouquet = (cls: string) =>
  svgBox(
    cls,
    "-40 -40 80 70",
    <g stroke="#5e1220" strokeWidth="0.5">
      {[-24, 22, -8, 10].map((x, i) => (
        <path key={i} d={`M${x} -2C${x - 8} -14 ${x - 2} -24 ${x + 4} -26C${x + 6} -16 ${x + 4} -8 ${x} -2Z`} fill="#4e7a3c" />
      ))}
      {[
        [-14, -14, "#6d1a2c"],
        [0, -22, "#a33a4d"],
        [14, -14, "#6d1a2c"],
        [-6, -6, "#d8c08f"],
        [8, -6, "#f6efe2"],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="7" fill={c as string} />
      ))}
      <path d="M-18 0H18L13 22H-13Z" fill="#d8c08f" stroke="#8f6726" />
      <path d="M-20 0H20" stroke="#8f6726" strokeWidth="1.4" />
    </g>,
  );

/** A refined gold border flourish (Reception). */
const Flourish = (cls: string) =>
  svgBox(
    cls,
    "0 0 200 20",
    <g fill="none" stroke="#c49a4a" strokeWidth="1.1" strokeLinecap="round">
      <path d="M4 10C30 2 60 18 86 10 92 8 96 4 100 4S108 8 114 10C140 18 170 2 196 10" />
      <circle cx="100" cy="10" r="3" fill="#6d1a2c" stroke="none" />
    </g>,
  );

/**
 * Each event's ornaments, all drawn at once and shown by theme, so they fade
 * from one event to the next while the doorway stays.
 */
export function ThemeDecor({ theme, active }: { theme: EventTheme; active: boolean }) {
  const on = `ev-decor ev-decor--${theme} ${active ? "is-on" : ""}`;
  switch (theme) {
    case "nalangu":
      return (
        <div aria-hidden className={on}>
          {BananaLeaf("ev-d ev-d-leaf ev-d-leaf--l")}
          {BananaLeaf("ev-d ev-d-leaf ev-d-leaf--r")}
          {TurmericBowl("ev-d ev-d-crown")}
          {TurmericBowl("ev-d ev-d-foot ev-d-foot--l")}
          {TurmericBowl("ev-d ev-d-foot ev-d-foot--r")}
          {Kolam("ev-d ev-d-kolam")}
        </div>
      );
    case "mehendi":
      return (
        <div aria-hidden className={on}>
          {HennaVine("ev-d ev-d-vine ev-d-vine--l")}
          {HennaVine("ev-d ev-d-vine ev-d-vine--r")}
          {HennaMandala("ev-d ev-d-crown")}
          {HennaMandala("ev-d ev-d-kolam")}
        </div>
      );
    case "sangeet":
      return (
        <div aria-hidden className={on}>
          {Festoon("ev-d ev-d-festoon")}
          {Veena("ev-d ev-d-crown ev-d-crown--wide")}
          {Veena("ev-d ev-d-kolam ev-d-kolam--wide")}
        </div>
      );
    case "reception":
      return (
        <div aria-hidden className={on}>
          {Bouquet("ev-d ev-d-foot ev-d-foot--l ev-d-foot--big")}
          {Bouquet("ev-d ev-d-foot ev-d-foot--r ev-d-foot--big")}
          {Flourish("ev-d ev-d-crown ev-d-crown--wide")}
          {Flourish("ev-d ev-d-kolam ev-d-kolam--wide")}
        </div>
      );
    default: // muhurtham: the most sacred and calm
      return (
        <div aria-hidden className={on}>
          {Jasmine("ev-d ev-d-jasmine ev-d-jasmine--l")}
          {Jasmine("ev-d ev-d-jasmine ev-d-jasmine--r")}
          {Kuthuvilakku("ev-d ev-d-lamp ev-d-lamp--l")}
          {Kuthuvilakku("ev-d ev-d-lamp ev-d-lamp--r")}
          {Kumkum("ev-d ev-d-crown")}
          {Kumkum("ev-d ev-d-kolam")}
        </div>
      );
  }
}
