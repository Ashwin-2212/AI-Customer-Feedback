import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  Settings,
  Building,
  Globe,
  Bell,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';

export function PlatformSettingsView() {
  const { organization, theme, toggleTheme, addToast } = useApp();
  const [companyName, setCompanyName] = useState(organization?.name || 'Acme Technologies Inc.');
  const [workspaceSlug, setWorkspaceSlug] = useState(organization?.slug || 'acme-corp');
  const [supportEmail, setSupportEmail] = useState('support@acme.com');
  const [timezone, setTimezone] = useState('UTC (GMT+0)');
  const [feedbackAutoTriage, setFeedbackAutoTriage] = useState(true);
  const [realtimeNotifications, setRealtimeNotifications] = useState(true);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState('WEEKLY');
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(0.85);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        title: 'Platform Settings Saved',
        message: 'Workspace configurations, notifications, and AI thresholds updated.',
        type: 'success'
      });
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl dark:border-indigo-900/50">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-300 uppercase border border-indigo-400/30">
                <Settings className="h-3 w-3 text-indigo-400" />
                Global System Preferences
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2.5">
              <span>Platform Settings & Workspace Profile</span>
            </h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-2xl">
              Configure enterprise workspace metadata, notification policies, theme preferences, and AI triage automation thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workspace Identity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Workspace Identity & Profile</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization Display Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workspace Domain Slug
              </label>
              <input
                type="text"
                value={workspaceSlug}
                onChange={(e) => setWorkspaceSlug(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform Default Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                <option value="EST (GMT-5)">EST (US Eastern Time)</option>
                <option value="PST (GMT-8)">PST (US Pacific Time)</option>
                <option value="IST (GMT+5:30)">IST (India Standard Time)</option>
                <option value="CET (GMT+1)">CET (Central European Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Automation Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>AI Automation & Thresholds</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Autonomous Feedback Auto-Triage</span>
                <div className="text-[10px] text-slate-400">Automatically classify sentiment and priority on ingestion</div>
              </div>
              <input
                type="checkbox"
                checked={feedbackAutoTriage}
                onChange={(e) => setFeedbackAutoTriage(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Realtime Toast Notifications</span>
                <div className="text-[10px] text-slate-400">Show alerts when critical issues or anomalies trigger</div>
              </div>
              <input
                type="checkbox"
                checked={realtimeNotifications}
                onChange={(e) => setRealtimeNotifications(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  AI Recommendation Confidence Cutoff
                </label>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(aiConfidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50% (Permissive)</span>
                <span>85% (Recommended)</span>
                <span>99% (Strict)</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Email Summary Digest
              </label>
              <select
                value={emailDigestFrequency}
                onChange={(e) => setEmailDigestFrequency(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="DAILY">Daily Morning Digest (09:00 AM)</option>
                <option value="WEEKLY">Weekly Executive Rollup (Monday)</option>
                <option value="MONTHLY">Monthly Board Report</option>
                <option value="OFF">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
