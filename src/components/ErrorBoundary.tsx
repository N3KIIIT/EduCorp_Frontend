import {
  Component,
  type ComponentType,
  type GetDerivedStateFromError,
  type PropsWithChildren,
} from 'react';

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback: ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  // eslint-disable-next-line max-len
  static getDerivedStateFromError: GetDerivedStateFromError<ErrorBoundaryProps, ErrorBoundaryState> = (error) => ({ error });

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  resetError = () => {
    this.setState({ error: undefined });
  };

  render() {
    const {
      state: {
        error,
      },
      props: {
        fallback: Fallback,
        children,
      },
    } = this;

    return error ? <Fallback error={error} resetError={this.resetError} /> : children;
  }
}
