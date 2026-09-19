import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { AnalyticsOverview, Feedback, UserRole } from '../../types.js';
import {
  AlertOctagon,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  BrainCircuit,
  Eye,
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { AdminDashboardView } from './AdminDashboardView.js';
import { ManagerDashboardView } from './ManagerDashboardView.js';
import { AnalystDashboardView } from './AnalystDashboardView.js';
import { ViewerDashboardView } from './ViewerDashboardView.js';

export function DashboardView() {
  const { currentRole, setCurrentRole, refreshTrigger, triggerRefresh, addToast } = useApp();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [overviewRes, feedbackRes] = await Promise.all([
        ApiService.getAnalyticsOverview(),
        ApiService.getFeedbacks({ limit: 6, sortBy: 'date_desc' })
      ]);
      setOverview(overviewRes.data);
      setRecentFeedbacks(feedbackRes.items);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setErrorMessage(err?.message || 'Failed to connect to analytics service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleRoleTabClick = async (role: UserRole) => {
    await setCurrentRole(role);
  };

  if (isLoading && !overview) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (errorMessage && !overview) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
          <AlertOctagon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Unable to Load Dashboard Data</h3>
        <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {errorMessage}. Please verify the server connection and try again.
        </p>
        <button
          id="btn-retry-dashboard"
          onClick={loadData}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Role Navigation Switcher Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800/80 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Workspace Overview
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              currentRole === 'ADMIN'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                : currentRole === 'MANAGER'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : currentRole === 'ANALYST'
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {currentRole === 'ADMIN' && <ShieldCheck className="h-3.5 w-3.5" />}
              {currentRole === 'MANAGER' && <Briefcase className="h-3.5 w-3.5" />}
              {currentRole === 'ANALYST' && <BrainCircuit className="h-3.5 w-3.5" />}
              {currentRole === 'VIEWER' && <Eye className="h-3.5 w-3.5" />}
              <span>Active UI: {currentRole}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentRole === 'ADMIN' && 'Total Project Scope: Full control, multi-product ingestion telemetry & governance.'}
            {currentRole === 'MANAGER' && 'Operations Scope: Team triage, critical issues, SLA resolution & customer health.'}
            {currentRole === 'ANALYST' && 'Intelligence Scope: Deep sentiment curves, aspect decomposition & Gemini AI research.'}
            {currentRole === 'VIEWER' && 'Viewer Scope: Read-only satisfaction scoreboards & high-level customer digests.'}
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            onClick={() => handleRoleTabClick('ADMIN')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentRole === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Administrator View (Total Project Access)"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => handleRoleTabClick('MANAGER')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentRole === 'MANAGER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Manager View (Operations & Issues)"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Manager</span>
          </button>

          <button
            onClick={() => handleRoleTabClick('ANALYST')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentRole === 'ANALYST'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Analyst View (Deep AI & Sentiment)"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Analyst</span>
          </button>

          <button
            onClick={() => handleRoleTabClick('VIEWER')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentRole === 'VIEWER'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Viewer View (Read-Only Digest)"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Viewer</span>
          </button>
        </div>
      </div>

      {/* Render Role-Specific View */}
      {currentRole === 'ADMIN' && (
        <AdminDashboardView
          overview={overview}
          recentFeedbacks={recentFeedbacks}
          onRefresh={loadData}
        />
      )}

      {currentRole === 'MANAGER' && (
        <ManagerDashboardView
          overview={overview}
          recentFeedbacks={recentFeedbacks}
          onRefresh={loadData}
        />
      )}

      {currentRole === 'ANALYST' && (
        <AnalystDashboardView
          overview={overview}
          recentFeedbacks={recentFeedbacks}
          onRefresh={loadData}
        />
      )}

      {currentRole === 'VIEWER' && (
        <ViewerDashboardView
          overview={overview}
          recentFeedbacks={recentFeedbacks}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
