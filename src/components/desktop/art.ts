import type { DesktopArt, DesktopSlot, WeddingConfig } from "@/config/types";

const PORTRAIT = 768 / 1376;

/**
 * Artwork for a desktop scene: the configured landscape art if provided,
 * otherwise the mobile artwork with a sensible framing (`focus`).
 */
export function desktopArt(config: WeddingConfig, slot: DesktopSlot): DesktopArt {
  const custom = config.media.desktop?.[slot];
  if (custom) return custom;
  const m = config.media;
  const fallback: Record<DesktopSlot, DesktopArt> = {
    opening: { src: m.opening, ratio: PORTRAIT, focus: 0.3 },
    hero: { src: m.invitation, ratio: PORTRAIT, focus: 0.4 },
    heroReveal: { src: m.heroReveal, ratio: PORTRAIT, focus: 0.9 },
    invitation: { src: m.couple, ratio: PORTRAIT, focus: 0.55 },
    couple: { src: m.gallery, ratio: PORTRAIT, focus: 0.62 },
    events: { src: m.events, ratio: PORTRAIT, focus: 0.5 },
    gallery: { src: m.gallery, ratio: PORTRAIT, focus: 0.5 },
    family: { src: m.family, ratio: 1200 / 896, focus: 0.5 },
    rsvp: { src: m.rsvp, ratio: PORTRAIT, focus: 0.5 },
    thankYou: { src: m.thankYou, ratio: 1376 / 768, focus: 0.5 },
  };
  return fallback[slot];
}
