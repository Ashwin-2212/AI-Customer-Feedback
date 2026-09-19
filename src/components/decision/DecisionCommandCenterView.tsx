import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../services/api.js';
import { PriorityLevel } from '../../types.js';

// ============================================================
// Sub-components
// ============================================================

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const cfg: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-300 border border-red-500/40',
    HIGH: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
    LOW: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${cfg[level] || cfg.LOW}`}>
      {level}
    </span>
  );
};

const MetricBubble: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({ label, value, sub, accent = 'blue' }) => {
  const accentMap: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/30 text-red-300',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    violet: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${accentMap[accent] || accentMap.blue}`}>
      <div className="text-xs font-medium opacity-70 mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
};

// Evidence Drawer
const EvidenceDrawer: React.FC<{ recommendationId: string; onClose: () => void }> = ({ recommendationId, onClose }) => {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getEvidenceForRecommendation(recommendationId)
      .then(r => setEvidence(r.evidence || []))
      .catch(() => setEvidence([]))
      .finally(() => setLoading(false));
  }, [recommendationId]);

  const typeIcon: Record<string, string> = {
    FEEDBACK_QUOTE: '💬',
    AGGREGATED_METRIC: '📊',
    TREND_DATA: '📈',
    ISSUE_CLUSTER: '🔗',
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />
      <div
        className="w-[480px] h-full bg-slate-900 border-l border-slate-700 overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">🔬 Evidence Vault</h2>
            <p className="text-slate-400 text-xs mt-0.5">{evidence.length} evidence items</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
            </div>
          ) : evidence.length === 0 ? (
            <div className="text-center text-slate-400 py-16">No evidence records found.</div>
          ) : evidence.map((ev: any) => (
            <div key={ev.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcon[ev.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{ev.title}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 rounded px-1.5 py-0.5">{ev.type?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{ev.detail}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>Confidence: <strong className="text-violet-400">{((ev.confidence || 0) * 100).toFixed(0)}%</strong></span>
                    {ev.timestamp && <span>{new Date(ev.timestamp).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Decision Trace Modal
const DecisionTraceModal: React.FC<{ recommendationId: string; onClose: () => void }> = ({ recommendationId, onClose }) => {
  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getDecisionTrace(recommendationId)
      .then(r => setTrace(r.trace))
      .catch(() => setTrace(null))
      .finally(() => setLoading(false));
  }, [recommendationId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!trace) return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-8 text-slate-300">Decision trace not available.</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold text-xl">🧭 AI Decision Trace</h2>
            <p className="text-slate-400 text-sm mt-0.5 truncate max-w-xl">{trace.recommendationTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            <MetricBubble label="AI Confidence" value={`${trace.confidence || 90}%`} accent="violet" />
            <MetricBubble label="Feedback Analyzed" value={(trace.supportingFeedbackCount || 0).toLocaleString()} accent="blue" />
            <MetricBubble label="Revenue at Risk" value={`$${((trace.estimatedRevenueRiskUSD || 0) / 1000).toFixed(0)}K`} accent="red" />
          </div>

          {/* Evidence Items */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-3">📊 Evidence Collected</h3>
            <div className="grid grid-cols-2 gap-2">
              {(trace.evidenceItems || []).map((ev: any, i: number) => (
                <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${ev.supporting ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <span className="text-lg">{ev.type === 'FEEDBACK' ? '💬' : ev.type === 'METRIC' ? '📊' : ev.type === 'TREND' ? '📈' : ev.type === 'CUSTOMER' ? '👥' : '🔗'}</span>
                  <div>
                    <div className="text-xs font-medium text-slate-300">{ev.label}</div>
                    <div className="text-sm font-bold text-white">{ev.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning Path */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-3">🧠 AI Reasoning Path</h3>
            <div className="relative space-y-0">
              {(trace.reasoningSteps || []).map((step: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold z-10 shrink-0">{step.step}</div>
                    {i < trace.reasoningSteps.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="font-semibold text-slate-100 text-sm">{step.label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{step.description}</div>
                    {step.evidenceCount && <div className="text-violet-400 text-[10px] mt-0.5">Evidence count: {step.evidenceCount?.toLocaleString()}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <h3 className="text-amber-300 font-semibold mb-2 text-sm">⚠️ Model Assumptions</h3>
            <ul className="space-y-1">
              {(trace.assumptions || []).map((a: string, i: number) => (
                <li key={i} className="text-amber-200/80 text-xs flex gap-2">
                  <span>•</span><span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          {trace.warnings && trace.warnings.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-red-300 font-semibold mb-2 text-sm">🚨 Warnings</h3>
              {trace.warnings.map((w: string, i: number) => (
                <div key={i} className="text-red-200/80 text-xs">• {w}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Simulation Modal
// ============================================================
const SimulationModal: React.FC<{ productId: string; productName: string; onClose: () => void }> = ({ productId, productName, onClose }) => {
  const [params, setParams] = useState({ latencyReduction: 20, reliabilityImprovement: 15, onboardingImprovement: 0 });
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r = await ApiService.runDigitalTwinSimulation(productId, params);
      setResult(r.result);
    } catch {
      setResult({ error: 'Simulation failed. Please try again.' });
    } finally {
      setRunning(false);
    }
  };

  const sliders = [
    { key: 'latencyReduction', label: 'Checkout Latency Reduction', unit: '%', min: 0, max: 80, step: 5 },
    { key: 'reliabilityImprovement', label: 'Gateway Reliability Improvement', unit: '%', min: 0, max: 50, step: 5 },
    { key: 'onboardingImprovement', label: 'Onboarding Flow Improvement', unit: '%', min: 0, max: 60, step: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">⚗️ What-If Simulation</h2>
            <p className="text-slate-400 text-sm">{productName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-blue-300 text-xs">
            🔬 Adjust parameters below and run the simulation to estimate the impact on customer satisfaction and revenue risk.
            <strong> Results are model estimates, not guaranteed outcomes.</strong>
          </div>

          {sliders.map(sl => (
            <div key={sl.key}>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 text-sm font-medium">{sl.label}</label>
                <span className="text-violet-300 font-bold text-sm">{(params as any)[sl.key]}{sl.unit}</span>
              </div>
              <input
                type="range" min={sl.min} max={sl.max} step={sl.step}
                value={(params as any)[sl.key]}
                onChange={e => setParams(p => ({ ...p, [sl.key]: Number(e.target.value) }))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>{sl.min}{sl.unit}</span><span>{sl.max}{sl.unit}</span>
              </div>
            </div>
          ))}

          <button
            onClick={run}
            disabled={running}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {running ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Running...</> : '▶ Run Simulation'}
          </button>

          {result && !result.error && (
            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="text-slate-200 font-semibold">📊 Simulation Results</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Est. Complaint Change</div>
                  <div className="text-2xl font-bold text-emerald-300">{result.estimatedComplaintChange}%</div>
                </div>
                <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Est. CSAT Change</div>
                  <div className="text-2xl font-bold text-blue-300">+{result.estimatedCSATChange} pts</div>
                </div>
                <div className="text-center bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Customer Risk</div>
                  <div className="text-sm font-bold text-violet-300">{result.estimatedCustomerRiskChange}</div>
                </div>
                <div className="text-center bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Revenue Risk Δ</div>
                  <div className="text-sm font-bold text-orange-300">${Math.abs(result.estimatedRevenueRiskChange).toLocaleString()}</div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.narrative}</p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-xs">{result.simulationNote}</div>
            </div>
          )}
          {result?.error && <div className="text-red-400 text-sm text-center">{result.error}</div>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Main Command Center Card
// ============================================================
const CommandCard: React.FC<{
  card: any;
  onViewEvidence: () => void;
  onViewTrace: () => void;
  onRunSimulation: () => void;
  onApprove: () => void;
}> = ({ card, onViewEvidence, onViewTrace, onRunSimulation, onApprove }) => {
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      await ApiService.approveRecommendation(card.recommendationId, 'Approved via Decision Command Center');
      setApprovalStatus('APPROVED');
      onApprove();
    } catch {
      setApprovalStatus('ERROR');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge level={card.severity} />
            <span className="text-slate-400 text-xs">{card.productName}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-snug">{card.issueTitle}</h3>
        </div>
        {card.hasApprovedAction && (
          <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-1 font-bold">ACTION TAKEN</span>
        )}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MetricBubble label="Affected Customers" value={(card.affectedCustomers || 0).toLocaleString()} accent="orange" />
        <MetricBubble label="Complaint Growth" value={`+${card.complaintGrowthPct || 0}%`} sub="Month-over-month" accent="red" />
        <MetricBubble label="Revenue at Risk" value={`$${((card.revenueAtRiskUSD || 0) / 1000).toFixed(0)}K`} sub="Estimated scenario" accent="violet" />
      </div>

      {/* AI Recommendation */}
      <div className="bg-slate-700/40 border border-slate-600/40 rounded-xl p-4 mb-5">
        <div className="text-xs text-violet-400 font-semibold mb-1">🤖 AI Recommendation</div>
        <p className="text-slate-200 text-sm leading-relaxed">{card.aiRecommendation}</p>
        <div className="text-[10px] text-slate-500 mt-2">Based on {card.evidenceCount} feedback signals</div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onViewEvidence}
          className="px-3 py-2 rounded-xl text-sm font-semibold border border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
        >
          🔬 View Evidence
        </button>
        <button
          onClick={onViewTrace}
          className="px-3 py-2 rounded-xl text-sm font-semibold border border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 transition-all"
        >
          🧭 Decision Trace
        </button>
        <button
          onClick={onRunSimulation}
          className="px-3 py-2 rounded-xl text-sm font-semibold border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all"
        >
          ⚗️ Run Simulation
        </button>
        {approvalStatus === 'APPROVED' ? (
          <div className="px-3 py-2 rounded-xl text-sm font-semibold text-center text-emerald-300 bg-emerald-500/10 border border-emerald-500/30">
            ✅ Approved
          </div>
        ) : (
          <button
            onClick={handleApprove}
            className="px-3 py-2 rounded-xl text-sm font-semibold border border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
          >
            ✅ Approve Action
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main View
// ============================================================
export const DecisionCommandCenterView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [evidenceFor, setEvidenceFor] = useState<string | null>(null);
  const [traceFor, setTraceFor] = useState<string | null>(null);
  const [simulationFor, setSimulationFor] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await ApiService.getCommandCenterData(productFilter === 'ALL' ? undefined : productFilter);
      setData(r.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load command center data');
    } finally {
      setLoading(false);
    }
  }, [productFilter]);

  useEffect(() => { load(); }, [load]);

  const [products, setProducts] = useState<{ id: string; name: string }[]>([
    { id: 'ALL', name: 'All Products' }
  ]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await ApiService.getProducts();
        const list = (res.products || []).map((p: any) => ({ id: p.id, name: p.name }));
        setProducts([{ id: 'ALL', name: 'All Products' }, ...list]);
      } catch {
        // keep default
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Decision Command Center
          </h1>
          <p className="text-slate-400 mt-1">
            AI-generated decision intelligence — view evidence, trace reasoning, simulate outcomes, and approve actions.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-xl hover:bg-violet-600/30 transition-all text-sm font-semibold"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Product Filter */}
      <div className="flex gap-2 flex-wrap">
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => setProductFilter(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              productFilter === p.id
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Summary Banner */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-red-300 text-xs font-semibold uppercase tracking-wider mb-1">Critical Issues</div>
            <div className="text-3xl font-black text-white">{data.criticalCards?.length || 0}</div>
            <div className="text-red-400 text-xs mt-1">Require immediate decision</div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/30 rounded-xl p-4 text-center">
            <div className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-1">Customers Affected</div>
            <div className="text-3xl font-black text-white">{data.totalAffectedCustomers?.toLocaleString()}</div>
            <div className="text-orange-400 text-xs mt-1">Across all active issues</div>
          </div>
          <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/30 rounded-xl p-4 text-center">
            <div className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">Revenue at Risk</div>
            <div className="text-3xl font-black text-white">${((data.totalRevenueAtRiskUSD || 0) / 1000).toFixed(0)}K</div>
            <div className="text-violet-400 text-xs mt-1">Scenario estimate only</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Last Updated</div>
            <div className="text-lg font-black text-white">{data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : '—'}</div>
            <div className="text-blue-400 text-xs mt-1">Live from AI pipeline</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400">Loading decision intelligence...</p>
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
      ) : data?.criticalCards?.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="text-5xl">✅</div>
            <h3 className="text-white font-bold text-xl">No Critical Decisions Pending</h3>
            <p className="text-slate-400 text-sm">All issues are within normal parameters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {(data?.criticalCards || []).map((card: any) => (
            <CommandCard
              key={card.id}
              card={card}
              onViewEvidence={() => setEvidenceFor(card.recommendationId)}
              onViewTrace={() => setTraceFor(card.recommendationId)}
              onRunSimulation={() => setSimulationFor({ productId: card.productId, productName: card.productName })}
              onApprove={load}
            />
          ))}
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-slate-400 text-xs text-center">
        🤖 All recommendations, revenue figures, and forecasts shown here are generated by AI models and are <strong className="text-slate-300">estimates only</strong>.
        Human review and validation are required before any action is taken. Actual results may vary.
      </div>

      {/* Modals / Drawers */}
      {evidenceFor && <EvidenceDrawer recommendationId={evidenceFor} onClose={() => setEvidenceFor(null)} />}
      {traceFor && <DecisionTraceModal recommendationId={traceFor} onClose={() => setTraceFor(null)} />}
      {simulationFor && <SimulationModal productId={simulationFor.productId} productName={simulationFor.productName} onClose={() => setSimulationFor(null)} />}
    </div>
  );
};
