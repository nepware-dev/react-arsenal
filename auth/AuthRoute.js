import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const AuthRoute = ({
  component: Component,
  isAuthenticated,
  ...rest
}) => {
  return (
    <Route {...rest} render={props => (
      isAuthenticated || (localStorage.getItem("user") 
        ? JSON.parse(localStorage.getItem("user")).isAuthenticated 
        : false) 
          ? <Redirect to="/" from={props.location} /> 
          : <Component {...props} />
        )} />
    )
}
