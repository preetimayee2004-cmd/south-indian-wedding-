import type { FamilyMember, FamilySide } from "@/config/types";

const HONORIFICS = /^(smt|shri|sri|thiru|tmt|dr|mr|mrs|ms)\.?\s+/i;

/** First letter of the name itself, skipping honorifics like "Smt." or "Shri". */
const initial = (name: string) => name.replace(HONORIFICS, "").trim().charAt(0).toUpperCase();

function Medallion({ m }: { m: FamilyMember }) {
  return (
    <span className="fam-medallion block rounded-full border border-gold/60 p-[3px]">
      <span className="block h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border border-gold/30 bg-gradient-to-b from-paper to-[#f3e6cf] md:h-20 md:w-20">
        {m.photo ? (
          <img src={m.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <span className="grid h-full w-full place-items-center font-script text-[2rem] text-accent/80" aria-hidden>
            {initial(m.name)}
          </span>
        )}
      </span>
    </span>
  );
}

/** One family: title, optional message, members as lotus medallions. */
export function FamilyPanel({ side, headingId }: { side: FamilySide; headingId: string }) {
  return (
    <div className="text-center">
      <h3 id={headingId} className="script-heading text-[2.1rem] leading-tight md:text-[2.4rem]">
        {side.title}
      </h3>
      {side.message && <p className="mx-auto mt-2 max-w-[17rem] italic leading-snug text-ink-soft">{side.message}</p>}
      <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-7">
        {side.members.map((m) => (
          <li key={m.name} className="fam-member flex flex-col items-center">
            <Medallion m={m} />
            <span className="mt-3 text-[0.98rem] leading-snug text-ink">{m.name}</span>
            <span className="mt-0.5 text-[0.62rem] uppercase tracking-[0.24em] text-ink-soft">{m.relation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
