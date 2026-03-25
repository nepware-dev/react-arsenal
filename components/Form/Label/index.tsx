import React from 'react';

import styles from './styles.module.scss';
import type { LabelProps } from './types';
import cs from '../../../cs';

const Label: React.FC<LabelProps> = (props) => {
    const {children, className: _className = '', required, disabled} = props;

    const className =  cs(
        styles.label,
        _className,
        {
            required,
            disabled,
        },
    );

    return (
        <div className={className}>
            { children }
        </div>
    );
};

export default Label;

export type { LabelProps };
