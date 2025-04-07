import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, isAdmin, isFaculty, isClubHead } = useAuth();
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  
  // Stats for different user types
  const [stats] = useState({
    adminStats: {
      totalUsers: '4,128',
      activeToday: '324',
      newThisWeek: '57',
      pendingRequests: '12'
    },
    facultyStats: {
      officeHours: '18',
      upcomingMeetings: '3',
      pendingRequests: '5',
      publications: '12'
    },
    clubHeadStats: {
      memberCount: '87',
      upcomingEvents: '2',
      pendingRequests: '8',
      totalPosts: '36'
    },
    studentStats: {
      clubsJoined: '3',
      upcomingEvents: '5',
      resources: '24',
      completedTasks: '18'
    }
  });
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

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

  // Stat card component with consistent design
  const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorConfig = {
      primary: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      secondary: { bg: 'bg-purple-50', text: 'text-purple-600' },
      success: { bg: 'bg-green-50', text: 'text-green-600' },
      danger: { bg: 'bg-red-50', text: 'text-red-600' },
      warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
      info: { bg: 'bg-blue-50', text: 'text-blue-600' },
    };
    
    const { bg, text } = colorConfig[color] || colorConfig.primary;
    
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center ${text}`}>
            <i className={`fas ${icon} text-xl`}></i>
          </div>
        </div>
      </div>
    );
  };
  
  // Menu card component with consistent design
  const MenuCard = ({ title, icon, description, path, color = 'primary', badge }) => {
    const colorConfig = {
      primary: { bg: 'bg-indigo-500', hover: 'bg-indigo-50', text: 'text-indigo-600' },
      secondary: { bg: 'bg-purple-500', hover: 'bg-purple-50', text: 'text-purple-600' },
      success: { bg: 'bg-green-500', hover: 'bg-green-50', text: 'text-green-600' },
      danger: { bg: 'bg-red-500', hover: 'bg-red-50', text: 'text-red-600' },
      warning: { bg: 'bg-amber-500', hover: 'bg-amber-50', text: 'text-amber-600' },
      info: { bg: 'bg-blue-500', hover: 'bg-blue-50', text: 'text-blue-600' },
    };
    
    const { bg, hover, text } = colorConfig[color] || colorConfig.primary;
    
    return (
      <Link to={path} className="block">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 h-full hover:shadow-lg hover:-translate-y-1 group">
          <div className={`h-1.5 ${bg} rounded-t-xl w-full`}></div>
          <div className="p-6">
            <div className="flex items-center mb-3">
              <div className={`w-12 h-12 rounded-full ${hover} ${text} flex items-center justify-center mr-4 group-hover:${bg} group-hover:text-white transition-all duration-300`}>
                <i className={`fas ${icon} text-lg`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center flex-wrap">
                {title}
                {badge && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 py-1 px-2 rounded-full">
                    {badge}
                  </span>
                )}
              </h3>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
      </Link>
    );
  };
  
  // Get user-specific stats based on role
  const getUserStats = () => {
    if (isAdmin()) return stats.adminStats;
    if (isFaculty()) return stats.facultyStats;
    if (isClubHead()) return stats.clubHeadStats;
    return stats.studentStats;
  };
  
  // Get stat cards based on user role
  const getStatCards = () => {
    const userStats = getUserStats();
    
    if (isAdmin()) {
      return (
        <>
          <StatCard title="Total Users" value={userStats.totalUsers} icon="fa-users" color="primary" />
          <StatCard title="Active Today" value={userStats.activeToday} icon="fa-chart-line" color="success" />
          <StatCard title="New This Week" value={userStats.newThisWeek} icon="fa-user-plus" color="secondary" />
          <StatCard title="Pending Requests" value={userStats.pendingRequests} icon="fa-clipboard-list" color="danger" />
        </>
      );
    }
    
    if (isFaculty()) {
      return (
        <>
          <StatCard title="Office Hours" value={userStats.officeHours} icon="fa-clock" color="primary" />
          <StatCard title="Upcoming Meetings" value={userStats.upcomingMeetings} icon="fa-calendar-check" color="success" />
          <StatCard title="Pending Requests" value={userStats.pendingRequests} icon="fa-clipboard-list" color="warning" />
          <StatCard title="Publications" value={userStats.publications} icon="fa-book" color="secondary" />
        </>
      );
    }
    
    if (isClubHead()) {
      return (
        <>
          <StatCard title="Club Members" value={userStats.memberCount} icon="fa-users" color="primary" />
          <StatCard title="Upcoming Events" value={userStats.upcomingEvents} icon="fa-calendar-check" color="info" />
          <StatCard title="Pending Requests" value={userStats.pendingRequests} icon="fa-clipboard-list" color="warning" />
          <StatCard title="Total Posts" value={userStats.totalPosts} icon="fa-newspaper" color="secondary" />
        </>
      );
    }
    
    return (
      <>
        <StatCard title="Clubs Joined" value={userStats.clubsJoined} icon="fa-people-group" color="primary" />
        <StatCard title="Upcoming Events" value={userStats.upcomingEvents} icon="fa-calendar-check" color="secondary" />
        <StatCard title="Resources" value={userStats.resources} icon="fa-file-alt" color="info" />
        <StatCard title="Completed Tasks" value={userStats.completedTasks} icon="fa-tasks" color="success" />
      </>
    );
  };
  
  // Get menu cards based on user role
  const getMenuCards = () => {
    if (isAdmin()) {
      return (
        <>
          <MenuCard 
            title="User Management"
            icon="fa-users"
            description="Create, edit, and manage user accounts"
            path="/admin/users"
            color="primary"
          />
          <MenuCard 
            title="Create Accounts"
            icon="fa-user-plus"
            description="Create faculty and club head accounts"
            path="/admin/create-user"
            color="success"
          />
          <MenuCard 
            title="System Settings"
            icon="fa-cogs"
            description="Configure system settings"
            path="/admin/settings"
            color="secondary"
          />
          <MenuCard 
            title="Club Management"
            icon="fa-people-group"
            description="Manage clubs and organizations"
            path="/admin/clubs"
            color="warning"
            badge="New"
          />
          <MenuCard 
            title="Analytics"
            icon="fa-chart-line"
            description="View system usage statistics"
            path="/admin/analytics"
            color="info"
          />
          <MenuCard 
            title="Help Requests"
            icon="fa-circle-question"
            description="Manage user support tickets"
            path="/admin/help-requests"
            color="danger"
          />
        </>
      );
    }
    
    if (isFaculty()) {
      return (
        <>
          <MenuCard 
            title="My Profile"
            icon="fa-user-circle"
            description="View and edit your profile information"
            path="/profile"
            color="primary"
          />
          <MenuCard 
            title="Department Info"
            icon="fa-building"
            description="View department information and contacts"
            path="/faculty/department"
            color="success"
          />
          <MenuCard 
            title="Research Publications"
            icon="fa-book"
            description="Manage your research and publications"
            path="/faculty/publications"
            color="secondary"
          />
          <MenuCard 
            title="Office Hours"
            icon="fa-clock"
            description="Set your availability for student consultations"
            path="/faculty/office-hours"
            color="warning"
          />
          <MenuCard 
            title="Student Appointments"
            icon="fa-calendar-alt"
            description="View and manage student appointments"
            path="/faculty/appointments"
            color="info"
            badge="3 New"
          />
          <MenuCard 
            title="Resources"
            icon="fa-file-alt"
            description="Upload and manage resources for students"
            path="/faculty/resources"
            color="indigo"
          />
        </>
      );
    }
    
    if (isClubHead()) {
      return (
        <>
          <MenuCard 
            title="Club Profile"
            icon="fa-users"
            description="Manage your club's profile and details"
            path="/club/profile"
            color="primary"
          />
          <MenuCard 
            title="Create Event"
            icon="fa-calendar-plus"
            description="Create and manage club events"
            path="/club/create-event"
            color="success"
            badge="New"
          />
          <MenuCard 
            title="Members"
            icon="fa-user-group"
            description="Manage club membership"
            path="/club/members"
            color="secondary"
          />
          <MenuCard 
            title="Announcements"
            icon="fa-bullhorn"
            description="Create announcements for club members"
            path="/club/announcements"
            color="warning"
          />
          <MenuCard 
            title="Resources"
            icon="fa-box"
            description="Manage club resources and materials"
            path="/club/resources"
            color="info"
          />
          <MenuCard 
            title="Analytics"
            icon="fa-chart-line"
            description="View engagement and growth analytics"
            path="/club/analytics"
            color="indigo"
          />
        </>
      );
    }
    
    return (
      <>
        <MenuCard 
          title="My Profile"
          icon="fa-user-circle"
          description="View and edit your profile information"
          path="/profile"
          color="primary"
        />
        <MenuCard 
          title="Clubs & Events"
          icon="fa-calendar-check"
          description="Explore and join clubs, view upcoming events"
          path="/clubs-events"
          color="success"
        />
        <MenuCard 
          title="Faculty Directory"
          icon="fa-chalkboard-teacher"
          description="Browse and contact faculty members"
          path="/faculty"
          color="secondary"
        />
        <MenuCard 
          title="My Clubs"
          icon="fa-people-group"
          description="View clubs you've joined and their activities"
          path="/student/my-clubs"
          color="warning"
        />
        <MenuCard 
          title="Resources"
          icon="fa-book"
          description="Access important student resources"
          path="/student/resources"
          color="info"
        />
        <MenuCard 
          title="Help & Support"
          icon="fa-circle-question"
          description="Get help and support"
          path="/help"
          color="danger"
        />
      </>
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
  
  return (
    <div className="bg-gray-50 min-h-screen dashboard-page">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              icon="fa-cog" 
              label="Settings" 
              onClick={() => {}}
              color="primary" 
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
                  {greeting}, {currentUser.name}!
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
                {currentUser.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  {getUserRoleText()}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {currentUser.email}
                </p>
              </div>
            </div>
            
            <div className="md:ml-auto flex flex-wrap gap-3">
              <QuickAction 
                icon="fa-user-edit" 
                label="Edit Profile" 
                onClick={() => navigate('/profile')}
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
        
        {/* Menu Cards - Consistent Design */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quick Access</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              <i className="fas fa-star mr-2"></i> Favorites
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getMenuCards()}
          </div>
        </div>
        
        {/* User Account Info - Improved consistency */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <i className="fas fa-user-shield mr-2 text-indigo-500"></i>
              Account Information
            </h3>
            <Link to="/profile" className="text-sm text-indigo-600 hover:text-indigo-800">
              View Details
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Email Address</span>
                <span className="text-gray-800 font-medium">{currentUser.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Role</span>
                <span className="text-gray-800 font-medium capitalize">{currentUser.role}</span>
              </div>
              {currentUser.studentId && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Student ID</span>
                  <span className="text-gray-800 font-medium">{currentUser.studentId}</span>
                </div>
              )}
              {currentUser.department && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Department</span>
                  <span className="text-gray-800 font-medium">{currentUser.department}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Member Since</span>
                <span className="text-gray-800 font-medium">
                  {currentUser.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Last Login</span>
                <span className="text-gray-800 font-medium">
                  {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'First login'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Updates Banner - Enhanced with consistent colors */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-md overflow-hidden mb-10">
          <div className="px-6 py-6 md:py-8 flex flex-col md:flex-row items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mb-4 md:mb-0 md:mr-6">
              <i className="fas fa-bullhorn text-xl"></i>
            </div>
            <div className="text-center md:text-left md:flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Platform Updates Available</h3>
              <p className="text-white/90">
                New features have been added to enhance your experience. Check out the latest improvements!
              </p>
            </div>
            <button className="mt-5 md:mt-0 md:ml-6 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Stats Section - Consistent design */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Stats</h2>
            <span className="text-sm text-gray-500">Last Updated: Today</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStatCards()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
