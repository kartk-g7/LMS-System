import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, getLessons, enrollCourse } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import VideoPlayer from '../components/VideoPlayer';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, updateUserEnrollment } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Auto-select first lesson as preview video when lessons load
  useEffect(() => {
    if (lessons.length > 0 && !currentVideo) {
      setCurrentVideo(lessons[0].videoId);
    }
  }, [lessons]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const courseRes = await getCourse(id);
        const courseData = courseRes.data.course;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setEnrolled(user?.enrolledCourses?.includes(id));
      } catch (err) {
        console.error('CourseDetails fetch error:', err);
        const status = err.response?.status;
        if (status === 404) {
          setError('course-not-found');
        } else if (err.code === 'ECONNABORTED' || !err.response) {
          setError('server-unavailable');
        } else {
          setError('generic');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    try {
      setEnrolling(true);
      await enrollCourse(id);
      setEnrolled(true);
      updateUserEnrollment(id);
    } catch (err) {
      if (err.response?.status === 400) {
        // 400 = already enrolled in DB — sync local state so the
        // button switches to "Continue Learning" and persists on reload
        setEnrolled(true);
        updateUserEnrollment(id);
      }
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

  if (error) {
    const isNotFound = error === 'course-not-found';
    const isUnavailable = error === 'server-unavailable';
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <div className="text-6xl mb-4">{isNotFound ? '😕' : isUnavailable ? '⏳' : '⚠️'}</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {isNotFound ? 'Course not found'
              : isUnavailable ? 'Server is waking up…'
              : 'Something went wrong'}
          </h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            {isNotFound
              ? 'This course doesn\'t exist or may have been removed.'
              : isUnavailable
              ? 'The backend server is starting up (this takes ~15-20 seconds on the free tier). Please wait a moment and try again.'
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {!isNotFound && (
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            )}
            <Link to="/courses" className="btn-secondary">
              Back to Courses
            </Link>
          </div>
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
            {/* Dynamic Video Preview — driven by lesson selection */}
            {lessons.length > 0 && (
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <VideoPlayer
                  youtubeId={currentVideo}
                  title={lessons.find(l => l.videoId === currentVideo)?.title || course.title}
                />
              </div>
            )}

            {/* Interactive Lesson List */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-white mb-5">Course Content</h2>
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-sm">No lessons available yet.</p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isActive = currentVideo === lesson.videoId;
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => setCurrentVideo(lesson.videoId)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border text-left group ${
                          isActive
                            ? 'bg-primary-600/20 border-primary-500/40'
                            : 'bg-dark-600/50 hover:bg-dark-600 border-white/5'
                        }`}
                      >
                        {/* Number / play indicator */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-500 text-gray-400 group-hover:bg-dark-400'
                        }`}>
                          {isActive ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lesson.isFree && (
                              <span className="text-xs text-emerald-400 font-medium">Free preview</span>
                            )}
                            {lesson.duration && lesson.duration !== '0:00' && (
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                            )}
                          </div>
                        </div>

                        {/* Active pulse */}
                        {isActive && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
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
