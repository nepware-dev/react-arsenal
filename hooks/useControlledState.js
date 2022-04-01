import {useEffect, useRef, useState, useCallback, useMemo} from 'react';

export default function useControlledState(defaultStateValue, options = {}) {
    const {defaultValue, value, onChange, valueExtractor} = options;

    const [innerValue, setInnerValue] = useState(() => {
        if(value !== undefined) {
            return value;
        }
        if(defaultValue !== undefined) {
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
        return typeof defaultStateValue === 'function' ? defaultStateValue() : defaultStateValue;
    });

    let controlledValue = useMemo(() => {
        const val = value !== undefined ? value : innerValue;
        if (valueExtractor) {
            return valueExtractor(val);
        }
        return val;
    }, [value, innerValue, valueExtractor]);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const triggerChange = useCallback((newValue) => {
        setInnerValue(newValue);
        if(onChangeRef.current) {
            onChangeRef.current(newValue);
        }
    }, []);

    return [controlledValue, triggerChange];
};
