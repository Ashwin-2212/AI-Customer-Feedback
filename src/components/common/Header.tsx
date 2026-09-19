import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { UserRole } from '../../types.js';
import {
  Bell,
  Search,
  Sun,
  Moon,
  PlusCircle,
  Upload,
  Command,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export function Header() {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    theme,
    toggleTheme,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsCommandPaletteOpen,
    setIsManualModalOpen,
    setIsCSVModalOpen,
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    setSelectedFeedbackId
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: UserRole[] = ['ADMIN', 'MANAGER', 'ANALYST', 'VIEWER'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Left: Global Search & Quick Actions */}
      <div className="flex items-center gap-3 md:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search feedback, topics, customers... (Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onClick={() => {
              if (window.innerWidth < 768) setIsCommandPaletteOpen(true);
            }}
            className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 md:flex"
            title="Open Command Palette"
          >
            <Command className="h-3 w-3" /> K
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Submit Feedback Buttons */}
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:flex"
          id="btn-quick-feedback"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Feedback</span>
        </button>

        <button
          onClick={() => setIsCSVModalOpen(true)}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex"
          id="btn-quick-csv"
          title="Import CSV Feedback"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Import CSV</span>
        </button>

        {/* Target Products Quick Shortcut */}
        <button
          onClick={() => setActiveTab('target_products')}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
          title="Manage Target Products"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline font-bold">🎯 Target Products</span>
        </button>

        {/* Public Portal link */}
        <button
          onClick={() => setActiveTab('public_portal')}
          className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/50 px-2 py-1.5 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
          title="Open Public Feedback URL"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Public Form</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
              currentRole === 'ADMIN'
                ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
                : currentRole === 'MANAGER'
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : currentRole === 'ANALYST'
                ? 'border-sky-200 bg-sky-50/80 text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
            }`}
            id="role-switcher-button"
            title="Switch User Role (RBAC)"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Role: {currentRole}</span>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Select Active Persona
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Switches UI view layout & permission boundaries
                </p>
              </div>

              <div className="mt-1 space-y-1">
                {/* ADMIN */}
                <button
                  onClick={() => {
                    setCurrentRole('ADMIN');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition ${
                    currentRole === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-white text-[9px]">A</span>
                      <span>ADMIN</span>
                      <span className="rounded bg-indigo-100 px-1 py-0.2 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">Total Project</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Unrestricted master overview & settings</div>
                  </div>
                  {currentRole === 'ADMIN' && <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
                </button>

                {/* MANAGER */}
                <button
                  onClick={() => {
                    setCurrentRole('MANAGER');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition ${
                    currentRole === 'MANAGER'
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-600 text-white text-[9px]">M</span>
                      <span>MANAGER</span>
                      <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">Operations</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Issues triage, SLA & customer health</div>
                  </div>
                  {currentRole === 'MANAGER' && <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                </button>

                {/* ANALYST */}
                <button
                  onClick={() => {
                    setCurrentRole('ANALYST');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition ${
                    currentRole === 'ANALYST'
                      ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border border-sky-200/60 dark:border-sky-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-600 text-white text-[9px]">N</span>
                      <span>ANALYST</span>
                      <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-semibold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Intelligence</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Deep analytics, AI Chat & topic clusters</div>
                  </div>
                  {currentRole === 'ANALYST' && <CheckCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />}
                </button>

                {/* VIEWER */}
                <button
                  onClick={() => {
                    setCurrentRole('VIEWER');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition ${
                    currentRole === 'VIEWER'
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white border border-slate-300 dark:border-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-500 text-white text-[9px]">V</span>
                      <span>VIEWER</span>
                      <span className="rounded bg-slate-200 px-1 py-0.2 text-[9px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">Read-Only</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Clean satisfaction digest & reports</div>
                  </div>
                  {currentRole === 'VIEWER' && <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            id="notifications-button"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 sm:w-96">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Live AI Alerts</span>
                  {unreadNotificationCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.link?.startsWith('/feedback/')) {
                          const fbId = n.link.replace('/feedback/', '');
                          setSelectedFeedbackId(fbId);
                        } else if (n.link) {
                          const tab = n.link.replace(/^\//, '').replace(/-/g, '_');
                          setActiveTab(tab);
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`group cursor-pointer rounded-xl border p-2.5 transition ${
                        !n.read
                          ? 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20'
                          : 'border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Avatar */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-800">
          <img
            src={currentUser?.avatarUrl || '/profile.jpg'}
            alt="User avatar"
            className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-2xs dark:border-slate-700"
          />
          <div className="hidden text-left xl:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {currentUser?.name || 'Ashwin T'}
            </div>
            <div className="text-[10px] text-slate-400">{currentUser?.email || 'admin@example.com'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
