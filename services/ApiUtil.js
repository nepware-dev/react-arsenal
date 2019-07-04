
export default class ApiUtil {
    constructor(baseUrl, store) {
        this.baseUrl = baseUrl;
        this.store = store;
    }

    async get(url, params) {
        let {auth: { token }} = this.store.getState();
        let headers = {};
        if(token) {
            headers.Authorization = headers.Authorization || 'Bearer '+token;
        }
        var esc = encodeURIComponent;
        var query = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');
        return fetch(`${this.baseUrl}${url}?${query}`, { 
            headers
        });
    }

    async post(url, { headers = {}, body }) {
        let {auth: { token }} = this.store.getState();
        if(token) {
            headers.Authorization = headers.Authorization || 'Bearer '+token;
        }
        url = `${this.baseUrl}${url}`;
      let options = {
            // headers: {
            //     ...headers,
            //     Accept: 'application/json',
            //     'Content-Type': 'application/json',
            // },
            method: 'POST',
            body: JSON.stringify(body)
        };

        return fetch(url, options);
    }

    async futch (url, opts={}, onProgress) {
        let {auth: { token }} = this.store.getState();

        url = `${this.baseUrl}${url}`;
        return new Promise( (res, rej)=>{
            let xhr = new XMLHttpRequest();
            xhr.open(opts.method || 'get', url);
            for (let k in opts.headers||{})
                xhr.setRequestHeader(k, opts.headers[k]);

            if(token) {
                xhr.setRequestHeader('Authorization', 'Bearer '+token);
            }
            xhr.onload = e => res(e.target);
            xhr.onerror = rej;
            if (xhr.upload && onProgress)
                xhr.upload.onprogress = (progressEvent) => {
                    const progress = progressEvent.loaded / progressEvent.total;
                    onProgress(progress);
                }; // event.loaded / event.total * 100 ; //event.lengthComputable
            xhr.send(opts.body);
        });
    }
}
