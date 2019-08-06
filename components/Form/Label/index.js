import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import styles from './styles';

const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
};

const defaultProps = {
    className: '',
    text: '',
    disabled: false,
    required: false,
};

export default class Label extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            text,
            className: _className,
            required,
            disabled,
        } = this.props;

        const className =  [
            styles.label,
            _className,
            {
                required,
                disabled,
            },
        ]

        return (
            <div className={className}>
                { text }
            </div>
        );
    }
}
