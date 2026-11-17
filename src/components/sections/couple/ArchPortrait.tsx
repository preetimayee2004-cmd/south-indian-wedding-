import type { Person } from "@/config/types";

/**
 * Arch-topped portrait with a double gold hairline (same frame language as the
 * countdown). With no photo it shows the person's initial instead of an
 * empty box. `.portrait-reveal` is the element the section animates.
 */
export function ArchPortrait({ person, className = "" }: { person: Person; className?: string }) {
  return (
    <div className={`rounded-t-[999px] border border-gold/60 p-[3px] ${className}`}>
      <div className="portrait-reveal relative aspect-[3/4] overflow-hidden rounded-t-[999px] border border-gold/30 bg-gradient-to-b from-paper to-[#f3e6cf]">
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.fullName ?? person.name}
            loading="lazy"
            decoding="async"
            className="portrait-img h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="portrait-img absolute inset-0 grid place-items-center font-script text-accent/80" style={{ fontSize: "6.2cqh" }} aria-hidden>
            {person.name.charAt(0)}
          </span>
        )}
      </div>
    </div>
  );
}
