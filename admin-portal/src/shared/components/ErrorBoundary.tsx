import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);

        // Hook point for external error reporting integration (e.g., Sentry).
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                    <div className="max-w-md w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
                        <div className="flex mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-[var(--text)]">
                                    Oops! Something went wrong
                                </h3>
                                <div className="mt-2 text-sm text-[var(--text-muted)]">
                                    <p>The application encountered an unexpected error.</p>
                                    {this.state.error && (
                                        <p className="mt-2 text-xs text-[var(--text-soft)] font-mono">
                                            {this.state.error.message}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 px-3 py-2 text-sm font-medium leading-4 text-black hover:from-white hover:to-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/15"
                                    >
                                        Reload Page
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
