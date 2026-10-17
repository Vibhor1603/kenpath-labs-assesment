"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * ViewErrorBoundary: wraps each view so an error in one view does not crash
 * the whole app. Progress is stored separately and is not affected.
 */
export class ViewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console for debugging; a real app would send to an error service.
    console.error("[ViewErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
          <p className="text-[17px] text-foreground font-medium leading-snug">
            Something went wrong.
          </p>
          <p className="text-[15px] text-muted-foreground">
            Your progress is safe.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              history.replaceState(null, "", "/");
              window.location.reload();
            }}
            className="mt-2 h-14 rounded-full bg-primary px-8 text-[17px] font-medium text-primary-foreground active:scale-[0.97] transition-transform"
          >
            Go home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
