import React from 'react';

import Input, { type InputProps } from '../Input';

const NumberInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
    <Input type="number" {...props} />
);

export default NumberInput;
