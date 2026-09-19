import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Bot,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  FileText,
  Users,
  Package,
  PlusCircle,
  Upload,
  Moon,
  Sun,
  Shield,
  FileDown
} from 'lucide-react';

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    setIsManualModalOpen,
    setIsCSVModalOpen,
    toggleTheme,
    setCurrentRole,
    theme
  } = useApp();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isCommandPaletteOpen) setSearch('');
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    { label: 'Go to Executive Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => setActiveTab('dashboard') },
    { label: 'Go to Total Project Admin Center', category: 'Navigation', icon: Shield, action: () => setActiveTab('total_project') },
    { label: 'Go to Feedback Ingestion & Table', category: 'Navigation', icon: MessageSquare, action: () => setActiveTab('feedback') },
    { label: 'Go to AI Issue Clusters & Trends', category: 'Navigation', icon: BarChart3, action: () => setActiveTab('clusters') },
    { label: 'Go to Support Copilot & RAG Hub', category: 'Navigation', icon: Bot, action: () => setActiveTab('copilot') },
    { label: 'Go to Competitive Intelligence & Win/Loss', category: 'Navigation', icon: BarChart3, action: () => setActiveTab('competitive') },
    { label: 'Go to Resolved ROI & Business Impact', category: 'Navigation', icon: BarChart3, action: () => setActiveTab('impact') },
    { label: 'Go to AI Model Governance & Telemetry', category: 'Navigation', icon: Bot, action: () => setActiveTab('governance') },
    { label: 'Open Grounded AI Chat Analyst', category: 'AI Tools', icon: Bot, action: () => setActiveTab('ai_analyst') },
    { label: 'View Deep Analytics & Aspect Heatmap', category: 'Navigation', icon: BarChart3, action: () => setActiveTab('analytics') },
    { label: 'View Issue Action Tracker & Kanban', category: 'Navigation', icon: AlertTriangle, action: () => setActiveTab('issues') },
    { label: 'View Feature Requests & Voting Hub', category: 'Navigation', icon: Lightbulb, action: () => setActiveTab('feature_requests') },
    { label: 'Generate & Download Executive Reports', category: 'Reports', icon: FileText, action: () => setActiveTab('reports') },
    { label: 'Browse Customer Profiles & Churn Segments', category: 'Navigation', icon: Users, action: () => setActiveTab('customers') },
    { label: '🎯 Manage Target Products (Admin Center)', category: 'Admin Navigation', icon: Package, action: () => setActiveTab('target_products') },
    { label: 'View Product Performance Matrix', category: 'Navigation', icon: Package, action: () => setActiveTab('products') },
    { label: 'Open Public Customer Review Portal', category: 'Public', icon: MessageSquare, action: () => setActiveTab('public_portal') },
    { label: 'Platform Settings & RBAC Config', category: 'Settings', icon: Shield, action: () => setActiveTab('settings') },
    { label: 'Audit Trail & Compliance Logs', category: 'Settings', icon: FileText, action: () => setActiveTab('audit_logs') },
    { label: 'Submit New Feedback (Manual Form)', category: 'Quick Action', icon: PlusCircle, action: () => setIsManualModalOpen(true) },
    { label: 'Import Feedback from CSV File', category: 'Quick Action', icon: Upload, action: () => setIsCSVModalOpen(true) },
    { label: `Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`, category: 'Preferences', icon: theme === 'light' ? Moon : Sun, action: toggleTheme },
    { label: 'Switch Role to ADMIN', category: 'RBAC', icon: Shield, action: () => setCurrentRole('ADMIN') },
    { label: 'Switch Role to MANAGER', category: 'RBAC', icon: Shield, action: () => setCurrentRole('MANAGER') },
    { label: 'Switch Role to ANALYST', category: 'RBAC', icon: Shield, action: () => setCurrentRole('ANALYST') },
    { label: 'Switch Role to VIEWER', category: 'RBAC', icon: Shield, action: () => setCurrentRole('VIEWER') },
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-20 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
        <div className="relative flex items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Type a command or search view..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="h-12 w-full bg-transparent px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No matching commands found</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
}
