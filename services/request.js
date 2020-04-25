const request = (baseUrl, originalFetch, interceptors) => {
    return (url, config={}) => {
        return new Promise((resolve, reject) => {
            const _url = getUrl(url, config);
            const request = new Request(_url, config);
            interceptors?.request?.forEach(f => f(request));
            originalFetch(request).then(async response => {
                interceptors?.response?.forEach(f => f(response));
                let data;
                if(response.contentType?.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                return resolve({error: !response.ok, data, response});
            }).catch(err => {
                interceptors?.error?.forEach(f => f(err, request));
                return reject(err);
            });
        });
    };

    function getUrl(_url, {query}) {
        const url = new URL(_url, baseUrl).toString();
        const querystring = new URLSearchParams(query).toString();
        return querystring?`${url}?${querystring}`:url;
    }
}

class RequestBuilder {
    constructor(baseUrl) {
        this.baseUrl = baseUrl?.replace(/\/^/, '');
        this.interceptors = {
            request: [],
            response: [],
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

    setFetch(_fetch) {
        this.fetch = _fetch;
        return this;
    }

    build() {
        return request(this.baseUrl, this.fetch, this.interceptors);
    }
}

export default RequestBuilder;
