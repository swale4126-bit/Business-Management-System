import React from 'react';

const DataTable = ({ columns, data, isLoading, emptyMessage = 'No records found', emptySubMessage = 'There are no records to display yet.' }) => {
  if (isLoading) {
    return (
      <div className="overflow-x-auto cursor-default">
        <table className="min-w-full">
          <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-5 py-3.5">
                    <div className={`h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse ${j === 0 ? 'w-2/3' : 'w-1/2'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-inner">
          <svg className="w-7 h-7 text-gray-350 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{emptyMessage}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full block md:table">
        <thead className="hidden md:table-header-group bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
          <tr className="md:table-row">
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block md:table-row-group bg-transparent md:bg-white md:dark:bg-gray-900 md:divide-y md:divide-gray-100 md:dark:divide-gray-800/80">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="block md:table-row bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl mb-4 md:mb-0 md:border-none shadow-sm md:shadow-none hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors duration-100"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="flex md:table-cell items-center justify-between px-4 py-3 md:px-5 md:py-3.5 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 md:border-b-0 last:border-b-0"
                >
                  <span className="md:hidden font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap mr-4">
                    {col.header}
                  </span>
                  <div className="text-right md:text-left flex-grow flex justify-end md:justify-start break-all md:break-normal">
                    {col.render
                      ? col.render(row)
                      : typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : row[col.accessor]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
