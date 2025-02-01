import { 
  DocMetadata,
  ModuleDoc,
  ClassDoc,
  InterfaceDoc,
  MethodDoc,
  PropertyDoc,
  TypeDoc,
  DocumentationFormat
} from './DocumentationTypes';
import { ValidationUtils } from '../types/ValidationUtils';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';
import { TypeValidator } from '../types/TypeValidator';

export class DocumentationGenerator {
  private errorHandler: ErrorHandler;
  private typeValidator: TypeValidator;
  private modules: Map<string, ModuleDoc> = new Map();

  constructor(errorHandler: ErrorHandler, typeValidator: TypeValidator) {
    this.errorHandler = errorHandler;
    this.typeValidator = typeValidator;
  }

  addModule(module: ModuleDoc): void {
    try {
      ValidationUtils.assertNonNull(module, 'Module documentation cannot be null');
      this.validateModule(module);
      this.modules.set(module.name, module);
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { module }
      });
    }
  }

  private validateModule(module: ModuleDoc): void {
    // Validate module structure
    if (!module.name || !module.description) {
      throw new Error('Module must have name and description');
    }

    // Validate classes
    module.classes.forEach(this.validateClass.bind(this));

    // Validate interfaces
    module.interfaces.forEach(this.validateInterface.bind(this));

    // Validate functions
    module.functions.forEach(this.validateMethod.bind(this));

    // Validate types
    module.types.forEach(this.validateType.bind(this));
  }

  private validateClass(classDoc: ClassDoc): void {
    if (!classDoc.name || !classDoc.description) {
      throw new Error('Class must have name and description');
    }

    if (classDoc.constructorDoc) {
      this.validateMethod(classDoc.constructorDoc);
    }

    classDoc.methods.forEach(this.validateMethod.bind(this));
    classDoc.properties.forEach(this.validateProperty.bind(this));
  }

  private validateInterface(interfaceDoc: InterfaceDoc): void {
    if (!interfaceDoc.name || !interfaceDoc.description) {
      throw new Error('Interface must have name and description');
    }

    interfaceDoc.methods.forEach(this.validateMethod.bind(this));
    interfaceDoc.properties.forEach(this.validateProperty.bind(this));
  }

  private validateMethod(methodDoc: MethodDoc): void {
    if (!methodDoc.name || !methodDoc.description) {
      throw new Error('Method must have name and description');
    }

    methodDoc.parameters.forEach(param => {
      if (!param.name || !param.type || !param.description) {
        throw new Error('Parameter must have name, type and description');
      }
    });

    if (!methodDoc.returns.type || !methodDoc.returns.description) {
      throw new Error('Return must have type and description');
    }
  }

  private validateProperty(propertyDoc: PropertyDoc): void {
    if (!propertyDoc.name || !propertyDoc.type || !propertyDoc.description) {
      throw new Error('Property must have name, type and description');
    }
  }

  private validateType(typeDoc: TypeDoc): void {
    if (!typeDoc.name || !typeDoc.description || !typeDoc.type) {
      throw new Error('Type must have name, description and type definition');
    }
  }

  generateDocumentation(format: DocumentationFormat): string {
    try {
      switch (format) {
        case 'markdown':
          return this.generateMarkdown();
        case 'html':
          return this.generateHtml();
        case 'json':
          return this.generateJson();
        case 'yaml':
          return this.generateYaml();
        default:
          throw new Error(`Unsupported documentation format: ${format}`);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.PROCESSING_ERROR,
        context: { format }
      });
      throw error;
    }
  }

  private generateMarkdown(): string {
    let markdown = '# API Documentation\n\n';

    this.modules.forEach(module => {
      markdown += this.generateModuleMarkdown(module);
    });

    return markdown;
  }

  private generateModuleMarkdown(module: ModuleDoc): string {
    let markdown = `## ${module.name}\n\n${module.description}\n\n`;

    if (module.classes.length > 0) {
      markdown += '### Classes\n\n';
      module.classes.forEach(classDoc => {
        markdown += this.generateClassMarkdown(classDoc);
      });
    }

    if (module.interfaces.length > 0) {
      markdown += '### Interfaces\n\n';
      module.interfaces.forEach(interfaceDoc => {
        markdown += this.generateInterfaceMarkdown(interfaceDoc);
      });
    }

    return markdown;
  }

  private generateClassMarkdown(classDoc: ClassDoc): string {
    let markdown = `#### ${classDoc.name}\n\n${classDoc.description}\n\n`;

    if (classDoc.extends) {
      markdown += `Extends: ${classDoc.extends}\n\n`;
    }

    if (classDoc.implements) {
      markdown += `Implements: ${classDoc.implements.join(', ')}\n\n`;
    }

    if (classDoc.constructorDoc) {
      markdown += '##### Constructor\n\n';
      markdown += this.generateMethodMarkdown(classDoc.constructorDoc);
    }

    if (classDoc.properties.length > 0) {
      markdown += '##### Properties\n\n';
      classDoc.properties.forEach(prop => {
        markdown += this.generatePropertyMarkdown(prop);
      });
    }

    if (classDoc.methods.length > 0) {
      markdown += '##### Methods\n\n';
      classDoc.methods.forEach(method => {
        markdown += this.generateMethodMarkdown(method);
      });
    }

    return markdown;
  }

  private generateInterfaceMarkdown(interfaceDoc: InterfaceDoc): string {
    let markdown = `#### ${interfaceDoc.name}\n\n${interfaceDoc.description}\n\n`;

    if (interfaceDoc.extends) {
      markdown += `Extends: ${interfaceDoc.extends.join(', ')}\n\n`;
    }

    if (interfaceDoc.properties.length > 0) {
      markdown += '##### Properties\n\n';
      interfaceDoc.properties.forEach(prop => {
        markdown += this.generatePropertyMarkdown(prop);
      });
    }

    if (interfaceDoc.methods.length > 0) {
      markdown += '##### Methods\n\n';
      interfaceDoc.methods.forEach(method => {
        markdown += this.generateMethodMarkdown(method);
      });
    }

    return markdown;
  }

  private generateMethodMarkdown(methodDoc: MethodDoc): string {
    let markdown = `###### ${methodDoc.name}\n\n${methodDoc.description}\n\n`;

    if (methodDoc.parameters.length > 0) {
      markdown += 'Parameters:\n';
      methodDoc.parameters.forEach(param => {
        markdown += `- ${param.name} (${param.type}): ${param.description}\n`;
        if (param.defaultValue) {
          markdown += `  Default: ${param.defaultValue}\n`;
        }
      });
      markdown += '\n';
    }

    markdown += `Returns: ${methodDoc.returns.type} - ${methodDoc.returns.description}\n\n`;

    if (methodDoc.examples.length > 0) {
      markdown += 'Examples:\n```typescript\n';
      markdown += methodDoc.examples.join('\n\n');
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  private generatePropertyMarkdown(propertyDoc: PropertyDoc): string {
    return `###### ${propertyDoc.name}\n\n` +
      `Type: ${propertyDoc.type}\n\n` +
      `${propertyDoc.description}\n\n` +
      `${propertyDoc.readonly ? 'Readonly: true\n\n' : ''}`;
  }

  private generateHtml(): string {
    // TODO: Implement HTML generation
    throw new Error('HTML generation not yet implemented');
  }

  private generateJson(): string {
    return JSON.stringify(Array.from(this.modules.values()), null, 2);
  }

  private generateYaml(): string {
    // TODO: Implement YAML generation
    throw new Error('YAML generation not yet implemented');
  }

  getModule(name: string): ModuleDoc | undefined {
    return this.modules.get(name);
  }

  getAllModules(): ModuleDoc[] {
    return Array.from(this.modules.values());
  }
}