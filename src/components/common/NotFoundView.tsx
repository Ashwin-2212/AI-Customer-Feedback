import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { FileQuestion, LayoutDashboard } from 'lucide-react';

export function NotFoundView() {
  const { setActiveTab } = useApp();

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner dark:bg-indigo-950/60 dark:text-indigo-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        404 - Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-xs text-slate-600 dark:text-slate-400">
        The requested page or module could not be found or your current active role lacks sufficient permissions to access it.
      </p>

      <div className="mt-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
