import { ErrorHandlerConfig, ErrorStats, ErrorContext } from '../../types/sacred-geometry/errors';
import { WebGLError } from '../../types/errors/webgl-errors';

export class WebGLErrorHandler {
  private static instance: WebGLErrorHandler | null = null;
  private readonly MAX_LOG_SIZE = 1000;
  private errorLog: Map<string, ErrorContext[]>;
  private config: ErrorHandlerConfig;

  private constructor(config?: Partial<ErrorHandlerConfig>) {
    this.errorLog = new Map();
    this.config = {
      maxLogSize: config?.maxLogSize || this.MAX_LOG_SIZE,
      errorReporting: {
        enabled: config?.errorReporting?.enabled || false,
        endpoint: config?.errorReporting?.endpoint,
        batchSize: config?.errorReporting?.batchSize || 10,
        interval: config?.errorReporting?.interval || 5000
      },
      development: {
        verbose: config?.development?.verbose || process.env.NODE_ENV === 'development',
        stackTrace: config?.development?.stackTrace || true,
        consoleErrors: config?.development?.consoleErrors || true
      }
    };
  }

  public static getInstance(config?: Partial<ErrorHandlerConfig>): WebGLErrorHandler {
    if (!WebGLErrorHandler.instance) {
      WebGLErrorHandler.instance = new WebGLErrorHandler(config);
    }
    return WebGLErrorHandler.instance;
  }

  public handleError(error: Error, context?: Record<string, any>): void {
    const errorContext: ErrorContext = {
      timestamp: Date.now(),
      severity: this.determineSeverity(error),
      source: error.name,
      message: error.message,
      stack: this.config.development.stackTrace ? error.stack : undefined,
      details: context
    };

    this.logError(errorContext);

    if (this.config.development.consoleErrors) {
      console.error('WebGL Error:', {
        name: error.name,
        message: error.message,
        context: errorContext
      });
    }

    if (errorContext.severity === 'critical') {
      this.handleCriticalError(errorContext);
    }
  }

  private determineSeverity(error: Error): ErrorContext['severity'] {
    if (error instanceof WebGLError) {
      if (error.name === 'ShaderCompilationError' || error.name === 'ProgramLinkError') {
        return 'critical';
      }
      if (error.name === 'ResourceLimitError') {
        return 'high';
      }
      return 'medium';
    }
    return 'low';
  }

  private logError(context: ErrorContext): void {
    const errorKey = context.source;
    const errorLogs = this.errorLog.get(errorKey) || [];
    errorLogs.push(context);

    if (errorLogs.length > this.config.maxLogSize!) {
      errorLogs.shift();
    }

    this.errorLog.set(errorKey, errorLogs);
  }

  private handleCriticalError(context: ErrorContext): void {
    if (this.config.errorReporting.enabled && this.config.errorReporting.endpoint) {
      this.reportError(context);
    }
  }

  private async reportError(context: ErrorContext): Promise<void> {
    try {
      await fetch(this.config.errorReporting.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }

  public getErrorStats(): ErrorStats {
    const stats: ErrorStats = {
      total: 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {},
      lastOccurrence: {},
      recoveryAttempts: {}
    };

    this.errorLog.forEach((errors, type) => {
      stats.byType[type] = errors.length;
      stats.total += errors.length;
      errors.forEach(error => {
        stats.bySeverity[error.severity]++;
        stats.lastOccurrence[type] = Math.max(
          stats.lastOccurrence[type] || 0,
          error.timestamp
        );
      });
    });

    return stats;
  }

  public clearErrorLog(): void {
    this.errorLog.clear();
  }
}