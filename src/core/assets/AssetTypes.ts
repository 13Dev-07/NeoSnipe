import { ResourceType } from '../memory/ResourceTypes';

export interface AssetMetadata {
  id: string;
  type: AssetType;
  size: number;
  format: string;
  width?: number;
  height?: number;
  mipLevels?: number;
  compressed?: boolean;
  lastModified: number;
  hash: string;
}

export enum AssetType {
  TEXTURE = 'TEXTURE',
  MODEL = 'MODEL',
  AUDIO = 'AUDIO',
  SHADER = 'SHADER',
  FONT = 'FONT',
  DATA = 'DATA'
}

export interface AssetLoadOptions {
  priority?: number;
  timeout?: number;
  retries?: number;
  preferCompressed?: boolean;
  generateMips?: boolean;
  placeholder?: any;
  onProgress?: (progress: number) => void;
}

export interface AssetRequest {
  url: string;
  type: AssetType;
  options?: AssetLoadOptions;
}

export interface LoadedAsset<T = any> {
  data: T;
  metadata: AssetMetadata;
  loaded: boolean;
  error?: Error;
}

export type AssetLoader<T = any> = {
  supportedTypes: AssetType[];
  supportedFormats: string[];
  load: (request: AssetRequest) => Promise<LoadedAsset<T>>;
  unload?: (asset: LoadedAsset<T>) => Promise<void>;
  createPlaceholder?: () => T;
};

export interface AssetCache {
  maxSize: number;
  maxEntries: number;
  ttl: number; // Time to live in ms
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface AssetManagerConfig {
  baseUrl?: string;
  cache?: Partial<AssetCache>;
  defaultLoadOptions?: Partial<AssetLoadOptions>;
  resourceMapping?: Map<AssetType, ResourceType>;
}

export interface AssetBatch {
  id: string;
  assets: AssetRequest[];
  onProgress?: (overall: number, individual: Map<string, number>) => void;
  onComplete?: (assets: Map<string, LoadedAsset>) => void;
  priority?: number;
}