import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, createCourse, createLesson, deleteCourse, deleteLesson, getLessons } from '../api/api';

const InstructorPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);

  const [courseForm, setCourseForm] = useState({
    title: '', description: '', thumbnail: '', category: 'Programming',
    level: 'Beginner', tags: '', duration: '',
  });
  const [lessonForm, setLessonForm] = useState({
    courseId: '', title: '', youtubeId: '', order: 1, isFree: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      navigate('/dashboard');
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses();
      const all = res.data.courses || [];
      const mine = user.role === 'admin' ? all : all.filter(c =>
        c.instructor?._id === user._id || c.instructor === user._id
      );
      setMyCourses(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const res = await getLessons(courseId);
      setCourseLessons(res.data.lessons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setLessonForm(f => ({ ...f, courseId: course._id, order: 1 }));
    fetchLessons(course._id);
    setActiveTab('lessons');
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!courseForm.title || !courseForm.description) {
      setFormError('Title and description are required'); return;
    }
    try {
      setFormLoading(true);
      const tags = courseForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createCourse({ ...courseForm, tags });
      setShowCourseForm(false);
      setCourseForm({ title: '', description: '', thumbnail: '', category: 'Programming', level: 'Beginner', tags: '', duration: '' });
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!lessonForm.youtubeId || !lessonForm.title) {
      setFormError('Title and YouTube ID are required'); return;
    }
    try {
      setFormLoading(true);
      // Extract YouTube video ID from URL if full URL is provided
      let ytId = lessonForm.youtubeId;
      const ytMatch = ytId.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
      if (ytMatch) ytId = ytMatch[1];

      await createLesson({ ...lessonForm, youtubeId: ytId });
      setShowLessonForm(false);
      setLessonForm(f => ({ ...f, title: '', youtubeId: '', isFree: false, order: courseLessons.length + 2 }));
      fetchLessons(selectedCourse._id);
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create lesson');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await deleteCourse(courseId);
      fetchCourses();
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null);
        setActiveTab('courses');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      fetchLessons(selectedCourse._id);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Instructor Portal</h1>
            <p className="text-gray-400 mt-1">Create and manage your courses</p>
          </div>
          <Link to="/dashboard" className="btn-secondary text-sm px-4 py-2">← Dashboard</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'courses' ? 'bg-primary-600/20 border border-primary-500/30 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            📚 My Courses ({myCourses.length})
          </button>
          {selectedCourse && (
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'lessons' ? 'bg-primary-600/20 border border-primary-500/30 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              🎥 Lessons — {selectedCourse.title}
            </button>
          )}
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowCourseForm(!showCourseForm)} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
                <span>+</span> New Course
              </button>
            </div>

            {/* Create Course Form */}
            {showCourseForm && (
              <div className="card p-6 animate-slide-up">
                <h3 className="font-display font-bold text-white text-lg mb-5">Create New Course</h3>
                {formError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">{formError}</div>}
                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Course Title *</label>
                    <input className="input-field" placeholder="e.g. Complete React.js Course" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
                    <textarea rows={3} className="input-field resize-none" placeholder="What will students learn?" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Thumbnail URL</label>
                    <input className="input-field" placeholder="https://..." value={courseForm.thumbnail} onChange={e => setCourseForm(f => ({ ...f, thumbnail: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                    <select className="input-field" value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}>
                      {['Programming', 'Frontend', 'Backend', 'Data Science', 'Design', 'General'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Level</label>
                    <select className="input-field" value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))}>
                      {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Duration (e.g. 10h 30m)</label>
                    <input className="input-field" placeholder="10h 30m" value={courseForm.duration} onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags (comma separated)</label>
                    <input className="input-field" placeholder="react, javascript, frontend" value={courseForm.tags} onChange={e => setCourseForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowCourseForm(false)} className="btn-secondary text-sm px-5 py-2">Cancel</button>
                    <button type="submit" disabled={formLoading} className="btn-primary text-sm px-6 py-2 disabled:opacity-50">
                      {formLoading ? 'Creating...' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Courses list */}
            {myCourses.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                <p className="text-gray-400">Create your first course to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCourses.map(course => (
                  <div key={course._id} className="card p-5 flex flex-col gap-3">
                    <img src={course.thumbnail} alt={course.title} className="w-full aspect-video rounded-lg object-cover" onError={e => e.target.style.display='none'} />
                    <div>
                      <h3 className="text-white font-semibold text-sm line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{course.totalLessons} lessons · {course.enrolledCount} students</p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => handleSelectCourse(course)} className="btn-primary text-xs px-3 py-1.5 flex-1">
                        Manage Lessons
                      </button>
                      <button onClick={() => handleDeleteCourse(course._id)} className="btn-danger text-xs px-3 py-1.5">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && selectedCourse && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedCourse.title}</h2>
                <p className="text-sm text-gray-400">{courseLessons.length} lessons</p>
              </div>
              <button onClick={() => { setShowLessonForm(!showLessonForm); setFormError(''); setLessonForm(f => ({ ...f, order: courseLessons.length + 1 })); }} className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
                <span>+</span> Add Lesson
              </button>
            </div>

            {/* Add Lesson Form */}
            {showLessonForm && (
              <div className="card p-6 animate-slide-up">
                <h3 className="font-display font-bold text-white text-base mb-4">Add New Lesson</h3>
                {formError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">{formError}</div>}
                <form onSubmit={handleCreateLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Lesson Title *</label>
                    <input className="input-field" placeholder="e.g. Introduction to React Hooks" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">YouTube Video URL or ID *</label>
                    <input className="input-field" placeholder="https://youtu.be/... or video_id" value={lessonForm.youtubeId} onChange={e => setLessonForm(f => ({ ...f, youtubeId: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Order</label>
                    <input type="number" className="input-field" min="1" value={lessonForm.order} onChange={e => setLessonForm(f => ({ ...f, order: parseInt(e.target.value) }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isFree" checked={lessonForm.isFree} onChange={e => setLessonForm(f => ({ ...f, isFree: e.target.checked }))} className="w-4 h-4 rounded border-white/20" />
                    <label htmlFor="isFree" className="text-sm text-gray-300">Free preview lesson</label>
                  </div>
                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowLessonForm(false)} className="btn-secondary text-sm px-5 py-2">Cancel</button>
                    <button type="submit" disabled={formLoading} className="btn-primary text-sm px-6 py-2 disabled:opacity-50">
                      {formLoading ? 'Adding...' : 'Add Lesson'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lessons list */}
            {courseLessons.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-4xl mb-3">🎥</div>
                <p className="text-gray-400">No lessons yet. Add your first lesson!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courseLessons.map((lesson, index) => (
                  <div key={lesson._id} className="card p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                      {lesson.order}
                    </div>
                    <img
                      src={lesson.thumbnailUrl || `https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
                      alt={lesson.title}
                      className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{lesson.youtubeId}</p>
                      {lesson.isFree && <span className="text-xs text-emerald-400">Free preview</span>}
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary-400 transition-colors p-2"
                      title="Open on YouTube"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.947-.262-1.69-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.686 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"/></svg>
                    </a>
                    <button onClick={() => handleDeleteLesson(lesson._id)} className="text-red-400 hover:text-red-300 transition-colors p-2" title="Delete lesson">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorPortal;
