import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, iconColor = 'blue', description }) => {
  const iconColors = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-500/10',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-500/10',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-500/10',
    red:    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-500/10',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-500/10',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-500/10',
  };

  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-2.5 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {(trend || description) ? (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              {trend && (
                <>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold ${
                    isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    isNegative ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {isPositive && '↑ '}
                    {isNegative && '↓ '}
                    {trend}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">vs last month</span>
                </>
              )}
              {description && !trend && (
                <span className="text-gray-500 dark:text-gray-400">{description}</span>
              )}
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>● Updated live</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex-shrink-0 p-3 rounded-2xl transition-transform group-hover:scale-105 ${iconColors[iconColor] || iconColors.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
