import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { calculateAcademicProgress, formatAcademicYear } from '../utils/academicUtils';
import AnnouncementManager from '../components/admin/AnnouncementManager';

const Dashboard = () => {
  const { currentUser, isAdmin, isFaculty, isClubHead, refreshUserData, isUserDataRefreshing } = useAuth();
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Add state for academic info
  const [academicInfo, setAcademicInfo] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Show admin status in the console for debugging
  useEffect(() => {
    if (currentUser) {
      console.log("Current user role:", currentUser.role);
      console.log("Is admin?", currentUser.role === 'admin');
      console.log("isAdmin() returns:", isAdmin());
    }
  }, [currentUser, isAdmin]);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Force refresh user data to ensure we have latest studentId and yearOfJoining
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser && !dataFetched) {
        try {
          // Refresh user data to ensure we have the latest info
          const result = await refreshUserData();
          if (result.success) {
            setDataFetched(true);
            console.log("User data refreshed successfully:", result.user);
          } else {
            console.error("Failed to refresh user data");
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    };

    fetchData();
  }, [currentUser, dataFetched, refreshUserData]);

  // Calculate academic info when user data is loaded
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      if (currentUser.yearOfJoining) {
        const progress = calculateAcademicProgress(currentUser.yearOfJoining);
        setAcademicInfo(progress);
      } else {
        setAcademicInfo(null);
      }
    }
  }, [currentUser]);

  // Format date to readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Quick action button component with consistent design
  const QuickAction = ({ icon, label, onClick, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white',
      secondary: 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white',
      success: 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white',
      danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
      warning: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white',
      info: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',
    };
    
    return (
      <button 
        onClick={onClick} 
        className={`flex items-center px-4 py-2.5 rounded-lg ${colorClasses[color]} transition-all duration-300 shadow-sm hover:shadow`}
      >
        <i className={`fas ${icon} mr-2`}></i> {label}
      </button>
    );
  };
  
  // Get user role text with formatted display
  const getUserRoleText = () => {
    if (isAdmin()) return "Administrator";
    if (isFaculty()) return "Faculty Member";
    if (isClubHead()) return `Club Head of ${currentUser.clubManaging}`;
    return "Student";
  };
  
  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    if (isAdmin()) {
      return "View system metrics and manage users below.";
    } else if (isFaculty()) {
      return "Access your courses, publications and appointment requests.";
    } else if (isClubHead()) {
      return `Manage ${currentUser.clubManaging} activities and members.`;
    } else {
      return "Access your courses, clubs, and campus resources.";
    }
  };

  // Format academic year and semester info for better display
  const formatAcademicInfo = (academicInfo) => {
    if (!academicInfo || !academicInfo.isValidCalculation) return 'Not available';
    
    return `${academicInfo.year}${academicInfo.yearSuffix} Year, ${academicInfo.currentSemester}${academicInfo.semesterSuffix} Semester`;
  };
  
  // Handler for updating profile
  const handleUpdateProfile = () => {
    navigate('/profile');
  };

  // Handler for adding student ID
  const handleAddStudentId = () => {
    navigate('/profile', { state: { focusField: 'studentId' } });
  };

  // Check if user is admin directly
  const userIsAdmin = currentUser && currentUser.role === 'admin';
  
  return (
    <div className="bg-gray-50 min-h-screen dashboard-page">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information */}
        <div className="mb-4">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebugInfo && (
            <div className="mt-2 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Debug Information</h3>
              <p><strong>Current User:</strong> {currentUser ? currentUser.name : 'Not logged in'}</p>
              <p><strong>Role:</strong> {currentUser ? currentUser.role : 'N/A'}</p>
              <p><strong>isAdmin() returns:</strong> {isAdmin() ? 'true' : 'false'}</p>
              <p><strong>Direct check:</strong> {userIsAdmin ? 'true' : 'false'}</p>
            </div>
          )}
        </div>
        
        {/* Header Section with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center justify-center w-10 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-200"
              aria-label="Back to home"
            >
              <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-0.5"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">{formatDate(new Date())}</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <QuickAction 
              icon="fa-bell" 
              label="Notifications" 
              onClick={() => {}}
              color="secondary" 
            />
            <QuickAction 
              icon="fa-comment-alt" 
              label="Submit Feedback" 
              onClick={() => navigate('/feedback')}
              color="secondary" 
            />
          </div>
        </div>
        
        {/* Welcome Banner - Enhanced with consistent design */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-90"></div>
            <div className="relative z-10 px-6 py-10 md:px-10 md:py-14 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {greeting}, {currentUser?.name}!
                </h2>
                <p className="text-white/90 text-lg mb-6">{getWelcomeMessage()}</p>
                
                <div className="mt-6 inline-flex">
                  <Link 
                    to="/profile" 
                    className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-5 py-3 font-medium transition-colors flex items-center backdrop-blur-sm"
                  >
                    <i className="fas fa-user-circle mr-2"></i>
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Summary Card - Improved consistency */}
          <div className="flex flex-col md:flex-row md:items-center p-6 border-t border-gray-100">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm mr-4">
                {currentUser?.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  {getUserRoleText()}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            
            <div className="md:ml-auto flex flex-wrap gap-3">
              <QuickAction 
                icon="fa-user-edit" 
                label="Edit Profile" 
                onClick={handleUpdateProfile}
                color="primary" 
              />
              <QuickAction 
                icon="fa-key" 
                label="Change Password" 
                onClick={() => navigate('/change-password')}
                color="danger" 
              />
            </div>
          </div>
        </div>
        
        {/* User Account Info - Improved consistency */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <i className="fas fa-user-shield mr-2 text-indigo-500"></i>
              Account Information
            </h3>
            <div className="flex items-center">
              {isUserDataRefreshing && (
                <span className="mr-3 text-xs text-gray-500 flex items-center">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mr-1"></div>
                  Refreshing...
                </span>
              )}
              <Link to="/profile" className="text-sm text-indigo-600 hover:text-indigo-800">
                View Details
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Email Address</span>
                <span className="text-gray-800 font-medium">{currentUser?.email || 'Loading...'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Role</span>
                <span className="text-gray-800 font-medium capitalize">{currentUser?.role || 'Loading...'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Student ID</span>
                <div className="flex items-center">
                  {currentUser?.studentId ? (
                    <span className="text-gray-800 font-medium">{currentUser.studentId}</span>
                  ) : currentUser?.role === 'student' ? (
                    <div className="flex items-center">
                      <span className="text-red-500 text-sm">Not set</span>
                      <button 
                        onClick={handleAddStudentId}
                        className="ml-2 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-medium transition-all"
                      >
                        Add ID
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">N/A</span>
                  )}
                </div>
              </div>
              
              {/* Academic Year Information for Students - Improved with clear status indicators */}
              {currentUser?.role === 'student' && (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Academic Year of Joining</span>
                    {isUserDataRefreshing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {currentUser?.yearOfJoining ? formatAcademicYear(currentUser.yearOfJoining) : 'Not available'}
                        {!currentUser?.yearOfJoining && (
                          <button
                            onClick={handleUpdateProfile}
                            className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                          >
                            (Add in Profile)
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {isUserDataRefreshing ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Current Academic Status</span>
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-500">Calculating...</span>
                      </div>
                    </div>
                  ) : academicInfo && academicInfo.isValidCalculation ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Current Academic Status</span>
                      <span className="text-gray-800 font-medium">
                        {formatAcademicInfo(academicInfo)}
                      </span>
                    </div>
                  ) : currentUser?.yearOfJoining ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Current Academic Status</span>
                      <span className="text-amber-600">
                        Calculation unavailable
                      </span>
                    </div>
                  ) : null}
                </>
              )}
              
              {currentUser?.department && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Department</span>
                  <span className="text-gray-800 font-medium">{currentUser.department}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Member Since</span>
                <span className="text-gray-800 font-medium">
                  {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Last Login</span>
                <span className="text-gray-800 font-medium">
                  {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'First login'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Sections - Only visible to admin users - Fixed conditional rendering */}
        {userIsAdmin && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Controls</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-bullhorn mr-2 text-indigo-500"></i>
                  Announcement Manager
                </h3>
              </div>
              <div className="p-6">
                <AnnouncementManager />
              </div>
            </div>
          </div>
        )}
        
        {/* Campus Map Widget - Added functional navigation component */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <i className="fas fa-map-marked-alt mr-2 text-indigo-500"></i>
              Campus Navigation
            </h3>
            <Link to="/college?tab=map" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              <span>Full Map</span>
              <i className="fas fa-external-link-alt ml-1 text-xs"></i>
            </Link>
          </div>
          <div className="p-6">
            <div className="campus-map-widget" style={{ height: '400px', overflow: 'hidden' }}>
              {/* Custom simplified version of the campus map for dashboard */}
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-gray-700 font-medium">Find Campus Locations</h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <i className="fas fa-info-circle mr-1"></i>
                    <span>Navigate the campus easily</span>
                  </div>
                </div>
                
                {/* Map container with fixed height */}
                <div className="flex-1 w-full min-h-0 border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://qgiscloud.com/Harshirh_517/Campus_Navigation/?l=Mahindra_Places%2CSnapped%20geometry%2CBuildings_icons%2CBuildings%2CPathways%2CMahindra_greens%2CSports%2Ccampus_boundary&bl=mapnik&t=Campus_Navigation&e=8730050%2C1986950%2C8732050%2C1987950&hc=1"
                    title="Mahindra University Campus Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
                
                {/* Quick location buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center">
                    <i className="fas fa-graduation-cap mr-1.5"></i> Academic Buildings
                  </button>
                  <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-medium hover:bg-green-100 transition-colors flex items-center">
                    <i className="fas fa-book mr-1.5"></i> Library
                  </button>
                  <button className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors flex items-center">
                    <i className="fas fa-utensils mr-1.5"></i> Cafeteria
                  </button>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors flex items-center">
                    <i className="fas fa-futbol mr-1.5"></i> Sports Complex
                  </button>
                  <button className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors flex items-center">
                    <i className="fas fa-home mr-1.5"></i> Hostels
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
