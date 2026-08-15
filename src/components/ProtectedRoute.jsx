import React from 'react';
import styles from './ProtectedRoute.module.css';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying authentication..." />;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if user role is not authorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
