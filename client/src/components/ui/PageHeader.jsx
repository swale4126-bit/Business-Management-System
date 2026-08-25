import React from 'react';

const PageHeader = ({ title, description, subtitle, actions, action }) => {
  const subtext = description || subtitle;
  const actionContent = actions || action;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtext && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
        )}
      </div>
      {actionContent && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actionContent}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
