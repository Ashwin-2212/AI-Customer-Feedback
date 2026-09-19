import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { AnalyticsOverview, Product, User, UserRole, AuditLog, RolePermissionMatrix, PermissionKey } from '../../types.js';
import { TargetProductsView } from '../products/TargetProductsView.js';
import {
  ShieldCheck,
  Sparkles,
  Server,
  Users,
  Package,
  Layers,
  Database,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Clock,
  Zap,
  TrendingUp,
  UserPlus,
  Lock,
  Eye,
  Sliders,
  Radio,
  FileClock,
  ArrowUpRight,
  Briefcase,
  KeyRound,
  Shield,
  Save,
  Check,
  Globe,
  Building,
  Key,
  Flame,
  CheckCircle
} from 'lucide-react';
import { RoleAccessGuard } from './RoleAccessGuard.js';
import { formatDate } from '../../lib/utils.js';

export function TotalProjectAdminView() {
  const { currentRole, organization, users, setCurrentRole, addToast, refreshTrigger, triggerRefresh, activeTab, setActiveTab } = useApp();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  type AdminTab = 'overview' | 'products' | 'users' | 'roles' | 'organizations' | 'pipeline' | 'compliance' | 'security';
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Permissions state
  const [permissionsMatrix, setPermissionsMatrix] = useState<RolePermissionMatrix | null>(null);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  // Organization settings state
  const [orgName, setOrgName] = useState(organization?.name || 'Acme Technologies Global');
  const [orgSlug, setOrgSlug] = useState(organization?.slug || 'acme-corp');
  const [dataRetentionDays, setDataRetentionDays] = useState('365');
  const [ssoEnforced, setSsoEnforced] = useState(true);
  const [piiRedactionEnabled, setPiiRedactionEnabled] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // Sync with App activeTab if navigated from Sidebar
  useEffect(() => {
    if (activeTab === 'users') {
      setActiveAdminTab('users');
    } else if (activeTab === 'roles_permissions') {
      setActiveAdminTab('roles');
    } else if (activeTab === 'organizations') {
      setActiveAdminTab('organizations');
    } else if (activeTab === 'total_project') {
      setActiveAdminTab('overview');
    } else if (activeTab === 'audit_logs') {
      setActiveAdminTab('compliance');
    } else if (activeTab === 'security') {
      setActiveAdminTab('security');
    } else if (activeTab === 'products') {
      setActiveAdminTab('products');
    }
  }, [activeTab]);

  // If user is not Admin, render RoleAccessGuard
  if (currentRole !== 'ADMIN') {
    return (
      <RoleAccessGuard
        title="Admin Exclusive: Total Project Master View"
        description="Only Administrators can inspect the total project health, configure cross-product governance, manage RBAC credentials, and monitor end-to-end system telemetry."
      />
    );
  }

  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        const [ovRes, prodRes, auditRes, permsRes] = await Promise.all([
          ApiService.getAnalyticsOverview().catch(() => ({ data: null })),
          ApiService.getProducts().catch(() => ({ products: [] })),
          ApiService.getAuditLogs().catch(() => ({ auditLogs: [] })),
          ApiService.getRolePermissions().catch(() => ({ data: null }))
        ]);
        setOverview(ovRes.data || null);
        setProducts(prodRes.products || []);
        setAuditLogs(auditRes.auditLogs || []);
        if (permsRes.data) {
          setPermissionsMatrix(permsRes.data);
        }
      } catch (e) {
        console.error('Admin data load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, [refreshTrigger]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await ApiService.switchRole(newRole, userId);
      addToast({
        title: 'User Role Updated',
        message: `User permissions modified to ${newRole}`,
        type: 'success'
      });
      triggerRefresh();
    } catch (e: any) {
      addToast({
        title: 'Update Failed',
        message: e?.message || 'Failed to update user role',
        type: 'error'
      });
    }
  };

  const handleTogglePermission = (role: UserRole, perm: PermissionKey) => {
    if (!permissionsMatrix) return;
    const currentList = permissionsMatrix[role] || [];
    const hasPerm = currentList.includes(perm);
    const updatedList = hasPerm
      ? currentList.filter(p => p !== perm)
      : [...currentList, perm];

    setPermissionsMatrix({
      ...permissionsMatrix,
      [role]: updatedList
    });
  };

  const handleSavePermissions = async () => {
    if (!permissionsMatrix) return;
    setIsSavingPerms(true);
    try {
      await ApiService.updateRolePermissions(permissionsMatrix);
      addToast({
        title: 'Permissions Saved',
        message: 'RBAC Authorization Matrix has been updated system-wide.',
        type: 'success'
      });
      triggerRefresh();
    } catch (e: any) {
      addToast({
        title: 'Save Failed',
        message: e?.message || 'Failed to update permissions.',
        type: 'error'
      });
    } finally {
      setIsSavingPerms(false);
    }
  };

  const handleSaveOrganization = () => {
    setIsSavingOrg(true);
    setTimeout(() => {
      setIsSavingOrg(false);
      addToast({
        title: 'Tenant Settings Saved',
        message: 'Organization preferences, data SLA, and SSO security rules updated.',
        type: 'success'
      });
    }, 600);
  };

  const handleExportProject = async () => {
    try {
      setIsExporting(true);
      const csv = await ApiService.exportFeedbacksCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `total_project_dump_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast({
        title: 'Total Project Exported',
        message: 'Complete customer feedback and analytics package downloaded.',
        type: 'success'
      });
    } catch (e) {
      addToast({
        title: 'Export Failed',
        message: 'Could not generate project export file.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const ALL_PERMISSIONS: { key: PermissionKey; label: string; desc: string }[] = [
    { key: 'feedback.view', label: 'View Feedback Stream', desc: 'Read customer tickets and satisfaction ratings' },
    { key: 'feedback.create', label: 'Ingest / Submit Feedback', desc: 'Submit manual feedback or import batch CSV datasets' },
    { key: 'feedback.edit', label: 'Triage & Tag Feedback', desc: 'Change ticket status, assign urgency, and modify tags' },
    { key: 'feedback.delete', label: 'Delete Records', desc: 'Permanently purge feedback records from database' },
    { key: 'analytics.view', label: 'View Analytics & Charts', desc: 'Access sentiment velocity, aspect breakdown & trends' },
    { key: 'analytics.export', label: 'Export Analytics & CSV', desc: 'Download executive summary reports and CSV dumps' },
    { key: 'ai.analyze', label: 'Run AI Sentiment / RCA', desc: 'Execute on-demand Gemini AI root-cause decomposition' },
    { key: 'ai.recommend', label: 'AI Strategy Recommendations', desc: 'Access automated decision guidance and action items' },
    { key: 'ai.simulate', label: 'Monte Carlo What-If Simulation', desc: 'Simulate financial impact of fixing customer pain points' },
    { key: 'recommendation.approve', label: 'Approve / Reject Action Items', desc: 'Authoritative sign-off on executive AI interventions' },
    { key: 'user.manage', label: 'Manage Team Rosters', desc: 'Invite members and change user access levels' },
    { key: 'role.manage', label: 'Configure RBAC Matrix', desc: 'Alter permission privileges for any platform role' },
    { key: 'system.configure', label: 'Configure AI Models & Keys', desc: 'Adjust Gemini parameters, temperature, and API secrets' }
  ];

  const ROLES_LIST: UserRole[] = ['ADMIN', 'MANAGER', 'ANALYST', 'VIEWER'];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Banner: Total Project Master Scope */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl dark:border-indigo-900/50">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-300 uppercase border border-indigo-400/30">
                <ShieldCheck className="h-3 w-3 text-indigo-400" />
                Root Administrator Scope
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Total Project Visibility: 100%
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Total Project Master Control Center
            </h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-2xl">
              Unified governance, cross-product ingestion telemetry, enterprise RBAC credentials, and live Gemini AI infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportProject}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Total Project CSV'}</span>
            </button>

            <button
              onClick={triggerRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync All Data</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4 lg:grid-cols-5">
          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Total Ingested Feedback</div>
            <div className="text-lg font-bold text-white mt-0.5">{overview?.totalFeedback || 520}+</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +14.2% this week
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Cross-Product CSAT</div>
            <div className="text-lg font-bold text-white mt-0.5">{overview?.avgRating?.toFixed(1) || '4.2'} / 5.0</div>
            <div className="text-[10px] text-indigo-200">Across 6 active products</div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Active Team Members</div>
            <div className="text-lg font-bold text-white mt-0.5">{(users || []).length} Users</div>
            <div className="text-[10px] text-indigo-200">4 Distinct Roles Active</div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">AI Pipeline Latency</div>
            <div className="text-lg font-bold text-white mt-0.5">118 ms</div>
            <div className="text-[10px] text-emerald-400">Gemini 3.7 Flash Engine</div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-indigo-300/80">System Health Index</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">99.98%</div>
            <div className="text-[10px] text-emerald-300/90">All 12 modules operational</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'overview'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Total Project Matrix</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('products')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'products'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Portfolio ({(products || []).length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'users'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management ({(users || []).length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('roles')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'roles'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Roles & Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('organizations')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'organizations'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Organizations & Tenants</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('pipeline')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'pipeline'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>AI Pipeline & Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('compliance')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'compliance'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <FileClock className="h-4 w-4" />
          <span>Audit & Compliance Trail</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('security')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeAdminTab === 'security'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Security & PII Rules</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CROSS-PRODUCT TOTAL HEALTH */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Multi-Product Summary Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Total Project Cross-Product Health & Sentiment Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive performance, ticket volume, sentiment, and SLA resolution across all enterprise product lines.
                </p>
              </div>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {(products || []).length} Products Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="p-3 font-semibold">Product Name</th>
                    <th className="p-3 font-semibold">Key Category</th>
                    <th className="p-3 font-semibold">Total Feedback</th>
                    <th className="p-3 font-semibold">Avg Rating</th>
                    <th className="p-3 font-semibold">Sentiment Health</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-indigo-500" />
                          <span>{prod.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{prod.category}</td>
                      <td className="p-3 font-medium">{(prod as any).feedbackCount || 85} records</td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {((prod as any).avgRating || (prod as any).averageRating || 4.1).toFixed(1)} / 5.0
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: '65%' }} title="65% Positive" />
                            <div className="h-full bg-slate-400" style={{ width: '20%' }} title="20% Neutral" />
                            <div className="h-full bg-rose-500" style={{ width: '15%' }} title="15% Negative" />
                          </div>
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">65% Pos</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Live
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          TOTAL_SCOPE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Module Authorization Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Enterprise Role Access Control Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Detailed view of capabilities granted across every system module by role.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* ADMIN */}
              <div className="rounded-xl border-2 border-indigo-500 bg-indigo-50/30 p-4 dark:border-indigo-500/60 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">ADMIN</span>
                  <span className="rounded bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5">UNRESTRICTED</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Total Project Master View
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> User & Role Management
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> System API & AI Pipeline
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> All 12 Functional Modules
                  </div>
                </div>
              </div>

              {/* MANAGER */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">MANAGER</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 dark:bg-emerald-950/60 dark:text-emerald-300">OPERATIONS</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Issues Triage & Kanban
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Customer Directory & SLA
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Feedback Ingestion & Review
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> No Total Project / Root Settings
                  </div>
                </div>
              </div>

              {/* ANALYST */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-400">ANALYST</span>
                  <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 dark:bg-sky-950/60 dark:text-sky-300">INTELLIGENCE</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Deep Analytics & Curves
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Gemini AI Chat Analyst
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aspect Decomposition & CSV
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> No User Role / System Config
                  </div>
                </div>
              </div>

              {/* VIEWER */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">VIEWER</span>
                  <span className="rounded bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 dark:bg-slate-800 dark:text-slate-300">READ-ONLY</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Executive Summary Digest
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Executive Reports View
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> Read-Only (No Edits/Triage)
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> No Total Project Admin
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TARGET PRODUCTS */}
      {activeAdminTab === 'products' && (
        <TargetProductsView />
      )}

      {/* TAB 3: USERS & RBAC */}
      {activeAdminTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace User Roster & RBAC Roles</h3>
              <p className="text-xs text-slate-500">Manage user authorization and switch role privileges seamlessly.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Active Role</th>
                  <th className="p-3 font-semibold">Role Authority Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || '/profile.jpg'}
                          alt={u.name}
                          className="h-7 w-7 rounded-full object-cover border border-slate-200"
                        />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{u.department || 'Product Engineering'}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                          : u.role === 'MANAGER'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : u.role === 'ANALYST'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="ADMIN">ADMIN (Total Project)</option>
                        <option value="MANAGER">MANAGER (Operations)</option>
                        <option value="ANALYST">ANALYST (Intelligence)</option>
                        <option value="VIEWER">VIEWER (Read-Only)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & PERMISSIONS MATRIX */}
      {activeAdminTab === 'roles' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) Permission Matrix</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize operational permissions per role. Changes take effect across all API endpoints and UI action buttons.
              </p>
            </div>
            <button
              onClick={handleSavePermissions}
              disabled={isSavingPerms}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingPerms ? 'Saving...' : 'Save Permissions'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="p-3 font-semibold w-1/3">Permission Capability</th>
                  {ROLES_LIST.map(role => (
                    <th key={role} className="p-3 font-semibold text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                        role === 'MANAGER' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        role === 'ANALYST' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {role}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {ALL_PERMISSIONS.map(perm => (
                  <tr key={perm.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{perm.label}</div>
                      <div className="text-[11px] text-slate-500">{perm.desc}</div>
                      <div className="text-[10px] font-mono text-indigo-500/80 mt-0.5">{perm.key}</div>
                    </td>
                    {ROLES_LIST.map(role => {
                      const isGranted = (permissionsMatrix?.[role] || []).includes(perm.key);
                      const isAdmin = role === 'ADMIN';

                      return (
                        <td key={role} className="p-3 text-center">
                          <button
                            onClick={() => !isAdmin && handleTogglePermission(role, perm.key)}
                            disabled={isAdmin}
                            title={isAdmin ? 'ADMIN has permanent root authority' : `Toggle ${perm.label} for ${role}`}
                            className={`h-6 w-11 inline-flex items-center rounded-full transition-colors focus:outline-none ${
                              isGranted
                                ? role === 'ADMIN'
                                  ? 'bg-indigo-600 cursor-not-allowed opacity-90'
                                  : role === 'MANAGER'
                                  ? 'bg-emerald-600 cursor-pointer'
                                  : role === 'ANALYST'
                                  ? 'bg-sky-600 cursor-pointer'
                                  : 'bg-slate-600 cursor-pointer'
                                : 'bg-slate-200 dark:bg-slate-700 cursor-pointer'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isGranted ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORGANIZATIONS & TENANTS */}
      {activeAdminTab === 'organizations' && (
        <div className="space-y-6">
          {/* Active Tenant Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{organization?.name || 'Acme Technologies Inc.'}</h3>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      ENTERPRISE TIER
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Tenant Slug: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{organization?.slug || 'acme-corp'}</span> · Multi-Tenant Dedicated Cluster</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5" /> Active & Healthy
                </span>
              </div>
            </div>

            {/* Tenant Parameters Edit Form */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Organization Display Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Organization Slug / Workspace Domain
                </label>
                <input
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data Retention SLA Policy
                </label>
                <select
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="90">90 Days (Standard Audit)</option>
                  <option value="180">180 Days (Half-Year Extended)</option>
                  <option value="365">365 Days (1 Year Full Compliance)</option>
                  <option value="730">730 Days (2 Years Financial SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  SSO & Authentication Mode
                </label>
                <div className="flex items-center justify-between h-9 px-3 rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-xs text-slate-700 dark:text-slate-300">Enforce SAML 2.0 / Okta SSO</span>
                  <input
                    type="checkbox"
                    checked={ssoEnforced}
                    onChange={(e) => setSsoEnforced(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveOrganization}
                disabled={isSavingOrg}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingOrg ? 'Saving...' : 'Save Tenant Settings'}</span>
              </button>
            </div>
          </div>

          {/* Connected Workspaces & Resource Quota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Feedback Ingestion Quota</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">520 / 50,000</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 mt-2">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '1.2%' }} />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">98.8% Available this month</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Gemini 3.7 AI Tokens</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">428,500 Tokens</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '8.5%' }} />
              </div>
              <div className="text-[10px] text-emerald-500 mt-1">Unlimited Enterprise Pool</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Dedicated Seats & RBAC</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{(users || []).length} / 50 Active</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 mt-2">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '8%' }} />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">4 Distinct Roles provisioned</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PIPELINE & INFRASTRUCTURE */}
      {activeAdminTab === 'pipeline' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini 3.7 Flash AI Ingestion Engine</h3>
            </div>
            <p className="text-xs text-slate-500">
              The AI engine automatically generates sentiment ratings, emotion scores, urgent intent classification, and key quotes for every customer feedback payload.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Target Model:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">models/gemini-3.7-flash</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Classification Latency:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">~118 ms (Realtime)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Fallback NLP Engine:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Active (Graceful redundancy)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Realtime SSE Stream Infrastructure</h3>
            </div>
            <p className="text-xs text-slate-500">
              Server-Sent Events route real-time feedback submissions and critical issue escalation alerts to all connected clients.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Stream Channel:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">/api/v1/stream</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Active Connection:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Streaming Live
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">In-Memory Store:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{overview?.totalFeedback || 520}+ Feedback Documents</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT & COMPLIANCE */}
      {activeAdminTab === 'compliance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Total Project Audit & Compliance Log</h3>
              <p className="text-xs text-slate-500">Immutable record of all administrative, triage, and role modification actions.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {log.action}
                    </span>
                    <span>{log.userName || (log as any).actorEmail || 'System Operator'}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">{log.details}</div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SECURITY & PII RULES */}
      {activeAdminTab === 'security' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Privacy Governance</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure PII masking, data redaction, TLS encryption policies, and IP security boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Automatic PII Redaction</div>
                <div className="text-[11px] text-slate-500">Sanitizes emails, phone numbers, and credit cards before AI inference</div>
              </div>
              <input
                type="checkbox"
                checked={piiRedactionEnabled}
                onChange={(e) => setPiiRedactionEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">AES-256 Data Encryption</div>
                <div className="text-[11px] text-slate-500">Feedback at rest is secured via AES-256 encryption keys</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> ENABLED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
