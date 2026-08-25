import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HiChevronRight, HiHome } from 'react-icons/hi2';

const routeLabels = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  customers: 'Customers',
  suppliers: 'Suppliers',
  categories: 'Categories',
  products: 'Products',
  inventory: 'Inventory',
  history: 'Movement History',
  sales: 'Sales Invoices',
  new: 'Create Sale',
  reports: 'Reports & Analytics',
  analytics: 'Analytics',
  profile: 'My Profile',
  settings: 'Settings',
  notifications: 'Notifications',
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-xs" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 font-medium">
        <li>
          <NavLink to="/" className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
            <HiHome className="w-3.5 h-3.5" />
            <span>Home</span>
          </NavLink>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = routeLabels[value] || (value.length > 16 ? `${value.substring(0, 14)}...` : value);

          return (
            <li key={to} className="flex items-center space-x-1.5">
              <HiChevronRight className="flex-shrink-0 w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              {last ? (
                <span className="text-gray-800 dark:text-gray-200 font-semibold capitalize" aria-current="page">
                  {label}
                </span>
              ) : (
                <NavLink to={to} className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors capitalize">
                  {label}
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

