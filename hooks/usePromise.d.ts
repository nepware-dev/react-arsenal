type UsePromiseState<T> = {
    loading: boolean;
    error: boolean;
    result: T;
};

export default function usePromise<FN extends (...args: any[]) => Promise<any>>(
    fn: FN,
    options?: Record<string, any>,
    initialParams?: Parameters<FN>
): [UsePromiseState<Awaited<ReturnType<FN>>>, (...args: Parameters<FN>) => Promise<Awaited<ReturnType<FN>>>]
