export enum ErrorType {
  // System-level errors
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Runtime errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Resource management errors
  MEMORY_ERROR = 'MEMORY_ERROR',
  RESOURCE_LIMIT_ERROR = 'RESOURCE_LIMIT_ERROR',
  
  // External integration errors
  API_ERROR = 'API_ERROR',
  THIRD_PARTY_ERROR = 'THIRD_PARTY_ERROR',
  
  // Unknown/Unhandled errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorMetadata {
  type: ErrorType;
  message: string;
  timestamp: number;
  stackTrace?: string;
  context?: Record<string, unknown>;
}