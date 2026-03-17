import axios from 'axios';

// Normalize the base URL — always ensure it ends with /api.
// If VITE_API_URL is set on Vercel without the /api suffix (e.g. just the domain),
// this guarantees requests still land on the correct /api/* routes.
const _raw = import.meta.env.VITE_API_URL || 'https://lms-system-ua65.onrender.com/api';
const BASE_URL = _raw.endsWith('/api') ? _raw : _raw.replace(/\/$/, '') + '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — accounts for Render free-tier cold-start (~15-20s)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Courses
export const getCourses = (params) => API.get('/courses', { params });
export const getCourse = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);

// Lessons
export const getLessons = (courseId) => API.get(`/lessons/${courseId}`);
export const getLesson = (id) => API.get(`/lessons/single/${id}`);
export const createLesson = (data) => API.post('/lessons', data);
export const updateLesson = (id, data) => API.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => API.delete(`/lessons/${id}`);

// Progress
export const updateProgress = (data) => API.post('/progress/update', data);
export const getProgress = (userId, courseId) =>
  API.get(`/progress/${userId}`, courseId ? { params: { courseId } } : {});
export const getLastWatched = (courseId) => API.get(`/progress/last/${courseId}`);
export const getMyStats = () => API.get('/progress/stats/me');

export default API;
