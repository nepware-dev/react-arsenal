import { useCallback } from 'react';

import Input from '../Input';

const NumericInput = (props) => {
    const handleOnInput = useCallback((e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    })
    return (
        <Input type="text" onInput={handleOnInput} {...props} />

    )
}

export default NumericInput;
