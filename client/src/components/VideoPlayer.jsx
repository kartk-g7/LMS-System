import { useEffect, useRef } from 'react';

const VideoPlayer = ({ youtubeId, title }) => {
  const containerRef = useRef(null);

  if (!youtubeId) {
    return (
      <div className="aspect-video bg-dark-600 rounded-2xl flex flex-col items-center justify-center border border-white/10">
        <svg className="w-16 h-16 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-sm">Select a lesson to start watching</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in"
        style={{ background: '#000' }}
      >
        <iframe
          key={youtubeId}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&color=white&iv_load_policy=3`}
          title={title || 'Lesson Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {title && (
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-white leading-snug">{title}</h2>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
