/**
 * The temple dressing shared by the closing sections (the same as the Venue's): a gold double
 * rule inset round the section, gold filigree in the two top corners, and — if asked — brass
 * deepams hanging on chains and marigold strings, all swaying gently. Put it as the first child
 * of a `relative` section that also has the `td-host` class (and `td-bg` for the dark damask).
 */
export function TempleDress({ deepams = false, strands = false }: { deepams?: boolean; strands?: boolean }) {
  return (
    <>
      <span aria-hidden className="fw-frame" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="fw-sec-corner fw-corner--tl" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="fw-sec-corner fw-corner--tr" />
      {strands && (["l1", "r1"] as const).map((k) => <span key={k} aria-hidden className={`fw-strand fw-strand--${k}`} />)}
      {deepams && (["l", "r"] as const).map((side) => <HangingDeepam key={side} className={`fw-deepam fw-deepam--${side}`} />)}
    </>
  );
}

/** A brass oil lamp on a gold chain, its flame flickering (sways from the top of the chain). */
export function HangingDeepam({ className = "fw-deepam" }: { className?: string }) {
  return (
    <span aria-hidden className={className}>
      <span className="fw-deepam-chain" />
      <svg viewBox="-22 -48 44 64">
        <path className="ic-oil-flame" d="M0-44C4-37 4-31 0-27-4-31-4-37 0-44Z" />
        <path d="M-12-26 0-46 12-26" fill="none" stroke="#b8893e" strokeWidth=".9" />
        <path d="M-17-26C-17-17-9-12 0-12S17-17 17-26Z" fill="#c8961e" stroke="#7a5418" strokeWidth=".9" />
        <ellipse cy="-26" rx="17" ry="3.8" fill="#e9c46a" stroke="#7a5418" strokeWidth=".8" />
        <path d="M-7-12H7L4-4H-4Z" fill="#b8862e" stroke="#7a5418" strokeWidth=".7" />
        <path d="M0-4 0 6" stroke="#b8893e" strokeWidth="1.2" />
        <circle cy="9" r="3" fill="#c8961e" stroke="#7a5418" strokeWidth=".7" />
      </svg>
    </span>
  );
}
