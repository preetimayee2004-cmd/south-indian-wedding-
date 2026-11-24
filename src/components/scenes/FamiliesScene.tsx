import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";

/** One carved wooden temple door leaf (the arch opening clips it to the arch shape). */
function DoorLeaf({ side }: { side: "l" | "r" }) {
  return (
    <span className={`fam-door fam-door--${side}`} aria-hidden>
      <svg viewBox="0 0 100 300" preserveAspectRatio="none" className="fam-door-svg">
        <defs>
          <linearGradient id={`fam-wood-${side}`} x1="0" x2="1">
            <stop offset="0" stopColor={side === "l" ? "#3e1d0c" : "#6a3818"} />
            <stop offset="0.5" stopColor="#5a2e14" />
            <stop offset="1" stopColor={side === "l" ? "#6a3818" : "#3e1d0c"} />
          </linearGradient>
        </defs>
        <rect width="100" height="300" fill={`url(#fam-wood-${side})`} />
        {/* carved panels with a gold bead border */}
        {[
          [14, 70, 72, 70],
          [14, 152, 72, 58],
          [14, 222, 72, 64],
        ].map(([x, y, w, h]) => (
          <g key={y}>
            <rect x={x} y={y} width={w} height={h} rx="3" fill="#4a240f" stroke="#c99a45" strokeWidth="1.6" />
            <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx="2" fill="none" stroke="#2d1407" strokeWidth="1.2" />
          </g>
        ))}
        {/* a lotus carved in the middle panel */}
        <g transform="translate(50 181)" fill="#c99a45">
          <path d="M0 12C-4 4-4-6 0-14 4-6 4 4 0 12Z" />
          <path d="M0 12C-9 8-14 0-15-8-7-6-2 2 0 12Z" opacity="0.85" />
          <path d="M0 12C9 8 14 0 15-8 7-6 2 2 0 12Z" opacity="0.85" />
        </g>
        {/* brass studs */}
        {[40, 105, 145, 215, 292].map((y) =>
          [26, 50, 74].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#e2b553" />),
        )}
        {/* the edge where the two leaves meet, and a brass ring handle */}
        <rect x={side === "l" ? 96 : 0} width="4" height="300" fill="#2a1206" />
        <circle cx={side === "l" ? 88 : 12} cy="150" r="6" fill="none" stroke="#e2b553" strokeWidth="2" />
      </svg>
    </span>
  );
}

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

type Side = NonNullable<NonNullable<ReturnType<typeof useWedding>["family"]>["bride"]>;

