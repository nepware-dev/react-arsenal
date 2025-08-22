import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import styles from './styles.module.scss';
import { useCallback } from 'react';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    focused: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
    disabled: PropTypes.bool,
};

const defaultProps = {
    onClick: noop,
    onfocus: noop,
    selected: false,
    disabled: false,
};

const Option = ({
            className: _className,
            label,
            selected,
            focused,
            onClick,
            onFocus,
            disabled,
}) => {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
        [styles.focused]: focused,
        [styles.disabled]: disabled
    });

    return (
        <div className={className} onClick={!disabled ? onClick : undefined} onMouseOverCapture={!disabled ? onFocus : undefined}>
            {label}
        </div>
    );
}

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;

export default Option;
