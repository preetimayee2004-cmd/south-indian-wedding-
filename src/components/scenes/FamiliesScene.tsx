import { useLayoutEffect, useRef } from "react";
import type { FamilySide } from "@/config/types";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type Key = "bride" | "groom";

/** Traditional South Indian temple crest (Gopuram / Vimana) */
function GopuramCrest() {
  return (
    <svg viewBox="0 0 160 52" className="fam-gopuram-crest" aria-hidden>
      <path d="M12 50 L148 50 L140 37 L20 37 Z" fill="#d4a753" stroke="#7a5418" strokeWidth="1" />
      <path d="M28 37 L132 37 L122 23 L38 23 Z" fill="#b8893e" stroke="#7a5418" strokeWidth="1" />
      <path d="M46 23 L114 23 L104 11 L56 11 Z" fill="#d4a753" stroke="#7a5418" strokeWidth="1" />
      <path d="M64 11 L96 11 L88 3 L72 3 Z" fill="#ffd98a" stroke="#7a5418" strokeWidth="1" />
      <circle cx="80" cy="3" r="3.2" fill="#ffd98a" stroke="#7a5418" strokeWidth="0.8" />
      <circle cx="68" cy="5" r="2.4" fill="#ffd98a" stroke="#7a5418" strokeWidth="0.8" />
      <circle cx="92" cy="5" r="2.4" fill="#ffd98a" stroke="#7a5418" strokeWidth="0.8" />
    </svg>
  );
}

