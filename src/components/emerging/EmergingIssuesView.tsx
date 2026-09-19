import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { EmergingIssue } from '../../types.js';
import {
  AlertTriangle,
  Flame,
  TrendingUp,
  Radio,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
  Tag,
  Quote,
  X
} from 'lucide-react';
import { formatDate, getPriorityBadgeClass } from '../../lib/utils.js';

export function EmergingIssuesView() {
  const { addToast } = useApp();
  const [issues, setIssues] = useState<EmergingIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<EmergingIssue | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchEmerging = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getEmergingIssues();
      setIssues(res.emergingIssues || []);
    } catch (err) {
      console.error('Failed to load emerging issues', err);
      addToast({
        title: 'Error loading emerging issues',
        message: 'Could not fetch early warning signals.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmerging();
  }, []);

  const handleMitigate = async (issue: EmergingIssue) => {
    try {
      setActionLoadingId(issue.id);
      const res = await ApiService.triggerEmergingIssueAction(issue.id, issue.recommendedIntervention);
      if (res.success) {
        addToast({
          title: 'Intervention Dispatched 🚀',
          message: res.message || `Proactive fix deployed for "${issue.topic}".`,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({
        title: 'Dispatch Failed',
        message: 'Could not trigger intervention.',
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = issues.filter(i =>
    i.topic.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.affectedSegment.toLowerCase().includes(search.toLowerCase())
  );

  // Render SVG Forecast Line Chart
  const renderForecastChart = (timeline: EmergingIssue['forecastTimeline']) => {
    if (!timeline || timeline.length === 0) return null;
    const width = 280;
    const height = 64;
    const padding = 12;

    const maxVal = Math.max(...timeline.map(t => Math.max(t.actualMentions || 0, t.predictedMentions || 0)), 10);

    const points = timeline.map((t, idx) => {
      const x = padding + (idx / (timeline.length - 1)) * (width - padding * 2);
      const yPred = (height - padding) - (t.predictedMentions / maxVal) * (height - padding * 2);
      const yAct = t.actualMentions !== undefined
        ? (height - padding) - (t.actualMentions / maxVal) * (height - padding * 2)
        : null;
      return { x, yPred, yAct, t };
    });

    const predPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yPred}`).join(' ');
    const actPoints = points.filter(p => p.yAct !== null);
    const actPath = actPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yAct}`).join(' ');

    return (
      <div className="relative pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
          {/* Baseline reference grid */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.5" />
          
          {/* Forecasted Curve (Dashed Violet) */}
          <path d={predPath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3,3" />
          
          {/* Historical Actual Curve (Solid Rose) */}
          {actPoints.length > 1 && (
            <path d={actPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              {p.yAct !== null ? (
                <circle cx={p.x} cy={p.yAct} r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
              ) : (
                <circle cx={p.x} cy={p.yPred} r="3" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1" />
              )}
            </g>
          ))}
        </svg>

        {/* Timeline Day Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-1">
          <span>{timeline[0].date} (Start)</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">🔮 Forecast: {timeline[timeline.length - 1].predictedMentions} Mentions</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 p-2 text-white shadow-sm">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Emerging Issue Prediction & Early Warning Center
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-black text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              🔮 Predictive Growth AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detect low-volume signals (e.g. 7 mentions growing at <strong className="text-rose-600 dark:text-rose-400">+180%</strong>) and proactively extinguish root friction before escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmerging}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-purple-500' : ''}`} />
            <span>Scan Signals</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-2xs dark:border-purple-900/60 dark:from-purple-950/30 dark:to-slate-900">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            <span>Active Small Signals</span>
            <Radio className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {issues.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Detected via semantic clustering on low-frequency feedback.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-2xs dark:border-rose-900/60 dark:from-rose-950/30 dark:to-slate-900">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
            <span>Peak Velocity Growth</span>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
            +180%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            OTP & Verification latency accelerating across new mobile users.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-2xs dark:border-amber-900/60 dark:from-amber-950/30 dark:to-slate-900">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            <span>Revenue at Protected Risk</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            ${issues.reduce((acc, i) => acc + (i.estimatedRevenueAtRiskUSD || 0), 0).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Potential subscription revenue preserved if resolved within 48h.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter emerging signals by topic, category, segment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Signal Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 border-t-4 border-t-purple-500"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {item.topic}
                    </h3>
                  </div>
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                    item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    item.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                {/* Key Telemetry Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Current</div>
                    <div className="text-base font-black text-slate-900 dark:text-white">{item.currentMentions} mentions</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Growth</div>
                    <div className="text-base font-black text-rose-600 dark:text-rose-400">+{item.growthRatePct}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence</div>
                    <div className="text-base font-black text-purple-600 dark:text-purple-400">{item.confidencePct}%</div>
                  </div>
                </div>

                {/* Forecast Curve */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Forecast Trajectory</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">Predicted: {item.predictedMentions}</span>
                  </span>
                  {renderForecastChart(item.forecastTimeline)}
                </div>

                {/* Related Keywords */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.relatedKeywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Tag className="h-2.5 w-2.5 text-slate-400" />
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>

                {/* Sample Quote */}
                {item.sampleQuotes && item.sampleQuotes.length > 0 && (
                  <div className="mt-3 rounded-lg bg-slate-100/70 p-2 text-[11px] italic text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-l-2 border-purple-400">
                    "{item.sampleQuotes[0]}"
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedIssue(item)}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Inspect Evidence
                </button>

                <button
                  onClick={() => handleMitigate(item)}
                  disabled={actionLoadingId === item.id}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-purple-500 disabled:opacity-50 transition"
                >
                  {actionLoadingId === item.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3 text-amber-300 fill-amber-300" />
                  )}
                  <span>Deploy Fix</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence & Forecast Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedIssue.topic}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  First Detected: {formatDate(selectedIssue.firstDetectedDate)} • Affected Segment: {selectedIssue.affectedSegment}
                </p>
              </div>
            </div>

            <div className="space-y-4 py-4 text-xs">
              {/* Forecast graph */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Forecast Mention Growth (Next 7 Days)
                </span>
                <div className="mt-2">
                  {renderForecastChart(selectedIssue.forecastTimeline)}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>AI Recommended Proactive Intervention</span>
                </div>
                <p className="mt-1 text-xs text-purple-900 dark:text-purple-200 font-medium">
                  {selectedIssue.recommendedIntervention}
                </p>
              </div>

              {/* Evidence Quotes */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Raw Customer Signal Transcripts ({selectedIssue.sampleQuotes.length})
                </span>
                {selectedIssue.sampleQuotes.map((quote, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 flex items-start gap-2">
                    <Quote className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <span>"{quote}"</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleMitigate(selectedIssue);
                  setSelectedIssue(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                <span>Execute Proactive Fix</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
