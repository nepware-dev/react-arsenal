type UsePromiseState = {
    loading: boolean;
    error: boolean;
    result: any;
}

export default (fn: (...arg: any[]) => Promise<any>, options?: Record<string, any>, initialParams?: any[]) => [UsePromiseState, () => (any | Promise<any>)];

