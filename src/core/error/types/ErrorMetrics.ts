export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Map<string, number>;
  recoveryRate: number;
  averageRecoveryTime: number;
  lastError?: {
    timestamp: number;
    type: string;
    message: string;
  };
}

export interface ErrorRecoveryMetrics {
  attempts: number;
  successes: number;
  failures: number;
  averageAttempts: number;
  totalRecoveryTime: number;
}