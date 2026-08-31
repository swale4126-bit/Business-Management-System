import React from 'react';

const PageHeader = ({ title, description, subtitle, actions, action, badge, icon: Icon }) => {
  const subtext = description || subtitle;
  const actionContent = actions || action;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 cursor-default">
      <div className="min-w-0 flex items-start gap-3.5">
        {Icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center mt-0.5 ring-1 ring-primary-500/20">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{title}</h1>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {subtext && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed">{subtext}</p>
          )}
        </div>
      </div>
      {actionContent && (
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {actionContent}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
