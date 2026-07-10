import "yet-another-abortcontroller-polyfill";
import "whatwg-fetch"; // Fetch Polyfill
import { sleep } from "../utils";

import type {
  CustomRequestOptions,
  FatalInterceptor,
  Interceptors,
  PromiseFunction,
  RequestInterceptor,
  RequestInvoker,
  RequestResponse,
  ResponseInterceptor,
  RetryConfig,
} from "./types";

const request = <T>(
  baseUrl: string,
  originalFetch: typeof fetch,
  interceptors: Interceptors,
): RequestInvoker<T> => {
  return <K>(
    url: string,
    options: CustomRequestOptions = {},
  ): RequestResponse<K> => {
    return new Promise((resolve, reject) => {
      const { query, ...requestInit } = options;
      const _url = getUrl(url, { query });
      const controller = new AbortController();
      const request = new Request(_url, {
        ...requestInit,
        signal: controller.signal,
      });
      interceptors.request.forEach((f) => f(request, controller));
      originalFetch(request)
        .then(async (response) => {
          interceptors.response.forEach((f) =>
            f(response, request, controller),
          );
          let data;
          const contentType = response.headers.get("Content-Type") || "";

          if (/application\/.*json.*$/.test(contentType)) {
            data = await response.clone().json();
          } else if (/text\/event-stream.*$/.test(contentType)) {
            data = null;
          } else if (/text/.test(contentType)) {
            data = await response.clone().text();
          } else {
            data = await response.clone().blob();
          }
          return resolve({ error: !response.ok, data, response });
        })
        .catch((error) => {
          interceptors.fatal.forEach((f) => f(error, request, controller));
          return reject(error);
        });
    });
  };

  function getUrl(_url: string, { query }: CustomRequestOptions = {}) {
    const url = new URL(_url, baseUrl);
    if (query) {
      url.search = new URLSearchParams(query).toString();
    }
    return url.toString();
  }
};

const withRetry = (request: PromiseFunction, config: RetryConfig) => {
  return <T>(...args: Parameters<RequestInvoker<T>>): ReturnType<RequestInvoker<T>> => {
    return new Promise((resolve, reject) => {
      const wrappedRequest = (attempt: number) => {
        request(...args)
          .then((res) => {
            if (shouldRetry(attempt, null, res.response)) {
              retry(attempt);
            } else {
              resolve(res);
            }
          })
          .catch((error: unknown) => {
            if (shouldRetry(attempt, error)) {
              retry(attempt);
            } else {
              reject(error);
            }
          });
      };

      const shouldRetry = (
        attempt: number,
        error: unknown,
        response?: Response,
      ) => {
        if (
          attempt >= config.maxRetries ||
          !config.methodWhitelist.includes(args[1]?.method || "GET")
        ) {
          return false;
        }

        if (
          (response?.status &&
            config.statusForcelist.includes(response.status)) ||
          error
        ) {
          return true;
        }

        return false;
      };

      const retry = async (attempt: number) => {
        attempt += 1;
        //TODO: prefer Retry-After header if available to calculate retryDelay
        const retryDelay = config.backoffFactor * Math.pow(2, attempt - 1);
        console.log(
          `[Retrying request attempt: ${attempt}, waiting for ${retryDelay}sec]`,
        );
        await sleep(retryDelay * 1000);
        wrappedRequest(attempt);
      };
      wrappedRequest(0);
    });
  };
};

class RequestBuilder {
  fetch: typeof fetch;
  baseUrl: string;
  interceptors: Interceptors;
  retryConfig: RetryConfig;

  constructor(baseUrl: string) {
    this.fetch = fetch;
    this.baseUrl = baseUrl?.replace(/\/^/, "");
    this.interceptors = {
      request: [],
      response: [],
      fatal: [],
    };
    this.retryConfig = {
      maxRetries: 5,
      statusForcelist: [429, 500, 502, 503, 504],
      backoffFactor: 0.5,
      methodWhitelist: [
        "HEAD",
        "GET",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
        "TRACE",
      ],
    };
  }

  setRequestInterceptors(interceptors: RequestInterceptor[]) {
    this.interceptors.request = interceptors;
    return this;
  }

  setResponseInterceptors(interceptors: ResponseInterceptor[]) {
    this.interceptors.response = interceptors;
    return this;
  }

  setFatalInterceptors(interceptors: FatalInterceptor[]) {
    this.interceptors.fatal = interceptors;
    return this;
  }

  setRetryConfig(config: Partial<RetryConfig>) {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    };
    return this;
  }

  setFetch(_fetch: typeof fetch) {
    this.fetch = _fetch;
    return this;
  }

  build() {
    const _request = request(this.baseUrl, this.fetch, this.interceptors);
    return withRetry(_request, this.retryConfig);
  }
}

export default RequestBuilder;

export * from './types';
