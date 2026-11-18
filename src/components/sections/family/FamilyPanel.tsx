import type { FamilyMember, FamilySide } from "@/config/types";

const HONORIFICS = /^(smt|shri|sri|thiru|tmt|dr|mr|mrs|ms)\.?\s+/i;

/** First letter of the name itself, skipping honorifics like "Smt." or "Shri". */
const initial = (name: string) => name.replace(HONORIFICS, "").trim().charAt(0).toUpperCase();

function Medallion({ m, compact }: { m: FamilyMember; compact?: boolean }) {
  return (
    <span className="fam-medallion block rounded-full border border-gold/60 p-[3px]">
      <span className={`block overflow-hidden rounded-full border border-gold/30 bg-gradient-to-b from-paper to-[#f3e6cf] ${compact ? "h-[3.1rem] w-[3.1rem]" : "h-[4.5rem] w-[4.5rem] md:h-20 md:w-20"}`}>
        {m.photo ? (
          <img src={m.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <span className={`grid h-full w-full place-items-center font-script text-accent ${compact ? "text-[1.5rem]" : "text-[2rem]"}`} aria-hidden>
            {initial(m.name)}
          </span>
        )}
      </span>
    </span>
  );
}

/** One family: title, optional message, members as lotus medallions. */
export function FamilyPanel({ side, headingId, compact }: { side: FamilySide; headingId: string; compact?: boolean }) {
  return (
    <div className="text-center">
      <h3 id={headingId} className={`script-heading leading-tight ${compact ? "text-[clamp(1.6rem,7.5vw,2.1rem)]" : "text-[2.1rem] md:text-[2.4rem]"}`}>
        {side.title}
      </h3>
      {side.message && (
        <p className={`mx-auto italic leading-snug text-ink-soft ${compact ? "mt-1 max-w-[19rem] text-[0.92rem]" : "mt-2 max-w-[17rem]"}`}>{side.message}</p>
      )}
      <ul className={compact ? "mt-3 grid grid-cols-4 gap-x-1.5" : "mt-7 grid grid-cols-2 gap-x-3 gap-y-7"}>
        {side.members.map((m) => (
          <li key={m.name} className="fam-member flex flex-col items-center">
            <Medallion m={m} compact={compact} />
            <span className={compact ? "mt-1.5 text-[0.74rem] leading-tight text-ink" : "mt-3 text-[0.98rem] leading-snug text-ink"}>{m.name}</span>
            <span className={`mt-0.5 uppercase text-ink-soft ${compact ? "text-[0.5rem] tracking-[0.08em]" : "text-[0.62rem] tracking-[0.24em]"}`}>{m.relation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
