import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const spinnerClass = sizeClasses[size] || sizeClasses.md;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
        <div className={`${spinnerClass} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}></div>
        {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${spinnerClass} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}></div>
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
