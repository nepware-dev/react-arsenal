import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

const withVisibleCheck = (WrappedComponent) => {
    const WithVisibleCheck = ({isVisible=true, ...props}) => {
        if(!isVisible) {
            return null;
        }

        return <WrappedComponent {...props} />
    }

    return hoistNonReactStatic(WithVisibleCheck, WrappedComponent);
}

export default withVisibleCheck;
