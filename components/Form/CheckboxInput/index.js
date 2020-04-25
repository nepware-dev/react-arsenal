import React from 'react';

import Input from '../Input';
import styles from './styles.module.scss';

const CheckboxInput = (props) => (
    <Input type='checkbox' className={styles.checkbox} {...props} />
);

export default CheckboxInput;
