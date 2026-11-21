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
      <HangingLamp side="left" />
      <HangingLamp side="right" />

      {/* Header Plaque */}
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

      {/* Grand Arch Container */}
      <div className="p5-arch" id="p5arch">
        <div className="p5-body">
          {/* Top of arch message */}
          <div className="p5-bond">
            <b lang="hi">दो परिवार · एक बंधन</b>
            <span>Two families, one bond</span>
            <svg viewBox="-20 -14 40 24" aria-hidden="true">
              <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
              <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
              <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
            </svg>
          </div>

          <div className="p5-unite" aria-hidden="true">
            <span>Blessed by our elders, united by love</span>
          </div>

          {/* The Two Families */}
          <div className="p5-fams">
            {bride && (
              <article className="p5-fam">
                <p className="p5-k">The Bride&apos;s Family</p>
                <div className="p5-ele p5-bride">
                  <img
                    src="/media/bride-family.jpg"
                    alt="The Bride's Family"
                    className="p5-photo"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="p5-n">
                  <b>Shri Sundaram</b>
                  <small>Father of the Bride</small>
                  <i>&amp;</i>
                  <b>Smt. Lakshmi Sundaram</b>
                  <small>Mother of the Bride</small>
                </p>
                <p className="p5-more">
                  Ravi Sundaram (Brother) · Smt. Janaki (Grandmother)
                </p>
              </article>
            )}

            <div className="p5-div" aria-hidden="true">
              <svg viewBox="-20 -14 40 24" aria-hidden="true">
                <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
                <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
                <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
              </svg>
            </div>

            {groom && (
              <article className="p5-fam">
                <p className="p5-k">The Groom&apos;s Family</p>
                <div className="p5-ele p5-groom">
                  <img
                    src="/media/groom-family.jpg"
                    alt="The Groom's Family"
                    className="p5-photo"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="p5-n">
                  <b>Shri Raghavan</b>
                  <small>Father of the Groom</small>
                  <i>&amp;</i>
                  <b>Smt. Kamala Raghavan</b>
                  <small>Mother of the Groom</small>
                </p>
                <p className="p5-more">
                  Divya Raghavan (Sister) · Shri Venkataraman (Grandfather)
                </p>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
