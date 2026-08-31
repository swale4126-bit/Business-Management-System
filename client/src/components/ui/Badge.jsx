import React from 'react';

const Badge = ({ children, variant = 'gray', dot = false, size = 'sm', className = '' }) => {
  const variants = {
    blue:    'bg-blue-50   text-blue-700   ring-blue-600/25   dark:bg-blue-500/10  dark:text-blue-300  dark:ring-blue-400/20',
    green:   'bg-green-50  text-green-700  ring-green-600/25  dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
    amber:   'bg-amber-50  text-amber-700  ring-amber-600/25  dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    red:     'bg-red-50    text-red-700    ring-red-600/25    dark:bg-red-500/10   dark:text-red-300   dark:ring-red-400/20',
    gray:    'bg-gray-100  text-gray-600   ring-gray-500/20   dark:bg-gray-800     dark:text-gray-400  dark:ring-gray-600/20',
    indigo:  'bg-indigo-50 text-indigo-700 ring-indigo-600/25 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
    purple:  'bg-purple-50 text-purple-700 ring-purple-600/25 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-400/20',
    cyan:    'bg-cyan-50   text-cyan-700   ring-cyan-600/25   dark:bg-cyan-500/10  dark:text-cyan-300  dark:ring-cyan-400/20',
    // legacy aliases
    yellow:  'bg-amber-50  text-amber-700  ring-amber-600/25  dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    success: 'bg-green-50  text-green-700  ring-green-600/25  dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
    warning: 'bg-amber-50  text-amber-700  ring-amber-600/25  dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    danger:  'bg-red-50    text-red-700    ring-red-600/25    dark:bg-red-500/10   dark:text-red-300   dark:ring-red-400/20',
  };

  const dotColors = {
    blue: 'bg-blue-500', green: 'bg-green-500', amber: 'bg-amber-500',
    red: 'bg-red-500', gray: 'bg-gray-400', indigo: 'bg-indigo-500',
    purple: 'bg-purple-500', cyan: 'bg-cyan-500', yellow: 'bg-amber-500',
    success: 'bg-green-500', warning: 'bg-amber-500', danger: 'bg-red-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset cursor-default select-none ${variants[variant] || variants.gray} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || 'bg-gray-400'}`} />}
      {children}
    </span>
  );
};

export default Badge;
