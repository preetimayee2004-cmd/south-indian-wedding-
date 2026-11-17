import type { FamilySide } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { FamilyPanel } from "@/components/sections/family/FamilyPanel";
import { Scene, SceneCard } from "../Scene";
import { desktopArt } from "../art";

/** Desktop scene — both families side by side, beneath the painted gateway. */
export function FamilyScene() {
  const config = useWedding();
  const { family, couple } = config;
  const order = couple.order === "bride-first" ? (["bride", "groom"] as const) : (["groom", "bride"] as const);
  const sides = order.filter((k) => family?.[k]);
  if (!sides.length) return null;

  return (
    <Scene id="family" labelledBy="family-heading" art={desktopArt(config, "family")} veil="soft">
      <SceneCard wide>
        <div className="text-center">
          <p className="eyebrow">With the blessings of</p>
          <h2 id="family-heading" className="script-heading mt-2 text-[clamp(2.8rem,3.8vw,3.8rem)] leading-none">
            Our Families
          </h2>
        </div>
        <div className={`mt-10 grid ${sides.length > 1 ? "grid-cols-2 divide-x divide-gold/40" : ""}`}>
          {sides.map((k) => (
            <div key={k} className="px-8">
              <FamilyPanel side={family![k] as FamilySide} headingId={`d-fam-${k}`} />
            </div>
          ))}
        </div>
      </SceneCard>
    </Scene>
  );
}
