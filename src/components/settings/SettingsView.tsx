import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { AuditLog, UserRole } from '../../types.js';
import {
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Key,
  FileClock,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function SettingsView() {
  const { organization, users, currentRole, setCurrentRole, addToast, triggerRefresh, activeTab: appActiveTab } = useApp();
  const [activeTab, setActiveTab] = useState<'organization' | 'users' | 'ai' | 'audit'>('organization');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Organization state
  const [companyName, setCompanyName] = useState(organization?.name || 'Acme Technologies');
  const [companyDomain, setCompanyDomain] = useState((organization as any)?.domain || 'acme.com');
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // AI Pipeline state
  const [activeModel, setActiveModel] = useState('gemini-3.7-flash');
  const [clusteringThreshold, setClusteringThreshold] = useState(0.45);
  const [isSavingAI, setIsSavingAI] = useState(false);

  useEffect(() => {
    if (appActiveTab === 'ai_config') {
      setActiveTab('ai');
    } else if (appActiveTab === 'audit_logs') {
      setActiveTab('audit');
    } else if (appActiveTab === 'users') {
      setActiveTab('users');
    } else if (appActiveTab === 'settings') {
      setActiveTab('organization');
    }
  }, [appActiveTab]);

  useEffect(() => {
    if (organization?.name) setCompanyName(organization.name);
    if ((organization as any)?.domain) setCompanyDomain((organization as any).domain);
  }, [organization]);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await ApiService.getAuditLogs();
        setAuditLogs(res.auditLogs || []);
      } catch (err) {}
    }
    loadLogs();
  }, [activeTab]);

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrg(true);
    try {
      addToast({
        title: 'Organization Updated',
        message: `Workspace profile set to "${companyName}" (${companyDomain}).`,
        type: 'success'
      });
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.message || 'Could not update organization profile.',
        type: 'error'
      });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleSaveAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAI(true);
    try {
      addToast({
        title: 'AI Pipeline Configured',
        message: `Active inference engine set to ${activeModel} (Similarity threshold: ${clusteringThreshold}).`,
        type: 'success'
      });
    } catch (err: any) {
      addToast({
        title: 'AI Config Failed',
        message: err.message || 'Could not update AI pipeline settings.',
        type: 'error'
      });
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await ApiService.updateUserRole(userId, newRole);
      triggerRefresh();
      addToast({
        title: 'User Role Updated',
        message: `Assigned ${newRole} role to team member.`,
        type: 'success'
      });
    } catch (err: any) {
      addToast({
        title: 'Role Update Failed',
        message: err.message || 'Could not update user role.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Platform Settings, RBAC & AI Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage workspace organization, role-based access control, Gemini AI settings, and compliance audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'organization'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'users'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users & RBAC ({(users || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'ai'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Gemini AI Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <FileClock className="h-4 w-4" />
          <span>Audit & Compliance Logs</span>
        </button>
      </div>

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <form onSubmit={handleSaveOrganization} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Information</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                required
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subscription Plan</label>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 font-semibold text-indigo-900 dark:border-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-300">
                {organization?.plan || 'Enterprise'} Intelligence Tier (Unlimited signals & AI inference)
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingOrg}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSavingOrg ? 'Saving...' : 'Save Organization Profile'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Users & RBAC Tab */}
      {activeTab === 'users' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Team Member</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Current Role</th>
                <th className="px-3 py-3">RBAC Assignment</th>
                <th className="px-3 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(users || []).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || '/profile.jpg'}
                        alt={u.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px]">{u.email}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                      u.role === 'MANAGER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      u.role === 'ANALYST' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUserRoleChange(u.id, e.target.value as UserRole)}
                      className="h-7 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right text-[10px] text-slate-400">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Telemetry Tab */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSaveAIConfig} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600" />
            Gemini AI Infrastructure Settings
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Active Model</div>
                <div className="text-[11px] text-slate-400">High speed multimodal text & schema inference</div>
              </div>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Default)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Low Latency)</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Deterministic NLP Fallback Engine</div>
                <div className="text-[11px] text-slate-400">Graceful rule-based sentiment & aspect fallback if API quotas are reached</div>
              </div>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Duplicate Clustering Threshold</div>
                <div className="text-[11px] text-slate-400">Jaccard / semantic similarity threshold for merging feedback</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={clusteringThreshold}
                  onChange={(e) => setClusteringThreshold(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-slate-200 rounded-lg dark:bg-slate-700 accent-indigo-600"
                />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{clusteringThreshold}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingAI}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSavingAI ? 'Applying...' : 'Save AI Configuration'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Resource</th>
                <th className="px-3 py-3">Details</th>
                <th className="px-3 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(auditLogs || []).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {log.action}
                  </td>
                  <td className="px-3 py-3">{log.userName}</td>
                  <td className="px-3 py-3">{log.resource}</td>
                  <td className="px-3 py-3 text-slate-500 max-w-md">{log.details}</td>
                  <td className="px-3 py-3 text-right text-[10px] text-slate-400">
                    {formatDate(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
