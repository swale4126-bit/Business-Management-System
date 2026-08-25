import React from 'react';

const Badge = ({ children, variant = 'gray', dot = false, className = '' }) => {
  const variants = {
    blue:    'bg-blue-50   text-blue-700   ring-blue-600/20   dark:bg-blue-900/30  dark:text-blue-300',
    green:   'bg-green-50  text-green-700  ring-green-600/20  dark:bg-green-900/30 dark:text-green-300',
    amber:   'bg-amber-50  text-amber-700  ring-amber-600/20  dark:bg-amber-900/30 dark:text-amber-300',
    red:     'bg-red-50    text-red-700    ring-red-600/20    dark:bg-red-900/30   dark:text-red-300',
    gray:    'bg-gray-50   text-gray-600   ring-gray-500/20   dark:bg-gray-800     dark:text-gray-300',
    indigo:  'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300',
    purple:  'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300',
    // legacy aliases
    yellow:  'bg-amber-50  text-amber-700  ring-amber-600/20  dark:bg-amber-900/30 dark:text-amber-300',
    success: 'bg-green-50  text-green-700  ring-green-600/20  dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-50  text-amber-700  ring-amber-600/20  dark:bg-amber-900/30 dark:text-amber-300',
    danger:  'bg-red-50    text-red-700    ring-red-600/20    dark:bg-red-900/30   dark:text-red-300',
  };

  const dotColors = {
    blue: 'bg-blue-500', green: 'bg-green-500', amber: 'bg-amber-500',
    red: 'bg-red-500', gray: 'bg-gray-400', indigo: 'bg-indigo-500',
    purple: 'bg-purple-500', yellow: 'bg-amber-500',
    success: 'bg-green-500', warning: 'bg-amber-500', danger: 'bg-red-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${variants[variant] || variants.gray} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || 'bg-gray-400'}`} />}
      {children}
    </span>
  );
};

export default Badge;
