import {
  ApiConfig,
  Endpoint,
  ApiMiddleware,
  RequestOptions,
  ApiResponse,
  RequestConfig
} from './ApiTypes';
import { HttpClient } from './HttpClient';
import { ErrorHandler } from '../error/ErrorHandler';
import { ValidationUtils } from '../types/ValidationUtils';

export class ApiClient {
  private config: ApiConfig;
  private endpoints: Map<string, Endpoint> = new Map();
  private httpClient: HttpClient;
  private middlewares: ApiMiddleware[] = [];

  constructor(config: ApiConfig, errorHandler: ErrorHandler) {
    this.config = config;
    this.httpClient = new HttpClient(errorHandler);
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    // Add global middlewares
    if (this.config.globalMiddlewares) {
      this.middlewares.push(...this.config.globalMiddlewares);
    }

    // Add retry middleware if configured
    if (this.config.retry) {
      this.middlewares.push(this.createRetryMiddleware(this.config.retry));
    }

    // Initialize all middlewares as interceptors
    this.middlewares.forEach(middleware => {
      this.httpClient.addInterceptor({
        request: middleware.pre,
        response: middleware.post,
        error: middleware.error
      });
    });
  }

  registerEndpoint(name: string, endpoint: Endpoint): void {
    ValidationUtils.assertNonNull(endpoint, 'Endpoint cannot be null');
    this.endpoints.set(name, endpoint);
  }

  async call<T = any>(
    endpointName: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointName}`);
    }

    if (endpoint.deprecated) {
      console.warn(`Warning: Endpoint ${endpointName} is deprecated`);
    }

    const requestConfig = this.buildRequestConfig(endpoint, params, config);
    return this.httpClient.request<T>(requestConfig);
  }

  private buildRequestConfig(
    endpoint: Endpoint,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): RequestOptions {
    let url = this.config.baseURL + endpoint.definition.path;
    const queryParams: Record<string, string> = {};
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...config?.headers
    };

    // Process parameters
    if (endpoint.definition.params && params) {
      Object.entries(endpoint.definition.params).forEach(([key, paramConfig]) => {
        const value = params[key];

        if (paramConfig.required && value === undefined) {
          throw new Error(`Required parameter missing: ${key}`);
        }

        if (value !== undefined) {
          if (paramConfig.validate && !paramConfig.validate(value)) {
            throw new Error(`Invalid parameter value for: ${key}`);
          }

          switch (paramConfig.type) {
            case 'path':
              url = url.replace(`{${key}}`, encodeURIComponent(value));
              break;
            case 'query':
              queryParams[key] = String(value);
              break;
            case 'header':
              headers[key] = String(value);
              break;
          }
        }
      });
    }

    // Build query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    if (queryString) {
      url += `?${queryString}`;
    }

    return {
      ...endpoint.definition.config,
      ...config,
      method: endpoint.definition.method,
      url,
      headers,
      timeout: config?.timeout || this.config.timeout
    };
  }

  private createRetryMiddleware(retryConfig: Required<ApiConfig>['retry']): ApiMiddleware {
    return {
      name: 'RetryMiddleware',
      error: async (error) => {
        const retryCount = (error as any).retryCount || 0;

        if (
          retryCount < retryConfig.maxRetries &&
          retryConfig.retryableErrors.includes(error.name as ErrorType)
        ) {
          const delay = retryConfig.backoffMs * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));

          (error as any).retryCount = retryCount + 1;
          return this.httpClient.request({
            ...error.config,
            signal: undefined // Clear any abort signal
          });
        }

        throw error;
      }
    };
  }

  getEndpoint(name: string): Endpoint | undefined {
    return this.endpoints.get(name);
  }

  getAllEndpoints(): Endpoint[] {
    return Array.from(this.endpoints.values());
  }

  addMiddleware(middleware: ApiMiddleware): void {
    this.middlewares.push(middleware);
    this.httpClient.addInterceptor({
      request: middleware.pre,
      response: middleware.post,
      error: middleware.error
    });
  }
}