import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const PrivateRoute = ({
  component: Component,
  isAuthenticated,
  ...rest
}) => {
  return (
    <Route {...rest} render={props => (
      isAuthenticated || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).isAuthenticated : false) ? (
        <Component {...props} />
      ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
      )
    )} />
  )
}
