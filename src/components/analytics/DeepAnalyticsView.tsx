import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { AnalyticsOverview } from '../../types.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Zap,
  Layers,
  Sparkles,
  Activity,
  Smile,
  Frown
} from 'lucide-react';
import { getEmotionEmoji } from '../../lib/utils.js';

export function DeepAnalyticsView() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'aspects' | 'anomalies' | 'emotions'>('aspects');

  useEffect(() => {
    async function load() {
      try {
        const res = await ApiService.getAnalyticsOverview();
        setOverview(res.data);
      } catch (err) {}
    }
    load();
  }, []);

  if (!overview) return <div className="p-8 text-center text-xs text-slate-400">Loading deep analytics...</div>;

  // Aspect sentiment matrix
  const aspectData = [
    { aspect: 'Performance & Speed', positive: 82, negative: 18, total: 142 },
    { aspect: 'Billing & Payments', positive: 44, negative: 56, total: 98 },
    { aspect: 'UI / UX Design', positive: 88, negative: 12, total: 120 },
    { aspect: 'Mobile Stability', positive: 52, negative: 48, total: 85 },
    { aspect: 'Customer Support', positive: 79, negative: 21, total: 75 },
    { aspect: 'API & Documentation', positive: 91, negative: 9, total: 64 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Deep Statistical & Aspect Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fine-grained sentiment decomposition across product aspects, anomalies, and customer emotions.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 text-xs">
          <button
            onClick={() => setActiveSubTab('aspects')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeSubTab === 'aspects'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Aspect Sentiment Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('anomalies')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeSubTab === 'anomalies'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Anomaly Detection Radar
          </button>
          <button
            onClick={() => setActiveSubTab('emotions')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              activeSubTab === 'emotions'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Affective State Correlation
          </button>
        </div>
      </div>

      {activeSubTab === 'aspects' && (
        <div className="space-y-6">
          {/* Aspect Breakdown Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aspectData.map((item) => (
              <div
                key={item.aspect}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.aspect}</span>
                  <span className="text-[10px] text-slate-400">{item.total} mentions</span>
                </div>

                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${item.positive}%` }}
                    title={`Positive: ${item.positive}%`}
                  />
                  <div
                    className="bg-rose-500 transition-all"
                    style={{ width: `${item.negative}%` }}
                    title={`Negative: ${item.negative}%`}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Smile className="h-3.5 w-3.5" /> {item.positive}% Positive
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Frown className="h-3.5 w-3.5" /> {item.negative}% Negative
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Volume Trend Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Feedback Signal Ingestion Velocity
            </h3>
            <p className="text-xs text-slate-400 mb-4">Daily volume across all integrated channels</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.volumeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Statistical Anomaly & Outlier Detection
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Algorithms identify abnormal sentiment dips or high velocity friction clusters before customer churn spikes.
            </p>

            <div className="space-y-3">
              {(overview.anomalies || []).map((anom) => (
                <div
                  key={anom.id}
                  className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/60 dark:bg-rose-950/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          {anom.topic}
                        </span>
                        <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                          +{anom.increaseRate}% Ingestion Spike
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                        {anom.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Detected: {new Date(anom.detectedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'emotions' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Customer Emotion Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">Extracted sentiment nuances</p>
            <div className="space-y-3">
              {(overview.emotionDistribution || []).map((em) => (
                <div key={em.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getEmotionEmoji(em.emotion)}
                    </span>
                    <span className="text-slate-400">{em.percentage}% ({em.count})</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        ['HAPPY', 'SATISFIED', 'EXCITED'].includes(em.emotion)
                          ? 'bg-emerald-500'
                          : ['ANGRY', 'FRUSTRATED', 'DISAPPOINTED'].includes(em.emotion)
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${em.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Emotion-to-Churn Impact Index
              </h3>
              <p className="text-xs text-slate-400 mb-4">Correlation with account retention</p>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 dark:border-rose-950 dark:bg-rose-950/20">
                  <span className="font-bold text-rose-800 dark:text-rose-300">FRUSTRATED & ANGRY Signals</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Accounts exhibiting frustrated emotion have an 84% probability of churn within 30 days if not responded to within 4 hours.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-950 dark:bg-emerald-950/20">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">HAPPY & SATISFIED Signals</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    NPS promoters are 3.4x more likely to expand seat tiers when engaged with proactive roadmap previews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
