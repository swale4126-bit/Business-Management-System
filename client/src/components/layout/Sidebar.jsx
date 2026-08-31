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
  HiShoppingCart,
} from 'react-icons/hi2';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard',  icon: HiHome,                  section: null,        roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/employees',  label: 'Employees',  icon: HiBriefcase,             section: 'PEOPLE',    roles: ['ADMIN'] },
  { to: '/customers',  label: 'Customers',  icon: HiUsers,                 section: 'PEOPLE',    roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/suppliers',  label: 'Suppliers',  icon: HiTruck,                 section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER'] },
  { to: '/categories', label: 'Categories', icon: HiTag,                   section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER'] },
  { to: '/products',   label: 'Products',   icon: HiCube,                  section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/inventory',  label: 'Inventory',  icon: HiClipboardDocumentList, section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/sales',      label: 'Sales',      icon: HiShoppingCart,          section: 'COMMERCE',  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/reports',    label: 'Reports',    icon: HiDocumentChartBar,      section: 'REPORTING', roles: ['ADMIN', 'MANAGER'] },
  { to: '/analytics',  label: 'Analytics',  icon: HiChartBar,              section: 'REPORTING', roles: ['ADMIN', 'MANAGER'] },
  { to: '/profile',    label: 'Profile',    icon: HiUserCircle,            section: 'SYSTEM',    roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/settings',   label: 'Settings',   icon: HiCog6Tooth,             section: 'SYSTEM',    roles: ['ADMIN'] },
];

const sectionOrder = ['__top__', 'PEOPLE', 'COMMERCE', 'REPORTING', 'SYSTEM'];

const sectionLabels = {
  PEOPLE:    'People',
  COMMERCE:  'Commerce',
  REPORTING: 'Reporting',
  SYSTEM:    'System',
};

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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'print:hidden fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f1623] text-slate-100',
        'border-r border-white/5',
        'transition-all duration-300 ease-in-out cursor-default select-none',
        'md:relative md:translate-x-0',
        collapsed ? 'w-[68px]' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Header / Branding */}
        <div className={`flex items-center h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden pr-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
                <span className="text-white font-extrabold text-sm">B</span>
              </div>
              <div className="min-w-0 leading-tight">
                <span className="font-bold text-white text-xs tracking-tight block truncate">Business Manager</span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wide block truncate">Enterprise ERP</span>
              </div>
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10 flex-shrink-0"
              title="BMS – Business Management System"
            >
              <span className="text-white font-extrabold text-xs tracking-tight">BMS</span>
            </div>
          )}

          {/* Close on mobile / Collapse on desktop */}
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            onClick={closeSidebar}
            aria-label="Close Sidebar"
          >
            <HiXMark className="w-5 h-5" />
          </button>
          {!collapsed && (
            <button
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors ml-auto"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse Sidebar"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2.5">
          {sectionOrder.map(section => {
            const items = sections[section];
            if (!items) return null;
            return (
              <div key={section}>
                {section !== '__top__' && !collapsed && (
                  <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {sectionLabels[section] || section}
                  </p>
                )}
                {section !== '__top__' && collapsed && (
                  <div className="mx-auto w-8 border-t border-white/8 mb-2" />
                )}
                <div className="space-y-0.5">
                  {items.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/dashboard'}
                      onClick={() => { if (window.innerWidth < 768) closeSidebar(); }}
                      className={({ isActive }) => [
                        'flex items-center rounded-xl transition-all duration-150 group relative text-sm font-medium',
                        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3',
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/6',
                      ].join(' ')}
                      title={collapsed ? link.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active left indicator */}
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/60 rounded-r-full" />
                          )}
                          <link.icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:scale-105`} />
                          {!collapsed && (
                            <span className="truncate">{link.label}</span>
                          )}
                          {/* Tooltip when collapsed */}
                          {collapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl ring-1 ring-white/10">
                              {link.label}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex-shrink-0 px-2.5 pb-3 hidden md:flex justify-center">
            <button
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-colors w-full flex justify-center"
              onClick={() => setCollapsed(false)}
              aria-label="Expand Sidebar"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Card Footer */}
        <div className={`border-t border-white/5 flex-shrink-0 ${collapsed ? 'p-2.5 flex justify-center' : 'p-3'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-1">
              {user?.profilePhoto && !imgError ? (
                <img
                  src={getImageUrl(user.profilePhoto)}
                  alt=""
                  onError={() => setImgError(true)}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs uppercase ring-2 ring-blue-500/30">
                  {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User'}
                </p>
                <span className="text-[10px] text-blue-400 font-medium tracking-wider truncate block">
                  {user?.role}
                </span>
              </div>
            </div>
          ) : (
            user?.profilePhoto && !imgError ? (
              <img
                src={getImageUrl(user.profilePhoto)}
                alt=""
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase ring-2 ring-blue-500/30">
                {user?.firstName?.[0] || user?.name?.[0] || 'U'}
              </div>
            )
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
