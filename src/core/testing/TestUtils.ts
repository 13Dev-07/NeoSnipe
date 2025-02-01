import { ValidationUtils } from '../types/ValidationUtils';

export class TestUtils {
  static async assertThrows(fn: () => any, errorType?: any): Promise<void> {
    let thrown = false;
    try {
      await fn();
    } catch (error) {
      thrown = true;
      if (errorType) {
        if (!(error instanceof errorType)) {
          throw new Error(
            `Expected error of type ${errorType.name} but got ${error.constructor.name}`
          );
        }
      }
    }
    
    if (!thrown) {
      throw new Error('Expected function to throw an error');
    }
  }

  static assertEqual<T>(actual: T, expected: T): void {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  }

  static assertDeepEqual<T>(actual: T, expected: T): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    
    if (actualStr !== expectedStr) {
      throw new Error(
        `Objects are not equal:\nExpected: ${expectedStr}\nActual: ${actualStr}`
      );
    }
  }

  static assertTypeOf(value: unknown, expectedType: string): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(`Expected type ${expectedType} but got ${actualType}`);
    }
  }

  static assertNonNull<T>(value: T | null | undefined, message?: string): asserts value is T {
    ValidationUtils.assertNonNull(value, message);
  }

  static async assertAsync(
    fn: () => Promise<boolean>,
    timeout: number = 5000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await fn()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Async assertion failed after ${timeout}ms`);
  }

  static assertValidatesAgainstSchema<T>(
    value: unknown,
    schemaName: string
  ): asserts value is T {
    const result = ValidationUtils.validateType(value, schemaName);
    if (!result.isValid) {
      throw new Error(
        `Value does not match schema ${schemaName}:\n${result.errors.join('\n')}`
      );
    }
  }

  static createMock<T extends object>(
    implementation: Partial<T> = {}
  ): jest.Mocked<T> {
    const mock = {} as jest.Mocked<T>;
    
    Object.entries(implementation).forEach(([key, value]) => {
      if (typeof value === 'function') {
        mock[key as keyof T] = jest.fn(value) as any;
      } else {
        mock[key as keyof T] = value as any;
      }
    });

    return mock;
  }
}