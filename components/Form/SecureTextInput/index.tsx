import React from 'react';

import Input, { type InputProps } from '../Input';

const SecureTextInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
    <Input type="password" {...props} />
);

export default SecureTextInput;
