import { useRef, useState, useCallback, useMemo } from 'react';

type StateInitializer<T> = () => T;
type ChangeHandler<T> = (newValue: T) => void;
type ValueExtractor<T, R> = (value: T) => R;

interface UseControlledStateOptions<T, R = T> {
    defaultValue?: T | StateInitializer<T>;
    value?: T;
    onChange?: ChangeHandler<T>;
    valueExtractor?: ValueExtractor<T, R>;
}

export default function useControlledState<T, R = T>(
    defaultStateValue: T | StateInitializer<T>,
    options: UseControlledStateOptions<T, R> = {},
) : [R, ChangeHandler<T>] {
    const { defaultValue, value, onChange, valueExtractor } = options;

    const [innerValue, setInnerValue] = useState<T>(() => {
        if (value !== undefined) {
            return value;
        }
        if (defaultValue !== undefined) {
            return typeof defaultValue === 'function'
                ? (defaultValue as StateInitializer<T>)()
                : defaultValue;
        }
        return typeof defaultStateValue === 'function'
            ? (defaultStateValue as StateInitializer<T>)()
            : defaultStateValue;
    });

    const controlledValue = useMemo<R>(() => {
        const val: T = value !== undefined ? value : innerValue;
        if (valueExtractor) {
            return valueExtractor(val);
        }
        return val as unknown as R;
    }, [value, innerValue, valueExtractor]);

    const onChangeRef = useRef<ChangeHandler<T> | undefined>(onChange);
    onChangeRef.current = onChange;

    const triggerChange = useCallback<ChangeHandler<T>>((newValue) => {
        setInnerValue(newValue);

        if (onChangeRef.current) {
            onChangeRef.current(newValue);
        }
    }, []);

    return [controlledValue, triggerChange];
}
