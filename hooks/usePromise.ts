import { useReducer, useCallback } from 'react';

type UsePromiseState<T> = {
    loading: boolean;
    error: unknown;
    result: T | null;
};

type PromiseFunction = (...args: any[]) => Promise<any>;

const initialState = {
    loading: false,
    error: false,
    result: null,
};

// TODO: Implement options and initial params
function usePromise<FN extends PromiseFunction>(
    fn: FN,
    options?: Record<string, any>,
    initialParams?: Parameters<FN>,
): [
    UsePromiseState<Awaited<ReturnType<FN>>>,
    (...args: Parameters<FN>) => Promise<Awaited<ReturnType<FN>>>,
] {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'PENDING':
                return { ...initialState, loading: true };
            case 'RESOLVED':
                return { ...initialState, result: action.result };
            case 'REJECTED':
                return { ...initialState, error: action.error };
            default:
                return state;
        }
    }, initialState);

    const trigger = useCallback(
        async (...args: Parameters<FN>) => {
            dispatch({ type: 'PENDING' });
            try {
                const result = await fn(...args);
                dispatch({ type: 'RESOLVED', result });
                return result;
            } catch (err) {
                dispatch({ type: 'REJECTED', error: err });
                throw err;
            }
        },
        [fn, options],
    );

    return [state, trigger];
}

export default usePromise;
