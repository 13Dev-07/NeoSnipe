import { ErrorType } from './ErrorTypes';

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  backoffMs: number;
  fallbackAction: () => void;
}

export interface ErrorHandlingConfig {
  defaultStrategy: ErrorRecoveryStrategy;
  strategies: Map<ErrorType, ErrorRecoveryStrategy>;
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    destination: 'console' | 'file' | 'remote';
  };
}

export const DEFAULT_ERROR_STRATEGY: ErrorRecoveryStrategy = {
  maxRetries: 3,
  backoffMs: 1000,
  fallbackAction: () => {
    console.error('Default fallback action executed');
  }
};