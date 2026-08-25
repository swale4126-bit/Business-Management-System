import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  hint,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = '',
  wrapperClassName = '',
  required,
  ...props
}, ref) => {
  const baseInput = [
    'block w-full rounded-lg border text-sm transition-colors duration-150',
    'bg-white text-gray-900 placeholder-gray-400',
    'dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'dark:disabled:bg-gray-900 dark:disabled:text-gray-600',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400/40'
      : 'border-gray-300 dark:border-gray-600',
    IconLeft ? 'pl-10' : 'px-3',
    IconRight ? 'pr-10' : '',
    'py-2.5',
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
        {IconLeft && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconLeft className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          ref={ref}
          className={`${baseInput} ${className}`}
          {...props}
        />
        {IconRight && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <IconRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
