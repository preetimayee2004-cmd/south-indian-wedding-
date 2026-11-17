import { useWedding } from "@/context/WeddingContext";
import { ArchPortrait } from "@/components/sections/couple/ArchPortrait";
import { Scene, SceneCard } from "../Scene";
import { desktopArt } from "../art";

/** Desktop scene 4 — the couple and their story, in the journey's one frame. */
export function CoupleScene() {
  const config = useWedding();
  const { couple } = config;
  const people = couple.order === "bride-first" ? [couple.bride, couple.groom] : [couple.groom, couple.bride];
  const story = couple.story ?? [];

  return (
    <Scene id="couple" labelledBy="couple-heading" art={desktopArt(config, "couple")} veil="soft">
      <SceneCard wide>
        <div className={`grid items-center gap-14 ${story.length ? "grid-cols-[1fr_1fr]" : ""}`}>
          <div className="text-center">
            <p className="eyebrow">॥ Vadhu · Varan ॥</p>
            <h2 id="couple-heading" className="script-heading mt-2 text-[clamp(2.8rem,3.6vw,3.6rem)] leading-none">
              The Couple
            </h2>
            <div className="mx-auto mt-8 grid max-w-[24rem] grid-cols-[1fr_auto_1fr] items-start gap-4">
              {people.map((p, i) => (
                <div key={p.name} className="contents">
                  {i === 1 && <span className="script-heading mt-16 text-[2.4rem]">&amp;</span>}
                  <figure className="flex flex-col items-center">
                    <ArchPortrait person={p} className="w-full" />
                    <figcaption className="mt-3">
                      <span className="block font-script text-[2.2rem] leading-none text-accent">{p.name}</span>
                      {p.parents && <span className="mt-1.5 block text-[0.8rem] leading-snug text-ink-soft">{p.parents}</span>}
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          {story.length > 0 && (
            <div className="border-l border-gold/40 pl-12">
              <p className="eyebrow">Our story</p>
              {couple.intro && <p className="mt-3 text-[1.2rem] italic leading-snug text-ink-soft">{couple.intro}</p>}
              <ol className="mt-7 space-y-6">
                {story.map((m) => (
                  <li key={m.title} className="grid grid-cols-[4.5rem_1fr] gap-4">
                    <span className="font-script text-[1.9rem] leading-none text-accent">{m.date}</span>
                    <div>
                      <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.24em] text-ink">{m.title}</h3>
                      <p className="mt-1 leading-snug text-ink-soft">{m.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </SceneCard>
    </Scene>
  );
}
