import React, { useCallback } from 'react';

import Input, { type InputProps } from '../Input';

const NumericInput: React.FC<Omit<InputProps, 'type'>> = (props) => {
    const handleOnInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
    }, []);

    return <Input type="text" onInput={handleOnInput} {...props} />;
};

export default NumericInput;
