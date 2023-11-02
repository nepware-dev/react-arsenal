import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatic from 'hoist-non-react-statics';

const withVisibleCheck = (WrappedComponent) => {
    const WithVisibleCheck = ({isVisible, ...props}) => {
        if(!isVisible) {
            return null;
        }

        return <WrappedComponent {...props} />
    }

    WithVisibleCheck.propTypes = {
        isVisible: PropTypes.bool,
    }

    WithVisibleCheck.defaultProps = {
        isVisible: true,
    }

    return hoistNonReactStatic(WithVisibleCheck, WrappedComponent);
}

export default withVisibleCheck;
