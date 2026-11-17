import type { ReactNode } from "react";

/**
 * Global shell. Full-bleed at every width (no device mockup):
 * mobile is the primary layout; tablet/desktop widen the content column
 * via the --w-content / --space-* tokens in styles/index.css.
 */
export function AppShell({ children, inert }: { children: ReactNode; inert?: boolean }) {
  return (
    <div className="relative min-h-svh bg-ivory text-ink" inert={inert} aria-hidden={inert || undefined}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2"
      >
        Skip to invitation
      </a>
      <main id="main">{children}</main>
    </div>
  );
}
