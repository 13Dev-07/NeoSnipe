import { ErrorType } from '../error/ErrorTypes';

export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  withCredentials?: boolean;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
    retryableErrors: ErrorType[];
  };
}

export interface RequestOptions extends RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  cache?: RequestCache;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestOptions;
}

export interface ApiError extends Error {
  config: RequestOptions;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
}

export interface EndpointDefinition {
  path: string;
  method: RequestOptions['method'];
  config?: Partial<RequestConfig>;
  params?: Record<string, {
    type: 'path' | 'query' | 'header';
    required?: boolean;
    validate?: (value: any) => boolean;
  }>;
  response?: {
    type: string;
    validate?: (data: any) => boolean;
  };
}

export interface Endpoint {
  name: string;
  definition: EndpointDefinition;
  tags?: string[];
  deprecated?: boolean;
  middlewares?: ApiMiddleware[];
}

export interface ApiMiddleware {
  name: string;
  pre?: (config: RequestOptions) => Promise<RequestOptions>;
  post?: (response: ApiResponse) => Promise<ApiResponse>;
  error?: (error: ApiError) => Promise<never>;
}

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  globalMiddlewares?: ApiMiddleware[];
  retry?: {
    maxRetries: number;
    backoffMs: number;
    retryableErrors: ErrorType[];
  };
}

export type HttpClientInterceptor = {
  request?: (config: RequestOptions) => Promise<RequestOptions>;
  response?: (response: ApiResponse) => Promise<ApiResponse>;
  error?: (error: ApiError) => Promise<never>;
};