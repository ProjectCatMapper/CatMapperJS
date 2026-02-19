import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { DEFAULT_DATABASE, isValidDatabase, rewritePathWithDatabase } from '../utils/database';

const DatabaseRoute = ({ children }) => {
  const { database } = useParams();
  const location = useLocation();

  if (isValidDatabase(database)) {
    return children;
  }

  return (
    <Navigate
      replace
      to={{
        pathname: rewritePathWithDatabase(location.pathname, DEFAULT_DATABASE),
        search: location.search,
        hash: location.hash,
      }}
    />
  );
};

export default DatabaseRoute;
