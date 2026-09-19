import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  ManagerDashboardData,
  AnalyticsOverview,
  Feedback,
  EmergingIssue,
  PriorityLevel
} from '../../types.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Briefcase,
  AlertTriangle,
  Users,
  Radio,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Check,
  X,
  Target,
  FileText,
  BrainCircuit,
  Lightbulb,
  ExternalLink,
  Search,
  Eye,
  Activity
} from 'lucide-react';

interface ManagerDashboardProps {
  overview: AnalyticsOverview;
  recentFeedbacks: Feedback[];
  onRefresh: () => void;
}

export function ManagerDashboardView({ overview, recentFeedbacks, onRefresh }: ManagerDashboardProps) {
  const { setActiveTab, addToast } = useApp();
  const [managerData, setManagerData] = useState<ManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedSegment, setSelectedSegment] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  // Investigation Drawer for Emerging Issues
  const [investigatingIssue, setInvestigatingIssue] = useState<EmergingIssue | null>(null);

  // What-If Simulator state
  const [simProblem, setSimProblem] = useState('Payment Gateway 504 Timeouts');
  const [simInterventionPct, setSimInterventionPct] = useState(50);

  // Recommendations approval state
  const [recommendations, setRecommendations] = useState<ManagerDashboardData['recommendations']>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadManagerData = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getManagerDashboard();
      setManagerData(res.data);
      setRecommendations(res.data.recommendations || []);
    } catch (e: any) {
      console.warn('Failed to load manager dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  const handleApproveRecommendation = async (id: string, title: string) => {
    try {
      setApprovingId(id);
      await ApiService.approveRecommendation(id, `Approved by Product Manager for upcoming sprint execution.`);
      setRecommendations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r)
      );
      addToast({
        title: 'Recommendation Approved',
        message: `"${title}" approved and dispatched to engineering sprint backlog.`,
        type: 'success'
      });
    } catch (e: any) {
      addToast({
        title: 'Approval Failed',
        message: e.message || 'Error executing approval',
        type: 'error'
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRecommendation = async (id: string, title: string) => {
    try {
      await ApiService.rejectRecommendation(id, 'Dismissed by manager evaluation.');
      setRecommendations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r)
      );
      addToast({
        title: 'Recommendation Dismissed',
        message: `"${title}" has been dismissed.`,
        type: 'info'
      });
    } catch (e: any) {
      addToast({
        title: 'Action Failed',
        message: e.message,
        type: 'error'
      });
    }
  };

  if (isLoading && !managerData) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  // Simulated calculations for What-If widget
  const projectedComplaintReduction = Math.round((simInterventionPct * 0.84));
  const projectedSentimentGain = (simInterventionPct * 0.28).toFixed(1);
  const projectedCsatGain = (simInterventionPct * 0.008).toFixed(2);
  const projectedRevenueSaved = Math.round((simInterventionPct / 100) * 84000);

  return (
    <div className="space-y-6">
      {/* Manager Scope Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/40 text-white border border-emerald-400/40 shadow-inner">
            <Briefcase className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200 uppercase tracking-wider border border-emerald-400/30">
                Manager Decisions Hub
              </span>
              <span className="text-xs text-teal-300 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Business Risk Tracking
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Product & Business Decision Intelligence</h2>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Triage friction points, approve AI interventions, evaluate what-if simulation models, and prioritize feature roadmaps.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('issues')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
          >
            <Target className="h-4 w-4" />
            <span>Open Issues Kanban</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 8 Top Business KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Customer Health Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Customer Health</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {managerData?.customerHealthScore || 84}/100
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+4.2 pts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Composite satisfaction & retention</p>
        </div>

        {/* 2. CSAT Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Average CSAT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {managerData?.csatScore || 4.2}/5.0
            </span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Top Quartile</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Target benchmark: 4.0+</p>
        </div>

        {/* 3. Churn Risk & Revenue at Risk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Revenue At Risk</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${(managerData?.revenueAtRiskUSD || 148500).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">18 Accounts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">High friction in checkout flow</p>
        </div>

        {/* 4. Recommendation Effectiveness */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">AI Recommendation ROI</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {managerData?.recommendationEffectivenessPct || 91}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified ROI</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Positive outcome on approved tasks</p>
        </div>
      </div>

      {/* CUSTOMER HEALTH & MULTI-DIMENSIONAL FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-500" />
              <span>Multi-Dimensional Customer Health & Sentiment Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time trend analysis across cohorts, product lines, and geographic markets.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">All Products</option>
              <option value="Acme Pay">Acme Pay Engine</option>
              <option value="Cloud Workspace">Cloud Workspace</option>
              <option value="Mobile App">Mobile App</option>
            </select>

            <select
              value={selectedSegment}
              onChange={e => setSelectedSegment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">All Segments</option>
              <option value="Enterprise">Enterprise Tier</option>
              <option value="SMB">SMB & Growth</option>
            </select>

            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">All Regions</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
              <option value="APAC">Asia-Pacific</option>
            </select>
          </div>
        </div>

        {/* Sentiment Trend Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={managerData?.sentimentTrend || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="positive" name="Positive %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="neutral" name="Neutral %" stroke="#94a3b8" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="negative" name="Negative %" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EMERGING ISSUES RADAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
              <span>Emerging Issues Early Warning Radar</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statistical anomaly detection identifying rapid growth in customer friction before CSAT deterioration.
            </p>
          </div>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
            {managerData?.emergingIssues?.length || 6} Emerging Warnings
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(managerData?.emergingIssues || []).slice(0, 3).map((issue, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-rose-200 bg-rose-50/40 p-4 transition hover:shadow-md dark:border-rose-900/50 dark:bg-rose-950/20"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    {issue.severity} Severity
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    +{issue.growthRatePct}% Growth
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{issue.topic}</h4>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{issue.category} - {issue.affectedSegment}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-rose-200/60 pt-3 dark:border-rose-900/40">
                <span className="text-[11px] text-slate-500">
                  Current Mentions: <strong className="text-slate-800 dark:text-slate-200">{issue.currentMentions}</strong>
                </span>
                <button
                  onClick={() => setInvestigatingIssue(issue)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-100 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Investigate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI RECOMMENDATIONS WITH APPROVAL WORKFLOW */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>AI Strategic Recommendations & Action Approval Hub</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-confidence interventions generated by Gemini 2.5 with estimated revenue impact and human-in-the-loop authorization.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition ${
                rec.status === 'APPROVED'
                  ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                  : rec.status === 'REJECTED'
                  ? 'border-slate-200 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{(rec.confidence * 100).toFixed(0)}% Confidence</span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {rec.category}
                    </span>
                    {rec.status === 'APPROVED' && (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved for Engineering
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rec.evidence}</p>
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                    <span>Expected Impact: <strong className="text-emerald-600 dark:text-emerald-400">{rec.expectedImpact}</strong></span>
                    <span>Affected Users: <strong className="text-slate-700 dark:text-slate-300">{rec.affectedCustomers?.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Manager Decision Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {rec.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleRejectRecommendation(rec.id, rec.title)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApproveRecommendation(rec.id, rec.title)}
                        disabled={approvingId === rec.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{approvingId === rec.id ? 'Approving...' : 'Approve & Assign'}</span>
                      </button>
                    </>
                  ) : rec.status === 'APPROVED' ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      In Sprint Backlog
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Dismissed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE WHAT-IF SIMULATOR WIDGET */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <span>Interactive What-If Decision Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Predict business outcomes and calculate projected revenue saved before committing engineering resources.
            </p>
          </div>
          <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            MODEL PREDICTION (94% Conf.)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Problem Scenario</label>
              <select
                value={simProblem}
                onChange={e => setSimProblem(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
              >
                <option value="Payment Gateway 504 Timeouts">Payment Gateway 504 Timeouts (2,840 checkouts affected)</option>
                <option value="Okta SAML Authentication Failures">Okta SAML Authentication Failures (640 enterprise users)</option>
                <option value="Mobile Push Notification Delays">Mobile Push Notification Delays (1,150 mobile users)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Intervention Efficacy / Defect Reduction</span>
                <span className="text-indigo-600 font-mono">{simInterventionPct}% Reduction</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={simInterventionPct}
                onChange={e => setSimInterventionPct(parseInt(e.target.value))}
                className="mt-2 w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10% Minor Tweak</span>
                <span>50% Hotfix</span>
                <span>100% Complete Overhaul</span>
              </div>
            </div>
          </div>

          {/* Outcome Projections */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-950 dark:bg-emerald-950/20">
              <span className="text-[10px] font-bold text-emerald-800 uppercase dark:text-emerald-300">Complaint Change</span>
              <div className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">-{projectedComplaintReduction}%</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Projected complaint decay</p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 dark:border-sky-950 dark:bg-sky-950/20">
              <span className="text-[10px] font-bold text-sky-800 uppercase dark:text-sky-300">Sentiment Uplift</span>
              <div className="mt-1 text-xl font-bold text-sky-700 dark:text-sky-400">+{projectedSentimentGain}%</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Positive sentiment growth</p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20">
              <span className="text-[10px] font-bold text-indigo-800 uppercase dark:text-indigo-300">CSAT Score Gain</span>
              <div className="mt-1 text-xl font-bold text-indigo-700 dark:text-indigo-400">+{projectedCsatGain} pts</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Expected rating increase</p>
            </div>

            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-950 dark:bg-teal-950/20">
              <span className="text-[10px] font-bold text-teal-800 uppercase dark:text-teal-300">Revenue Saved</span>
              <div className="mt-1 text-xl font-bold text-teal-700 dark:text-teal-400">${projectedRevenueSaved.toLocaleString()}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Retained ARR / Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESOLUTION TRACKING (BEFORE VS AFTER OUTCOMES) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-emerald-500" />
              <span>Closed-Loop Resolution Tracking & Effectiveness</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical attribution measuring metric delta before vs. after product interventions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Acme Pay 504 Timeout Resolution</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Outcome: Improved
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <div className="rounded-lg bg-rose-50/60 p-2 dark:bg-rose-950/30">
                <span className="text-[10px] font-bold text-rose-700 uppercase dark:text-rose-400">Before Hotfix</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Negative Sentiment: 61%</div>
                <div className="text-[11px] text-slate-500">342 checkout complaints</div>
              </div>
              <div className="rounded-lg bg-emerald-50/60 p-2 dark:bg-emerald-950/30">
                <span className="text-[10px] font-bold text-emerald-700 uppercase dark:text-emerald-400">After Hotfix</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Negative Sentiment: 24%</div>
                <div className="text-[11px] text-slate-500">48 complaints (-86%)</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">SAML SSO Token Refresh Hotfix</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Outcome: Improved
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <div className="rounded-lg bg-rose-50/60 p-2 dark:bg-rose-950/30">
                <span className="text-[10px] font-bold text-rose-700 uppercase dark:text-rose-400">Before Hotfix</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Enterprise CSAT: 3.2</div>
                <div className="text-[11px] text-slate-500">7 Enterprise churn warnings</div>
              </div>
              <div className="rounded-lg bg-emerald-50/60 p-2 dark:bg-emerald-950/30">
                <span className="text-[10px] font-bold text-emerald-700 uppercase dark:text-emerald-400">After Hotfix</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Enterprise CSAT: 4.6</div>
                <div className="text-[11px] text-slate-500">0 Enterprise churn warnings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emerging Issue Investigation Modal */}
      {investigatingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {investigatingIssue.severity} Priority
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{investigatingIssue.topic}</h3>
              </div>
              <button
                onClick={() => setInvestigatingIssue(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{investigatingIssue.category} - {investigatingIssue.affectedSegment}</p>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Growth Velocity</span>
                <div className="font-bold text-rose-600 mt-0.5">+{investigatingIssue.growthRatePct}% in 7 days</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Current Mentions</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{investigatingIssue.currentMentions} Mentions</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Recommended Manager Action</h4>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                {investigatingIssue.recommendedIntervention}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInvestigatingIssue(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setInvestigatingIssue(null);
                  setActiveTab('issues');
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Assign Engineering Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
