// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredLevel }) => {
    const { authLevel } = useAuth();

    if (authLevel < requiredLevel) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
