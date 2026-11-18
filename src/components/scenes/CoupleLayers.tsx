import { layer } from "@/lib/art";
import { Layer } from "@/components/scene/Layer";

export type CoupleRefs = Record<string, HTMLElement | null>;

/**
 * The garland-exchange scene as layers, shared by the couple and thank-you
 * scenes. With separately exported art (couple-gopurams, couple-couple,
 * couple-banana-left/right, couple-garlands) each moves on its own; until
 * then the sky is separate and the rest of the painting is one layer.
 */
export function coupleArt(fallback: string) {
  const split = {
    gopurams: layer("couple-gopurams"),
    couple: layer("couple-couple"),
    bananaL: layer("couple-banana-left"),
    bananaR: layer("couple-banana-right"),
    garlands: layer("couple-garlands"),
  };
  return {
    sky: layer("couple-sky"),
    scene: layer("couple-scene") ?? fallback,
    split: split.couple ? split : null,
  };
}

export function CoupleLayers({ fallback, alt, refs }: { fallback: string; alt: string; refs: CoupleRefs }) {
  const art = coupleArt(fallback);
  const set = (k: string) => (el: HTMLElement | null) => void (refs[k] = el);
  const box = "absolute inset-x-0 top-0 h-[108%]";
  const pos = "52% 50%";
  return (
    <>
      {art.sky ? <Layer ref={set("sky")} src={art.sky} className={box} position={pos} /> : <div ref={set("sky")} className="absolute inset-0 bg-[#a9cdee]" />}
      {art.split ? (
        <>
          {art.split.gopurams && <Layer ref={set("gopurams")} src={art.split.gopurams} className={box} position={pos} />}
          <Layer ref={set("couple")} src={art.split.couple!} alt={alt} className={box} position={pos} />
          {art.split.bananaL && <Layer ref={set("bananaL")} src={art.split.bananaL} className={box} position={pos} />}
          {art.split.bananaR && <Layer ref={set("bananaR")} src={art.split.bananaR} className={box} position={pos} />}
          {art.split.garlands && <Layer ref={set("garlands")} src={art.split.garlands} className={box} position={pos} />}
        </>
      ) : (
        <Layer ref={set("scene")} src={art.scene} alt={alt} className={box} position={pos} />
      )}
    </>
  );
}
