import React, { useState } from 'react';
import { HiBars3, HiUser, HiArrowRightOnRectangle, HiCog6Tooth, HiMoon, HiSun } from 'react-icons/hi2';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { AnimatePresence, motion } from 'framer-motion';

import Breadcrumb from './Breadcrumb';
import { getImageUrl } from '../../utils/image';

const Topbar = () => {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User';
  const initials = `${user?.firstName?.[0] || user?.name?.[0] || 'U'}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <header className="print:hidden sticky top-0 z-20 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <HiBars3 className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:block">
        <Breadcrumb />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {user?.profilePhoto && !imgError ? (
              <img 
                src={getImageUrl(user.profilePhoto)} 
                alt={displayName} 
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[120px]">
                {user?.role}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 z-20 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <HiUser className="w-4 h-4 text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <HiCog6Tooth className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiArrowRightOnRectangle className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
