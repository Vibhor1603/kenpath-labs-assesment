"use client";

import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; onHome: () => void };
type State = { hasError: boolean };

/** One error boundary per view. Progress lives in storage and is never touched here. */
export class ViewErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ViewErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center"
        role="alert"
      >
        <p className="text-title-s max-w-[280px] font-semibold">{copy.errors.boundary}</p>
        <Button
          onClick={() => {
            this.setState({ hasError: false });
            this.props.onHome();
          }}
        >
          {copy.errors.goHome}
        </Button>
      </div>
    );
  }
}
