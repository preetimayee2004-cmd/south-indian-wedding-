/** Hairline divider with a small lotus-bud centre. Inherits colour (use text-gold). */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 24" className={`h-5 w-48 ${className}`} aria-hidden fill="none" stroke="currentColor">
      <path d="M0 12h88M132 12h88" strokeWidth="0.8" />
      <path d="M78 12h6M136 12h6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M110 3c5 4 8 6 8 9s-3 6-8 9c-5-3-8-6-8-9s3-5 8-9Z" strokeWidth="1" />
      <path d="M110 8c2 1.5 3 2.6 3 4s-1 2.5-3 4c-2-1.5-3-2.6-3-4s1-2.5 3-4Z" fill="currentColor" stroke="none" />
      <path d="M98 12c-3 0-5-1.5-6-3M122 12c3 0 5-1.5 6-3M98 12c-3 0-5 1.5-6 3M122 12c3 0 5 1.5 6 3" strokeWidth="0.8" />
    </svg>
  );
}
