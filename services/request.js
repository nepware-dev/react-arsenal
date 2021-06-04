import 'yet-another-abortcontroller-polyfill';
import 'whatwg-fetch'; // Fetch Polyfill
import {sleep} from '../utils';

const request = (baseUrl, originalFetch, interceptors) => {
    return (url, options={}) => {
        return new Promise((resolve, reject) => {
            const _url = getUrl(url, options);
            const controller = new AbortController();
            const request = new Request(_url, {...options, signal: controller.signal});
            interceptors.request.forEach(f => f(request, controller));
            originalFetch(request).then(async response => {
                interceptors.response.forEach(f => f(response, request, controller));
                let data;
                if(/application\/.*json.*$/.test(response.headers.get('Content-Type'))) {
                    data = await response.json();
                } else if(/text/.test(response.headers.get('Content-Type'))) {
                    data = await response.text();
                } else {
                    data = await response.blob();
                }
                return resolve({error: !response.ok, data, response});
            }).catch(error => {
                interceptors.fatal.forEach(f => f(error, request, controller));
                return reject(error);
            });
        });
    };

    function getUrl(_url, {query}) {
        const url = new URL(_url, baseUrl);
        if(query) {
            url.search = new URLSearchParams(query);
        }
        return url.toString();
    }
}

const withRetry = (request, config) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            const wrappedRequest = (attempt) => {
                request(...args).then(res => {
                    if(shouldRetry(attempt, null, res.response)) {
                        retry(attempt, null, res.response);
                    } else {
                        resolve(res);
                    }
                }).catch(error => {
                    if(shouldRetry(attempt, error)) {
                        retry(attempt, error);
                    } else {
                        reject(error);
                    }
                });
            }

            const shouldRetry = (attempt, error, response) => {
                if(
                    attempt >= config.maxRetries
                    || !config.methodWhitelist.includes(args[1]?.method || 'GET')
                ) {
                    return false;
                }

                if(config.statusForcelist.includes(response?.status) || error) {
                    return true;
                }

                return false;
            }

            const retry = async (attempt) => {
                attempt+=1;
                //TODO: prefer Retry-After header if available to calculate retryDelay
                const retryDelay = config.backoffFactor*Math.pow(2, attempt-1);
                console.log(`[Retrying request attempt: ${attempt}, waiting for ${retryDelay}sec]`);
                await sleep(retryDelay*1000);
                wrappedRequest(attempt);
            }
            wrappedRequest(0);
        });
    };
}


class RequestBuilder {
    constructor(baseUrl) {
        this.fetch = fetch;
        this.baseUrl = baseUrl?.replace(/\/^/, '');
        this.interceptors = {
            request: [],
            response: [],
            fatal: [],
        };
        this.retryConfig = {
            maxRetries: 5,
            statusForcelist: [429, 500, 502, 503, 504],
            backoffFactor: 0.5,
            methodWhitelist: ["HEAD", "GET", "PUT", "PATCH","DELETE", "OPTIONS", "TRACE"],
        };
    }

    setRequestInterceptors(interceptors) {
        this.interceptors.request = interceptors;
        return this;
    }

    setResponseInterceptors(interceptors) {
        this.interceptors.response = interceptors;
        return this;
    }

    setFatalInterceptors(interceptors) {
        this.interceptors.fatal = interceptors;
        return this;
    }

    setRetryConfig(config) {
        this.retryConfig = {
            ...this.retryConfig,
            ...config,
        };
        return this;
    }

    setFetch(_fetch) {
        this.fetch = _fetch;
        return this;
    }

    build() {
        const _request = request(this.baseUrl, this.fetch, this.interceptors);
        return withRetry(_request, this.retryConfig);
    }
}

export default RequestBuilder;
