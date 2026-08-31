import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, iconColor = 'blue', description, accent }) => {
  const iconConfig = {
    blue:   { bg: 'bg-blue-500/10   dark:bg-blue-500/15',   text: 'text-blue-600   dark:text-blue-400',   border: 'ring-1 ring-blue-500/20',   accent: 'from-blue-500'   },
    green:  { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'ring-1 ring-emerald-500/20', accent: 'from-emerald-500' },
    amber:  { bg: 'bg-amber-500/10  dark:bg-amber-500/15',  text: 'text-amber-600  dark:text-amber-400',  border: 'ring-1 ring-amber-500/20',  accent: 'from-amber-500'  },
    red:    { bg: 'bg-rose-500/10   dark:bg-rose-500/15',   text: 'text-rose-600   dark:text-rose-400',   border: 'ring-1 ring-rose-500/20',   accent: 'from-rose-500'   },
    purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'ring-1 ring-purple-500/20', accent: 'from-purple-500' },
    indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', border: 'ring-1 ring-indigo-500/20', accent: 'from-indigo-500' },
    cyan:   { bg: 'bg-cyan-500/10   dark:bg-cyan-500/15',   text: 'text-cyan-600   dark:text-cyan-400',   border: 'ring-1 ring-cyan-500/20',   accent: 'from-cyan-500'   },
  };

  const config = iconConfig[iconColor] || iconConfig.blue;
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-default">
      {/* Subtle top gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.accent} to-transparent opacity-60`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 truncate mb-1.5">{title}</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>

          {(trend || description) ? (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              {trend && (
                <>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${
                    isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                    isNegative ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {isPositive && '↑'}
                    {isNegative && '↓'}
                    {trend}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-[11px]">vs last month</span>
                </>
              )}
              {description && !trend && (
                <span className="text-gray-400 dark:text-gray-500 text-[11px]">{description}</span>
              )}
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Live</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl ${config.bg} ${config.text} ${config.border} transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
