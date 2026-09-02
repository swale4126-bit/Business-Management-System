export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[2px]',
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`rounded-full border-gray-200 border-t-primary-600 animate-spin ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
};

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-gray-100 dark:border-gray-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">BMS</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] w-full bg-transparent">
      <div className="relative mb-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-100 dark:border-gray-800" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
};
