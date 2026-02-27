import React from 'react';

import Input, { type InputProps } from '../Input';

const FileInput: React.FC<Omit<InputProps, 'type'>> = (props) => <Input type="file" {...props} />;

export default FileInput;
