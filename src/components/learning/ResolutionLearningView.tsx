import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { ResolutionLearningItem } from '../../types.js';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  X
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function ResolutionLearningView() {
  const { addToast } = useApp();
  const [outcomes, setOutcomes] = useState<ResolutionLearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ResolutionLearningItem | null>(null);

  const fetchOutcomes = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getResolutionLearningOutcomes();
      setOutcomes(res.outcomes || []);
    } catch (err) {
      console.error('Failed to load resolution learning outcomes', err);
      addToast({
        title: 'Error loading learning outcomes',
        message: 'Could not fetch closed-loop intelligence records.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-2 text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Feedback-to-Resolution Learning Loop
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Closed-Loop Intelligence Layer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Measures post-resolution outcomes against pre-fix baselines to continuously learn which technical and CS interventions work best under specific conditions.
          </p>
        </div>

        <button
          onClick={fetchOutcomes}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span>Refresh Learning Metrics</span>
        </button>
      </div>

      {/* 10-Stage Closed-Loop Pipeline Flow Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Closed-Loop Intelligence Lifecycle:
        </span>
        <div className="flex items-center gap-2 min-w-[700px] text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Feedback</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">AI Analysis</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">AI Recommendation</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Human Approval</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Team Action</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Resolution</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Measure Outcome</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs animate-pulse">🧠 Learn</span>
        </div>
      </div>

      {/* Learning Items Grid */}
      <div className="space-y-4">
        {outcomes.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-emerald-500"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                    {item.recommendationState.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.issueTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Product: {item.productName} • Team: {item.responsibleTeam} • Resolved: {formatDate(item.resolvedDate)}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ⚡ {item.recommendationEffectivenessPct}% Effectiveness
                </span>
              </div>
            </div>

            {/* Before vs After Visual Comparison Box */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              {/* Before Fix */}
              <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-3 md:pb-0 md:pr-4">
                <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span>📉 Pre-Resolution Baseline</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Negative Sent</span>
                    <strong className="text-base text-rose-600">{item.beforeMetrics.negativeSentimentPct}%</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">CSAT Rating</span>
                    <strong className="text-base text-slate-700 dark:text-slate-300">{item.beforeMetrics.csat} / 5</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Complaints/wk</span>
                    <strong className="text-base text-slate-700 dark:text-slate-300">{item.beforeMetrics.weeklyComplaintVolume}</strong>
                  </div>
                </div>
              </div>

              {/* After Fix */}
              <div className="space-y-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span>📈 Post-Resolution Outcome</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Negative Sent</span>
                    <strong className="text-base text-emerald-600">{item.afterMetrics.negativeSentimentPct}%</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">CSAT Rating</span>
                    <strong className="text-base text-emerald-600">{item.afterMetrics.csat} / 5</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Complaints/wk</span>
                    <strong className="text-base text-emerald-600">{item.afterMetrics.weeklyComplaintVolume}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Learned Conditions & Summary */}
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Action Executed:{' '}
                <span className="font-normal text-slate-600 dark:text-slate-400">{item.interventionAction}</span>
              </div>
              <div className="rounded-lg bg-emerald-50/70 p-2.5 text-[11px] text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60">
                <strong>🧠 What the System Learned:</strong> {item.learningSummary}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
