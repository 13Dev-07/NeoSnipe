import { ErrorType } from '../../core/error/ErrorTypes';
import { ErrorRecoveryStrategy } from '../../core/error/ErrorRecoveryStrategy';

export class WebGLContextLostError extends Error implements WebGLError {
  constructor(message: string = 'WebGL context lost') {
    super(message);
    this.name = 'WebGLContextLostError';
  }
}

// Add more specific error types
export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class APIError extends Error {
  constructor(message: string = 'API error occurred') {
    super(message);
    this.name = 'APIError';
  }
}

export const recoveryStrategies = new Map<ErrorType, ErrorRecoveryStrategy>([
  [ErrorType.RESOURCE_ERROR, {
    maxRetries: 3,
    backoffMs: 1000,
    fallbackAction: () => {
      // Attempt to free up resources
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const gl = canvas.getContext('webgl2');
        if (gl) {
          gl.getExtension('WEBGL_lose_context')?.restoreContext();
        }
      }
    }
  }],
  [ErrorType.MEMORY_ERROR, {
    maxRetries: 2,
    backoffMs: 500,
    fallbackAction: () => {
      // Clear caches and attempt garbage collection
      if (window.gc) {
        window.gc();
      }
    }
  }],
  [ErrorType.INITIALIZATION_ERROR, {
    maxRetries: 1,
    backoffMs: 100,
    fallbackAction: () => {
      // Reset initialization state
      window.location.reload();
    }
  }],
  [ErrorType.NETWORK_ERROR, {
    maxRetries: 3,
    backoffMs: 2000,
    fallbackAction: () => {
      // Retry network request with exponential backoff
      const retryEvent = new CustomEvent('network-retry');
      window.dispatchEvent(retryEvent);
    }
  }],
  [ErrorType.API_ERROR, {
    maxRetries: 2,
    backoffMs: 1500,
    fallbackAction: () => {
      // Clear API cache and retry
      localStorage.removeItem('api-cache');
      const retryEvent = new CustomEvent('api-retry');
      window.dispatchEvent(retryEvent);
    }
  }],
  [ErrorType.TIMEOUT_ERROR, {
    maxRetries: 2,
    backoffMs: 3000,
    fallbackAction: () => {
      // Increase timeout threshold and retry
      const retryEvent = new CustomEvent('timeout-retry', {
        detail: { increaseTimeout: true }
      });
      window.dispatchEvent(retryEvent);
    }
  }],
  [ErrorType.VALIDATION_ERROR, {
    maxRetries: 1,
    backoffMs: 0,
    fallbackAction: () => {
      // Reset form state and validation rules
      const resetEvent = new CustomEvent('validation-reset');
      window.dispatchEvent(resetEvent);
    }
  }],
  [ErrorType.PROCESSING_ERROR, {
    maxRetries: 2,
    backoffMs: 1000,
    fallbackAction: () => {
      // Clear processing queue and restart
      const resetEvent = new CustomEvent('process-reset');
      window.dispatchEvent(resetEvent);
    }
  }]
]);