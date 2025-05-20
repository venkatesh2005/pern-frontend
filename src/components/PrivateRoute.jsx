import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ component: Component, requiredRole, ...rest }) => {
  const token = localStorage.getItem('authToken');

  let isAuthenticated = false;
  let hasRoleAccess = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      isAuthenticated = true;
      hasRoleAccess = decoded.role === requiredRole;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && hasRoleAccess ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
