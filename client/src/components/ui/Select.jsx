import React from 'react';

const Select = React.forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
  className = '',
  wrapperClassName = '',
  required,
  children,
  ...props
}, ref) => {
  const baseSelect = [
    'block w-full rounded-xl border text-sm transition-colors duration-150 py-2.5 px-3.5',
    'bg-white text-gray-900',
    'dark:bg-gray-800/80 dark:text-gray-100',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'dark:disabled:bg-gray-900 dark:disabled:text-gray-600',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400/40'
      : 'border-gray-300 dark:border-gray-700',
    'appearance-none',
  ].join(' ');

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select ref={ref} className={`${baseSelect} pr-10 ${className}`} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {/* Support both options array and direct children */}
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        {/* Chevron icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
