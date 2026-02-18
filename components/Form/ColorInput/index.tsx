import React from 'react';

import Input, { type InputProps }  from '../Input';

const ColorInput: React.FC<Omit<InputProps, 'type'>> = (props) => <Input type="color" {...props} />;

export default ColorInput;
