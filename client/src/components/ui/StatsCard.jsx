import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, iconColor = 'blue', description, accent }) => {
  const iconConfig = {
    blue:   { bg: 'bg-blue-500/10 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', border: 'ring-1 ring-blue-500/20', accent: 'from-blue-500' },
    green:  { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'ring-1 ring-emerald-500/20', accent: 'from-emerald-500' },
    amber:  { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'ring-1 ring-amber-500/20', accent: 'from-amber-500' },
    red:    { bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'ring-1 ring-rose-500/20', accent: 'from-rose-500' },
    purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'ring-1 ring-purple-500/20', accent: 'from-purple-500' },
    indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', border: 'ring-1 ring-indigo-500/20', accent: 'from-indigo-500' },
    cyan:   { bg: 'bg-cyan-500/10 dark:bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'ring-1 ring-cyan-500/20', accent: 'from-cyan-500' },
  };

  const config = iconConfig[iconColor] || iconConfig.blue;
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-800 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-default flex flex-col justify-between">
      {/* Subtle top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.accent} to-transparent opacity-70`} />

      {/* Top Header: Title + Compact Icon */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0" title={title}>
          {title}
        </p>
        {Icon && (
          <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl ${config.bg} ${config.text} ${config.border} transition-transform group-hover:scale-105 duration-150`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5 sm:my-2">
        <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight truncate">
          {value}
        </p>
      </div>

      {/* Bottom Footer: Trend Badge or Subtle Status */}
      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] min-h-[18px]">
        {trend ? (
          <div className="flex items-center gap-1 truncate">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[10px] leading-none ${
              isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50' :
              isNegative ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {isPositive && '↑'}
              {isNegative && '↓'}
              {trend}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] hidden sm:inline">vs last mo</span>
          </div>
        ) : description ? (
          <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-[11px] truncate">{description}</span>
        ) : (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
