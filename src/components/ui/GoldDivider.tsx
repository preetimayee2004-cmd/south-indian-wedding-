/** A thin gold rule with a lotus bud in the middle — the ornament shared by the closing sections. */
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 20" className={`mx-auto block h-[18px] w-[200px] ${className}`}>
      <path d="M4 10H84M136 10H216" stroke="#d4a54a" strokeWidth="1" />
      <circle cx="90" cy="10" r="1.8" fill="#e8c56b" />
      <circle cx="130" cy="10" r="1.8" fill="#e8c56b" />
      <path d="M110 2c3.5 3 4.2 7 0 14-4.2-7-3.5-11 0-14Z" fill="#e8c56b" />
      <path d="M110 16c-3-4.6-7.4-6.4-12-6 1.8 4 6 6.4 12 6Zm0 0c3-4.6 7.4-6.4 12-6-1.8 4-6 6.4-12 6Z" fill="#c9954f" />
    </svg>
  );
}

/** The four gold filigree corners (the same art as the family arches), for a framed panel. */
export function GoldCorners({ className = "pm-corner" }: { className?: string }) {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <img key={c} src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className={`${className} ${className}--${c}`} />
      ))}
    </>
  );
}
