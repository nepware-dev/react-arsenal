import React, { useCallback } from 'react';
import { Route, Redirect, type RouteProps, type RouteComponentProps } from 'react-router-dom';

interface AuthRouteProps extends RouteProps {
    component: NonNullable<RouteProps['component']>;
    isAuthenticated: boolean;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({
    component: Component,
    isAuthenticated,
    ...rest
}) => {
    const checkAuth = useCallback(() => {
        if (isAuthenticated) return true;

        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                return !!user?.isAuthenticated;
            } catch (error) {
                console.error('Error parsing user from localStorage', error);
                return false;
            }
        }
        return false;
    }, [isAuthenticated]);

    const renderRoute = useCallback(
        (props: RouteComponentProps<any>) => {
            const redirectTo = {
                pathname: '/',
                state: { from: props.location },
            };
            if (checkAuth()) {
                return <Redirect to={redirectTo} />;
            } else {
                return <Component {...props} />;
            }
        },
        [checkAuth, Component],
    );

    return <Route {...rest} render={renderRoute} />;
};
