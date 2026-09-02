import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import Input from './Input';

const SearchFilter = ({ onSearch, value, placeholder = 'Search...', children }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    // Only update local value from prop if it differs from what's typed
    if (value === '' && localValue !== '') setLocalValue('');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch && localValue !== value) {
        onSearch(localValue);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localValue, onSearch, value]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm mb-6">
      <div className="w-full sm:w-80">
        <Input
          iconLeft={HiMagnifyingGlass}
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;

