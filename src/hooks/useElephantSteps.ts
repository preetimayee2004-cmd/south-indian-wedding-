import { useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

/** One step per bob of .elephant-walk (it bobs twice in its 1.1 s cycle: feet down at 0 and 550 ms). */
const STEP_MS = 550;
/** Footsteps stop this long after the last scroll. */
const IDLE_MS = 400;

/**
 * The hero elephants' footsteps: a soft, heavy step with a light ankle-bell jingle, one per
 * walking bob, at 35% volume — only while the hero is on screen and the guest is scrolling
 * through it. They come in gently (the first steps are quieter) and stop when the scrolling
 * stops, the hero leaves the screen or the tab is hidden. Silent with reduced motion (the
 * elephants then stand still) and before the envelope is tapped.
 */
export function useElephantSteps(sectionId: string) {
  const { playSfx } = useAudio();
  useEffect(() => {
    const sec = document.getElementById(sectionId);
    if (!sec || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    let lastScroll = -Infinity;
    let timer = 0;
    let steps = 0;

    const active = () => visible && !document.hidden && performance.now() - lastScroll < IDLE_MS;
    /** ms until the next foot comes down, read from the elephants' own walk animation */
    const untilNextStep = () => {
      const walk = sec.querySelector(".elephant-walk") as (Element & { getAnimations?: () => Animation[] }) | null;
      const t = Number(walk?.getAnimations?.()[0]?.currentTime ?? performance.now());
      return STEP_MS - (t % STEP_MS);
    };
    const tick = () => {
      timer = 0;
      if (!active()) {
        steps = 0;
        return;
      }
      playSfx("elestep", { volume: Math.min(0.35, 0.14 + steps * 0.07), owner: sec, cut: 0.5 });
      steps++;
      timer = window.setTimeout(tick, STEP_MS);
    };
    const schedule = () => {
      if (timer || !active()) return;
      timer = window.setTimeout(tick, untilNextStep());
    };
    const onScroll = () => {
      lastScroll = performance.now();
      schedule();
    };
    const io = new IntersectionObserver(
      (es) => {
        visible = es.some((e) => e.isIntersecting);
        if (!visible) {
          window.clearTimeout(timer);
          timer = 0;
          steps = 0;
        }
      },
      { threshold: 0.1 },
    );
    io.observe(sec);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [sectionId, playSfx]);
}
