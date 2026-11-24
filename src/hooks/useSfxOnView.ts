import { useEffect, type RefObject } from "react";
import { useAudio, type Sfx, type SfxOptions } from "@/context/AudioContext";

/**
 * Play a sound effect once, the first time an element comes into view.
 * Silent when the guest has sound off or hasn't tapped anything yet.
 */
export function useSfxOnView(
  ref: RefObject<Element | null>,
  sounds: [Sfx, SfxOptions?][],
  {
    threshold = 0.35,
    rootMargin = "0px 0px -15% 0px",
    enabled = true,
  }: { threshold?: number; rootMargin?: string; enabled?: boolean } = {},
) {
  const { playSfx } = useAudio();
  const key = JSON.stringify(sounds);
  useEffect(() => {
    const el = ref.current;
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
  }, [ref, key, playSfx, threshold, rootMargin, enabled]);
}
