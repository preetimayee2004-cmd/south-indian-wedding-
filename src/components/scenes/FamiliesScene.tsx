import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";

/** Slow falling jasmine and marigold petals */
function FallingPetals() {
  const petals = [
    { left: "8%", delay: "0s", duration: "11s", size: "14px", type: "jasmine" },
    { left: "22%", delay: "4s", duration: "13s", size: "18px", type: "marigold" },
    { left: "38%", delay: "2s", duration: "12s", size: "15px", type: "jasmine" },
    { left: "54%", delay: "6s", duration: "14s", size: "19px", type: "marigold" },
    { left: "70%", delay: "1.5s", duration: "11.5s", size: "16px", type: "jasmine" },
    { left: "84%", delay: "5s", duration: "13.5s", size: "20px", type: "marigold" },
    { left: "92%", delay: "3s", duration: "12.5s", size: "14px", type: "jasmine" },
  ];

  return (
    <div className="fam-petals-wrap" aria-hidden="true">
      {petals.map((p, idx) => (
        <span
          key={idx}
          className={`fam-falling-petal ${p.type === "marigold" ? "petal-marigold" : "petal-jasmine"}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

/** Traditional hanging brass wall lantern with vertical hanging gold chain and slow sway */
function HangingLamp({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div className={`fam-chain-lamp ${isLeft ? "fam-chain-lamp-l" : "fam-chain-lamp-r"}`} aria-hidden="true">
      {/* Thin hanging gold chain links */}
      <div className="fam-gold-chain" />
      <div className="fam-lamp-sway">
        <svg viewBox="0 0 54 84" className="fam-lamp-svg">
          <defs>
            <radialGradient id={`lamp-glow-${side}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffea78" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ff9a28" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff9a28" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Top finial & cap */}
          <line x1="27" y1="0" x2="27" y2="10" stroke="#d4a753" strokeWidth="2.5" />
          <ellipse cx="27" cy="11" rx="11" ry="4" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
          <path d="M16 11 L12 28 L42 28 L38 11 Z" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
          {/* Glass body with warm flame */}
          <path d="M12 28 L16 56 L38 56 L42 28 Z" fill="rgba(255, 235, 170, 0.28)" stroke="#d4a753" strokeWidth="1" />
          <ellipse cx="27" cy="56" rx="12" ry="3.5" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
          <circle cx="27" cy="63" r="3.2" fill="#ffd98a" stroke="#8a6420" strokeWidth="0.8" />
          {/* Flame & Glow */}
          <circle cx="27" cy="42" r="9" fill={`url(#lamp-glow-${side})`} />
          <path d="M27 34 C29 39 29 44 27 47 C25 44 25 39 27 34 Z" fill="#ff7a18" />
          <path d="M27 37 C28 40 28 43 27 45 C26 43 26 40 27 37 Z" fill="#fff6c8" />
        </svg>
      </div>
    </div>
  );
}

/** Draped Marigold Garland across the top curve of each arch */
function ArchGarland() {
  return (
    <div className="fam-garland-wrap" aria-hidden="true">
      <svg viewBox="0 0 260 70" className="fam-garland-svg" preserveAspectRatio="none">
        <defs>
          <radialGradient id="mari-gold" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="45%" stopColor="#fbc02d" />
            <stop offset="100%" stopColor="#f57f17" />
          </radialGradient>
          <radialGradient id="mari-orange" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#ffb74d" />
            <stop offset="50%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#e65100" />
          </radialGradient>
        </defs>
        {/* Supporting catenary thread */}
        <path d="M15 15 Q 130 68 245 15" fill="none" stroke="#2e6930" strokeWidth="2.5" />
        {/* Mango Leaves on sides */}
        <path d="M12 16 Q 6 32 15 36 Q 22 26 18 16 Z" fill="#2d7334" />
        <path d="M248 16 Q 254 32 245 36 Q 238 26 242 16 Z" fill="#2d7334" />
        {/* Marigold blooms strung along curve */}
        {[
          { cx: 22, cy: 19, r: 8.5, g: "mari-orange" },
          { cx: 42, cy: 29, r: 8.5, g: "mari-gold" },
          { cx: 64, cy: 38, r: 9, g: "mari-orange" },
          { cx: 88, cy: 45, r: 9.5, g: "mari-gold" },
          { cx: 114, cy: 50, r: 10, g: "mari-orange" },
          { cx: 130, cy: 51, r: 10.5, g: "mari-gold" },
          { cx: 146, cy: 50, r: 10, g: "mari-orange" },
          { cx: 172, cy: 45, r: 9.5, g: "mari-gold" },
          { cx: 196, cy: 38, r: 9, g: "mari-orange" },
          { cx: 218, cy: 29, r: 8.5, g: "mari-gold" },
          { cx: 238, cy: 19, r: 8.5, g: "mari-orange" },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.cx} cy={m.cy} r={m.r} fill={`url(#${m.g})`} stroke="#bf360c" strokeWidth="0.4" />
            <circle cx={m.cx} cy={m.cy} r={m.r * 0.55} fill="#ffe082" opacity="0.6" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Flickering Brass Oil Diya */
function FlickeringDiya() {
  return (
    <div className="fam-diya" aria-hidden="true">
      <div className="fam-diya-flame-wrap">
        <span className="fam-diya-flame" />
        <span className="fam-diya-glow" />
      </div>
      <svg viewBox="0 0 36 20" className="fam-diya-bowl">
        <path d="M4 8 Q 18 19 32 8 Q 30 14 18 16 Q 6 14 4 8 Z" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
        <ellipse cx="18" cy="8" rx="14" ry="4" fill="#a67c2e" stroke="#8a6420" strokeWidth="0.8" />
        <ellipse cx="18" cy="7.5" rx="12" ry="3" fill="#664614" />
      </svg>
    </div>
  );
}

/** Center Kalasam / Kolam Medallion flanked by two flickering Diyas */
function CenterMedallion() {
  return (
    <div className="fam-center-divider" aria-hidden="true">
      <div className="fam-medallion-assembly">
        <FlickeringDiya />
        <div className="fam-kalasam-wrap">
          {/* Ornate Gold Filigree / Kolam Halo Ring */}
          <div className="fam-kolam-ring" />
          <img
            src="/media/kalash.webp"
            alt="Sacred Kalasam"
            className="fam-kalasam-img"
            draggable={false}
          />
        </div>
        <FlickeringDiya />
      </div>
    </div>
  );
}

export function FamiliesScene() {
  const { family } = useWedding();
  const bride = family?.bride;
  const groom = family?.groom;

  // Toggle state to expand arch on tap/click or hover
  const [expanded, setExpanded] = useState<"bride" | "groom" | null>(null);

  const toggleExpand = (arch: "bride" | "groom") => {
    setExpanded((curr) => (curr === arch ? null : arch));
  };

  return (
    <section className="pg5" id="family" aria-labelledby="p5title">
      {/* Background Soft Gold Radial Glow behind the section */}
      <div className="fam-bg-glow" aria-hidden="true" />

      {/* Gentle falling jasmine and marigold petals */}
      <FallingPetals />

      {/* Swaying hanging lanterns with vertical gold chains */}
      <HangingLamp side="left" />
      <HangingLamp side="right" />

      {/* Header Plaque: "Our Families" (script) + Tamil subtitle "எங்கள் குடும்பங்கள்" (Noto Serif Tamil) */}
      <header className="p5-head">
        <p className="p5-ta-subtitle" lang="ta">
          எங்கள் குடும்பங்கள்
        </p>
        <h2 className="p5-title" id="p5title">
          <span className="p5-script-title">Our Families</span>
        </h2>
        <div className="p5-orn" aria-hidden="true">
          <i />
          <svg viewBox="-20 -14 40 24" aria-hidden="true">
            <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
            <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
            <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
          </svg>
          <i />
        </div>
      </header>

      {/* The Two Temple Arch Frames Showcase */}
      <div className="fam-showcase">
        {/* Bride's Family Arch */}
        {bride && (
          <article
            className={`fam-card fam-card-left ${expanded === "bride" ? "is-expanded" : ""}`}
            onClick={() => toggleExpand("bride")}
          >
            <div className="fam-arch-wrap">
              {/* Soft radial gold glow behind the arch */}
              <div className="fam-arch-glow" aria-hidden="true" />

              {/* Photo inside arch cutout with curtain reveal & shimmer */}
              <div className="fam-photo-frame">
                <img
                  src="/media/bride-family.jpg"
                  alt="The Bride's Family"
                  className="fam-photo"
                  loading="lazy"
                  decoding="async"
                />
                <div className="fam-photo-shimmer" aria-hidden="true" />
              </div>

              {/* Ornate Golden Temple Arch Frame Overlay */}
              <img
                src="/media/temple-arch-frame.webp"
                alt=""
                aria-hidden="true"
                className="fam-arch-img"
                draggable={false}
              />

              {/* Draped Marigold Garland swinging gently */}
              <ArchGarland />
            </div>

            {/* Hanging Gold Nameplate Plaque Under Arch */}
            <div className="fam-nameplate-assembly">
              <div className="fam-nameplate-chains" aria-hidden="true">
                <span className="fam-mini-chain" />
                <span className="fam-mini-chain" />
              </div>

              <div className="fam-nameplate">
                <span className="fam-nameplate-badge">Bride&apos;s Family</span>
                <h3 className="fam-parents-title">
                  Shri Sundaram &amp; Smt. Lakshmi Sundaram
                </h3>
                <p className="fam-blessing-ta" lang="ta">
                  &ldquo;இரு மனங்கள் இணையும் இல்லறம் சிறக்க வாழ்த்துகிறோம்&rdquo;
                </p>

                {/* Expanded Family Details (Tapped or Hovered) */}
                <div className="fam-expanded-drawer">
                  <div className="fam-sub-family">
                    <p className="fam-kin">
                      <span>Ravi Sundaram <small>(Brother)</small></span>
                      <span className="fam-dot">·</span>
                      <span>Smt. Janaki <small>(Grandmother)</small></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Center: Ornate Kalasam / Kolam Medallion with Flickering Diyas */}
        <CenterMedallion />

        {/* Groom's Family Arch */}
        {groom && (
          <article
            className={`fam-card fam-card-right ${expanded === "groom" ? "is-expanded" : ""}`}
            onClick={() => toggleExpand("groom")}
          >
            <div className="fam-arch-wrap">
              {/* Soft radial gold glow behind the arch */}
              <div className="fam-arch-glow" aria-hidden="true" />

              {/* Photo inside arch cutout with curtain reveal & shimmer */}
              <div className="fam-photo-frame">
                <img
                  src="/media/groom-family.jpg"
                  alt="The Groom's Family"
                  className="fam-photo"
                  loading="lazy"
                  decoding="async"
                />
                <div className="fam-photo-shimmer" aria-hidden="true" />
              </div>

              {/* Ornate Golden Temple Arch Frame Overlay */}
              <img
                src="/media/temple-arch-frame.webp"
                alt=""
                aria-hidden="true"
                className="fam-arch-img"
                draggable={false}
              />

              {/* Draped Marigold Garland swinging gently */}
              <ArchGarland />
            </div>

            {/* Hanging Gold Nameplate Plaque Under Arch */}
            <div className="fam-nameplate-assembly">
              <div className="fam-nameplate-chains" aria-hidden="true">
                <span className="fam-mini-chain" />
                <span className="fam-mini-chain" />
              </div>

              <div className="fam-nameplate">
                <span className="fam-nameplate-badge">Groom&apos;s Family</span>
                <h3 className="fam-parents-title">
                  Shri Raghavan &amp; Smt. Kamala Raghavan
                </h3>
                <p className="fam-blessing-ta" lang="ta">
                  &ldquo;இல்லற வாழ்வில் அன்பும் அமைதியும் நிலவ வாழ்த்துகிறோம்&rdquo;
                </p>

                {/* Expanded Family Details (Tapped or Hovered) */}
                <div className="fam-expanded-drawer">
                  <div className="fam-sub-family">
                    <p className="fam-kin">
                      <span>Divya Raghavan <small>(Sister)</small></span>
                      <span className="fam-dot">·</span>
                      <span>Shri Venkataraman <small>(Grandfather)</small></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Decorative Gold Stripe Separator at Section Base */}
      <div className="gold-stripe-separator" aria-hidden="true" />
    </section>
  );
}
