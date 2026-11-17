import type { ReactNode } from "react";
import type { SectionId } from "@/config/types";
import { Container } from "./Container";

interface SectionProps {
  id: SectionId;
  /** id of the element that labels this section (usually its heading). */
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  /** Skip the inner Container for full-bleed compositions. */
  bleed?: boolean;
  /** Skip the shared vertical padding (e.g. a full-screen hero). */
  flush?: boolean;
}

/**
 * Every invitation section renders through this, so spacing, anchors and
 * landmarks stay consistent. Layout *inside* is each section's own.
 */
export function Section({ id, labelledBy, children, className = "", bleed, flush }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative isolate ${flush ? "" : "py-section"} ${className}`}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
