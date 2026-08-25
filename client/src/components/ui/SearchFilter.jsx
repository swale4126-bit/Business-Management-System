import React from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import Input from './Input';

const SearchFilter = ({ onSearch, placeholder = 'Search...', children }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="w-full sm:w-1/3">
        <Input
          iconLeft={HiMagnifyingGlass}
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {children && (
        <div className="flex gap-2 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
