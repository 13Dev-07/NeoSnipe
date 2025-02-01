export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PatternValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'PatternValidationError';
  }
}

export class ConfigValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export class ResourceValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceValidationError';
  }
}