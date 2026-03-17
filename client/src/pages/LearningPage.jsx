import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessons, getCourse, updateProgress, getProgress, getLastWatched } from '../api/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import SidebarLessons from '../components/SidebarLessons';
import ProgressBar from '../components/ProgressBar';

const LearningPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [progressData, setProgressData] = useState({ percentage: 0, completedLessons: 0, totalLessons: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const init = async () => {
      try {
        const courseRes = await getCourse(courseId);
        const fetchedCourse = courseRes.data.course;
        const fetchedLessons = fetchedCourse.lessons || [];
        setCourse(fetchedCourse);
        setLessons(fetchedLessons);

        // Check if enrolled
        if (!user.enrolledCourses?.includes(courseId)) {
          navigate(`/courses/${courseId}`);
          return;
        }

        // Fetch progress
        const progressRes = await getProgress(user._id, courseId);
        const { progressRecords, percentage, completedLessons, totalLessons } = progressRes.data;
        setProgressData({ percentage: percentage || 0, completedLessons: completedLessons || 0, totalLessons: totalLessons || fetchedLessons.length });
        const completed = progressRecords?.filter(p => p.status === 'completed').map(p => p.lessonId?._id || p.lessonId) || [];
        setCompletedLessonIds(completed);

        // Resume last watched lesson
        try {
          const lastRes = await getLastWatched(courseId);
          const lastLesson = lastRes.data.lastProgress?.lessonId;
          if (lastLesson && typeof lastLesson === 'object') {
            const found = fetchedLessons.find(l => l._id === lastLesson._id);
            if (found) { setCurrentLesson(found); return; }
          }
        } catch (_) {}

        // Default to first lesson
        if (fetchedLessons.length > 0) setCurrentLesson(fetchedLessons[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, user]);

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    try {
      await updateProgress({ courseId, lessonId: currentLesson._id });
      const newCompleted = completedLessonIds.includes(currentLesson._id)
        ? completedLessonIds
        : [...completedLessonIds, currentLesson._id];
      setCompletedLessonIds(newCompleted);
      const pct = Math.round((newCompleted.length / lessons.length) * 100);
      setProgressData({ percentage: pct, completedLessons: newCompleted.length, totalLessons: lessons.length });

      // Auto-advance to next lesson
      const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => setCurrentLesson(lessons[currentIndex + 1]), 600);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const goToPrev = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson?._id);
    if (idx > 0) setCurrentLesson(lessons[idx - 1]);
  };

  const goToNext = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson?._id);
    if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading your classroom...</p>
        </div>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l._id === currentLesson?._id);
  const isCurrentCompleted = completedLessonIds.includes(currentLesson?._id);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 h-14 flex items-center px-4 gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard
        </button>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="text-sm font-semibold text-white truncate flex-1">{course?.title}</h1>
        <div className="hidden sm:flex items-center gap-3 w-48">
          <ProgressBar percentage={progressData.percentage} showLabel={false} size="sm" />
          <span className="text-xs text-gray-400 whitespace-nowrap">{progressData.percentage}%</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 pt-14">
        {/* Video area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
            {/* Video */}
            <VideoPlayer youtubeId={currentLesson?.videoId} title={currentLesson?.title} />

            {/* Progress + Actions */}
            <div className="card p-5 space-y-4">
              <ProgressBar
                percentage={progressData.percentage}
                completed={progressData.completedLessons}
                total={progressData.totalLessons}
              />

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="btn-secondary text-sm px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= lessons.length - 1}
                    className="btn-secondary text-sm px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={isCurrentCompleted}
                  className={`text-sm px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                    isCurrentCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isCurrentCompleted ? 'Completed!' : 'Mark as Complete'}
                </button>
              </div>

              {currentIndex >= 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Lesson {currentIndex + 1} of {lessons.length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-80' : 'w-0'}`}>
          <div className="w-80 h-full overflow-hidden border-l border-white/5">
            <SidebarLessons
              lessons={lessons}
              currentLesson={currentLesson}
              onSelectLesson={handleSelectLesson}
              completedLessons={completedLessonIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
