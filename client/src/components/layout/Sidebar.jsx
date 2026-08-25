import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../hooks/useSidebar';
import { getImageUrl } from '../../utils/image';
import {
  HiHome,
  HiUsers,
  HiBriefcase,
  HiTruck,
  HiTag,
  HiCube,
  HiClipboardDocumentList,
  HiChartBar,
  HiDocumentChartBar,
  HiUserCircle,
  HiCog6Tooth,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HiHome,                 section: null,        roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/employees',  label: 'Employees', icon: HiBriefcase,            section: 'PEOPLE',    roles: ['ADMIN'] },
  { to: '/customers',  label: 'Customers', icon: HiUsers,                section: 'PEOPLE',    roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/suppliers',  label: 'Suppliers', icon: HiTruck,                section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER'] },
  { to: '/categories', label: 'Categories',icon: HiTag,                  section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER'] },
  { to: '/products',   label: 'Products',  icon: HiCube,                 section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/inventory',  label: 'Inventory', icon: HiClipboardDocumentList,section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/sales',      label: 'Sales',     icon: HiChartBar,             section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/reports',    label: 'Reports',   icon: HiDocumentChartBar,     section: 'REPORTING', roles: ['ADMIN', 'MANAGER'] },
  { to: '/analytics',  label: 'Analytics', icon: HiChartBar,             section: 'REPORTING', roles: ['ADMIN', 'MANAGER'] },
  { to: '/profile',    label: 'Profile',   icon: HiUserCircle,           section: 'SYSTEM',    roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/settings',   label: 'Settings',  icon: HiCog6Tooth,            section: 'SYSTEM',    roles: ['ADMIN'] },
];

const Sidebar = () => {
  const { user } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const userRole = user?.role || 'STAFF';

  const visibleLinks = navLinks.filter(l => l.roles.includes(userRole));

  // Group by section
  const sections = {};
  visibleLinks.forEach(link => {
    const key = link.section || '__top__';
    if (!sections[key]) sections[key] = [];
    sections[key].push(link);
  });

  const sectionOrder = ['__top__', 'PEOPLE', 'COMMERCE', 'REPORTING', 'SYSTEM'];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'print:hidden fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 text-white',
        'transition-all duration-300 ease-in-out',
        'md:relative md:translate-x-0',
        collapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Header */}
        <div className={`flex items-center h-16 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden pr-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div className="min-w-0 leading-none">
                <span className="font-extrabold text-white text-xs tracking-tight block truncate">Business Management System</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm" title="BMS - Business Management System">
              <span className="text-white font-bold text-sm">B</span>
            </div>
          )}

          {/* Close on mobile / Collapse on desktop */}
          <button
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
            onClick={closeSidebar}
          >
            <HiXMark className="w-5 h-5" />
          </button>
          <button
            className="hidden md:flex p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {sectionOrder.map(section => {
            const items = sections[section];
            if (!items) return null;
            return (
              <div key={section} className="mb-4">
                {section !== '__top__' && !collapsed && (
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    {section}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => { if (window.innerWidth < 768) closeSidebar(); }}
                      className={({ isActive }) => [
                        'flex items-center rounded-lg transition-all duration-150 group relative',
                        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3',
                        isActive
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/10',
                      ].join(' ')}
                      title={collapsed ? link.label : undefined}
                    >
                      <link.icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'}`} />
                      {!collapsed && (
                        <span className="text-sm font-medium truncate">{link.label}</span>
                      )}
                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                          {link.label}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              {user?.profilePhoto && !imgError ? (
                <img 
                  src={getImageUrl(user.profilePhoto)} 
                  alt="" 
                  onError={() => setImgError(true)}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white font-semibold text-xs uppercase">
                    {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate font-mono">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="border-t border-white/10 p-2 flex-shrink-0 flex justify-center">
            {user?.profilePhoto && !imgError ? (
              <img 
                src={getImageUrl(user.profilePhoto)} 
                alt="" 
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full object-cover border border-white/20" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs uppercase">{user?.firstName?.[0] || user?.name?.[0] || 'U'}</span>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
