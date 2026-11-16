import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { HiSparkles, HiXMark } from 'react-icons/hi2';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden cursor-default">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        {user?.isDemo && !bannerDismissed && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2">
              <HiSparkles className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
              <span>
                You are exploring as a guest with read-only access. Full exploration is enabled; modification actions are disabled to preserve demo data.
              </span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded-lg transition-colors ml-3"
              aria-label="Dismiss banner"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto animate-fade-in flex flex-col min-h-full">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
