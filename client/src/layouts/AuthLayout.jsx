import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen, PageLoader } from '../components/ui/LoadingSpinner';
import { 
  HiUsers, HiUserGroup, HiTruck, HiCube, 
  HiClipboardDocumentList, HiBanknotes, HiDocumentChartBar, HiChartPie,
  HiShieldCheck, HiSparkles, HiCheckCircle
} from 'react-icons/hi2';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const enterpriseHighlights = [
    { label: 'Real-Time Inventory', desc: 'Automated stock tracking, min-threshold alerts & PO history', icon: HiCube },
    { label: 'POS & Sales Checkout', desc: 'Instant invoice generator with cash, card, and bank reconciliations', icon: HiBanknotes },
    { label: 'Financial Analytics', desc: '12-month revenue velocity, product demand & customer insights', icon: HiChartPie },
    { label: 'Strict RBAC Security', desc: 'Granular permissions across Administrator, Manager, and Staff', icon: HiShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Left Column: Form & Interaction Area */}
      <div className="w-full lg:w-[50%] xl:w-[46%] flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-8 lg:px-10 min-h-screen relative">
        <div className="w-full max-w-md flex flex-col gap-4 sm:gap-5 my-auto">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 flex-shrink-0">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-tight">B</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight block text-base sm:text-lg">
                  Business Manager
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Enterprise Cloud Platform
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cloud
            </div>
          </div>

          {/* Form Content Outlet */}
          <div className="w-full">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
          
          {/* Footer */}
          <div className="w-full pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Business Management System · Enterprise RBAC
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Visual Showcase (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-[#0b1120] p-12 xl:p-16 flex-col justify-between relative overflow-hidden text-white border-l border-white/5">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-indigo-600/15 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
            <HiSparkles className="w-4 h-4 text-amber-400" />
            <span>ERP System Architecture v2.4</span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>99.9% Production Uptime</span>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black leading-[1.18] tracking-tight text-white">
              Complete business operations, from inventory to analytics.
            </h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed mt-4">
              A robust, unified enterprise system designed to streamline supply chains, transactions, staff permissions, and financial reporting.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {enterpriseHighlights.map(({ label, desc, icon: Icon }) => (
              <div 
                key={label}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{label}</h3>
                <p className="text-xs text-slate-400 leading-snug mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <HiShieldCheck className="w-4 h-4 text-emerald-400" />
            PostgreSQL · Prisma ORM · JWT Auth · Multi-Role Architecture
          </span>
          <span className="text-slate-500 font-mono text-[11px]">BMS-PROD-LIVE</span>
        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;
