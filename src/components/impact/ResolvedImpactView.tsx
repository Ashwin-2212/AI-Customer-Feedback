import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { ResolvedImpactAnalysis } from '../../types.js';
import {
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function ResolvedImpactView() {
  const [impacts, setImpacts] = useState<ResolvedImpactAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadImpacts = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getResolvedImpacts();
      setImpacts(res.resolvedImpacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImpacts();
  }, []);

  const totalRevenueSaved = (impacts || []).reduce((acc, curr) => acc + (curr.churnRevenuePreventedUSD || 0), 0);
  const avgCsatDelta = ((impacts || []).reduce((acc, curr) => acc + (curr.csatDelta || 0), 0) / ((impacts || []).length || 1)).toFixed(1);

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Resolved Impact & Business ROI Attribution
            </h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Closed-Loop Impact Measurement
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify the concrete business revenue saved, CSAT lift, and churn reduction achieved by resolved product issues.
          </p>
        </div>

        <button
          onClick={loadImpacts}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Attribution</span>
        </button>
      </div>

      {/* Aggregate ROI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Churn Prevented</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${(totalRevenueSaved || 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Across {(impacts || []).length} resolved structural initiatives</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Post-Fix CSAT Lift</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            +{avgCsatDelta} Points
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Directly measured via 30-day cohort surveys</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Closed-Loop Resolution Rate</span>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            94.2%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Feedback with confirmed fix verification</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engineering Hours Saved</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            320+ hrs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Through automated root cause diagnostics</div>
        </div>
      </div>

      {/* Impact Initiatives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impacts.map((imp) => (
          <div
            key={imp.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolved on {formatDate(imp.resolutionDate)}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +${(imp.churnRevenuePreventedUSD || 0).toLocaleString()} Saved
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {imp.issueTitle}
              </h3>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Pre-Fix CSAT</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{imp.preFixCSAT} / 5.0</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Post-Fix CSAT</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{imp.postFixCSAT} / 5.0</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Net CSAT Lift</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">+{imp.csatDelta}</div>
                </div>
              </div>
            </div>

            {/* Post-Fix Customer Verbatim */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-xs dark:border-indigo-950 dark:bg-indigo-950/20">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Subsequent Customer Verification:
              </span>
              <p className="text-slate-800 dark:text-slate-200 italic">
                "{imp.feedbackSummaryPostResolution}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
