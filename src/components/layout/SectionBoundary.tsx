import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Wraps each section: draws the gold dividing line between neighbouring
 * sections (CSS .sec, skipping sections that render nothing), and isolates
 * failures — if one section throws, only that section disappears.
 */
export class SectionBoundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[invitation] section "${this.props.id}" failed and was hidden`, error, info.componentStack);
  }

  render() {
    return <div className="sec" data-section={this.props.id}>{this.state.failed ? null : this.props.children}</div>;
  }
}
