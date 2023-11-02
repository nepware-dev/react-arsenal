import React, {PureComponent} from 'react';
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
};

const defaultProps = {
    onClick: noop,
    selected: false,
};

const Option = ({
            className: _className,
            label,
            selected,
            onClick,
}) => {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
    });

    return (
        <div className={className} onClick={onClick}>
            <CheckboxInput checked={selected} />
            {label}
        </div>
    );
}

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;

export default Option;
