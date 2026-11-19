import { Scene, type Build } from "@/components/scene/Scene";
import { useRsvpUsable } from "@/components/sections/rsvp/RsvpPanel";

/**
 * Scene 9 — RSVP. Left empty on its sky for now (the stone arch and its text were
 * removed); the new design goes here.
 */
export function RsvpScene() {
  const usable = useRsvpUsable();
  if (!usable && !import.meta.env.DEV) return null;

  const build: Build = (tl) => {
    tl.to({}, { duration: 0.3 });
  };

  return (
    <Scene
      id="rsvp"
      label="RSVP"
      className="cobalt"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />}
    >
      <h2 className="sr-only">RSVP</h2>
    </Scene>
  );
}
