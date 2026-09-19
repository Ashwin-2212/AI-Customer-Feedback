import React, { useState, useEffect } from 'react';
import { Product, Feedback, Issue, ProductAIReport, ProductActivityItem } from '../../types.js';
import { ApiService } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import {
  ArrowLeft, Sparkles, AlertTriangle, ShieldCheck, Activity, MessageSquare,
  AlertCircle, CheckCircle2, TrendingUp, Users, ExternalLink, Calendar, Globe,
  RefreshCw, Edit3, Trash2, Layers, Cpu, Clock, ChevronRight, Sliders, GitMerge
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

interface ProductDetailViewProps {
  productId: string;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export function ProductDetailView({ productId, onBack, onEdit, onRefresh }: ProductDetailViewProps) {
  const { addToast, setActiveTab } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activity, setActivity] = useState<ProductActivityItem[]>([]);
  const [aiReport, setAiReport] = useState<ProductAIReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'ai_insights' | 'feedback' | 'issues' | 'hierarchy' | 'activity'>('ai_insights');

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const [prodRes, feedRes, issueRes, actRes] = await Promise.all([
        ApiService.getProductDetails(productId),
        ApiService.getProductFeedback(productId),
        ApiService.getProductIssues(productId),
        ApiService.getProductActivity(productId)
      ]);

      if (prodRes.product) setProduct(prodRes.product);
      if (feedRes.feedback) setFeedbacks(feedRes.feedback);
      if (issueRes.issues) setIssues(issueRes.issues);
      if (actRes.activity) setActivity(actRes.activity);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await ApiService.analyzeProductWithAI(productId);
      if (res.success && res.report) {
        setAiReport(res.report);
        addToast({
          title: 'AI Product Analysis Complete',
          message: `Generated real-time product intelligence report for ${product?.name}.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'AI Analysis Failed',
        message: err.message || 'Could not analyze product.',
        type: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getInitials = (str?: string) => {
    if (!str) return 'TP';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  if (loading || !product) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading Target Product Intelligence...</p>
        </div>
      </div>
    );
  }

  const healthScore = product.healthScore !== undefined ? product.healthScore : 84;
  const healthColor = healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500';
  const healthBg = healthScore >= 80 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900' : healthScore >= 60 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900';

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Target Products</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('feedback')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Explore filtered feedback for this product"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            <span>View Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="View open issues and Kanban board"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>View Issues</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
            title="Run what-if scenario simulations for this product"
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Run Simulation</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge_graph')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Inspect causal knowledge graph topology"
          >
            <GitMerge className="h-3.5 w-3.5 text-purple-500" />
            <span>Causal Graph</span>
          </button>

          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            )}
            <span>🤖 Analyze Product</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Logo & Product Metadata */}
            <div className="flex items-center gap-4">
              {product.logoUrl ? (
                <img src={product.logoUrl} alt={product.name} className="h-16 w-16 rounded-2xl border-2 border-indigo-400/30 object-cover shadow-lg" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-black text-white shadow-xl shadow-indigo-500/30 border border-white/20">
                  {getInitials(product.name)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-white">{product.name}</h1>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono text-xs font-bold text-indigo-300 border border-indigo-500/30">
                    {product.code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    product.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    product.status === 'MONITORING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    ● {product.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 max-w-2xl">{product.description}</p>
                
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
                  <span>Category: <strong className="text-white">{product.category}</strong></span>
                  <span>•</span>
                  <span>Version: <strong className="text-indigo-300 font-mono">{product.version || 'v1.0'}</strong></span>
                  <span>•</span>
                  <span>Owner: <strong className="text-white">{product.owner || 'Unassigned'}</strong></span>
                  {product.website && (
                    <>
                      <span>•</span>
                      <a href={product.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-300 hover:underline">
                        <Globe className="h-3 w-3" />
                        <span>Website</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Health Score Gauge Display */}
            <div className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center backdrop-blur-md ${healthBg} shrink-0`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AI Health Score
              </span>
              <div className={`mt-1 text-3xl font-black ${healthColor}`}>
                {healthScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <span className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                Risk Tier: <strong className={healthColor}>{product.customerRisk || 'LOW'}</strong>
              </span>
            </div>

          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 bg-slate-50/50 dark:divide-slate-800 dark:bg-slate-900/60 sm:grid-cols-4 sm:divide-y-0 text-xs">
          <div className="p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Monitored Feedback</span>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{feedbacks.length} records</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">CSAT {product.csat || 84}%</span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Open Issues</span>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{issues.length} issues</div>
            <span className="text-[10px] text-rose-500 font-medium">{product.criticalIssues || 0} Critical</span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Positive Sentiment</span>
            <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{product.positiveRate || 74}%</div>
            <span className="text-[10px] text-slate-400">Verified customer rating</span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last Activity</span>
            <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white truncate">
              {formatDate(product.lastActivity || new Date().toISOString())}
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Live Telemetry</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('ai_insights')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeSubTab === 'ai_insights'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Product Health & Intelligence</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeSubTab === 'feedback'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Product Feedback ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('issues')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeSubTab === 'issues'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Product Issues ({issues.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hierarchy')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeSubTab === 'hierarchy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Product Feature Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeSubTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Timeline</span>
        </button>
      </div>

      {/* Tab 1: AI Insights */}
      {activeSubTab === 'ai_insights' && (
        <div className="space-y-6">
          {!aiReport ? (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-2xs dark:border-indigo-950 dark:from-indigo-950/20 dark:to-slate-900">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Gemini Product Intelligence Summary</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-lg">
                  Run grounded AI analysis over {feedbacks.length} customer feedback submissions and {issues.length} open issues to extract complaint velocity, customer risk drivers, and recommended engineering fixes.
                </p>
                <button
                  onClick={handleRunAIAnalysis}
                  disabled={analyzing}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{analyzing ? 'Analyzing Product Telemetry...' : '🤖 Run AI Product Analysis'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview AI Summary Box */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Gemini Product Summary Report • {formatDate(aiReport.generatedAt)}</span>
                  </div>
                  <span className="rounded-full bg-indigo-200/60 px-2.5 py-0.5 text-[10px] font-bold text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                    Confidence: {aiReport.confidenceScore}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {aiReport.sentimentSummary}
                </p>
              </div>

              {/* Top Problems & Emerging Trends */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Top Problems */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Top Monitored Friction Points</span>
                  </h3>
                  <div className="space-y-3">
                    {aiReport.topProblems.map((prob, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{prob.issue}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{prob.mentions} mentions • +{prob.growthPercent}% complaint growth</div>
                        </div>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          prob.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {prob.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>AI Recommended Engineering Actions</span>
                  </h3>
                  <div className="space-y-3">
                    {aiReport.recommendedActions.map((rec, idx) => (
                      <div key={idx} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs dark:border-emerald-950 dark:bg-emerald-950/20">
                        <div className="font-bold text-emerald-950 dark:text-emerald-200">{rec.action}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Impact: <strong className="text-emerald-700 dark:text-emerald-300">{rec.impact}</strong></span>
                          <span className="font-semibold text-rose-600">Urgency: {rec.urgency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Feedback */}
      {activeSubTab === 'feedback' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Customer Feedback Stream for {product.name} ({feedbacks.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {feedbacks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No feedback submitted for this product yet.</div>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} className="p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{f.customerName} ({f.customerEmail})</span>
                    <span className="text-[10px] text-slate-400">{formatDate(f.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{f.text}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Rating: {f.rating}/5 ⭐
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      f.analysis?.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' :
                      f.analysis?.sentiment === 'NEGATIVE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.analysis?.sentiment || 'NEUTRAL'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Issues */}
      {activeSubTab === 'issues' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Open Product Issues ({issues.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No open issues for this product.</div>
            ) : (
              issues.map(i => (
                <div key={i.id} className="p-4 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{i.title}</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{i.description}</p>
                  </div>
                  <span className={`rounded px-2.5 py-1 text-[10px] font-bold ${
                    i.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {i.priority || 'MEDIUM'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Hierarchy */}
      {activeSubTab === 'hierarchy' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product ➔ Feature ➔ Issue Hierarchy
          </h3>
          <div className="space-y-3">
            {(product.features || []).length === 0 ? (
              <div className="text-xs text-slate-400">No specific features configured under this product yet.</div>
            ) : (
              product.features?.map(feat => (
                <div key={feat.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{feat.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Status: {feat.status} • {feat.feedbackCount || 0} feedbacks linked</div>
                    </div>
                  </div>
                  <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {feat.openIssuesCount || 0} Open Issues
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Activity */}
      {activeSubTab === 'activity' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product Activity Timeline
          </h3>
          <div className="space-y-3">
            {activity.map(act => (
              <div key={act.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                <Clock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{act.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(act.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
