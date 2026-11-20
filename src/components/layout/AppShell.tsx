import type { ReactNode } from "react";

/**
 * Global shell. Full-bleed at every width (no device mockup):
 * mobile is the primary layout; tablet/desktop widen the content column
 * via the --w-content / --space-* tokens in styles/index.css.
 */
export function AppShell({ children, inert }: { children: ReactNode; inert?: boolean }) {
  return (
    <div className="relative min-h-svh bg-ivory text-ink" inert={inert} aria-hidden={inert || undefined}>
      <main id="main">{children}</main>
    </div>
  );
}
