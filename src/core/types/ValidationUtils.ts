import { TypeValidator, TypeDefinition, ValidationResult } from './TypeValidator';
import { SystemConfigTypes } from './SystemTypes';

export class ValidationUtils {
  private static validator: TypeValidator;

  static initialize(): void {
    ValidationUtils.validator = new TypeValidator();
    
    // Register all system types
    Object.values(SystemConfigTypes).forEach(type => {
      ValidationUtils.validator.registerType(type);
    });
  }

  static validateType(value: unknown, typeName: string): ValidationResult {
    if (!ValidationUtils.validator) {
      ValidationUtils.initialize();
    }
    return ValidationUtils.validator.validate(value, typeName);
  }

  static registerCustomType(definition: TypeDefinition): void {
    if (!ValidationUtils.validator) {
      ValidationUtils.initialize();
    }
    ValidationUtils.validator.registerType(definition);
  }

  // Utility function to ensure non-null values
  static assertNonNull<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value cannot be null or undefined');
    }
    return value;
  }

  // Type guard utility
  static isOfType<T>(value: unknown, typeCheck: (value: unknown) => value is T): value is T {
    return typeCheck(value);
  }

  // Runtime type checking utilities
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isArray<T>(value: unknown, elementCheck: (element: unknown) => element is T): value is T[] {
    return Array.isArray(value) && value.every(elementCheck);
  }
}