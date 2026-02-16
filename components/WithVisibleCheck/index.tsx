import hoistNonReactStatic from 'hoist-non-react-statics';
import React from 'react';

function withVisibleCheck<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const WithVisibleCheck: React.FC<P & { isVisible?: boolean }> = ({
        isVisible = true,
        ...props
    }) => {
        if (!isVisible) return null;
        return <WrappedComponent {...(props as P)} />;
    };

    return hoistNonReactStatic(WithVisibleCheck, WrappedComponent);
}

export default withVisibleCheck;
