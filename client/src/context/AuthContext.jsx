import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    const savedUser = localStorage.getItem('lms_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Revalidate with server
      getMe()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('lms_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (name, email, password, role = 'student') => {
    const res = await apiSignup({ name, email, password, role });
    const { token, user } = res.data;
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
  };

  const updateUserEnrollment = (courseId) => {
    if (!user) return;
    const updated = {
      ...user,
      enrolledCourses: [...(user.enrolledCourses || []), courseId],
    };
    setUser(updated);
    localStorage.setItem('lms_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserEnrollment }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
