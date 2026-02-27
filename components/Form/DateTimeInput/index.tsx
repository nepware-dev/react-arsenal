import React from 'react';

import Input, { type InputProps } from '../Input';

const DateTimeInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
    <Input type="datetime-local" {...props} />
);

export default DateTimeInput;
