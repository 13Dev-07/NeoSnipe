import { ValidationError } from './validation-error';
import { WebGLError } from './webgl-error';

interface ErrorMetadata {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Map<string, ErrorMetadata[]>;
  private readonly MAX_LOG_SIZE = 100;

  private constructor() {
    this.errorLog = new Map();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error, context?: Record<string, any>): void {
    let severity: ErrorMetadata['severity'] = 'medium';

    // Determine error severity
    if (error instanceof WebGLError) {
      severity = 'high';
    } else if (error instanceof ValidationError) {
      severity = 'low';
    } else if (error.name === 'FatalError') {
      severity = 'critical';
    }

    // Log error with metadata
    const metadata: ErrorMetadata = {
      timestamp: Date.now(),
      severity,
      context
    };

    const errorKey = error.name;
    const errorLogs = this.errorLog.get(errorKey) || [];
    errorLogs.push(metadata);

    // Maintain max log size
    if (errorLogs.length > this.MAX_LOG_SIZE) {
      errorLogs.shift();
    }

    this.errorLog.set(errorKey, errorLogs);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        metadata
      });
    }

    // Report critical errors
    if (severity === 'critical') {
      this.reportCriticalError(error, metadata);
    }
  }

  private reportCriticalError(error: Error, metadata: ErrorMetadata): void {
    // TODO: Implement error reporting service integration
    console.error('Critical Error:', {
      error,
      metadata
    });
  }

  getErrorStats(): Record<string, { count: number; lastOccurrence: number }> {
    const stats: Record<string, { count: number; lastOccurrence: number }> = {};
    
    this.errorLog.forEach((logs, errorType) => {
      stats[errorType] = {
        count: logs.length,
        lastOccurrence: logs[logs.length - 1]?.timestamp || 0
      };
    });

    return stats;
  }

  clearErrorLog(): void {
    this.errorLog.clear();
  }
}

export default ErrorHandler.getInstance();