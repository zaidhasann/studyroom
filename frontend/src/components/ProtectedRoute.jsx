import React from 'react';

const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You need to be logged in
          </h1>
          <a href="/login" className="btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
