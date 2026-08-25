import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi2';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <NavLink to="/" className="text-gray-400 hover:text-gray-500">
            Home
          </NavLink>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to} className="flex items-center">
              <HiChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400" />
              {last ? (
                <span className="ml-2 text-sm font-medium text-gray-500 capitalize" aria-current="page">
                  {value}
                </span>
              ) : (
                <NavLink to={to} className="ml-2 text-sm font-medium text-gray-400 hover:text-gray-500 capitalize">
                  {value}
                </NavLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
