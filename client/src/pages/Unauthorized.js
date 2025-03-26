import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <i className="fas fa-lock text-8xl text-primary-red"></i>
        </div>
        <h1 className="text-3xl font-bold text-dark-gray mb-4">Access Denied</h1>
        <p className="text-medium-gray mb-8">
          You don't have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="bg-primary-red text-white font-medium py-3 px-6 rounded-lg hover:bg-secondary-red transition-colors"
          >
            Return to Home
          </Link>
          <Link 
            to="/login" 
            className="bg-transparent text-primary-red border border-primary-red font-medium py-3 px-6 rounded-lg hover:bg-red-light transition-colors"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
