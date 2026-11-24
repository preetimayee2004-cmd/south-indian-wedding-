import { useEffect, type RefObject } from "react";
import { useAudio, type Sfx, type SfxOptions } from "@/context/AudioContext";

/**
 * Play a sound effect once, the first time an element comes into view.
 * `target` is a ref, or a selector (e.g. "#couple") for an element this component renders.
 * Default: fires when the element's top passes ~70% of the screen height.
 * Silent until the guest has tapped something (browsers allow no sound before that).
 */
export function useSfxOnView(
  target: RefObject<Element | null> | string,
  sounds: [Sfx, SfxOptions?][],
  {
    threshold = 0,
    rootMargin = "0px 0px -30% 0px",
    enabled = true,
  }: { threshold?: number; rootMargin?: string; enabled?: boolean } = {},
) {
  const { playSfx } = useAudio();
  const key = JSON.stringify(sounds);
  useEffect(() => {
    const el = typeof target === "string" ? document.querySelector(target) : target.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return;
    const list = JSON.parse(key) as [Sfx, SfxOptions?][];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        list.forEach(([name, opts]) => playSfx(name, opts));
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, key, playSfx, threshold, rootMargin, enabled]);
}
