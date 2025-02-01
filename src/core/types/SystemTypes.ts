import { TypeDefinition } from './TypeValidator';

// Core system configuration type definitions
export const SystemConfigTypes: Record<string, TypeDefinition> = {
  ErrorHandlingConfig: {
    name: 'ErrorHandlingConfig',
    type: 'object',
    nullable: false,
    properties: {
      defaultStrategy: {
        name: 'ErrorRecoveryStrategy',
        type: 'object',
        nullable: false,
        properties: {
          maxRetries: {
            name: 'maxRetries',
            type: 'number',
            nullable: false,
            validations: [
              (value: number) => value >= 0 && Number.isInteger(value)
            ]
          },
          backoffMs: {
            name: 'backoffMs',
            type: 'number',
            nullable: false,
            validations: [
              (value: number) => value > 0
            ]
          },
          fallbackAction: {
            name: 'fallbackAction',
            type: 'object',
            nullable: false
          }
        }
      },
      logging: {
        name: 'LoggingConfig',
        type: 'object',
        nullable: false,
        properties: {
          enabled: {
            name: 'enabled',
            type: 'boolean',
            nullable: false
          },
          level: {
            name: 'level',
            type: 'enum',
            nullable: false,
            enumValues: ['error', 'warn', 'info', 'debug']
          },
          destination: {
            name: 'destination',
            type: 'enum',
            nullable: false,
            enumValues: ['console', 'file', 'remote']
          }
        }
      }
    }
  },
  ResourceLimits: {
    name: 'ResourceLimits',
    type: 'object',
    nullable: false,
    properties: {
      maxTextureSize: {
        name: 'maxTextureSize',
        type: 'number',
        nullable: false,
        validations: [
          (value: number) => value > 0 && Number.isInteger(value)
        ]
      },
      maxBufferSize: {
        name: 'maxBufferSize',
        type: 'number',
        nullable: false,
        validations: [
          (value: number) => value > 0 && Number.isInteger(value)
        ]
      },
      maxShaderPrograms: {
        name: 'maxShaderPrograms',
        type: 'number',
        nullable: false,
        validations: [
          (value: number) => value > 0 && Number.isInteger(value)
        ]
      },
      maxTotalMemory: {
        name: 'maxTotalMemory',
        type: 'number',
        nullable: false,
        validations: [
          (value: number) => value > 0 && Number.isInteger(value)
        ]
      }
    }
  }
};