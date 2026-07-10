export type RequestInterceptor = (
  request: Request,
  controller: AbortController,
) => void;

export type ResponseInterceptor = (
  response: Response,
  request: Request,
  controller: AbortController,
) => void;

export type FatalInterceptor = (
  error: any,
  request: Request,
  controller: AbortController,
) => void;

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  fatal: FatalInterceptor[];
}
export interface RetryConfig {
  maxRetries: number;
  statusForcelist: number[];
  backoffFactor: number;
  methodWhitelist: string[];
}

export interface CustomRequestOptions extends Omit<RequestInit, "signal"> {
  query?: Record<string, string>;
}

export type RequestResponse<T> = Promise<{
  error: boolean;
  data: T;
  response: Response;
}>;

export type RequestInvoker<T> = (
  url: string,
  options?: CustomRequestOptions,
) => RequestResponse<T>;

export type CustomRequest<T> = (
  url: string,
  _fetch: typeof fetch,
  interceptors: Interceptors,
) => RequestInvoker<T>;

export type PromiseFunction = (...args: any[]) => Promise<any>;

export interface RetryWrappedRequest {
  <T>(...args: Parameters<RequestInvoker<T>>): ReturnType<RequestInvoker<T>>;
}
