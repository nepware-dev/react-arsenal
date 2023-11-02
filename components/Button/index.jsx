import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    children: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    onClick: PropTypes.func,
    success: PropTypes.bool,
    warning: PropTypes.bool,
    danger: PropTypes.bool,
    outline: PropTypes.bool,
    disabled: PropTypes.bool,
};

const defaultProps = {
    onClick: noop,
    disabled: false,
};

const Button = React.forwardRef((props, ref) => {
    const {
        style,
        className,
        onClick,
        children,
        success,
        warning,
        danger,
        outline,
        disabled,
        ...otherProps
    } = props;

    return (
        <button
            ref={ref}
            style={style}
            className={cs(
                styles.button,
                className,
                'button',
                {
                    [styles.success]: success,
                    [styles.warning]: warning,
                    [styles.danger]: danger,
                    [styles.outline]: outline,
                    [styles.disabled]: disabled,
                }
            )}
            onClick={onClick}
            {...otherProps}
        >
            {children}
        </button>
    );
});

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