/** A tall brass kuthuvilakku: five wicks burning on the oil bowl, a peacock finial on top. */
function Kuthuvilakku() {
  const wicks = [-22, -11, 0, 11, 22];
  return (
    <svg viewBox="-40 -30 80 270" className="fm-lamp-svg" aria-hidden>
      <defs>
        <linearGradient id="fm-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#7a5216" />
          <stop offset="0.35" stopColor="#f3d27a" />
          <stop offset="0.62" stopColor="#c8952f" />
          <stop offset="1" stopColor="#6e4a14" />
        </linearGradient>
        <radialGradient id="fm-glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="40" rx="46" ry="34" fill="url(#fm-glow)" />
      {/* peacock finial */}
      <path d="M0-26c5 4 6 10 2 14l5 6H-7l5-6c-4-4-3-10 2-14Z" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      <path d="M0-12v18" stroke="#b8862f" strokeWidth="3" />
      {/* the oil bowl with its five wicks */}
      <path d="M-34 44c4 12 18 18 34 18s30-6 34-18Z" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.9" />
      <ellipse cy="44" rx="34" ry="6" fill="#f3d27a" stroke="#6e4a14" strokeWidth="0.9" />
      {wicks.map((x) => (
        <g key={x} transform={`translate(${x} ${44 - Math.abs(x) * 0.15})`}>
          <path d="M0-4c1.4-1 2.4.6 0 4-2.4-3.4-1.4-5 0-4Z" fill="#5a3a24" />
          <path className="ic-oil-flame" d="M0-20C4-13 4-8 0-4-4-8-4-13 0-20Z" />
        </g>
      ))}
      {/* stem with knobs */}
      <path d="M-4 62h8v120h-8Z" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      {[78, 110, 142].map((y) => (
        <ellipse key={y} cy={y} rx="11" ry="5" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      ))}
      {/* the wide foot */}
      <path d="M-8 182h16l18 30H-26Z" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      <ellipse cy="214" rx="34" ry="7" fill="url(#fm-brass)" stroke="#6e4a14" strokeWidth="0.9" />
      <ellipse cy="226" rx="26" ry="4" fill="#000" opacity="0.35" />
    </svg>
  );
}

/** One family: the photo in the golden arch, then the names underneath (as before). */
function FamilyCard({ side, who, photo, archRef, doors }: { side: Side; who: "Bride" | "Groom"; photo: string; archRef: (el: HTMLDivElement | null) => void; doors: boolean }) {
  const father = side.members.find((m) => /father/i.test(m.relation) && !/grand/i.test(m.relation));
  const mother = side.members.find((m) => /mother/i.test(m.relation) && !/grand/i.test(m.relation));
  const others = side.members.filter((m) => m !== father && m !== mother);
  return (
    <article className={`fm-side fm-side--${who.toLowerCase()}`}>
      <div ref={archRef} className="fam-arch-wrap">
        <div className="fam-photo-frame">
          <img src={photo} alt={side.title} className="fam-photo" loading="lazy" decoding="async" />
          {doors && (
            <>
              <DoorLeaf side="l" />
              <DoorLeaf side="r" />
            </>
          )}
        </div>
        <picture>
          <source srcSet="/media/family-arch-frame.webp" type="image/webp" />
          <img src="/media/family-arch-frame.png" alt="" aria-hidden="true" className="fam-arch-img" width={463} height={672} draggable={false} />
        </picture>
      </div>

      {/* Decorative Names & Details Underneath (as before) */}
      <div className="fam-details">
        <div className="fam-badge-wrap">
          <span className="fam-badge">{side.title}</span>
        </div>

        <div className="fam-names-block">
          {father && (
            <div className="fam-parent">
              <h3 className="fam-name">{father.name}</h3>
              <p className="fam-role">Father of the {who}</p>
            </div>
          )}

          {father && mother && (
            <div className="fam-amp" aria-hidden="true">
              <span className="fam-amp-line" />
              <span className="fam-amp-symbol">&amp;</span>
              <span className="fam-amp-line" />
            </div>
          )}

          {mother && (
            <div className="fam-parent">
              <h3 className="fam-name">{mother.name}</h3>
              <p className="fam-role">Mother of the {who}</p>
            </div>
          )}
        </div>

        {others.length > 0 && (
          <div className="fam-sub-family">
            <p className="fam-kin">
              {others.map((m, i) => (
                <Fragment key={m.name}>
                  {i > 0 && <span className="fam-dot">·</span>}
                  <span>
                    {m.name} <small>({m.relation})</small>
                  </span>
                </Fragment>
              ))}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

type Garland = { w: number; h: number; d: string; low: { x: number; y: number }; lampTop: number; lampH: number; captionTop: number };

export function FamiliesScene() {
  const { family, couple } = useWedding();
  const bride = family?.bride;
  const groom = family?.groom;
  const stage = useRef<HTMLDivElement>(null);
  const arches = useRef<{ bride: HTMLDivElement | null; groom: HTMLDivElement | null }>({ bride: null, groom: null });
  const [g, setG] = useState<Garland | null>(null);
  const initials = `${couple.bride.name[0]} & ${couple.groom.name[0]}`;
  const reduced = usePrefersReducedMotion();
  const { playSfx } = useAudio();

  // each arch: two carved wooden doors swing open (bride first, groom 0.35s after), the family photo behind
  useLayoutEffect(() => {
    if (reduced) return;
    let brideAt = 0;
    const ctx = gsap.context(() => {
      (["bride", "groom"] as const).forEach((who) => {
        const arch = arches.current[who];
        if (!arch) return;
        const l = arch.querySelector(".fam-door--l");
        const r = arch.querySelector(".fam-door--r");
        const pic = arch.querySelector(".fam-photo");
        gsap.set(pic, { scale: 1.06, autoAlpha: 0 });
        const tl = gsap.timeline({ paused: true, defaults: { duration: 1.4, ease: "power2.inOut" } });
        tl.to(l, { rotateY: -105 }, 0)
          .to(r, { rotateY: 105 }, 0)
          .to(pic, { scale: 1, autoAlpha: 1, clearProps: "transform" }, 0.1);
        gsap.timeline({ scrollTrigger: { trigger: arch, start: "top 70%", once: true } }).call(() => {
          const now = performance.now() / 1000;
          const wait = who === "groom" ? Math.max(0, brideAt + 0.35 - now) : 0;
          if (who === "bride") brideAt = now;
          gsap.delayedCall(wait, () => {
            playSfx("door", { volume: 0.6, rate: who === "groom" ? 0.97 : 1 });
            tl.play();
          });
        });
      });
    }, stage);
    return () => ctx.revert();
  }, [reduced, playSfx, bride, groom]);

  // the garland is drawn between the two arches wherever they actually stand (wide screens)
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const calc = () => {
      const b = arches.current.bride;
      const gr = arches.current.groom;
      const box = el.getBoundingClientRect();
      if (!b || !gr || window.innerWidth < 900) return setG((prev) => (prev ? null : prev));
      const br = b.getBoundingClientRect();
      const grr = gr.getBoundingClientRect();
      const y = br.top - box.top + br.height * 0.2;
      const x1 = br.right - box.left - br.width * 0.1;
      const x2 = grr.left - box.left + grr.width * 0.1;
      const sag = Math.min(88, (x2 - x1) * 0.26);
      const mid = (x1 + x2) / 2;
      const d = `M${x1.toFixed(1)} ${y.toFixed(1)} Q${mid.toFixed(1)} ${(y + sag * 2).toFixed(1)} ${x2.toFixed(1)} ${y.toFixed(1)}`;
      const archBottom = br.bottom - box.top;
      const lampH = Math.min(190, br.height * 0.38);
      const next = { w: box.width, h: box.height, d, low: { x: mid, y: y + sag }, lampTop: archBottom - lampH, lampH, captionTop: archBottom + 18 };
      setG((prev) => (prev && prev.d === next.d && prev.h === next.h && prev.w === next.w ? prev : next));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bond = (
    <div className="fm-bond" style={g ? { left: g.low.x, top: g.low.y } : undefined}>
      <span className="fm-bond-chain" aria-hidden />
      <span className="fm-medallion" aria-hidden>
        <span>{initials}</span>
      </span>
      {!g && <p className="fm-bond-text">Two families, one sacred bond</p>}
    </div>
  );

  return (
    <section className="pg5" id="family" aria-labelledby="p5title">
      {/* Ornate Gold Filigree Corners */}
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-tl" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-tr" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-bl" draggable={false} />
      <img src="/media/gold-corner.webp" alt="" aria-hidden="true" className="fam-corner fam-corner-br" draggable={false} />

      <HangingLamp side="left" />
      <HangingLamp side="right" />

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

      {/* the two families, joined by a marigold-and-jasmine garland with the couple's medallion,
          a brass kuthuvilakku burning between them */}
      <div ref={stage} className={`fm-stage ${g ? "is-wide" : ""}`}>
        {g && (
          <svg className="fm-garland" width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden>
            <path d={g.d} className="fm-g-thread" />
            <path d={g.d} className="fm-g-marigold" />
            <path d={g.d} className="fm-g-yellow" />
            <path d={g.d} className="fm-g-jasmine" />
          </svg>
        )}
        {g && (
          <div className="fm-lamp" style={{ top: g.lampTop, height: g.lampH }}>
            <Kuthuvilakku />
          </div>
        )}
        {g && (
          <p className="fm-caption" style={{ top: g.captionTop }}>
            Two families,
            <br />
            one sacred bond
          </p>
        )}

        {bride && <FamilyCard side={bride} who="Bride" photo="/media/bride-family.jpg" archRef={(el) => void (arches.current.bride = el)} doors={!reduced} />}
        {g ? bond : <div className="fm-bond-row">{bond}</div>}
        {groom && <FamilyCard side={groom} who="Groom" photo="/media/groom-family.jpg" archRef={(el) => void (arches.current.groom = el)} doors={!reduced} />}
      </div>
    </section>
  );
}
