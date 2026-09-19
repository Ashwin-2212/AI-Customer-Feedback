import React from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  LayoutDashboard,
  Layers,
  MessageSquareText,
  Bot,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  FileText,
  Users,
  Package,
  Share2,
  FileClock,
  Settings,
  Sparkles,
  ShieldCheck,
  Briefcase,
  BrainCircuit,
  Eye,
  Lock,
  Activity,
  Award,
  TrendingUp,
  TrendingDown,
  Sliders,
  DollarSign,
  Radio,
  ShieldAlert,
  Server,
  KeyRound,
  Cpu,
  Shield,
  Workflow,
  Database,
  Search,
  Radar,
  LineChart,
  Target,
  HelpCircle,
  Zap,
  GitMerge,
  FlaskConical,
  TrendingUp as ChevronUp,
  IterationCw
} from 'lucide-react';
import { UserRole } from '../../types.js';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
  category?: string;
}

export function Sidebar() {
  const { activeTab, setActiveTab, organization, currentRole, setCurrentRole } = useApp();

  // Define role-specific navigation menus
  const getRoleNavItems = (): { section: string; items: NavItem[] }[] => {
    switch (currentRole) {
      case 'ADMIN':
        return [
          {
            section: 'Control Center',
            items: [
              { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, highlight: true },
              { id: 'target_products', label: '🎯 Target Products', icon: Target, highlight: true, badge: 'New' },
              { id: 'total_project', label: 'Total Project Master', icon: Layers, badge: 'Full Scope' },
              { id: 'users', label: 'User Management', icon: Users, badge: 'RBAC' },
              { id: 'roles_permissions', label: 'Roles & Permissions', icon: KeyRound },
              { id: 'organizations', label: 'Organizations & Tenants', icon: Briefcase },
              { id: 'products', label: 'Product Catalog', icon: Package }
            ]
          },
          {
            section: 'AI & Decision Intelligence',
            items: [
              { id: 'knowledge_graph', label: 'Causal Knowledge Graph', icon: GitMerge, highlight: true, badge: 'Graph AI' },
              { id: 'causal', label: 'Causal Intelligence Graph', icon: Workflow, badge: 'Graph' },
              { id: 'feedback', label: 'Feedback Sources', icon: MessageSquareText, badge: 'Live Stream' },
              { id: 'ai_config', label: 'AI Configuration', icon: Cpu, badge: 'Gemini 2.5' },
              { id: 'autonomous_agent', label: 'AI Agent Control', icon: Bot, badge: 'HITL Queue' }
            ]
          },
          {
            section: 'System & Governance',
            items: [
              { id: 'system_health', label: 'System Health & Metrics', icon: Server, badge: '6/6 Up' },
              { id: 'governance', label: 'Model Governance & Safety', icon: BrainCircuit },
              { id: 'security', label: 'Security & PII Rules', icon: Shield },
              { id: 'audit_logs', label: 'Compliance Audit Logs', icon: FileClock },
              { id: 'settings', label: 'Platform Settings', icon: Settings }
            ]
          }
        ];

      case 'MANAGER':
        return [
          {
            section: 'Executive Decisions',
            items: [
              { id: 'dashboard', label: 'Manager Overview', icon: LayoutDashboard, highlight: true },
              { id: 'customers', label: 'Customer Health Score', icon: Users, badge: '84/100' },
              { id: 'issues', label: 'Critical Issues & Triage', icon: AlertTriangle, badge: '3 Critical' },
              { id: 'emerging_issues', label: 'Emerging Issues Radar', icon: Radio, highlight: true, badge: '+38% High' }
            ]
          },
          {
            section: 'Decision Intelligence',
            items: [
              { id: 'decision_command_center', label: '⚡ Decision Command Center', icon: Zap, highlight: true, badge: 'AI Core' },
              { id: 'predictive_issues', label: 'Predictive Issue Radar', icon: Radar, highlight: true, badge: 'Forecast' },
              { id: 'knowledge_graph', label: 'Causal Knowledge Graph', icon: GitMerge, badge: 'Graph AI' },
              { id: 'closed_loop_outcomes', label: 'Outcome Learning Loop', icon: IterationCw, badge: 'Closed Loop' }
            ]
          },
          {
            section: 'Strategic Actions',
            items: [
              { id: 'churn_intelligence', label: 'Customer Risk & ARR', icon: ShieldAlert, badge: '$148k' },
              { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles, highlight: true, badge: 'Actionable' },
              { id: 'simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Monte Carlo' },
              { id: 'feature_roadmap', label: 'Product Roadmap Priority', icon: Lightbulb, badge: 'Score 94' }
            ]
          },
          {
            section: 'Attribution & Outcomes',
            items: [
              { id: 'resolution_learning', label: 'Resolution Tracking', icon: BrainCircuit, badge: '91% ROI' },
              { id: 'impact', label: 'Business Impact ROI', icon: DollarSign },
              { id: 'reports', label: 'Executive Reports', icon: FileText },
              { id: 'ai_analyst', label: 'Manager AI Copilot', icon: Bot }
            ]
          }
        ];

      case 'ANALYST':
        return [
          {
            section: 'Intelligence Workspace',
            items: [
              { id: 'dashboard', label: 'Analyst Overview', icon: LayoutDashboard, highlight: true },
              { id: 'feedback', label: 'Feedback Explorer', icon: Search, badge: 'Multi-Filter' },
              { id: 'analytics', label: 'Sentiment & Aspect Analysis', icon: BarChart3 },
              { id: 'clusters', label: 'Semantic HDBSCAN Clusters', icon: Layers, badge: 'ML Topics' }
            ]
          },
          {
            section: 'Deep Causal & Velocity',
            items: [
              { id: 'causal', label: 'Causal Intelligence Graph', icon: Workflow, highlight: true, badge: 'Graph' },
              { id: 'sentiment_velocity', label: 'Frustration Velocity', icon: TrendingDown, badge: 'Trajectory' },
              { id: 'churn_intelligence', label: 'Customer Segments & Risk', icon: Users },
              { id: 'competitive', label: 'Competitive Benchmarks', icon: Award }
            ]
          },
          {
            section: 'Decision Intelligence',
            items: [
              { id: 'decision_command_center', label: '⚡ Decision Command Center', icon: Zap, highlight: true, badge: 'AI Core' },
              { id: 'predictive_issues', label: 'Predictive Issue Radar', icon: Radar, highlight: true, badge: 'Forecast' },
              { id: 'knowledge_graph', label: 'Causal Knowledge Graph', icon: GitMerge, badge: 'Graph AI' },
              { id: 'feature_demand', label: 'Feature Demand Matrix', icon: FlaskConical, badge: 'Demand IQ' },
              { id: 'closed_loop_outcomes', label: 'Outcome Learning Loop', icon: IterationCw, badge: 'Closed Loop' }
            ]
          },
          {
            section: 'Forecasting & AI Tools',
            items: [
              { id: 'simulator', label: 'Simulation & Forecasting', icon: LineChart },
              { id: 'autonomous_agent', label: 'AI Agent Telemetry Logs', icon: Bot },
              { id: 'governance', label: 'Model Signals & Weights', icon: BrainCircuit },
              { id: 'reports', label: 'Analytical Reports', icon: FileText },
              { id: 'ai_analyst', label: 'Natural Language AI Query', icon: Sparkles, highlight: true }
            ]
          }
        ];

      case 'VIEWER':
      default:
        return [
          {
            section: 'Executive Digest (Read-Only)',
            items: [
              { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, highlight: true },
              { id: 'customers', label: 'Customer Health Digest', icon: Users, badge: '84 Score' },
              { id: 'issues', label: 'Key Product Issues', icon: AlertTriangle, badge: 'Summary' },
              { id: 'analytics', label: 'Satisfaction Trends', icon: TrendingUp },
              { id: 'reports', label: 'Approved Executive Reports', icon: FileText, badge: 'Verified' },
              { id: 'ai_analyst', label: 'AI Executive Summary', icon: Sparkles }
            ]
          }
        ];
    }
  };

  const navSections = getRoleNavItems();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-slate-950 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-sm">
            <span>FeedbackAI</span>
            <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-semibold text-indigo-400">ENTERPRISE</span>
          </div>
          <span className="truncate text-[11px] text-slate-400 font-medium">{organization?.name || 'Acme Technologies'}</span>
        </div>
      </div>

      {/* Active Role Scope Banner */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold ${
          currentRole === 'ADMIN'
            ? 'bg-indigo-950/80 border border-indigo-500/30 text-indigo-300'
            : currentRole === 'MANAGER'
            ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
            : currentRole === 'ANALYST'
            ? 'bg-sky-950/80 border border-sky-500/30 text-sky-300'
            : 'bg-slate-800/80 border border-slate-700/50 text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            {currentRole === 'ADMIN' && <ShieldCheck className="h-4 w-4 text-indigo-400" />}
            {currentRole === 'MANAGER' && <Briefcase className="h-4 w-4 text-emerald-400" />}
            {currentRole === 'ANALYST' && <BrainCircuit className="h-4 w-4 text-sky-400" />}
            {currentRole === 'VIEWER' && <Eye className="h-4 w-4 text-slate-400" />}
            <span>{currentRole} Scope</span>
          </div>
          <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-slate-300 uppercase">
            {currentRole === 'ADMIN' ? 'Control' : currentRole === 'MANAGER' ? 'Decide' : currentRole === 'ANALYST' ? 'Investigate' : 'Digest'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {section.section}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition duration-150 ${
                    isActive
                      ? currentRole === 'ADMIN'
                        ? 'bg-indigo-600 font-semibold text-white shadow-sm shadow-indigo-600/30'
                        : currentRole === 'MANAGER'
                        ? 'bg-emerald-600 font-semibold text-white shadow-sm shadow-emerald-600/30'
                        : currentRole === 'ANALYST'
                        ? 'bg-sky-600 font-semibold text-white shadow-sm shadow-sky-600/30'
                        : 'bg-slate-700 font-semibold text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  } ${item.highlight && !isActive ? 'ring-1 ring-slate-700/50 text-indigo-300' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? currentRole === 'ADMIN' ? 'text-indigo-400' : currentRole === 'MANAGER' ? 'text-emerald-400' : 'text-sky-400'
                        : 'text-slate-400 group-hover:text-white'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Role Quick Switcher & System Status */}
      <div className="border-t border-slate-800 p-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Switch Experience:</span>
          <span className="font-mono text-[10px] text-slate-500">RBAC v2.4</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(['ADMIN', 'MANAGER', 'ANALYST', 'VIEWER'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRole(r)}
              className={`rounded-lg py-1 text-[10px] font-bold tracking-tight transition ${
                currentRole === r
                  ? r === 'ADMIN'
                    ? 'bg-indigo-600 text-white'
                    : r === 'MANAGER'
                    ? 'bg-emerald-600 text-white'
                    : r === 'ANALYST'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={`Switch to ${r} View`}
            >
              {r.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

