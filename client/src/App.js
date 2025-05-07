import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './CSS/quill-custom.css'; // Update custom editor styles
import './CSS/forms.css'; // Add custom form styles
// Import react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import Home from './pages/Home';
import ClubsEvents from './pages/ClubsEvents';
import Faculty from './pages/Faculty';
import College from './pages/College';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import FacultyDetail from './pages/FacultyDetail';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile'; // Import the new Profile page
import FacultyAppointments from './pages/FacultyAppointments'; // Import the Faculty Appointments page
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/Admin/AdminFeedback'; // Import AdminFeedback page
import NewsManagement from './pages/Admin/NewsManagement'; // Import NewsManagement page

// Import components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import context
import { AuthProvider } from './contexts/AuthContext';

// ScrollToTop component to ensure page starts at the top when navigating
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// NavbarWrapper component to conditionally render the Navbar
function NavbarWrapper() {
  const location = useLocation();
  const [hideNavbarState, setHideNavbarState] = useState(false);
  
  // Check for hide-navbar class and update state accordingly
  useEffect(() => {
    const checkBodyClass = () => {
      const hasHideNavbarClass = document.body.classList.contains('hide-navbar');
      setHideNavbarState(hasHideNavbarClass);
    };
    
    // Initial check
    checkBodyClass();
    
    // Set up a mutation observer to detect class changes on body element
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          checkBodyClass();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // List of paths where Navbar should be hidden
  const noNavbarPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Check if the current path starts with any of the paths where Navbar should be hidden
  // or if the body has the hide-navbar class
  const hideNavbar = noNavbarPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  ) || hideNavbarState;
  
  return hideNavbar ? null : <Navbar />;
}

// Standard container wrapper to ensure consistent sizing across pages
function PageContainer({ children, fullWidth = false }) {
  const location = useLocation();
  
  // List of paths where Navbar should be hidden (same as in NavbarWrapper)
  const noNavbarPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Check if the current path starts with any of the paths where Navbar should be hidden
  const hideNavbar = noNavbarPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  // Only apply top margin if navbar is visible
  const topMarginClass = hideNavbar ? '' : 'mt-16 md:mt-20';
  
  return (
    <main className={`flex-1 w-full ${topMarginClass} ${fullWidth ? 'container-fluid px-0' : 'std-container'}`}>
      <div className="w-full">
        {children}
      </div>
    </main>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set a short timeout to simulate initialization
    const initializeApp = async () => {
      try {
        // Other initialization code can go here if needed
        
        // Add a small delay to prevent flash of loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  return (
    // Move Router to wrap AuthProvider, fixing the navigation context error
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-[calc(var(--vh,1vh)*100)]">
          {/* Add ToastContainer at the application root level */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          
          {isLoading ? (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
              <div className="animate-pulse text-primary-red text-lg font-medium">
                Loading MU-UniConnect...
              </div>
            </div>
          ) : (
            <>
              <ScrollToTop />
              <NavbarWrapper />
              
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <PageContainer fullWidth>
                    <Home />
                  </PageContainer>
                } />
                
                <Route path="/login" element={
                  <PageContainer fullWidth>
                    <Login />
                  </PageContainer>
                } />
                
                <Route path="/signup" element={
                  <PageContainer fullWidth>
                    <SignUp />
                  </PageContainer>
                } />
                
                <Route path="/forgot-password" element={
                  <PageContainer fullWidth>
                    <ForgotPassword />
                  </PageContainer>
                } />
                
                <Route path="/reset-password/:token" element={
                  <PageContainer fullWidth>
                    <ResetPassword />
                  </PageContainer>
                } />
                
                <Route path="/unauthorized" element={
                  <PageContainer>
                    <Unauthorized />
                  </PageContainer>
                } />
                
                {/* Semi-public routes */}
                <Route path="/clubs-events" element={
                  <PageContainer fullWidth>
                    <ClubsEvents />
                  </PageContainer>
                } />
                
                <Route path="/faculty" element={
                  <PageContainer fullWidth>
                    <Faculty />
                  </PageContainer>
                } />
                
                <Route path="/faculty-detail/:id" element={
                  <PageContainer fullWidth>
                    <FacultyDetail />
                  </PageContainer>
                } />
                
                {/* College routes with nested sub-routes */}
                <Route path="/college/*" element={
                  <PageContainer fullWidth>
                    <College />
                  </PageContainer>
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <PageContainer fullWidth>
                      <Dashboard />
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <PageContainer fullWidth>
                      <ChangePassword />
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Faculty Appointments page */}
                <Route path="/faculty-appointments" element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <PageContainer fullWidth>
                      <FacultyAppointments />
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Faculty Appointment Booking page - accessible to students and clubs */}
                <Route path="/faculty-appointments/book" element={
                  <ProtectedRoute>
                    <PageContainer fullWidth>
                      <FacultyAppointments bookingMode={true} />
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PageContainer>
                      <h1>Admin Panel (To be implemented)</h1>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Admin Feedback page */}
                <Route
                  path="/admin/feedback"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PageContainer>
                        <AdminFeedback />
                      </PageContainer>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin News Management page */}
                <Route
                  path="/admin/news"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PageContainer>
                        <NewsManagement />
                      </PageContainer>
                    </ProtectedRoute>
                  }
                />
                
                {/* Faculty routes */}
                <Route path="/faculty-portal/*" element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <PageContainer>
                      <h1>Faculty Portal (To be implemented)</h1>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Club head routes */}
                <Route path="/club/*" element={
                  <ProtectedRoute allowedRoles={['clubHead', 'admin']}>
                    <PageContainer>
                      <h1>Club Management (To be implemented)</h1>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Student routes */}
                <Route path="/student/*" element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <PageContainer>
                      <h1>Student Portal (To be implemented)</h1>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Profile page - accessible to all logged in users */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <PageContainer fullWidth>
                      <Profile />
                    </PageContainer>
                  </ProtectedRoute>
                } />
                
                {/* Feedback page */}
                <Route path="/feedback" element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <PageContainer>
                    <div className="py-12 text-center">
                      <h2 className="text-2xl text-primary-red font-bold mb-4">Page Not Found</h2>
                      <p className="mb-6">The page you're looking for doesn't exist or has been moved.</p>
                      <a href="/" className="bg-primary-red text-white font-medium px-6 py-2 rounded hover:bg-secondary-red transition-colors">
                        Return Home
                      </a>
                    </div>
                  </PageContainer>
                } />
              </Routes>
              
              <footer className="bg-dark-gray text-white text-center p-2 mt-0">
                <p>&copy; {new Date().getFullYear()} MU-UniConnect. All rights reserved.</p>
              </footer>
            </>
          )}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
