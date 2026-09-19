import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { IssueCluster, PriorityLevel } from '../../types.js';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  Users
} from 'lucide-react';
import { getPriorityBadgeClass, formatDate } from '../../lib/utils.js';

export function IssueClustersView() {
  const { setSelectedFeedbackId, setActiveTab, addToast } = useApp();
  const [clusters, setClusters] = useState<IssueCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<IssueCluster | null>(null);

  const loadClusters = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getIssueClusters();
      const list = res.clusters || [];
      setClusters(list);
      if (list.length > 0 && !selectedCluster) {
        setSelectedCluster(list[0]);
      }
    } catch (err) {
      console.error('Failed to load issue clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const filteredClusters = clusters.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || c.summary || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.keywords || c.topKeywords || []).some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateIssueFromCluster = async (cluster: IssueCluster) => {
    try {
      const kws = cluster.keywords || cluster.topKeywords || [];
      await ApiService.createIssue({
        title: `Cluster: ${cluster.name}`,
        description: `${cluster.description || cluster.summary || ''}\n\nRoot Cause Hypothesis: ${cluster.rootCauseHypothesis}\n\nTop Keywords: ${kws.join(', ')}`,
        priority: (cluster.severity || 'MEDIUM') as PriorityLevel,
        category: cluster.category || 'General',
        productId: cluster.productIds?.[0] || cluster.productId || 'prod_1',
        feedbackIds: cluster.feedbackIds || cluster.sampleFeedbackIds || []
      });
      addToast({
        title: 'Issue Created from Cluster',
        message: `Generated action item for ${cluster.feedbackCount} clustered feedback signals`,
        type: 'success'
      });
      setActiveTab('issues');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              AI Issue Clustering & Root Hypothesis Hub
            </h1>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              HDBSCAN + Gemini Embeddings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated semantic clustering groups disparate customer signals into high-impact structural issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClusters}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-cluster Signals</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search clusters by keyword, topic, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Main Grid: Clusters List & Cluster Detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Cluster Cards List */}
        <div className="space-y-3 lg:col-span-5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2 text-indigo-500" />
              Computing semantic clusters...
            </div>
          ) : filteredClusters.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              No clusters found matching your query.
            </div>
          ) : (
            filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm dark:border-indigo-500/70 dark:bg-indigo-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getPriorityBadgeClass(cluster.severity)}`}>
                          {cluster.severity}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {cluster.name}
                        </h3>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                        {cluster.description || cluster.summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {cluster.feedbackCount} <span className="text-[10px] text-slate-400 font-normal">signals</span>
                      </div>
                      <div className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold ${
                        (cluster.trendPercentage || 0) > 0 ? 'text-rose-500' : 'text-emerald-500'
                      }`}>
                        {(cluster.trendPercentage || 0) > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{(cluster.trendPercentage || 0) > 0 ? `+${cluster.trendPercentage}%` : `${cluster.trendPercentage || 0}%`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Keywords Pills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(cluster.keywords || cluster.topKeywords || []).slice(0, 4).map((kw, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Cluster Deep Dive */}
        <div className="lg:col-span-7">
          {selectedCluster ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${getPriorityBadgeClass(selectedCluster.severity)}`}>
                      {selectedCluster.severity} Severity
                    </span>
                    <span className="text-xs text-slate-400">Cluster ID: {selectedCluster.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedCluster.name}
                  </h2>
                </div>

                <button
                  onClick={() => handleCreateIssueFromCluster(selectedCluster)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Promote to Kanban Issue</span>
                </button>
              </div>

              {/* Description & Impact Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Feedback Volume</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedCluster.feedbackCount} signals
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across {selectedCluster.productIds?.length || 1} product(s)</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Trend Velocity (7d)</div>
                  <div className={`text-base font-bold mt-1 ${(selectedCluster.trendPercentage || 0) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {(selectedCluster.trendPercentage || 0) > 0 ? `+${selectedCluster.trendPercentage}%` : `${selectedCluster.trendPercentage || 0}%`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Relative to previous 7 days</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                    {selectedCluster.status || 'ANALYZING'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Automated AI sync</div>
                </div>
              </div>

              {/* AI Root Cause Hypothesis */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs dark:border-indigo-950 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Gemini Synthesis: Root Cause Hypothesis</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedCluster.rootCauseHypothesis}
                </p>
              </div>

              {/* Clustered Feedback Signals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Associated Feedback Ingestion Signals ({(selectedCluster.feedbackIds || selectedCluster.sampleFeedbackIds || []).length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(selectedCluster.feedbackIds || selectedCluster.sampleFeedbackIds || []).map((fbId) => (
                    <div
                      key={fbId}
                      onClick={() => setSelectedFeedbackId(fbId)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs transition hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">ID: {fbId}</span>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          Inspect Signal →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              Select a cluster from the left panel to inspect detailed root-cause hypotheses and associated customer signals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
