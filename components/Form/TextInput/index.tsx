import React from 'react';

import styles from './styles.module.scss';
import Input, { type InputProps } from '../Input';
import cs from '../../../cs';

const noop = () => {};

const TextInput: React.FC<Omit<InputProps, 'type'>> = (props) => {
    const { className: _className, onChange = noop, ...otherProps } = props;

    return (
        <Input
            type="text"
            className={cs(_className, styles.input)}
            onChange={onChange}
            {...otherProps}
        />
    );
};

export default TextInput;
