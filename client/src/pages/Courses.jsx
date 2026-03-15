import { useState, useEffect } from 'react';
import { getCourses } from '../api/api';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['All', 'Programming', 'Frontend', 'Backend', 'Data Science', 'Design'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedLevel !== 'All') params.level = selectedLevel;
        const res = await getCourses(params);
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLevel('All');
  };

  const hasFilters = search || selectedCategory !== 'All' || selectedLevel !== 'All';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-white mb-3">
            Explore <span className="text-gradient">Courses</span>
          </h1>
          <p className="text-gray-400">Discover expert-led courses to advance your skills</p>
        </div>

        {/* Search + Filters */}
        <div className="card p-5 mb-8 animate-fade-in">
          {/* Search bar */}
          <div className="relative mb-4">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, topics, or technologies..."
              className="input-field pl-12 text-base"
              id="course-search"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 flex items-center">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 flex items-center">Level:</span>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedLevel === lvl
                      ? 'bg-accent-purple text-white'
                      : 'bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-dark-500" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-dark-500 rounded w-3/4" />
                  <div className="h-3 bg-dark-500 rounded w-full" />
                  <div className="h-3 bg-dark-500 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
