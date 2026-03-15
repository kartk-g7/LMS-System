const ProgressBar = ({ percentage = 0, completed = 0, total = 0, showLabel = true, size = 'md' }) => {
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = () => {
    if (clampedPercent >= 100) return 'from-emerald-500 to-emerald-400';
    if (clampedPercent >= 60) return 'from-primary-600 to-primary-400';
    if (clampedPercent >= 30) return 'from-primary-600 to-accent-purple';
    return 'from-accent-purple to-accent-pink';
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 font-medium">Your Progress</span>
            {clampedPercent === 100 && (
              <span className="badge-green text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-medium">
                ✓ Complete!
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-base font-bold ${clampedPercent === 100 ? 'text-emerald-400' : 'text-white'}`}>
              {clampedPercent}%
            </span>
          </div>
        </div>
      )}

      <div className={`w-full bg-dark-500 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out relative`}
          style={{ width: `${clampedPercent}%` }}
        >
          {size === 'lg' && clampedPercent > 10 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {clampedPercent}%
            </span>
          )}
        </div>
      </div>

      {showLabel && total > 0 && (
        <p className="text-xs text-gray-500">
          {completed} of {total} lessons completed
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
