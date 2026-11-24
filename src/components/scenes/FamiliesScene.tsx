import { useWedding } from "@/context/WeddingContext";

/** Traditional hanging wall lantern with swaying animation */
function HangingLamp({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div className={`p5-lamp ${isLeft ? "p5-lamp-l" : ""}`} aria-hidden="true">
      <div className="p5-lamp-inner">
        <svg viewBox="0 0 70 120" className="p5-arm-svg">
          <path d="M4 12 L46 12 C52 12 54 16 54 22 L54 36" fill="none" stroke="#d4a753" strokeWidth="2.5" />
          <path d="M4 28 C26 28 46 38 50 48" fill="none" stroke="#8a6420" strokeWidth="1.6" />
          <circle cx="5" cy="12" r="3.2" fill="#ffd98a" />
          <circle cx="5" cy="28" r="2.6" fill="#ffd98a" />
          <line x1="54" y1="36" x2="54" y2="52" stroke="#d4a753" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
        <div className="p5-lan-svg-wrap">
          <svg viewBox="0 0 50 72" className="p5-lan-svg">
            <defs>
              <radialGradient id="lamp-flame-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffea78" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ff9a28" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff9a28" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="7" rx="10" ry="3.5" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
            <path d="M15 7 L11 26 L39 26 L35 7 Z" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
            <path d="M11 26 L15 54 L35 54 L39 26 Z" fill="rgba(255, 235, 170, 0.28)" stroke="#d4a753" strokeWidth="1" />
            <ellipse cx="25" cy="54" rx="11" ry="3.2" fill="#b8893e" stroke="#8a6420" strokeWidth="0.8" />
            <circle cx="25" cy="61" r="3.2" fill="#ffd98a" stroke="#8a6420" strokeWidth="0.8" />
            <circle cx="25" cy="40" r="8" fill="url(#lamp-flame-glow)" />
            <path d="M25 33 C27 38 27 42 25 45 C23 42 23 38 25 33 Z" fill="#ff7a18" />
            <path d="M25 36 C26 39 26 41 25 43 C24 41 24 39 25 36 Z" fill="#fff6c8" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function FamiliesScene() {
  const { family } = useWedding();
  const bride = family?.bride;
  const groom = family?.groom;

  return (
    <section className="pg5" id="family" aria-labelledby="p5title">
      {/* Ornate Gold Filigree Corners */}
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-tl" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-tr" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-bl" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-br" draggable={false} />

      <HangingLamp side="left" />
      <HangingLamp side="right" />

      {/* Header Plaque on deep maroon/brown background */}
      <header className="p5-head">
        <p className="p5-hi" lang="hi">॥ परिवार से मिलिए ॥</p>
        <h2 className="p5-title" id="p5title">
          <span className="p5-t1">Meet the</span>
          <span className="p5-t2">Bride &amp; Groom</span>
          <span className="p5-t3">Family</span>
        </h2>
        <div className="p5-orn" aria-hidden="true">
          <i></i>
          <svg viewBox="-20 -14 40 24" aria-hidden="true">
            <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
            <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
            <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
          </svg>
          <i></i>
        </div>
      </header>

      {/* The Two Temple Arch Frames Showcase */}
      <div className="fam-showcase">
        {/* Bride's Family */}
        {bride && (
          <article className="fam-card">
            <div className="fam-arch-wrap">
              {/* Photo inside arch cutout */}
              <div className="fam-photo-frame">
                <img
                  src="/media/bride-family.jpg"
                  alt="The Bride's Family"
                  className="fam-photo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Ornate Golden Temple Arch Frame Overlay */}
              <img
                src="/media/temple-arch-frame.webp"
                alt=""
                aria-hidden="true"
                className="fam-arch-img"
                draggable={false}
              />
            </div>

            {/* Decorative Names & Details Underneath */}
            <div className="fam-details">
              <div className="fam-badge-wrap">
                <span className="fam-badge">The Bride&apos;s Family</span>
              </div>

              <div className="fam-names-block">
                <div className="fam-parent">
                  <h3 className="fam-name">Shri Sundaram</h3>
                  <p className="fam-role">Father of the Bride</p>
                </div>

                <div className="fam-amp" aria-hidden="true">
                  <span className="fam-amp-line" />
                  <span className="fam-amp-symbol">&amp;</span>
                  <span className="fam-amp-line" />
                </div>

                <div className="fam-parent">
                  <h3 className="fam-name">Smt. Lakshmi Sundaram</h3>
                  <p className="fam-role">Mother of the Bride</p>
                </div>
              </div>

              <div className="fam-sub-family">
                <p className="fam-kin">
                  <span>Ravi Sundaram <small>(Brother)</small></span>
                  <span className="fam-dot">·</span>
                  <span>Smt. Janaki <small>(Grandmother)</small></span>
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Center Divider */}
        <div className="fam-center-divider" aria-hidden="true">
          <span className="fam-v-line" />
          <svg viewBox="-20 -14 40 24" className="fam-v-lotus">
            <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
            <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
            <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
          </svg>
          <span className="fam-v-line" />
        </div>

        {/* Groom's Family */}
        {groom && (
          <article className="fam-card">
            <div className="fam-arch-wrap">
              {/* Photo inside arch cutout */}
              <div className="fam-photo-frame">
                <img
                  src="/media/groom-family.jpg"
                  alt="The Groom's Family"
                  className="fam-photo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Ornate Golden Temple Arch Frame Overlay */}
              <img
                src="/media/temple-arch-frame.webp"
                alt=""
                aria-hidden="true"
                className="fam-arch-img"
                draggable={false}
              />
            </div>

            {/* Decorative Names & Details Underneath */}
            <div className="fam-details">
              <div className="fam-badge-wrap">
                <span className="fam-badge">The Groom&apos;s Family</span>
              </div>

              <div className="fam-names-block">
                <div className="fam-parent">
                  <h3 className="fam-name">Shri Raghavan</h3>
                  <p className="fam-role">Father of the Groom</p>
                </div>

                <div className="fam-amp" aria-hidden="true">
                  <span className="fam-amp-line" />
                  <span className="fam-amp-symbol">&amp;</span>
                  <span className="fam-amp-line" />
                </div>

                <div className="fam-parent">
                  <h3 className="fam-name">Smt. Kamala Raghavan</h3>
                  <p className="fam-role">Mother of the Groom</p>
                </div>
              </div>

              <div className="fam-sub-family">
                <p className="fam-kin">
                  <span>Divya Raghavan <small>(Sister)</small></span>
                  <span className="fam-dot">·</span>
                  <span>Shri Venkataraman <small>(Grandfather)</small></span>
                </p>
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Sleek metallic double gold stripe separator at the bottom */}
      
    </section>
  );
}
