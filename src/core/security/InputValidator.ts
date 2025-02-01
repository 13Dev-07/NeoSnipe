import { ValidationUtils } from '../types/ValidationUtils';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';

export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export type ValidationRules = Record<string, ValidationRule>;

export interface ValidationError {
  field: string;
  message: string;
}

export class InputValidator {
  private errorHandler: ErrorHandler;
  private readonly defaultRules: ValidationRules = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    },
    password: {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
    },
    username: {
      pattern: /^[a-zA-Z0-9_-]+$/,
      minLength: 3,
      maxLength: 32,
      message: 'Username must be 3-32 characters long and contain only letters, numbers, underscores and hyphens'
    }
  };

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  validate(
    input: Record<string, unknown>,
    rules: ValidationRules
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      Object.entries(rules).forEach(([field, rule]) => {
        const value = input[field];

        // Check required fields
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field,
            message: rule.message || `${field} is required`
          });
          return;
        }

        // Skip validation for optional empty fields
        if (!rule.required && (value === undefined || value === null || value === '')) {
          return;
        }

        // Validate pattern
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push({
            field,
            message: rule.message || `${field} format is invalid`
          });
        }

        // Validate length
        if (typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push({
              field,
              message: rule.message || `${field} must be at least ${rule.minLength} characters`
            });
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push({
              field,
              message: rule.message || `${field} must be no more than ${rule.maxLength} characters`
            });
          }
        }

        // Run custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push({
            field,
            message: rule.message || `${field} is invalid`
          });
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { input, rules }
      });
    }

    return errors;
  }

  sanitize(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    try {
      Object.entries(input).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Remove any HTML tags
          sanitized[key] = value.replace(/<[^>]*>/g, '');
          
          // Encode special characters
          sanitized[key] = this.encodeHtml(sanitized[key] as string);
          
          // Normalize whitespace
          sanitized[key] = (sanitized[key] as string).trim().replace(/\s+/g, ' ');
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            typeof item === 'string' ? this.encodeHtml(item) : item
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitize(value as Record<string, unknown>);
        } else {
          sanitized[key] = value;
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { input }
      });
    }

    return sanitized;
  }

  private encodeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  getDefaultRules(): ValidationRules {
    return { ...this.defaultRules };
  }
}