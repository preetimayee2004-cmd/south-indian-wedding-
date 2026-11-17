import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Isolates each section: if one throws (bad config value, missing asset,
 * a browser quirk), only that section disappears — the rest of the
 * invitation keeps working.
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
    return this.state.failed ? null : this.props.children;
  }
}
