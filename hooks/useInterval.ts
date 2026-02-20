import { useEffect, useRef } from 'react';

type UseIntervalCallback = () => void;
type UseInterval = (callback: UseIntervalCallback, delay: number, reset?: unknown) => void;

const useInterval: UseInterval = (callback, delay, reset) => {
    const callbackRef = useRef<UseIntervalCallback | null>(null);
    const savedReset = useRef<unknown>(null);

    useEffect(() => {
        callbackRef.current = callback;
        savedReset.current = reset;
    }, [callback, reset]);

    useEffect(() => {
        const tick = () => {
            callbackRef.current?.();
        };
        if (delay !== null || reset !== savedReset.current) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay, reset]);
};

export default useInterval;
