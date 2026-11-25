import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { Wish } from "@/lib/wishes";

const mod = (a: number, b: number) => ((a % b) + b) % b;
/** A stable pseudo-random 0–1 per index. */
const r01 = (i: number, k = 1) => {
  const x = Math.sin(i * 12.9898 * k + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const DEG = 180 / Math.PI;

/** The writing on a leaf: the wish (two lines on the string), the name at the right end. */
export function LeafText({ wish }: { wish: Wish }) {
  return (
    <>
      <span className="pl-msg">{wish.message}</span>
      <span className="pl-name">
        <span className="pl-dot" aria-hidden />
        {wish.name}
      </span>
    </>
  );
}

type Mode = "wrap" | "drag" | "still";

interface Props {
  wishes: Wish[];
  /** the guest's own new wish: it slides onto the front of the thread */
  newId: string | null;
  /** the leaf lifted off the thread (open in the viewer) */
  hiddenId: string | null;
  reduced: boolean;
  onOpen: (wish: Wish, el: HTMLElement) => void;
}

/**
 * Palm-leaf manuscript strips strung on one maroon thread across the section, hanging in a
 * gentle curve. The string drifts slowly sideways on its own (pausing on hover or touch), the
 * guest can drag it, each leaf sways a little on the thread. When there are too few wishes to
 * fill the screen the leaves repeat round the loop (the repeats are hidden from screen readers).
 * Positions are set as transforms every frame; the leaves stay a normal list in the page.
 * With animations off the string stands still (and can still be dragged when it is wider than the screen).
 */
export function PalmLeafString({ wishes, newId, hiddenId, reduced, onOpen }: Props) {
  const strip = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<string, HTMLElement>());
  const threads = useRef<(HTMLSpanElement | null)[]>([]);
  const st = useRef({ tx: 0, ready: false, lastMode: "" as Mode | "", paused: false, focused: false, dragging: false, moved: false, downX: 0, startTx: 0, time: 0, resumeAt: 0 });
  const ent = useRef(new Map<string, { y: number; r: number; o: number }>());
  const prev = useRef<{ first?: string; P: number }>({ P: 0 });
  const geo = useRef({ W: 0, w: 0, h: 0, g: 0, s: 0, sag: 0, pad: 0, top: 12 });
  const [copies, setCopies] = useState(1);
  const copiesRef = useRef(copies);
  copiesRef.current = copies;
  const list = useRef(wishes);
  list.current = wishes;
  const hidden = useRef(hiddenId);
  hidden.current = hiddenId;
  const n = wishes.length;

  const mode = (): Mode => {
    const { W, s, g } = geo.current;
    const P = list.current.length * copiesRef.current * s;
    if (!reduced && P > W + s) return "wrap";
    return list.current.length * s - g > W ? "drag" : "still";
  };

  const measure = () => {
    const el = strip.current;
    if (!el) return;
    const W = el.clientWidth;
    const leaf = el.querySelector<HTMLElement>(".pl-leaf");
    const w = leaf?.offsetWidth ?? 320;
    const h = leaf?.offsetHeight ?? 94;
    const phone = W < 700;
    const g = phone ? Math.round(W * 0.035) : 34;
    const sag = phone ? 12 : Math.min(34, W * 0.022);
    const s = w + g;
    geo.current = { W, w, h, g, s, sag, pad: phone ? Math.round((W - w) * 0.3) : 28, top: 12 };
    el.style.height = `${Math.round(12 + sag + h + 26)}px`;
    // enough rounds of the leaves for an endless loop wider than the screen
    const one = list.current.length * s;
    const need = reduced || !one ? 1 : one > W + s ? 1 : Math.floor((W + s) / one) + 1;
    if (need !== copiesRef.current) {
      copiesRef.current = need;
      setCopies(need);
    }
  };

  const clampTx = (tx: number) => {
    if (mode() !== "drag") return tx;
    const { W, s, g, pad } = geo.current;
    const total = list.current.length * s - g;
    return Math.min(0, Math.max(W - total - pad * 2, tx));
  };

  const layout = () => {
    const { W, w, h, g, s, sag, pad, top } = geo.current;
    if (!W) return;
    const all = list.current;
    const k = copiesRef.current;
    const m = mode();
    const t = st.current;
    // where the string starts when it first shows, or when it changes between looping and not
    if (m !== t.lastMode) {
      t.lastMode = m;
      t.tx = m === "wrap" ? pad + s : 0;
    }
    if (m === "drag") t.tx = clampTx(t.tx);
    const P = all.length * k * s;
    const half = W / 2;
    const curve = (x: number) => {
      const u = (x - half) / half;
      return sag * (1 - u * u);
    };
    const pts: { x: number; y: number; a: number }[] = [];
    for (let c = 0; c < k; c++) {
      all.forEach((wish, i) => {
        const j = c * all.length + i;
        const x = m === "wrap" ? mod(j * s + t.tx, P) - s : m === "drag" ? pad + i * s + t.tx : (W - (all.length * s - g)) / 2 + i * s;
        const el = items.current.get(`${wish.id}#${c}`);
        if (!el) return;
        const xc = x + w / 2;
        const a = Math.atan((-2 * sag * (xc - half)) / (half * half));
        const sway = reduced ? 0 : Math.sin(t.time * (0.9 + r01(j, 3) * 0.6) + r01(j, 7) * 6.283) * 0.9;
        const e = ent.current.get(wish.id);
        const y = top + curve(xc) + (e?.y ?? 0);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(a * DEG + sway + (e?.r ?? 0)).toFixed(2)}deg)`;
        el.style.opacity = hidden.current === wish.id ? "0" : String(e?.o ?? 1);
        if (xc > -w && xc < W + w) pts.push({ x: xc, y: y + h / 2, a });
      });
    }
    // the thread: from the left edge, through both holes of every leaf, to the right edge
    const hole = 0.44 * w;
    const order = pts.sort((p, q) => p.x - q.x);
    const segs: [number, number, number, number][] = [];
    if (order.length) {
      const edge = (x: number) => top + curve(x) + h / 2;
      const f = order[0];
      segs.push([-24, edge(-24), f.x - hole * Math.cos(f.a), f.y - hole * Math.sin(f.a)]);
      for (let q = 0; q < order.length - 1; q++) {
        const p = order[q], r = order[q + 1];
        segs.push([p.x + hole * Math.cos(p.a), p.y + hole * Math.sin(p.a), r.x - hole * Math.cos(r.a), r.y - hole * Math.sin(r.a)]);
      }
      const l = order[order.length - 1];
      segs.push([l.x + hole * Math.cos(l.a), l.y + hole * Math.sin(l.a), W + 24, edge(W + 24)]);
    }
    threads.current.forEach((sp, q) => {
      if (!sp) return;
      const sg = segs[q];
      if (!sg) {
        sp.style.opacity = "0";
        return;
      }
      const [x1, y1, x2, y2] = sg;
      const len = Math.hypot(x2 - x1, y2 - y1);
      sp.style.opacity = "1";
      sp.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${(Math.atan2(y2 - y1, x2 - x1) * DEG).toFixed(2)}deg) scaleX(${(len / 100).toFixed(3)})`;
    });
  };

  // a new wish at the front: the string glides so the new leaf is in view, and the new leaf
  // drops onto the thread with a small swing
  useLayoutEffect(() => {
    measure();
    const first = wishes[0]?.id;
    const p = prev.current;
    const { s, W, w } = geo.current;
    const P = n * copiesRef.current * s;
    if (first && first === newId && p.first && first !== p.first) {
      const t = st.current;
      const m = mode();
      if (m === "wrap" && p.P) {
        t.tx = mod(t.tx, p.P) - s; // the leaves already there stay put
        const want = (W < 700 ? (W - w) / 2 : Math.max(24, W * 0.1)) + s;
        const delta = mod(want - t.tx + P / 2, P) - P / 2;
        gsap.to(t, { tx: t.tx + delta, duration: 1.3, ease: "power2.inOut" });
      } else if (m === "drag") {
        gsap.to(t, { tx: 0, duration: 1, ease: "power2.inOut" });
      }
      if (!reduced) {
        const e = { y: -70, r: -14, o: 0 };
        ent.current.set(first, e);
        gsap.to(e, { y: 0, r: 0, o: 1, duration: 1.6, delay: 0.25, ease: "elastic.out(1, 0.45)", onComplete: () => void ent.current.delete(first) });
      }
    }
    prev.current = { first, P };
    layout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishes, newId, copies]);

  // keep the hidden (opened) leaf in sync even while the frame loop is asleep
  useEffect(() => layout());

  // the frame loop runs only while the string is on screen
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const speed = () => (geo.current.W < 700 ? 18 : 26);
    const tick = (_: number, dt: number) => {
      const t = st.current;
      t.time += dt / 1000;
      if (mode() === "wrap" && !t.paused && !t.focused && !t.dragging && performance.now() > t.resumeAt) t.tx -= (speed() * dt) / 1000;
      layout();
    };
    let on = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) gsap.ticker.add(tick);
      else if (!e.isIntersecting && on) gsap.ticker.remove(tick);
      on = e.isIntersecting;
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      measure();
      layout();
    });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /** The section may be scaled down to fit the screen: pointer moves are in screen pixels. */
  const fit = () => parseFloat(getComputedStyle(strip.current?.closest(".ww-fit") ?? document.body).getPropertyValue("--fit")) || 1;

  const down = (e: React.PointerEvent) => {
    const t = st.current;
    gsap.killTweensOf(t);
    t.paused = true;
    t.dragging = true;
    t.moved = false;
    t.downX = e.clientX;
    t.startTx = t.tx;
  };
  const move = (e: React.PointerEvent) => {
    const t = st.current;
    if (!t.dragging || mode() === "still") return;
    const dx = (e.clientX - t.downX) / fit();
    if (!t.moved && Math.abs(dx) > 6) {
      t.moved = true;
      strip.current?.setPointerCapture(e.pointerId);
    }
    if (t.moved) t.tx = clampTx(t.startTx + dx);
  };
  const up = (e: React.PointerEvent) => {
    const t = st.current;
    t.dragging = false;
    if (e.pointerType !== "mouse") {
      t.paused = false;
      t.resumeAt = performance.now() + 2500;
    }
    window.setTimeout(() => (t.moved = false), 0); // the click that ends a drag doesn't open a leaf
  };

  /** Keyboard: the focused leaf comes into the middle of the screen. */
  const focusLeaf = (i: number) => {
    const t = st.current;
    t.focused = true;
    const { W, w, s, pad } = geo.current;
    const m = mode();
    if (m === "wrap") {
      const P = n * copiesRef.current * s;
      const want = (W - w) / 2 + s - i * s;
      const delta = mod(want - t.tx + P / 2, P) - P / 2;
      gsap.to(t, { tx: t.tx + delta, duration: 0.6, ease: "power2.out" });
    } else if (m === "drag") {
      gsap.to(t, { tx: clampTx((W - w) / 2 - pad - i * s), duration: 0.6, ease: "power2.out" });
    }
  };

  const setItem = (key: string) => (el: HTMLElement | null) => {
    if (el) items.current.set(key, el);
    else items.current.delete(key);
  };
  const open = (w: Wish) => (e: React.MouseEvent<HTMLElement>) => {
    if (st.current.moved) return;
    onOpen(w, e.currentTarget);
  };

  return (
    <div
      ref={strip}
      className={`pl-strip ${reduced ? "is-still" : ""}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={(e) => e.pointerType === "mouse" && (st.current.paused = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (st.current.paused = false)}
    >
      {Array.from({ length: n * copies + 1 }, (_, k) => (
        <span key={k} ref={(el) => void (threads.current[k] = el)} className="pl-thread" aria-hidden />
      ))}
      <ul className="pl-list" aria-label="Blessings from guests">
        {wishes.map((w, i) => (
          <li key={w.id} ref={setItem(`${w.id}#0`)} className="pl-item">
            <button type="button" className="pl-leaf" onClick={open(w)} onFocus={() => focusLeaf(i)} onBlur={() => (st.current.focused = false)}>
              <LeafText wish={w} />
            </button>
          </li>
        ))}
      </ul>
      {/* the repeats that close the loop: for the eye only */}
      {copies > 1 && (
        <div className="pl-list" aria-hidden>
          {Array.from({ length: copies - 1 }, (_, c) =>
            wishes.map((w) => (
              <div key={`${w.id}#${c + 1}`} ref={setItem(`${w.id}#${c + 1}`)} className="pl-item">
                <div className="pl-leaf" onClick={open(w)}>
                  <LeafText wish={w} />
                </div>
              </div>
            )),
          )}
        </div>
      )}
    </div>
  );
}
