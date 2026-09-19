import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Issue, PriorityLevel, IssueStatus } from '../../types.js';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Ban,
  User,
  Package,
  Layers,
  ChevronRight,
  Filter,
  TrendingDown,
  X
} from 'lucide-react';
import { getPriorityBadgeClass, formatDate } from '../../lib/utils.js';

export function IssuesView() {
  const { refreshTrigger, triggerRefresh, addToast, setSelectedFeedbackId, setActiveTab } = useApp();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('HIGH');
  const [newCategory, setNewCategory] = useState('Payment Engine');
  const [newProductId, setNewProductId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [issueRes, prodRes] = await Promise.all([
          ApiService.getIssues(),
          ApiService.getProducts()
        ]);
        setIssues(issueRes.issues || []);
        const prods = (prodRes.products || []).map((p: any) => ({ id: p.id, name: p.name }));
        setProducts(prods);
        if (prods.length > 0) setNewProductId(prods[0].id);
      } catch (err) {
        console.error('Failed to load issues:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      await ApiService.updateIssue(issueId, { status });
      triggerRefresh();
      addToast({
        title: 'Issue Status Updated',
        message: `Issue moved to ${status}`,
        type: 'success'
      });
    } catch (err) {
      // ignore
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    try {
      await ApiService.createIssue({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        category: newCategory,
        productId: newProductId || (products[0]?.id || 'prod_1')
      });
      triggerRefresh();
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      addToast({
        title: 'Issue Created',
        message: 'New action item tracked on Kanban board',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Issue Creation Failed',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  const columns: { id: IssueStatus; label: string; icon: any; color: string }[] = [
    { id: 'OPEN', label: 'Open Issues', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: AlertTriangle, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
    { id: 'BLOCKED', label: 'Blocked / Escalated', icon: Ban, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    { id: 'RESOLVED', label: 'Resolved / Verified', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  ];

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Issue Action Tracker & Kanban Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn customer friction points into prioritized engineering tasks and tracked fixes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setActiveTab('sentiment_velocity')}
            className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300 transition"
          >
            <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>🔴 Deterioration Alerts</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => {
            const colIssues = issues.filter(i => i.status === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/60 min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between rounded-xl border p-2.5 mb-3 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{col.label}</span>
                  </div>
                  <span className="rounded-full bg-white/80 dark:bg-slate-800/80 px-2 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {colIssues.length}
                  </span>
                </div>

                {/* Issue Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                  {colIssues.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">No issues</div>
                  ) : (
                    colIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`inline-flex rounded-md border px-1.5 py-0.2 text-[9px] ${getPriorityBadgeClass(issue.priority)}`}>
                            {issue.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {issue.category}
                          </span>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {issue.title}
                        </h4>

                        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>

                        {/* Linked Feedback Citation */}
                        {issue.feedbackCount > 0 && (
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3 text-indigo-500" />
                              {issue.feedbackCount} feedback citations
                            </span>
                            {issue.feedbackIds && issue.feedbackIds.length > 0 && (
                              <button
                                onClick={() => setSelectedFeedbackId(issue.feedbackIds![0])}
                                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                              >
                                View
                              </button>
                            )}
                          </div>
                        )}

                        {/* Move Status Controls */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] dark:border-slate-800">
                          <span className="text-slate-400 truncate max-w-[100px]">
                            {issue.assignedToName || 'Unassigned'}
                          </span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'RESOLVED' && (
                              <button
                                onClick={() => handleStatusChange(issue.id, 'RESOLVED')}
                                className="rounded px-1.5 py-0.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-medium"
                              >
                                Resolve
                              </button>
                            )}
                            {col.id === 'OPEN' && (
                              <button
                                onClick={() => handleStatusChange(issue.id, 'IN_PROGRESS')}
                                className="rounded px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-medium"
                              >
                                Start
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Issue Title & Description</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Linked Signals</th>
                <th className="px-3 py-3">Assignee</th>
                <th className="px-3 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {issues.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 max-w-md">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{i.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{i.description}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-md border px-1.5 py-0.2 text-[10px] ${getPriorityBadgeClass(i.priority)}`}>
                      {i.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{i.category}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <select
                      value={i.status}
                      onChange={(e) => handleStatusChange(i.id, e.target.value as IssueStatus)}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{i.feedbackCount} feedback items</td>
                  <td className="px-3 py-3 whitespace-nowrap">{i.assignedToName || 'Unassigned'}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap text-[10px] text-slate-400">
                    {formatDate(i.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Issue Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Track New Action Issue</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fix webhook 504 gateway timeout on billing engine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Product *
                  </label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description & Resolution Plan *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Root cause, reproduction steps, and required engineering tasks..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
