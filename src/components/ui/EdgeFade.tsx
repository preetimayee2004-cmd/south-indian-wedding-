/**
 * Soft ivory fade at the top and/or bottom edge of a full-bleed artwork, so
 * every section meets the page the same way (no hard image edges).
 * Place inside a `relative` container, after the artwork.
 */
export function EdgeFade({ top = false, bottom = false, size = "4.5rem" }: { top?: boolean; bottom?: boolean; size?: string }) {
  const base = "pointer-events-none absolute inset-x-0 z-[5]";
  return (
    <>
      {top && (
        <span aria-hidden className={`${base} top-0`} style={{ height: size, background: "linear-gradient(to bottom, rgb(var(--c-ivory)), rgb(var(--c-ivory) / 0))" }} />
      )}
      {bottom && (
        <span aria-hidden className={`${base} bottom-0`} style={{ height: size, background: "linear-gradient(to top, rgb(var(--c-ivory)), rgb(var(--c-ivory) / 0))" }} />
      )}
    </>
  );
}
