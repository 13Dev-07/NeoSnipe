import { 
  RequestOptions,
  ApiResponse,
  ApiError,
  HttpClientInterceptor 
} from './ApiTypes';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';
import { ValidationUtils } from '../types/ValidationUtils';

export class HttpClient {
  private interceptors: HttpClientInterceptor[] = [];
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  addInterceptor(interceptor: HttpClientInterceptor): void {
    this.interceptors.push(interceptor);
  }

  removeInterceptor(interceptor: HttpClientInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    try {
      let config = { ...options };
      
      // Run request interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.request) {
          config = await interceptor.request(config);
        }
      }

      // Make the request
      const response = await this.performRequest<T>(config);

      // Run response interceptors
      let processedResponse = response;
      for (const interceptor of this.interceptors) {
        if (interceptor.response) {
          processedResponse = await interceptor.response(processedResponse);
        }
      }

      return processedResponse;
    } catch (error) {
      const apiError = this.normalizeError(error as Error, options);

      // Run error interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.error) {
          await interceptor.error(apiError);
        }
      }

      await this.errorHandler.handleError(apiError, {
        type: ErrorType.API_ERROR,
        context: {
          url: options.url,
          method: options.method,
          status: apiError.status
        }
      });

      throw apiError;
    }
  }

  private async performRequest<T>(config: RequestOptions): Promise<ApiResponse<T>> {
    const { url, method, data, headers = {}, signal } = config;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined,
      signal,
      credentials: config.withCredentials ? 'include' : 'same-origin',
      cache: config.cache
    });

    const responseData = await this.parseResponse<T>(response, config);

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: this.parseHeaders(response.headers),
      config
    };
  }

  private async parseResponse<T>(
    response: Response, 
    config: RequestOptions
  ): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (config.responseType === 'blob') {
      return await response.blob() as unknown as T;
    }

    if (config.responseType === 'arraybuffer') {
      return await response.arrayBuffer() as unknown as T;
    }

    if (config.responseType === 'text' || !contentType?.includes('application/json')) {
      return await response.text() as unknown as T;
    }

    return await response.json();
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private normalizeError(error: Error, config: RequestOptions): ApiError {
    const apiError = error as ApiError;
    apiError.config = config;

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      apiError.message = 'Network Error';
    }

    return apiError;
  }

  // Convenience methods
  async get<T = any>(url: string, config?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}