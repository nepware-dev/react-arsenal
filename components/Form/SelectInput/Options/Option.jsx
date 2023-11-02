import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    focused: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
};

const defaultProps = {
    onClick: noop,
    onfocus: noop,
    selected: false,
};

const Option = ({
            className: _className,
            label,
            selected,
            focused,
            onClick,
            onFocus,
}) => {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
        [styles.focused]: focused,
    });

    return (
        <div className={className} onClick={onClick} onMouseOverCapture={onFocus}>
            {label}
        </div>
    );
}

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;

export default Option;
