// ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ensureDatabase } from '../utils/database';

const ProtectedRoute = ({ children, requiredLevel }) => {
    const { authLevel } = useAuth();
    const { database } = useParams();
    const location = useLocation();

    if (authLevel < requiredLevel) {
        return <Navigate to={`/${ensureDatabase(database)}/login`} replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
