import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, getProgress, getMyStats } from '../api/api';
import ProgressBar from '../components/ProgressBar';

const SidebarNav = ({ active, onSelect, user, onLogout }) => {
  const items = [
    { id: 'overview', label: 'Dashboard', icon: '⊞' },
    { id: 'courses', label: 'My Learning', icon: '📚' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    ...(user?.role === 'instructor' || user?.role === 'admin'
      ? [{ id: 'manage', label: 'Manage Courses', icon: '⚙️' }]
      : []),
  ];

  return (
    <div className="w-64 flex-shrink-0 hidden lg:flex flex-col card h-[calc(100vh-5rem)] sticky top-20 p-4">
      {/* User info */}
      <div className="flex items-center gap-3 p-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-lg font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              active === item.id
                ? 'bg-primary-600/20 border border-primary-500/30 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="space-y-1 mt-4 pt-4 border-t border-white/5">
        <Link
          to="/courses"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span>🔍</span>
          Browse Courses
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [stats, setStats] = useState({ completedLessons: 0, coursesInProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchDashboard = async () => {
      try {
        const [coursesRes, statsRes] = await Promise.all([
          getCourses(),
          getMyStats(),
        ]);
        const allCourses = coursesRes.data.courses || [];
        const enrolled = allCourses.filter(c =>
          user.enrolledCourses?.includes(c._id)
        );
        setEnrolledCourses(enrolled);
        if (statsRes?.data?.stats) setStats(statsRes.data.stats);

        // For each enrolled course, fetch progress
        const progressMap = {};
        await Promise.all(
          enrolled.map(async (course) => {
            try {
              const res = await getProgress(user._id, course._id);
              progressMap[course._id] = res.data;
            } catch {}
          })
        );
        setCourseProgress(progressMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container">
        <div className="flex gap-8">
          {/* Sidebar */}
          <SidebarNav
            active={activeSection}
            onSelect={setActiveSection}
            user={user}
            onLogout={handleLogout}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                {activeSection === 'overview' && `Hey, ${user?.name?.split(' ')[0]}! 👋`}
                {activeSection === 'courses' && 'My Learning'}
                {activeSection === 'progress' && 'Progress Report'}
                {activeSection === 'manage' && 'Manage Courses'}
              </h1>
              <p className="text-gray-400 mt-1">
                {activeSection === 'overview' && 'Here\'s an overview of your learning journey'}
                {activeSection === 'courses' && 'Continue where you left off'}
                {activeSection === 'progress' && 'Track your learning milestones'}
                {activeSection === 'manage' && 'Instructor tools'}
              </p>
            </div>

            {/* Overview */}
            {activeSection === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-2xl">📚</div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">{enrolledCourses.length}</p>
                      <p className="text-sm text-gray-400">Enrolled Courses</p>
                    </div>
                  </div>
                  <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">✅</div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">{stats.completedLessons}</p>
                      <p className="text-sm text-gray-400">Lessons Completed</p>
                    </div>
                  </div>
                  <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-2xl">🎯</div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">{stats.coursesInProgress}</p>
                      <p className="text-sm text-gray-400">In Progress</p>
                    </div>
                  </div>
                </div>

                {/* Recent courses */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-bold text-white text-lg">Continue Learning</h2>
                    <button onClick={() => setActiveSection('courses')} className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
                      View all →
                    </button>
                  </div>
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-3">🎓</div>
                      <p className="text-gray-400 mb-4">No courses enrolled yet</p>
                      <Link to="/courses" className="btn-primary text-sm px-6 py-2.5">Explore Courses</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.slice(0, 3).map(course => {
                        const prog = courseProgress[course._id] || {};
                        return (
                          <div key={course._id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-600/50 hover:bg-dark-600 transition-all group">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate group-hover:text-primary-300 transition-colors">
                                {course.title}
                              </p>
                              <div className="mt-2">
                                <ProgressBar
                                  percentage={prog.percentage || 0}
                                  completed={prog.completedLessons || 0}
                                  total={prog.totalLessons || course.totalLessons}
                                  showLabel={false}
                                  size="sm"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{prog.percentage || 0}% complete</p>
                            </div>
                            <Link
                              to={`/learn/${course._id}`}
                              className="btn-primary text-xs px-4 py-2 flex-shrink-0"
                            >
                              Continue
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick links for instructors */}
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <div className="card p-6">
                    <h2 className="font-display font-bold text-white text-lg mb-4">Instructor Tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link to="/instructor" className="flex items-center gap-3 p-4 rounded-xl bg-dark-600/50 hover:bg-dark-600 border border-white/5 transition-all">
                        <span className="text-2xl">➕</span>
                        <div>
                          <p className="text-white text-sm font-semibold">Create Course</p>
                          <p className="text-xs text-gray-400">Add a new course</p>
                        </div>
                      </Link>
                      <Link to="/instructor" className="flex items-center gap-3 p-4 rounded-xl bg-dark-600/50 hover:bg-dark-600 border border-white/5 transition-all">
                        <span className="text-2xl">📹</span>
                        <div>
                          <p className="text-white text-sm font-semibold">Add Lessons</p>
                          <p className="text-xs text-gray-400">Upload YouTube lessons</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* My Learning tab */}
            {activeSection === 'courses' && (
              <div className="space-y-4">
                {enrolledCourses.length === 0 ? (
                  <div className="card p-12 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-white mb-2">No enrolled courses</h3>
                    <p className="text-gray-400 mb-6">Explore our course catalog to get started</p>
                    <Link to="/courses" className="btn-primary">Browse Courses</Link>
                  </div>
                ) : (
                  enrolledCourses.map(course => {
                    const prog = courseProgress[course._id] || {};
                    return (
                      <div key={course._id} className="card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full sm:w-32 h-24 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="badge badge-primary">{course.category}</span>
                            <span className="badge badge-purple">{course.level}</span>
                          </div>
                          <h3 className="text-white font-bold mb-2 text-base">{course.title}</h3>
                          <ProgressBar
                            percentage={prog.percentage || 0}
                            completed={prog.completedLessons || 0}
                            total={prog.totalLessons || course.totalLessons}
                            size="sm"
                          />
                        </div>
                        <Link to={`/learn/${course._id}`} className="btn-primary text-sm px-5 py-2.5 flex-shrink-0 w-full sm:w-auto text-center">
                          {(prog.percentage || 0) > 0 ? 'Continue' : 'Start'}
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Progress tab */}
            {activeSection === 'progress' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-display font-bold text-gradient mb-1">{stats.completedLessons}</p>
                    <p className="text-gray-400 text-sm">Total Lessons Completed</p>
                  </div>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-display font-bold text-gradient mb-1">
                      {enrolledCourses.length > 0
                        ? Math.round(Object.values(courseProgress).reduce((acc, p) => acc + (p.percentage || 0), 0) / enrolledCourses.length)
                        : 0}%
                    </p>
                    <p className="text-gray-400 text-sm">Average Course Completion</p>
                  </div>
                </div>

                {enrolledCourses.map(course => {
                  const prog = courseProgress[course._id] || {};
                  return (
                    <div key={course._id} className="card p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-white font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-400">{course.instructorName}</p>
                        </div>
                        <span className={`badge ${prog.percentage === 100 ? 'badge-green' : 'badge-primary'}`}>
                          {prog.percentage === 100 ? '✓ Complete' : 'In Progress'}
                        </span>
                      </div>
                      <ProgressBar
                        percentage={prog.percentage || 0}
                        completed={prog.completedLessons || 0}
                        total={prog.totalLessons || course.totalLessons}
                        size="md"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Manage tab */}
            {activeSection === 'manage' && (user?.role === 'instructor' || user?.role === 'admin') && (
              <div className="card p-6 text-center py-12">
                <div className="text-5xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-white mb-2">Instructor Portal</h3>
                <p className="text-gray-400 mb-6">Create and manage your courses from the instructor dashboard</p>
                <Link to="/instructor" className="btn-primary">Go to Instructor Portal</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
