import { describe, it, expect, vi } from 'vitest';

import RequestBuilder from './request';

const jsonResponse = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

// backoffFactor 0 keeps retries instant; maxRetries 2 => up to 3 total attempts.
const buildRequest = (mockFetch) =>
    new RequestBuilder().setFetch(mockFetch).setRetryConfig({ backoffFactor: 0, maxRetries: 2 }).build();

describe('RequestBuilder', () => {
    it('resolves with data and no error on a successful response', async () => {
        const mockFetch = vi.fn().mockResolvedValue(jsonResponse({ id: 1, title: 'todo' }));
        const request = buildRequest(mockFetch);

        const { error, data } = await request('https://api.test/todos/1', {
            headers: { 'content-type': 'application/json' },
        });

        expect(error).toBeFalsy();
        expect(data).toEqual({ id: 1, title: 'todo' });
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries a retryable status code and resolves with an error after exhausting retries', async () => {
        const mockFetch = vi.fn().mockResolvedValue(jsonResponse({ message: 'Too Many Requests' }, 429));
        const request = buildRequest(mockFetch);

        const { error } = await request('https://api.test/rate-limited', {
            headers: { 'content-type': 'application/json' },
        });

        expect(error).toBeTruthy();
        // initial attempt + 2 retries
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('rejects when the underlying fetch fails', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new TypeError('Network request failed'));
        const request = buildRequest(mockFetch);

        await expect(request('https://non-existent.test/')).rejects.toThrow();
        // initial attempt + 2 retries
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});
