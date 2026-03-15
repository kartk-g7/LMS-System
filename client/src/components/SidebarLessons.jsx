const SidebarLessons = ({ lessons, currentLesson, onSelectLesson, completedLessons = [] }) => {
  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-sm">Course Content</h3>
        <p className="text-xs text-gray-400 mt-1">{lessons.length} lessons</p>
      </div>

      {/* Lessons list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
        {lessons.map((lesson, index) => {
          const isActive = currentLesson?._id === lesson._id;
          const isCompleted = completedLessons.includes(lesson._id);

          return (
            <button
              key={lesson._id}
              onClick={() => onSelectLesson(lesson)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-600/20 border border-primary-500/40 text-white'
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {/* Status indicator */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-500 text-gray-500 group-hover:bg-dark-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                  isActive ? 'text-white' : 'text-gray-300'
                }`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {lesson.isFree && (
                    <span className="text-xs text-emerald-400 font-medium">Free</span>
                  )}
                  {lesson.duration && (
                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-slow" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarLessons;
