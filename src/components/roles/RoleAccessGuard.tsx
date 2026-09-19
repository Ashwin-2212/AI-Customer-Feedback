import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import { UserRole } from '../../types.js';

interface RoleAccessGuardProps {
  requiredRole?: UserRole | UserRole[];
  title?: string;
  description?: string;
}

export function RoleAccessGuard({
  requiredRole = 'ADMIN',
  title = 'Restricted: Total Project Administration',
  description = 'Only Administrators have full authorization to view the total project overview, system pipeline, user access roster, and organizational governance settings.'
}: RoleAccessGuardProps) {
  const { currentRole, setCurrentRole, addToast } = useApp();

  const handleElevate = async () => {
    await setCurrentRole('ADMIN');
    addToast({
      title: 'Switched to Admin Role',
      message: 'You now have full unrestricted access to the total project.',
      type: 'success'
    });
  };

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200/80 shadow-lg shadow-rose-500/10 dark:bg-rose-950/40 dark:border-rose-800/80">
          <Lock className="h-10 w-10 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border-2 border-white text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm">
          <ShieldAlert className="h-4 w-4 text-amber-400 dark:text-amber-600" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 mb-3">
        <span>Current Active Role: {currentRole}</span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl max-w-md">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </p>

      {/* Role Permissions Matrix Comparison Card */}
      <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
          <span>Role Scope & Access Boundaries</span>
          <span className="text-[11px] font-normal text-slate-500">RBAC Policy</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[10px]">A</span>
              <span className="font-semibold text-slate-900 dark:text-white">ADMIN</span>
            </div>
            <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300">Total Project (All Views & Controls)</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-[10px]">M</span>
              <span className="font-semibold text-slate-900 dark:text-white">MANAGER</span>
            </div>
            <span className="text-[11px] text-slate-500">Operations, Triage & Customer Health</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 text-white font-bold text-[10px]">N</span>
              <span className="font-semibold text-slate-900 dark:text-white">ANALYST</span>
            </div>
            <span className="text-[11px] text-slate-500">Deep Analytics & AI Intelligence</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-500 text-white font-bold text-[10px]">V</span>
              <span className="font-semibold text-slate-900 dark:text-white">VIEWER</span>
            </div>
            <span className="text-[11px] text-slate-500">Read-Only Executive Digest</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleElevate}
          id="btn-switch-admin-guard"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Switch to Admin Mode</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
