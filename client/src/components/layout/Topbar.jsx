import React, { useState } from 'react';
import { HiBars3, HiUser, HiArrowRightOnRectangle, HiCog6Tooth, HiMoon, HiSun, HiChevronDown } from 'react-icons/hi2';
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
    <header className="print:hidden sticky top-0 z-20 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800/80 flex items-center px-4 sm:px-5 gap-3 flex-shrink-0 cursor-default select-none">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-1.5 -ml-0.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <HiBars3 className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center min-w-0">
        <Breadcrumb />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <HiSun className="w-5 h-5" />
            : <HiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700/80 mx-1" />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {user?.profilePhoto && !imgError ? (
              <img
                src={getImageUrl(user.profilePhoto)}
                alt={displayName}
                onError={() => setImgError(true)}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm ring-2 ring-primary-500/20">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate max-w-[100px]">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[100px] leading-tight">
                {user?.role}
              </p>
            </div>
            <HiChevronDown className={`hidden sm:block w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 z-20 overflow-hidden"
                >
                  {/* User header */}
                  <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      {user?.profilePhoto && !imgError ? (
                        <img
                          src={getImageUrl(user.profilePhoto)}
                          alt={displayName}
                          onError={() => setImgError(true)}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-primary-500/20">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      <HiUser className="w-4 h-4 text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      <HiCog6Tooth className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 py-1.5">
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
