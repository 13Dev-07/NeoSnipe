export interface ErrorContext {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  stack?: string;
  details?: Record<string, any>;
}

export interface ErrorHandlerConfig {
  maxLogSize?: number;
  errorReporting?: {
    enabled: boolean;
    endpoint?: string;
    batchSize?: number;
    interval?: number;
  };
  development?: {
    verbose: boolean;
    stackTrace: boolean;
    consoleErrors: boolean;
  };
}

export interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  lastOccurrence: Record<string, number>;
  recoveryAttempts: Record<string, number>;
}