export interface DocMetadata {
  title: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  deprecated?: boolean;
  since?: string;
  example?: string;
}

export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  validation?: string[];
}

export interface ReturnDoc {
  type: string;
  description: string;
  nullable: boolean;
  async: boolean;
}

export interface MethodDoc {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  returns: ReturnDoc;
  throws?: string[];
  examples: string[];
  metadata: DocMetadata;
}

export interface PropertyDoc {
  name: string;
  type: string;
  description: string;
  readonly: boolean;
  metadata: DocMetadata;
}

export interface ClassDoc {
  name: string;
  description: string;
  extends?: string;
  implements?: string[];
  constructorDoc?: MethodDoc;
  methods: MethodDoc[];
  properties: PropertyDoc[];
  metadata: DocMetadata;
}

export interface InterfaceDoc {
  name: string;
  description: string;
  extends?: string[];
  methods: MethodDoc[];
  properties: PropertyDoc[];
  metadata: DocMetadata;
}

export interface ModuleDoc {
  name: string;
  description: string;
  classes: ClassDoc[];
  interfaces: InterfaceDoc[];
  functions: MethodDoc[];
  types: TypeDoc[];
  metadata: DocMetadata;
}

export interface TypeDoc {
  name: string;
  description: string;
  type: string;
  members?: string[];
  union?: string[];
  intersection?: string[];
  metadata: DocMetadata;
}

export type DocumentationFormat = 'markdown' | 'html' | 'json' | 'yaml';