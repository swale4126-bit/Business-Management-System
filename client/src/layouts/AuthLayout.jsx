import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/ui/LoadingSpinner';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait until the initial auth check is done before deciding
  if (isLoading) return <LoadingScreen />;

  // If already logged in, bounce straight to the dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-950 px-4 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Business Management System</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} Business Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