/** Hanging brass temple bell */
function TempleBell() {
  return (
    <div className="fam-bell-wrap" aria-hidden>
      <span className="fam-bell-chain" />
      <svg viewBox="0 0 24 36" className="fam-bell">
        <path d="M7 16 C7 10 17 10 17 16 L19 24 L5 24 Z" fill="#d4a753" stroke="#7a5418" strokeWidth="1" />
        <ellipse cx="12" cy="24" rx="7" ry="2.2" fill="#b8893e" stroke="#7a5418" strokeWidth="0.8" />
        <circle cx="12" cy="27" r="2.2" fill="#ffd98a" stroke="#7a5418" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

/** Traditional Kolam / Rangoli between arches */
function CenterKolam() {
  return (
    <div className="fam-kolam-container" aria-hidden>
      <svg viewBox="0 0 100 130" className="fam-kolam-svg">
        <g fill="none" stroke="#f6dfa9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          <path d="M50 10 L68 28 L50 46 L32 28 Z" />
          <path d="M50 46 L68 64 L50 82 L32 64 Z" />
          <path d="M50 82 L68 100 L50 118 L32 100 Z" />
          <path d="M32 28 L14 46 L32 64 L50 46 Z" />
          <path d="M68 28 L86 46 L68 64 L50 46 Z" />
          <path d="M32 64 L14 82 L32 100 L50 82 Z" />
          <path d="M68 64 L86 82 L68 100 L50 82 Z" />
          <circle cx="50" cy="28" r="2.2" fill="#f6dfa9" />
          <circle cx="50" cy="64" r="2.2" fill="#f6dfa9" />
          <circle cx="50" cy="100" r="2.2" fill="#f6dfa9" />
          <circle cx="32" cy="46" r="2.2" fill="#f6dfa9" />
          <circle cx="68" cy="46" r="2.2" fill="#f6dfa9" />
          <circle cx="32" cy="82" r="2.2" fill="#f6dfa9" />
          <circle cx="68" cy="82" r="2.2" fill="#f6dfa9" />
        </g>
      </svg>
    </div>
  );
}

/** Standing Brass Deepam (Kuthuvilakku) */
function StandingDeepam({ side }: { side: "left" | "right" }) {
  return (
    <div className={`fam-standing-deepam fam-standing-deepam--${side}`} aria-hidden>
      <svg viewBox="0 0 60 220" className="fam-deepam-svg">
        <ellipse cx="30" cy="208" rx="26" ry="7" fill="#b8893e" stroke="#7a5418" strokeWidth="1" />
        <path d="M12 207 C12 198 22 194 30 194 C38 194 48 198 48 207 Z" fill="#d4a753" stroke="#7a5418" strokeWidth="0.8" />
        <rect x="27" y="65" width="6" height="130" rx="1.5" fill="#e5b85a" stroke="#7a5418" strokeWidth="0.8" />
        <circle cx="30" cy="140" r="7.5" fill="#b8893e" stroke="#7a5418" strokeWidth="0.8" />
        <circle cx="30" cy="95" r="8.5" fill="#b8893e" stroke="#7a5418" strokeWidth="0.8" />
        <ellipse cx="30" cy="58" rx="22" ry="6" fill="#d4a753" stroke="#7a5418" strokeWidth="1" />
        <ellipse cx="30" cy="56" rx="19" ry="4.5" fill="#ffd98a" />
        <path d="M30 42 C32 48 32 52 30 55 C28 52 28 48 30 42 Z" fill="#ff7a18" className="fam-oil-flame" />
        <path d="M30 45 C31 49 31 52 30 54 C29 52 29 49 30 45 Z" fill="#ffea78" />
        <path d="M13 46 C15 50 15 53 13 56 C11 53 11 50 13 46 Z" fill="#ff7a18" className="fam-oil-flame" />
        <path d="M47 46 C49 50 49 53 47 56 C45 53 45 50 47 46 Z" fill="#ff7a18" className="fam-oil-flame" />
        <path d="M30 56 L30 36 C30 28 37 22 30 15 C23 22 30 28 30 36 Z" fill="#d4a753" stroke="#7a5418" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

/** One Family Arch Pavilion */
function FamilyArch({
  sideKey,
  data,
  photoSrc,
}: {
  sideKey: Key;
  data: FamilySide;
  photoSrc: string;
}) {
  const isBride = sideKey === "bride";
  const badgeText = isBride ? "BRIDE'S SIDE" : "GROOM'S SIDE";

  return (
    <div data-reveal className="fam-arch-card">
      {/* Arch Crown */}
      <div className="fam-arch-head">
        <GopuramCrest />
        <TempleBell />
      </div>

      {/* Arched Photo Window */}
      <div className="fam-arch-frame">
        <div className="fam-photo-wrapper">
          <img
            src={photoSrc}
            alt={data.title}
            className="fam-photo-img"
            loading="lazy"
            decoding="async"
          />
          <div className="fam-photo-glow" />
        </div>
      </div>

      {/* Under Arch Details ("arch ke niche details") */}
      <div className="fam-under-arch">
        <div className="fam-side-badge">{badgeText}</div>
        <h3 className="fam-side-heading">{data.title}</h3>
        {data.message && <p className="fam-side-quote">“{data.message}”</p>}

        <div className="fam-members-box">
          {data.members.map((m) => (
            <div key={m.name} className="fam-member-card">
              <span className="fam-m-name">{m.name}</span>
              <span className="fam-m-rel">{m.relation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FamiliesScene() {
  const { family, couple } = useWedding();
  const reduced = usePrefersReducedMotion();
  const order: Key[] = couple.order === "bride-first" ? ["bride", "groom"] : ["groom", "bride"];
  const sides = order.filter((k) => family?.[k]);
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.95,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }),
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!sides.length) return null;

  const brideData = family?.bride;
  const groomData = family?.groom;

  return (
    <section
      ref={root}
      id="family"
      aria-labelledby="family-heading"
      className="fam-section relative overflow-hidden"
    >
      {/* Top Toran / Marigold Garland */}
      <div aria-hidden className="fam-top-toran">
        <div className="fam-toran-garland" />
      </div>

      {/* Flanking Standing Lamps (on wide screens) */}
      <StandingDeepam side="left" />
      <StandingDeepam side="right" />

      <div className="fam-container relative mx-auto px-4 py-16 sm:py-24">
        {/* Upper space under the arch canopy: Heading */}
        <div className="fam-header text-center" data-reveal>
          <p className="fam-invocation">॥ परिवार से मिलिए ॥</p>
          <h2 id="family-heading" className="fam-main-title">
            Meet the <span className="fam-highlight">Bride &amp; Groom&apos;s</span> Family
          </h2>
          <p className="fam-subtitle">
            Two families, one bond · Blessed by our elders, united by love
          </p>
          <div className="fam-header-divider" aria-hidden>
            <span className="iv-divider-line iv-divider-line--l" />
            <svg viewBox="-20 -14 40 24" className="fam-lotus-icon">
              <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
              <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
              <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
            </svg>
            <span className="iv-divider-line iv-divider-line--r" />
          </div>
        </div>

        {/* The Two Arches Pavilion: Left Arch (Bride) & Right Arch (Groom) */}
        <div className="fam-arches-grid">
          {brideData && (
            <FamilyArch
              sideKey="bride"
              data={brideData}
              photoSrc="/media/bride-family.jpg"
            />
          )}

          {/* Kolam / Rangoli between the two arches */}
          <CenterKolam />

          {groomData && (
            <FamilyArch
              sideKey="groom"
              data={groomData}
              photoSrc="/media/groom-family.jpg"
            />
          )}
        </div>
      </div>
    </section>
  );
}
