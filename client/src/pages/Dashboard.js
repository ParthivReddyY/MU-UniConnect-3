import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, isAdmin, isFaculty, isClubHead } = useAuth();

  // Common dashboard components
  const DashboardHeader = ({ title, subtitle }) => (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-dark-gray">{title}</h1>
      {subtitle && <p className="text-medium-gray mt-2">{subtitle}</p>}
    </div>
  );

  // Role-specific dashboard content
  const renderDashboardContent = () => {
    if (isAdmin()) {
      return (
        <>
          <DashboardHeader 
            title="Admin Dashboard" 
            subtitle="Manage the entire system from here" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
              title="User Management"
              icon="fa-users"
              description="Create, edit, and manage user accounts"
              path="/admin/users"
              color="blue"
            />
            <DashboardCard 
              title="Create Accounts"
              icon="fa-user-plus"
              description="Create faculty and club head accounts"
              path="/admin/create-user"
              color="green"
            />
            <DashboardCard 
              title="System Settings"
              icon="fa-cogs"
              description="Configure system settings"
              path="/admin/settings"
              color="purple"
            />
            <DashboardCard 
              title="Club Management"
              icon="fa-people-group"
              description="Manage clubs and organizations"
              path="/admin/clubs"
              color="orange"
            />
            <DashboardCard 
              title="Analytics"
              icon="fa-chart-line"
              description="View system usage statistics"
              path="/admin/analytics"
              color="teal"
            />
            <DashboardCard 
              title="Help Requests"
              icon="fa-circle-question"
              description="Manage user support tickets"
              path="/admin/help-requests"
              color="red"
            />
          </div>
        </>
      );
    } else if (isFaculty()) {
      return (
        <>
          <DashboardHeader 
            title="Faculty Dashboard" 
            subtitle={`Welcome, ${currentUser.name} | ${currentUser.department}`} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
              title="My Profile"
              icon="fa-user-circle"
              description="View and edit your profile information"
              path="/profile"
              color="blue"
            />
            <DashboardCard 
              title="Department Info"
              icon="fa-building"
              description="View department information and contacts"
              path="/faculty/department"
              color="green"
            />
            <DashboardCard 
              title="Research Publications"
              icon="fa-book"
              description="Manage your research and publications"
              path="/faculty/publications"
              color="purple"
            />
            <DashboardCard 
              title="Office Hours"
              icon="fa-clock"
              description="Set your availability for student consultations"
              path="/faculty/office-hours"
              color="orange"
            />
            <DashboardCard 
              title="University Events"
              icon="fa-calendar-check"
              description="View upcoming university events"
              path="/clubs-events"
              color="teal"
            />
          </div>
        </>
      );
    } else if (isClubHead()) {
      return (
        <>
          <DashboardHeader 
            title="Club Manager Dashboard" 
            subtitle={`Welcome, ${currentUser.name} | ${currentUser.clubManaging}`} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
              title="Club Profile"
              icon="fa-users"
              description="Manage your club's profile and details"
              path="/club/profile"
              color="blue"
            />
            <DashboardCard 
              title="Create Event"
              icon="fa-calendar-plus"
              description="Create and manage club events"
              path="/club/create-event"
              color="green"
            />
            <DashboardCard 
              title="Members"
              icon="fa-user-group"
              description="Manage club membership"
              path="/club/members"
              color="purple"
            />
            <DashboardCard 
              title="Announcements"
              icon="fa-bullhorn"
              description="Create announcements for club members"
              path="/club/announcements"
              color="orange"
            />
            <DashboardCard 
              title="Resources"
              icon="fa-box"
              description="Manage club resources and materials"
              path="/club/resources"
              color="teal"
            />
          </div>
        </>
      );
    } else {
      // Student dashboard
      return (
        <>
          <DashboardHeader 
            title="Student Dashboard" 
            subtitle={`Welcome, ${currentUser.name} | Student ID: ${currentUser.studentId}`} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
              title="My Profile"
              icon="fa-user-circle"
              description="View and edit your profile information"
              path="/profile"
              color="blue"
            />
            <DashboardCard 
              title="Clubs & Events"
              icon="fa-calendar-check"
              description="Explore and join clubs, view upcoming events"
              path="/clubs-events"
              color="green"
            />
            <DashboardCard 
              title="Faculty Directory"
              icon="fa-chalkboard-teacher"
              description="Browse and contact faculty members"
              path="/faculty"
              color="purple"
            />
            <DashboardCard 
              title="My Clubs"
              icon="fa-people-group"
              description="View clubs you've joined and their activities"
              path="/student/my-clubs"
              color="orange"
            />
            <DashboardCard 
              title="Resources"
              icon="fa-book"
              description="Access important student resources"
              path="/student/resources"
              color="teal"
            />
            <DashboardCard 
              title="Help & Support"
              icon="fa-circle-question"
              description="Get help and support"
              path="/help"
              color="red"
            />
          </div>
        </>
      );
    }
  };

  // Dashboard card component for each menu item
  const DashboardCard = ({ title, icon, description, path, color }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
      green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
      purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
      orange: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
      teal: "bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200",
      red: "bg-red-light text-primary-red hover:bg-red-200 border-red-200"
    };

    return (
      <Link 
        to={path} 
        className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-md ${colorClasses[color] || "bg-gray-50 border-gray-200"}`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <i className={`fas ${icon} text-2xl`}></i>
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-medium-gray text-sm mb-4 flex-grow">{description}</p>
          <div className="mt-auto inline-flex items-center text-sm font-medium">
            Access <i className="fas fa-arrow-right ml-2"></i>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-off-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardContent()}
        
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-light-gray">
          <h2 className="text-lg font-semibold text-dark-gray mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-off-white rounded-lg border border-light-gray">
              <div className="text-medium-gray text-sm">Last Login</div>
              <div className="text-dark-gray font-medium">
                {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'First login'}
              </div>
            </div>
            <div className="p-4 bg-off-white rounded-lg border border-light-gray">
              <div className="text-medium-gray text-sm">Account Created</div>
              <div className="text-dark-gray font-medium">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </div>
            </div>
            {isAdmin() && (
              <>
                <div className="p-4 bg-off-white rounded-lg border border-light-gray">
                  <div className="text-medium-gray text-sm">Total Users</div>
                  <div className="text-dark-gray font-medium">4,128</div>
                </div>
                <div className="p-4 bg-off-white rounded-lg border border-light-gray">
                  <div className="text-medium-gray text-sm">Active Today</div>
                  <div className="text-dark-gray font-medium">243</div>
                </div>
              </>
            )}
            {isClubHead() && (
              <>
                <div className="p-4 bg-off-white rounded-lg border border-light-gray">
                  <div className="text-medium-gray text-sm">Club Members</div>
                  <div className="text-dark-gray font-medium">42</div>
                </div>
                <div className="p-4 bg-off-white rounded-lg border border-light-gray">
                  <div className="text-medium-gray text-sm">Upcoming Events</div>
                  <div className="text-dark-gray font-medium">3</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
