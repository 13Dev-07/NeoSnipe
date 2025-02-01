import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorType } from '../../core/error/ErrorTypes';
import { WebGLContextLostError } from '../../utils/errors/recovery-strategies';
import { WebGLErrorHandler } from '../../utils/webgl/error-handler';

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
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to monitoring service (implement in production)
    this.logError(errorDetails);

    // Attempt recovery if possible
    this.attemptRecovery(error);
  }

  private logError(errorDetails: any): void {
    // Import the ErrorHandler singleton
    const errorHandler = import('../utils/errors/error-handler').then(module => module.default);

    // Always log to error handling system regardless of environment
    errorHandler.then(handler => {
      handler.handleError(new Error(errorDetails.message), {
        context: {
          componentStack: errorDetails.componentStack,
          timestamp: errorDetails.timestamp,
          userAgent: errorDetails.userAgent,
          url: errorDetails.url,
          stack: errorDetails.stack
        },
        severity: 'error',
        source: 'ErrorBoundary',
        isFatal: true
      });
    }).catch(err => {
      // Fallback to console in case error handler fails
      console.error('Failed to log error:', err);
      console.error('Original error:', errorDetails);
    });

    // Additional development logging
    if (process.env.NODE_ENV === 'development') {
      console.group('Detailed Error Information');
      console.table(errorDetails);
      console.groupEnd();
    }
  }

  private determineSeverity(error: Error): 'error' | 'warning' | 'info' {
    if (error instanceof WebGLContextLostError) {
      return 'error';
    }
    if (error.message.includes('memory')) {
      return 'warning';
    }
    if (error.message.includes('initialization')) {
      return 'warning';
    }
    return 'error';
  }

  private determineErrorType(error: Error): ErrorType {
    // Enhanced error type detection
    if (error instanceof WebGLContextLostError) {
      return ErrorType.RESOURCE_ERROR;
    }
    if (error instanceof NetworkError) {
      return ErrorType.NETWORK_ERROR;
    }
    if (error instanceof APIError) {
      return ErrorType.API_ERROR;
    }
    if (error.message.includes('memory')) {
      return ErrorType.MEMORY_ERROR;
    }
    if (error.message.includes('initialization')) {
      return ErrorType.INITIALIZATION_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    if (error.message.includes('validation')) {
      return ErrorType.VALIDATION_ERROR;
    }
    if (error.message.includes('processing')) {
      return ErrorType.PROCESSING_ERROR;
    }
    return ErrorType.UNKNOWN_ERROR;
  }

  private async attemptRecovery(error: Error): Promise<void> {
    try {
      const webglErrorHandler = WebGLErrorHandler.getInstance();
      const errorType = this.determineErrorType(error);
      const severity = this.determineSeverity(error);
      const { recoveryStrategies } = await import('../../utils/errors/recovery-strategies');
      const strategy = recoveryStrategies.get(errorType);

      // Log error with comprehensive context
      const errorContext = {
        severity,
        context: {
          type: errorType,
          recovery: strategy ? 'attempted' : 'unavailable',
          source: 'ErrorBoundary',
          isWebGLError: error instanceof WebGLContextLostError,
          retryAttempts: strategy?.maxRetries || 0,
          backoffDelay: strategy?.backoffMs || 0,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      };

      webglErrorHandler.handleError(error, errorContext);

    if (strategy) {
      let retryCount = 0;
      const tryRecover = async () => {
        try {
          strategy.fallbackAction();
          this.setState({ hasError: false, error: undefined });
        } catch (recoveryError) {
          if (retryCount < strategy.maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, strategy.backoffMs));
            await tryRecover();
          }
        }
      };
      
      await tryRecover();
    }
    } catch (importError) {
      console.error('Failed to load recovery strategies:', importError);
      // Fallback to basic error display
      this.setState({
        hasError: true,
        error: new Error('Recovery system unavailable: ' + error.message)
      });
    }
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