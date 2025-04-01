import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './CSS/quill-custom.css'; // Update custom editor styles

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
  
  // List of paths where Navbar should be hidden
  const noNavbarPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Check if the current path starts with any of the paths where Navbar should be hidden
  const hideNavbar = noNavbarPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  return hideNavbar ? null : <Navbar />;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate content loading and hide loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    // Handle resizing for responsive design
    const handleResize = () => {
      // Add custom vh variable for mobile browsers to handle viewport height correctly
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on load
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-[calc(var(--vh,1vh)*100)]">
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
                  <main className="flex-1 w-full mt-16 md:mt-20">
                    <Home />
                  </main>
                } />
                
                <Route path="/login" element={
                  <main className="flex-1 w-full">
                    <Login />
                  </main>
                } />
                
                <Route path="/signup" element={
                  <main className="flex-1 w-full">
                    <SignUp />
                  </main>
                } />
                
                <Route path="/forgot-password" element={
                  <main className="flex-1 w-full">
                    <ForgotPassword />
                  </main>
                } />
                
                <Route path="/reset-password/:token" element={
                  <main className="flex-1 w-full">
                    <ResetPassword />
                  </main>
                } />
                
                <Route path="/unauthorized" element={
                  <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                    <Unauthorized />
                  </main>
                } />
                
                {/* Semi-public routes */}
                <Route path="/clubs-events" element={
                  <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                    <ClubsEvents />
                  </main>
                } />
                
                <Route path="/faculty" element={
                  <main className="flex-1 w-full mt-8 md:mt-10">
                    <Faculty />
                  </main>
                } />
                
                <Route path="/faculty-detail/:id" element={
                  <main className="flex-1 w-full">
                    <FacultyDetail />
                  </main>
                } />
                
                <Route path="/college" element={
                  <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                    <College />
                  </main>
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <main className="flex-1 mt-16 md:mt-20 w-full">
                      <Dashboard />
                    </main>
                  </ProtectedRoute>
                } />
                
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                      <h1>Admin Panel (To be implemented)</h1>
                    </main>
                  </ProtectedRoute>
                } />
                
                {/* Faculty routes */}
                <Route path="/faculty-portal/*" element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                      <h1>Faculty Portal (To be implemented)</h1>
                    </main>
                  </ProtectedRoute>
                } />
                
                {/* Club head routes */}
                <Route path="/club/*" element={
                  <ProtectedRoute allowedRoles={['clubHead', 'admin']}>
                    <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                      <h1>Club Management (To be implemented)</h1>
                    </main>
                  </ProtectedRoute>
                } />
                
                {/* Student routes */}
                <Route path="/student/*" element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                      <h1>Student Portal (To be implemented)</h1>
                    </main>
                  </ProtectedRoute>
                } />
                
                {/* Profile page - accessible to all logged in users */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full">
                      <h1>User Profile (To be implemented)</h1>
                    </main>
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto mt-16 md:mt-20 w-full text-center">
                    <div className="py-12">
                      <h2 className="text-2xl text-primary-red font-bold mb-4">Page Not Found</h2>
                      <p className="mb-6">The page you're looking for doesn't exist or has been moved.</p>
                      <a href="/" className="bg-primary-red text-white font-medium px-6 py-2 rounded hover:bg-secondary-red transition-colors">
                        Return Home
                      </a>
                    </div>
                  </main>
                } />
              </Routes>
              
              <footer className="bg-dark-gray text-white text-center p-2 mt-0">
                <p>&copy; {new Date().getFullYear()} MU-UniConnect. All rights reserved.</p>
              </footer>
            </>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
