import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  id: string;
  /** Phone scenes: how this section arrives (see components/scenes). */
  enter?: string;
  /** Phone scenes: stacking order against its neighbours. */
  z?: number;
  /** True for the very first section on the page (no separator above it). */
  isFirst?: boolean;
  children: ReactNode;
}

/**
 * Wraps each section: draws the gold dividing line between neighbouring
 * sections (CSS .sec, skipping sections that render nothing — not in the
 * phone scenes, which hand over without a line), and isolates failures —
 * if one section throws, only that section disappears.
 */
export class SectionBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[invitation] section "${this.props.id}" failed and was hidden`, error, info.componentStack);
  }

  render() {
    const { id, enter, z, isFirst } = this.props;
    return (
      <div className="sec" data-section={id} data-enter={enter} style={z === undefined ? undefined : { zIndex: z }}>
        {!isFirst && !this.state.failed && <div className="section-separator" aria-hidden="true" />}
        {this.state.failed ? null : this.props.children}
      </div>
    );
  }
}
