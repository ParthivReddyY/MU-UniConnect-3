import axios from 'axios';

// Simple utility to test server connectivity
const testServerConnection = async () => {
  try {
    // Try to connect to the server's health endpoint
    const response = await axios.get('http://localhost:5000/health', {
      timeout: 5000 // 5 second timeout
    });
    
    console.log('Server connection test result:', response.data);
    
    return {
      success: true,
      message: 'Connected to server successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Server connection test failed:', error);
    
    // Format a user-friendly error message
    let errorMessage = 'Unable to connect to server';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Server is not running or not accessible at http://localhost:5000';
    } else if (error.code === 'TIMEOUT') {
      errorMessage = 'Connection to server timed out';
    } else if (error.response) {
      errorMessage = `Server returned error: ${error.response.status} ${error.response.statusText}`;
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};

// Add this to window for easy debugging in the browser console
if (typeof window !== 'undefined') {
  window.testServerConnection = testServerConnection;
}

export default testServerConnection;
