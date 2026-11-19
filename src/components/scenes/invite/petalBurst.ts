import type { MouseEvent } from "react";

const COLORS = ["#fffdf6", "#fff8e8", "#c4283a", "#e04a5a", "#f6efe0"];

/**
 * A small burst of jasmine and rose petals from where a name was tapped
 * (transform + opacity only; nothing with reduced motion).
 */
export function petalBurst(e: MouseEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = e.currentTarget;
  const r = host.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("i");
    p.className = "ic-burst";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = COLORS[i % COLORS.length];
    host.appendChild(p);
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
    const d = 40 + Math.random() * 50;
    const anim = p.animate(
      [
        { transform: "translate(-50%, -50%) rotate(0deg) scale(0.6)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 30}px)) rotate(${200 + Math.random() * 200}deg) scale(1)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
    );
    anim.onfinish = () => p.remove();
  }
}
