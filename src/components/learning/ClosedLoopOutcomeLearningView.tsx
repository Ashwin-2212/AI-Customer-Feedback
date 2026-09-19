import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../services/api.js';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { color: string; icon: string }> = {
    IMPROVEMENT_DETECTED: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '✅' },
    NO_CHANGE: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: '➖' },
    WORSENED: { color: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '⚠️' },
    PENDING: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '⏳' },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${c.color}`}>
      {c.icon} {status.replace('_', ' ')}
    </span>
  );
};

const ChangeIndicator: React.FC<{ value: number; unit?: string; inverted?: boolean }> = ({ value, unit = '', inverted = false }) => {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;
  const color = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400';
  const prefix = value > 0 ? '+' : '';
  return (
    <span className={`font-bold text-sm ${color}`}>
      {prefix}{value.toFixed(1)}{unit}
    </span>
  );
};

// Before/After comparison card
const OutcomeCard: React.FC<{ outcome: any }> = ({ outcome }) => {
  const [expanded, setExpanded] = useState(false);
  const isPending = outcome.status === 'PENDING';

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      outcome.status === 'IMPROVEMENT_DETECTED'
        ? 'border-emerald-500/40 bg-emerald-500/5'
        : outcome.status === 'WORSENED'
        ? 'border-red-500/40 bg-red-500/5'
        : outcome.status === 'PENDING'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-slate-700/50 bg-slate-800/40'
    }`}>
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge status={outcome.status} />
            <span className="text-slate-400 text-xs">{outcome.productName}</span>
          </div>
          <h3 className="text-white font-bold text-base leading-snug">{outcome.recommendationTitle}</h3>
          {!isPending && (
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{outcome.evaluationNote}</p>
          )}
        </div>
        {!isPending && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-slate-400 hover:text-white text-sm transition-colors"
          >
            {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>

      {/* Action Taken */}
      <div className="px-5 pb-3">
        <div className="text-xs text-slate-500 font-semibold mb-1">ACTION TAKEN</div>
        <div className="text-slate-300 text-sm italic">"{outcome.actionTaken}"</div>
        <div className="text-slate-500 text-xs mt-1">
          Applied: {new Date(outcome.actionDate).toLocaleDateString()} |
          Measured: {isPending ? 'Pending…' : new Date(outcome.outcomeDate).toLocaleDateString()}
        </div>
      </div>

      {/* Change metrics row (always visible) */}
      {!isPending && (
        <div className="px-5 pb-3 grid grid-cols-3 gap-3">
          <div className="text-center bg-slate-800/60 rounded-xl p-2">
            <div className="text-xs text-slate-400 mb-0.5">Complaint Δ</div>
            <ChangeIndicator value={outcome.complaintChangePct} unit="%" inverted />
          </div>
          <div className="text-center bg-slate-800/60 rounded-xl p-2">
            <div className="text-xs text-slate-400 mb-0.5">CSAT Δ</div>
            <ChangeIndicator value={outcome.csatChangePts} unit=" pts" />
          </div>
          <div className="text-center bg-slate-800/60 rounded-xl p-2">
            <div className="text-xs text-slate-400 mb-0.5">Sentiment Δ</div>
            <ChangeIndicator value={outcome.sentimentChangePct} unit="%" />
          </div>
        </div>
      )}

      {isPending && (
        <div className="px-5 pb-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300 text-xs">
            ⏳ Outcome measurement in progress. Awaiting data collection after action deployment.
          </div>
        </div>
      )}

      {/* Expanded: before/after detail */}
      {expanded && !isPending && (
        <div className="border-t border-slate-700/50 p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* BEFORE */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400 font-bold text-xs uppercase tracking-wider mb-3">📉 BEFORE Intervention</div>
              <div className="space-y-2">
                {[
                  { label: 'Complaints', value: outcome.beforeComplaints },
                  { label: 'CSAT Score', value: outcome.beforeCSAT.toFixed(2) },
                  { label: 'Positive Sentiment', value: `${outcome.beforeSentimentPct}%` },
                  { label: 'Issue Frequency', value: `${outcome.beforeIssueFrequency}/week` },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-400 text-xs">{m.label}</span>
                    <span className="text-red-300 font-bold text-xs">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AFTER */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">📈 AFTER Intervention</div>
              <div className="space-y-2">
                {[
                  { label: 'Complaints', value: outcome.afterComplaints },
                  { label: 'CSAT Score', value: outcome.afterCSAT.toFixed(2) },
                  { label: 'Positive Sentiment', value: `${outcome.afterSentimentPct}%` },
                  { label: 'Issue Frequency', value: `${outcome.afterIssueFrequency}/week` },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-400 text-xs">{m.label}</span>
                    <span className="text-emerald-300 font-bold text-xs">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Causality note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-blue-300 text-xs">
            🔬 <strong>Causality Note:</strong> {outcome.causalityNote}
          </div>
        </div>
      )}
    </div>
  );
};

// Performance Summary Panel
const PerformanceSummaryPanel: React.FC<{ performance: any }> = ({ performance }) => {
  const effectiveness = performance.effectivenessRate || 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (effectiveness / 100) * circumference;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-4">📊 Recommendation Performance</h3>
      <div className="flex items-center gap-6">
        {/* Radial progress */}
        <div className="relative shrink-0">
          <svg width={110} height={110} viewBox="0 0 110 110">
            <circle cx={55} cy={55} r={45} fill="none" stroke="#1e293b" strokeWidth={10} />
            <circle
              cx={55} cy={55} r={45} fill="none"
              stroke={effectiveness >= 70 ? '#10b981' : effectiveness >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth={10}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 55 55)"
              className="transition-all duration-1000"
            />
            <text x={55} y={55} textAnchor="middle" dy="0.35em" className="fill-white text-lg font-black" style={{ fontSize: 20, fontWeight: 900, fill: 'white' }}>
              {effectiveness}%
            </text>
          </svg>
          <div className="text-center text-xs text-slate-400 mt-1">Effectiveness</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[
            { label: 'Total Recs', value: performance.total, color: 'text-white' },
            { label: 'Approved', value: performance.approved, color: 'text-emerald-300' },
            { label: 'Implemented', value: performance.implemented, color: 'text-blue-300' },
            { label: 'Successful', value: performance.successfulOutcomes, color: 'text-emerald-300' },
            { label: 'No Change', value: performance.unsuccessfulOutcomes, color: 'text-slate-400' },
            { label: 'Avg Days to Outcome', value: performance.avgTimeToOutcomeDays, color: 'text-violet-300' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">{s.label}</div>
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Record Outcome Modal
const RecordOutcomeModal: React.FC<{ outcomes: any[]; onClose: () => void; onSaved: () => void }> = ({ outcomes, onClose, onSaved }) => {
  const pendingOutcomes = outcomes.filter(o => o.status === 'PENDING');
  const [selectedId, setSelectedId] = useState(pendingOutcomes[0]?.recommendationId || '');
  const [form, setForm] = useState({ afterComplaints: '', afterCSAT: '', afterSentimentPct: '', actionTaken: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await ApiService.recordOutcome({
        recommendationId: selectedId,
        actionTaken: form.actionTaken || 'Intervention applied',
        afterComplaints: Number(form.afterComplaints) || 0,
        afterCSAT: Number(form.afterCSAT) || 0,
        afterSentimentPct: Number(form.afterSentimentPct) || 0,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">📝 Record Outcome</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">Recommendation</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-violet-500"
            >
              {outcomes.map(o => (
                <option key={o.id} value={o.recommendationId}>{o.recommendationTitle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">Action Taken</label>
            <input
              type="text" placeholder="Describe what was done..."
              value={form.actionTaken}
              onChange={e => setForm(p => ({ ...p, actionTaken: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'afterComplaints', label: 'Complaints After', placeholder: 'e.g. 235' },
              { key: 'afterCSAT', label: 'CSAT After', placeholder: 'e.g. 3.95' },
              { key: 'afterSentimentPct', label: 'Positive % After', placeholder: 'e.g. 41' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-slate-300 text-xs font-medium block mb-1">{f.label}</label>
                <input
                  type="number" placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-bold rounded-xl transition-all"
          >
            {saving ? 'Saving…' : '💾 Save Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Main View
// ============================================================
export const ClosedLoopOutcomeLearningView: React.FC = () => {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [outRes, perfRes] = await Promise.all([
        ApiService.getOutcomes(),
        ApiService.getRecommendationPerformance(),
      ]);
      setOutcomes(outRes.outcomes || []);
      setPerformance(perfRes.performance || null);
    } catch (e: any) {
      setError(e.message || 'Failed to load outcome data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusFilters = ['ALL', 'IMPROVEMENT_DETECTED', 'PENDING', 'NO_CHANGE', 'WORSENED'];
  const filteredOutcomes = filterStatus === 'ALL' ? outcomes : outcomes.filter(o => o.status === filterStatus);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-4xl">🔄</span>
            Closed-Loop Outcome Learning
          </h1>
          <p className="text-slate-400 mt-1">
            Track BEFORE vs. AFTER metrics for every action taken — measure real-world impact and feed learnings back into the AI.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRecordModal(true)}
            className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-xl hover:bg-emerald-600/30 transition-all text-sm font-semibold"
          >
            ＋ Record Outcome
          </button>
          <button
            onClick={load}
            className="px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-sm font-semibold"
          >
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400">Loading outcome records...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-400">{error}</p>
            <button onClick={load} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-sm">Retry</button>
          </div>
        </div>
      ) : (
        <>
          {/* Performance Summary */}
          {performance && <PerformanceSummaryPanel performance={performance} />}

          {/* Causality disclaimer */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-blue-200 text-xs flex items-start gap-2">
            <span>🔬</span>
            <span>
              <strong>Causality Disclaimer:</strong> Outcome measurements represent <em>correlations</em> between actions and observed metric changes.
              They do not prove causation — concurrent changes, seasonal effects, and external factors may also contribute to measured improvements or declines.
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  filterStatus === s
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Outcomes list */}
          {filteredOutcomes.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-lg font-bold text-white">No outcomes for this filter</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOutcomes.map(o => (
                <OutcomeCard key={o.id} outcome={o} />
              ))}
            </div>
          )}
        </>
      )}

      {showRecordModal && (
        <RecordOutcomeModal
          outcomes={outcomes}
          onClose={() => setShowRecordModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
};
