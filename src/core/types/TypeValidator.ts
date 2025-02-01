export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type TypeDefinition = {
  name: string;
  nullable: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'union';
  validations?: Array<(value: any) => boolean>;
  properties?: Record<string, TypeDefinition>;
  elementType?: TypeDefinition; // For arrays
  enumValues?: string[]; // For enums
  unionTypes?: TypeDefinition[]; // For unions
};

export class TypeValidator {
  private types: Map<string, TypeDefinition> = new Map();

  registerType(definition: TypeDefinition): void {
    this.types.set(definition.name, definition);
  }

  validate(value: unknown, typeName: string): ValidationResult {
    const definition = this.types.get(typeName);
    if (!definition) {
      return {
        isValid: false,
        errors: [`Type definition not found for: ${typeName}`]
      };
    }

    const errors: string[] = [];
    
    if (value === null) {
      if (!definition.nullable) {
        errors.push(`${typeName} cannot be null`);
      }
      return { isValid: errors.length === 0, errors };
    }

    if (value === undefined) {
      errors.push(`${typeName} cannot be undefined`);
      return { isValid: false, errors };
    }

    this.validateValue(value, definition, errors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateValue(value: any, definition: TypeDefinition, errors: string[]): void {
    switch (definition.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Expected string, got ${typeof value}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Expected number, got ${typeof value}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Expected boolean, got ${typeof value}`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`Expected object, got ${typeof value}`);
        } else if (definition.properties) {
          this.validateObject(value, definition.properties, errors);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Expected array, got ${typeof value}`);
        } else if (definition.elementType) {
          value.forEach((element, index) => {
            const elementErrors: string[] = [];
            this.validateValue(element, definition.elementType!, elementErrors);
            errors.push(...elementErrors.map(error => `[${index}] ${error}`));
          });
        }
        break;

      case 'enum':
        if (!definition.enumValues?.includes(value)) {
          errors.push(`Expected one of [${definition.enumValues?.join(', ')}], got ${value}`);
        }
        break;

      case 'union':
        if (!definition.unionTypes?.some(type => {
          const unionErrors: string[] = [];
          this.validateValue(value, type, unionErrors);
          return unionErrors.length === 0;
        })) {
          errors.push(`Value does not match any of the union types`);
        }
        break;
    }

    // Run custom validations if any
    definition.validations?.forEach(validation => {
      if (!validation(value)) {
        errors.push(`Custom validation failed for ${definition.name}`);
      }
    });
  }

  private validateObject(
    obj: Record<string, any>,
    properties: Record<string, TypeDefinition>,
    errors: string[]
  ): void {
    // Check for required properties
    Object.entries(properties).forEach(([key, propDef]) => {
      if (!propDef.nullable && !(key in obj)) {
        errors.push(`Missing required property: ${key}`);
      }
    });

    // Validate each property
    Object.entries(obj).forEach(([key, value]) => {
      const propDef = properties[key];
      if (!propDef) {
        errors.push(`Unknown property: ${key}`);
        return;
      }

      const propErrors: string[] = [];
      this.validateValue(value, propDef, propErrors);
      errors.push(...propErrors.map(error => `${key}: ${error}`));
    });
  }
}