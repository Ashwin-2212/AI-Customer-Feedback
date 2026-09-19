import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { CompetitorBenchmark } from '../../types.js';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  Award,
  BarChart2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Target
} from 'lucide-react';

export function CompetitiveIntelligenceView() {
  const [competitors, setCompetitors] = useState<CompetitorBenchmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompetitors = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getCompetitors();
      setCompetitors(res.competitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Competitive Intelligence & Market Sentiment Benchmarks
            </h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Omnichannel Market Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Benchmarked against public reviews, G2/Capterra telemetry, and comparative customer sentiment.
          </p>
        </div>

        <button
          onClick={loadCompetitors}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Our Net Sentiment</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            78.4% <span className="text-xs font-semibold text-emerald-500">(+6.2% vs Mkt)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Leading in UI/UX & Reliability</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg CSAT Benchmark</span>
            <Target className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            4.2 / 5.0
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Competitor Average: 3.8 / 5.0</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pricing Sentiment Vulnerability</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            -8.5% Delta
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Competitor C perceived as lower cost</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Competitive Win Rate</span>
            <BarChart2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            71.8%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Based on customer migration signals</div>
        </div>
      </div>

      {/* Competitors Benchmarking Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/60">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Market Competitor Comparative Scorecard
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Competitor / Product</th>
                <th className="px-3 py-3">Sentiment Index</th>
                <th className="px-3 py-3">Avg CSAT</th>
                <th className="px-4 py-3">Top Strengths</th>
                <th className="px-4 py-3">Critical Weaknesses</th>
                <th className="px-3 py-3 text-right">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Our Platform Highlight */}
              <tr className="bg-indigo-50/50 dark:bg-indigo-950/30 font-semibold">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Our Platform (Acme)</span>
                  </div>
                </td>
                <td className="px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  78.4% Positive
                </td>
                <td className="px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  4.2 / 5.0
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  AI insights speed, Intuitive UX, Mobile app responsiveness
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  Legacy ERP integrations, Enterprise custom billing
                </td>
                <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">
                  34.5%
                </td>
              </tr>

              {(competitors || []).map((comp, compIdx) => {
                const sList = comp.strengths || comp.strengthsMentioned || [];
                const wList = comp.weaknesses || comp.weaknessesMentioned || [];
                const sScore = comp.sentimentScore ?? comp.competitorSentiment ?? 65;
                const cScore = comp.csatScore ?? 3.8;
                return (
                  <tr key={comp.id || `comp_${compIdx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {comp.name || comp.competitorName || 'Competitor'}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {sScore}%
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {cScore} / 5.0
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {sList.map((s, idx) => (
                          <span key={idx} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {wList.map((w, idx) => (
                          <span key={idx} className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {comp.marketShareEstimate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
