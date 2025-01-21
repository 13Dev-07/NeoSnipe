import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you can add error logging service integration
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-deep-space">
          <div className="max-w-md w-full bg-gray-900/50 p-8 rounded-lg border border-[#00FFCC]/20">
            <h2 className="text-2xl font-orbitron text-[#00FFCC] mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-400 font-space-grotesk mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/30 
                       rounded hover:bg-[#00FFCC]/20 transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}