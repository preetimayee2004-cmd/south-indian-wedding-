import type { ReactNode } from "react";

/** Centred column with the shared side gutter. Width grows by breakpoint (see --w-content). */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-content px-gutter ${className}`}>{children}</div>;
}
