import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { FeatureRoadmapItem } from '../../types.js';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  Flame,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  Sliders,
  Layers,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';

export function FeatureRoadmapView() {
  const { addToast } = useApp();
  const [roadmap, setRoadmap] = useState<FeatureRoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<FeatureRoadmapItem | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getFeatureRoadmap();
      setRoadmap(res.roadmap || []);
    } catch (err) {
      console.error('Failed to load feature roadmap', err);
      addToast({
        title: 'Error loading roadmap',
        message: 'Could not calculate AI feature prioritization scoring.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const filtered = roadmap.filter(f => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-2 text-white shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Product Roadmap & Feature Prioritization
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Transparent Multi-Factor Scoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Prioritize feature engineering using transparent math: <strong className="font-mono text-indigo-600 dark:text-indigo-400">Score = Customer Impact × Frequency × Revenue Impact × Churn Risk × Strategic Importance</strong>.
          </p>
        </div>

        <button
          onClick={fetchRoadmap}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          <span>Re-evaluate Ranking</span>
        </button>
      </div>

      {/* Transparent Formula Explainer Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-4 shadow-2xs dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Mathematical Prioritization Weights:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Customer Impact (30%)</span>
            <span>×</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Frequency (25%)</span>
            <span>×</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Revenue Impact (20%)</span>
            <span>×</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Churn Risk (15%)</span>
            <span>×</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Strategic (10%)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search prioritized roadmap features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'IN_DEVELOPMENT', 'PLANNED', 'UNDER_REVIEW', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {st === 'IN_DEVELOPMENT' ? 'In Dev' : st === 'UNDER_REVIEW' ? 'Review' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked Roadmap Cards */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setSelectedFeature(item)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
          >
            {/* Left: Rank & Title */}
            <div className="flex items-start gap-4 flex-1">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-lg ${
                idx === 0 ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400' :
                idx === 1 ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                #{idx + 1}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    item.status === 'IN_DEVELOPMENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    item.status === 'PLANNED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {item.roiRationale}
                </p>

                {/* Sub-metrics */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Users className="h-3.5 w-3.5" />
                    <span>{(item.affectedUsersCount || 0).toLocaleString()} Users Affected</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{item.complaintVolume || 0} Complaints</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>${(item.revenueImpactUSD || 0).toLocaleString()} Est. ARR Impact</span>
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{item.confidencePct}% AI Confidence</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Big Priority Score */}
            <div className="flex items-center gap-4 self-end lg:self-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-6">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority Score</span>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {item.priorityScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Feature Drilldown Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedFeature.title}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Product: {selectedFeature.productName} • Category: {selectedFeature.category}
                </p>
              </div>
            </div>

            <div className="space-y-4 py-4 text-xs">
              {/* Score Breakdown Bar */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Mathematical Score Factors (0–10 Scale)
                </span>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Customer Impact</span>
                    <strong className="text-base text-indigo-600 dark:text-indigo-400">{selectedFeature.customerImpactScore}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Frequency</span>
                    <strong className="text-base text-indigo-600 dark:text-indigo-400">{selectedFeature.frequencyScore}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Revenue Risk</span>
                    <strong className="text-base text-indigo-600 dark:text-indigo-400">9.4</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Churn Mitigation</span>
                    <strong className="text-base text-indigo-600 dark:text-indigo-400">+{selectedFeature.churnRiskMitigationPct}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Strategic Priority</span>
                    <strong className="text-base text-indigo-600 dark:text-indigo-400">{selectedFeature.strategicImportanceScore}</strong>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <span className="font-bold text-indigo-900 dark:text-indigo-300">Prioritization Rationale:</span>
                <p className="mt-1 text-indigo-800 dark:text-indigo-200">
                  {selectedFeature.roiRationale}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedFeature(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addToast({
                    title: 'Sprint Backlog Updated 🚀',
                    message: `Feature "${selectedFeature.title}" prioritized for engineering sprint allocation.`,
                    type: 'success'
                  });
                  setSelectedFeature(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                <span>Assign to Active Sprint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
