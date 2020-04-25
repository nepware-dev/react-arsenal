const request = (baseUrl, originalFetch, interceptors) => {
    return (url, options={}) => {
        return new Promise((resolve, reject) => {
            const _url = getUrl(url, options);
            const controller = new AbortController();
            const request = new Request(_url, {...options, signal: controller.signal});
            interceptors?.request?.forEach(f => f(request, controller));
            originalFetch(request).then(async response => {
                interceptors?.response?.forEach(f => f(response, request, controller));
                let data;
                if(/application\/json/.test(response.contentType)) {
                    data = await response.json();
                } else if(/text/.test(response.contentType)) {
                    data = await response.text();
                } else {
                    data = await response.blob();
                }
                return resolve({error: !response.ok, data, response});
            }).catch(err => {
                interceptors?.fatal?.forEach(f => f(err, request, controller));
                return reject(err);
            });
        });
    };

    function getUrl(_url, {query}) {
        const url = new URL(_url, baseUrl);
        url.search = new URLSearchParams(query);
        return url.toString();
    }
}

class RequestBuilder {
    constructor(baseUrl) {
        this.baseUrl = baseUrl?.replace(/\/^/, '');
        this.interceptors = {
            request: [],
            response: [],
            fatal: [],
        };
        this.fetch = fetch;
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

    setFetch(_fetch) {
        this.fetch = _fetch;
        return this;
    }

    build() {
        return request(this.baseUrl, this.fetch, this.interceptors);
    }
}

export default RequestBuilder;
