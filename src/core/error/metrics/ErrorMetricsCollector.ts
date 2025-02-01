import { ErrorMetrics, ErrorRecoveryMetrics } from '../types/ErrorMetrics';
import { ErrorMetadata } from '../ErrorTypes';

export class ErrorMetricsCollector {
  private errorCount: number = 0;
  private typeCount: Map<string, number> = new Map();
  private recoveryAttempts: number = 0;
  private recoverySuccesses: number = 0;
  private totalRecoveryTime: number = 0;
  private lastErrorData?: {
    timestamp: number;
    type: string;
    message: string;
  };

  public recordError(metadata: ErrorMetadata): void {
    this.errorCount++;
    
    const currentCount = this.typeCount.get(metadata.type) || 0;
    this.typeCount.set(metadata.type, currentCount + 1);

    this.lastErrorData = {
      timestamp: metadata.timestamp,
      type: metadata.type,
      message: metadata.message
    };
  }

  public recordRecoveryAttempt(success: boolean, duration: number): void {
    this.recoveryAttempts++;
    if (success) {
      this.recoverySuccesses++;
    }
    this.totalRecoveryTime += duration;
  }

  public getMetrics(): ErrorMetrics {
    return {
      totalErrors: this.errorCount,
      errorsByType: this.typeCount,
      recoveryRate: this.recoveryAttempts > 0 
        ? this.recoverySuccesses / this.recoveryAttempts 
        : 0,
      averageRecoveryTime: this.recoveryAttempts > 0 
        ? this.totalRecoveryTime / this.recoveryAttempts 
        : 0,
      lastError: this.lastErrorData
    };
  }

  public getRecoveryMetrics(): ErrorRecoveryMetrics {
    return {
      attempts: this.recoveryAttempts,
      successes: this.recoverySuccesses,
      failures: this.recoveryAttempts - this.recoverySuccesses,
      averageAttempts: this.errorCount > 0 
        ? this.recoveryAttempts / this.errorCount 
        : 0,
      totalRecoveryTime: this.totalRecoveryTime
    };
  }

  public reset(): void {
    this.errorCount = 0;
    this.typeCount.clear();
    this.recoveryAttempts = 0;
    this.recoverySuccesses = 0;
    this.totalRecoveryTime = 0;
    this.lastErrorData = undefined;
  }
}