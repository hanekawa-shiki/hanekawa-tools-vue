import request from '@/lib/request';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
}

export interface ApiRequestOptions {
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function createApi<TResponse = unknown>(config: ApiRequestConfig) {
  return async (options?: ApiRequestOptions): Promise<TResponse> => {
    return request
      .request<TResponse>({
        method: config.method,
        url: config.url,
        data: options?.data,
        params: options?.params,
        headers: {
          ...config.headers,
          ...options?.headers,
        },
      })
      .then((res) => res.data);
  };
}
