import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const ServerStatusIndicator = () => {
  // Disable the component completely
  return null;
  
  // Original code commented out
  /*
  const [status, setStatus] = useState({
    checked: false,
    online: false,
    message: 'Checking server status...'
  });

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const result = await api.testConnection();
        setStatus({
          checked: true,
          online: result.success,
          message: result.message
        });
      } catch (error) {
        setStatus({
          checked: true,
          online: false,
          message: 'Server is offline. Please check if the server is running.'
        });
      }
    };

    checkServerStatus();

    // Check server status periodically
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status.checked || status.online) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
      <p className="font-bold">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        Server Connection Error
      </p>
      <p className="text-sm">{status.message}</p>
      <p className="text-sm mt-1">
        Run <code className="bg-red-700 p-1 rounded">npm run dev</code> in the server directory.
      </p>
    </div>
  );
  */
};

export default ServerStatusIndicator;
