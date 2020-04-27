import RequestBuilder from './request';

const request = new RequestBuilder().setRetryConfig({backoffFactor: 0, maxRetries: 2}).build();

it('test if request error resolves correctly', async() => {
    let error, data;
    ({error, data} = await request('https://jsonplaceholder.typicode.com/todos/1', {
            headers: {'content-type': 'application/json'}
    }));
    expect(error).toBeFalsy();

    ({error, data} = await request('https://httpstat.us/429', {
        headers: {'content-type': 'application/json'}
    }));
    expect(error).toBeTruthy();

    await expect(request('https://non-existant.com/')).rejects.toThrow();
}, 60000);
