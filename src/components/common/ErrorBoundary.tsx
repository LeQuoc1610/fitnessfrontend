import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GymBro UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-24 max-w-md card-neon p-6 text-center">
          <h2 className="font-display text-xl text-neon-orange mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-4">
            UI just failed a heavy set. Refresh the page and try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
