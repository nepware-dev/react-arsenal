import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
    container: PropTypes.instanceOf(Element),
};

const defaultProps = {
    container: document.body,
};

export default class Portal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { children, container } = this.props;
        return ReactDOM.createPortal(
                children,
                container,
            );
    }
}
