import { ErrorType, ErrorMetadata } from './ErrorTypes';
import { ErrorHandlingConfig, ErrorRecoveryStrategy, DEFAULT_ERROR_STRATEGY } from './ErrorRecoveryStrategy';
import { ErrorLogger, ErrorLogConfig } from './logging/ErrorLogger';
import { ErrorMetricsCollector } from './metrics/ErrorMetricsCollector';

export class ErrorHandler {
  private logger: ErrorLogger;
  private metricsCollector: ErrorMetricsCollector;
  private config: ErrorHandlingConfig;
  private retryCount: Map<string, number> = new Map();

  constructor(config?: Partial<ErrorHandlingConfig>) {
    this.logger = new ErrorLogger(config?.logging || {
      enabled: true,
      logToConsole: true,
      logToFile: false
    });
    
    this.metricsCollector = new ErrorMetricsCollector();
    
    this.config = {
      defaultStrategy: DEFAULT_ERROR_STRATEGY,
      strategies: new Map(),
      logging: {
        enabled: true,
        logToConsole: true,
        logToFile: false
      },
      ...config
    };
  }

  public async handleError(error: Error, metadata: Partial<ErrorMetadata> = {}): Promise<void> {
    try {
      const startTime = Date.now();
      const errorMeta: ErrorMetadata = {
        type: metadata.type || ErrorType.UNKNOWN_ERROR,
        message: error.message,
        timestamp: startTime,
        stackTrace: error.stack,
        context: metadata.context || {}
      };

      // Record the error in metrics
      this.metricsCollector.recordError(errorMeta);

      // Log the error
      await this.logError(errorMeta);

      // Get and execute recovery strategy
      const strategy = this.getStrategy(errorMeta.type);
      const errorKey = this.getErrorKey(errorMeta);
      const currentRetries = this.retryCount.get(errorKey) || 0;

      if (currentRetries < strategy.maxRetries) {
        const success = await this.retryOperation(errorMeta, strategy, currentRetries);
        this.metricsCollector.recordRecoveryAttempt(success, Date.now() - startTime);
      } else {
        await this.executeFailbackAction(strategy, errorMeta);
        this.metricsCollector.recordRecoveryAttempt(false, Date.now() - startTime);
      }
    } catch (error) {
      console.error('Error in error handling chain:', error);
      throw error;
    }
  }

  private getStrategy(errorType: ErrorType): ErrorRecoveryStrategy {
    return this.config.strategies.get(errorType) || this.config.defaultStrategy;
  }

  private getErrorKey(metadata: ErrorMetadata): string {
    return `${metadata.type}:${metadata.message}`;
  }

  private async retryOperation(
    metadata: ErrorMetadata,
    strategy: ErrorRecoveryStrategy,
    currentRetries: number
  ): Promise<boolean> {
    try {
      const retryDelay = strategy.backoffMs * Math.pow(2, currentRetries);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      this.retryCount.set(
        this.getErrorKey(metadata),
        currentRetries + 1
      );

      if (strategy.retryAction) {
        await strategy.retryAction(metadata);
      }

      return true;
    } catch (error) {
      console.error('Error during retry operation:', error);
      return false;
    }
  }

  private async executeFailbackAction(
    strategy: ErrorRecoveryStrategy, 
    metadata: ErrorMetadata
  ): Promise<void> {
    try {
      if (strategy.failbackAction) {
        await strategy.failbackAction(metadata);
      }
    } catch (error) {
      console.error('Error executing failback action:', error);
      throw error;
    }
  }

  private async logError(metadata: ErrorMetadata): Promise<void> {
    if (!this.config.logging.enabled) return;
    
    try {
      await this.logger.log(metadata);
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  public getErrorMetrics() {
    return this.metricsCollector.getMetrics();
  }

  public getRecoveryMetrics() {
    return this.metricsCollector.getRecoveryMetrics();
  }

  public resetMetrics() {
    this.metricsCollector.reset();
  }
}