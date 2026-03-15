import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollCourse } from '../api/api';
import { useState } from 'react';

const levelColors = {
  Beginner: 'badge-green',
  Intermediate: 'badge-primary',
  Advanced: 'badge-orange',
};

const CategoryIcon = ({ category }) => {
  const icons = {
    Programming: '💻',
    Frontend: '🎨',
    Backend: '⚙️',
    'Data Science': '📊',
    Design: '✏️',
    General: '📚',
  };
  return <span>{icons[category] || '📚'}</span>;
};

const CourseCard = ({ course, onEnroll }) => {
  const { user, updateUserEnrollment } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(
    user?.enrolledCourses?.includes(course._id)
  );

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setEnrolling(true);
      await enrollCourse(course._id);
      setEnrolled(true);
      updateUserEnrollment(course._id);
      if (onEnroll) onEnroll(course._id);
    } catch (err) {
      if (err.response?.status === 400) setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="card card-hover group flex flex-col overflow-hidden animate-fade-in">
      {/* Thumbnail — clicking navigates to course details */}
      <Link to={`/courses/${course._id}`} className="relative overflow-hidden aspect-video block">
        <img
          src={course.thumbnail || `https://img.youtube.com/vi/K5KVEU3aaeQ/maxresdefault.jpg`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/640x360/151929/3b63ff?text=Course';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${levelColors[course.level] || 'badge-primary'}`}>
            {course.level}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="badge badge-purple">
            <CategoryIcon category={course.category} />
            <span className="ml-1">{course.category}</span>
          </span>
        </div>
        <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link to={`/courses/${course._id}`}>
          <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors mb-2">
            {course.title}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-yellow-400 font-medium">{course.rating}</span>
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold">
              {course.instructorName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-gray-300 font-medium">{course.instructorName}</p>
              <p className="text-xs text-gray-500">{course.enrolledCount?.toLocaleString()} students</p>
            </div>
          </div>

          {enrolled ? (
            <Link
              to={`/learn/${course._id}`}
              className="btn-primary text-xs px-4 py-2"
            >
              Continue
            </Link>
          ) : user ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Free'}
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-xs px-4 py-2">
              Enroll Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
