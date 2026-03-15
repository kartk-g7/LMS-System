import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, getLessons, enrollCourse } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, updateUserEnrollment } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([getCourse(id), getLessons(id)]);
        setCourse(courseRes.data.course);
        setLessons(lessonsRes.data.lessons || []);
        setEnrolled(user?.enrolledCourses?.includes(id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    try {
      setEnrolling(true);
      await enrollCourse(id);
      setEnrolled(true);
      updateUserEnrollment(id);
    } catch (err) {
      if (err.response?.status === 400) setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <Link to="/courses" className="btn-primary mt-4 inline-block">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/5 mb-10">
        <div className="absolute inset-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover opacity-10 scale-105 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/90 to-dark-900/60" />
        </div>
        <div className="relative page-container py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-primary">{course.category}</span>
                <span className="badge badge-purple">{course.level}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-4">
                {course.title}
              </h1>
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-6">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold">
                    {course.instructorName?.charAt(0)}
                  </div>
                  {course.instructorName}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-yellow-400 font-medium">{course.rating}</span>
                </span>
                <span>{course.enrolledCount?.toLocaleString()} students</span>
                <span>{lessons.length} lessons · {course.duration}</span>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="card w-full lg:w-80 p-6 flex-shrink-0">
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-center mb-4">
                <p className="text-3xl font-display font-bold text-white mb-1">Free</p>
                <p className="text-gray-500 text-sm">Full course access</p>
              </div>
              {enrolled ? (
                <Link to={`/learn/${course._id}`} className="btn-primary w-full text-center block text-base py-3">
                  Continue Learning →
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full text-base py-3 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                </button>
              )}
              <ul className="mt-5 space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {lessons.length} on-demand video lessons</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Full lifetime access</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Progress tracking</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Mobile-friendly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Embedded YouTube Player */}
            {course.youtubeVideoId && (
              <div className="card w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/5">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${course.youtubeVideoId}`}
                  title={course.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Lessons */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-white mb-5">Course Content</h2>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-600/50 hover:bg-dark-600 transition-all border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-500 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
                      {lesson.isFree && (
                        <span className="text-xs text-emerald-400">Preview available</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-white mb-4">Course Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Total Lessons</span>
                  <span className="text-white font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Duration</span>
                  <span className="text-white font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Level</span>
                  <span className="text-white font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Students</span>
                  <span className="text-white font-medium">{course.enrolledCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Rating</span>
                  <span className="text-yellow-400 font-medium">⭐ {course.rating}</span>
                </div>
              </div>
            </div>

            {course.tags?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="badge badge-primary text-xs px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
