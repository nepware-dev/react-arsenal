import RequestBuilder from './request';

const request = new RequestBuilder().build();

it('test if request error resolves correctly', async() => {
    let error, data;
    ({error, data} = await request('https://jsonplaceholder.typicode.com/todos/1', {
            headers: {'content-type': 'application/json'}
    }));
    expect(error).toBeFalsy();
    ({error, data} = await request('https://httpstat.us/406', {
        headers: {'content-type': 'application/json'}
    }));
    expect(error).toBeTruthy();
});
