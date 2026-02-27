import React from 'react';

import Input, { type InputProps } from '../Input';

const DateInput: React.FC<Omit<InputProps, 'type'>> = (props) => <Input type="date" {...props} />;

export default DateInput;
