import React from 'react';
import { Link } from 'react-router-dom';
import { HiLockClosed, HiHome } from 'react-icons/hi2';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto shadow-sm">
          <HiLockClosed className="w-10 h-10 text-red-600" />
        </div>
        <div>
          <h1 className="text-7xl font-extrabold text-red-600 dark:text-red-500 tracking-tight">403</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Access Forbidden</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            You don't have authorization or sufficient permissions to access this page.
          </p>
        </div>
        <div>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <HiHome className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
