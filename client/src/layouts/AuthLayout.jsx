import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen, PageLoader } from '../components/ui/LoadingSpinner';
import { 
  HiUsers, HiUserGroup, HiTruck, HiCube, 
  HiClipboardDocumentList, HiBanknotes, HiDocumentChartBar, HiChartPie 
} from 'react-icons/hi2';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const features = [
    { name: 'Employees', icon: HiUsers },
    { name: 'Customers', icon: HiUserGroup },
    { name: 'Suppliers', icon: HiTruck },
    { name: 'Products', icon: HiCube },
    { name: 'Inventory', icon: HiClipboardDocumentList },
    { name: 'Sales', icon: HiBanknotes },
    { name: 'Reports', icon: HiDocumentChartBar },
    { name: 'Analytics', icon: HiChartPie },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 font-sans">
      
      {/* Left Column: Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        
        {/* Brand Logo - Absolute Top Left */}
        <div className="absolute top-8 left-8 sm:left-16 lg:left-24 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Business Management System
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
              Enterprise Business Platform
            </span>
          </div>
        </div>

        {/* Content Outlet (Login, Forgot Password, etc.) */}
        <div className="w-full max-w-sm mx-auto flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Business Management System. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column: Marketing / Testimonial (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-16 flex-col justify-center relative overflow-hidden text-white">
        
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl" />

        <div className="relative z-10 max-w-xl mx-auto space-y-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
            Manage your business from one powerful platform.
          </h1>
          
          <p className="text-lg text-primary-100 font-medium leading-relaxed max-w-md">
            Centralize employees, customers, suppliers, products, inventory, sales, reports, and analytics in one place.
          </p>

          {/* Integration / Feature Logos */}
          <div className="pt-10 border-t border-primary-700/60">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 text-primary-200">
              {features.map(({ name, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary-400" />
                  <span className="text-sm font-semibold tracking-wide">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;
