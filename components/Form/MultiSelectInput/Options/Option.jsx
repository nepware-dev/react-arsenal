import React, {useCallback} from 'react';
import PropTypes from 'prop-types';

import CheckboxInput from '../../CheckboxInput';

import cs from '../../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    label: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
};

const defaultProps = {
    onClick: noop,
    selected: false,
    disabled: false,
};

const Option = ({
            className: _className,
            label,
            selected,
            onClick,
            disabled,
}) => {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
        [styles.disabled]: disabled,
    });

    // Disable pointer events on the checkbox wrapper to prevent the native focus behavior of the browser.
    // Without this, clicking the checkbox would try to focus the absolutely positioned input (see CheckboxInput) causing unexpected scroll behavior
    return (
        <div className={className} onClick={!disabled ? onClick : undefined}>
            <div style={{ pointerEvents: 'none' }}>
                <CheckboxInput checked={selected} disabled={disabled} />
            </div>
            {label}
        </div>
    );
}

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;

export default Option;
