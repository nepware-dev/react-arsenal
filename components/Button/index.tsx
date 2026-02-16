import React from 'react';

import styles from './styles.module.scss';
import { type ButtonProps } from './types';
import cs from '../../cs';

const noop = () => {};

const Button: React.FC<ButtonProps> = (props) => {
    const {
        style,
        className,
        onClick = noop,
        children,
        success,
        warning,
        danger,
        outline,
        disabled,
        ref,
        ...otherProps
    } = props;

    return (
        <button
            ref={ref}
            style={style}
            className={cs(styles.button, className, 'button', {
                [styles.success]: success,
                [styles.warning]: warning,
                [styles.danger]: danger,
                [styles.outline]: outline,
                [styles.disabled]: disabled,
            })}
            disabled={disabled}
            onClick={onClick}
            {...otherProps}
        >
            {children}
        </button>
    );
};

export default Button;

export { type ButtonProps };
