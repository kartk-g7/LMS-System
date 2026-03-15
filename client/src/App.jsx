import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LearningPage from './pages/LearningPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InstructorPortal from './pages/InstructorPortal';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public-only route (redirect logged-in users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Layout wrapper (pages that need Navbar)
const WithNavbar = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages with navbar */}
      <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />
      <Route path="/courses" element={<WithNavbar><Courses /></WithNavbar>} />
      <Route path="/courses/:id" element={<WithNavbar><CourseDetails /></WithNavbar>} />

      {/* Auth pages (redirect if logged in) */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <WithNavbar><Dashboard /></WithNavbar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <LearningPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <WithNavbar><InstructorPortal /></WithNavbar>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
