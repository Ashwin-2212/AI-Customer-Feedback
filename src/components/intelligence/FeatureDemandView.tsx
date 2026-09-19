import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../services/api.js';

const ComplexityBadge: React.FC<{ level: string }> = ({ level }) => {
  const cfg: Record<string, string> = {
    LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    HIGH: 'bg-red-500/20 text-red-300 border-red-500/40',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${cfg[level] || cfg.MEDIUM}`}>{level}</span>;
};

// Demand score visual gauge
const PriorityGauge: React.FC<{ score: number; label?: string }> = ({ score, label }) => {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : score >= 50 ? '#60a5fa' : '#94a3b8';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={70} height={70} viewBox="0 0 70 70">
        <circle cx={35} cy={35} r={28} fill="none" stroke="#1e293b" strokeWidth={7} />
        <circle
          cx={35} cy={35} r={28} fill="none"
          stroke={color} strokeWidth={7}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={35} y={35} textAnchor="middle" dy="0.35em"
          style={{ fontSize: 14, fontWeight: 900, fill: color }}>
          {score}
        </text>
      </svg>
      {label && <div className="text-[10px] text-slate-400 mt-0.5 text-center">{label}</div>}
    </div>
  );
};

// Demand matrix quadrant indicator
const QuadrantBadge: React.FC<{ impact: number; complexity: string }> = ({ impact, complexity }) => {
  let label = '', color = '';
  if (impact >= 85 && complexity === 'LOW') { label = '⚡ Quick Win'; color = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'; }
  else if (impact >= 80 && complexity === 'HIGH') { label = '🎯 Strategic'; color = 'text-blue-300 bg-blue-500/10 border-blue-500/30'; }
  else if (impact >= 70 && complexity !== 'HIGH') { label = '📈 High Value'; color = 'text-violet-300 bg-violet-500/10 border-violet-500/30'; }
  else { label = '🔬 Investigate'; color = 'text-slate-300 bg-slate-500/10 border-slate-500/30'; }
  return <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${color}`}>{label}</span>;
};

// Feature demand card
const FeatureCard: React.FC<{ feature: any; rank: number }> = ({ feature, rank }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        {/* Rank */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${
          rank === 1 ? 'bg-yellow-500/20 text-yellow-300' :
          rank === 2 ? 'bg-slate-400/20 text-slate-300' :
          rank === 3 ? 'bg-orange-600/20 text-orange-400' :
          'bg-slate-700/50 text-slate-400'
        }`}>
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-bold text-base">{feature.featureTitle}</h3>
            <QuadrantBadge impact={feature.customerImpact} complexity={feature.implementationComplexity} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>📊 {feature.requestCount.toLocaleString()} requests</span>
            <ComplexityBadge level={feature.implementationComplexity} />
          </div>
        </div>

        {/* Priority gauge */}
        <PriorityGauge score={feature.priorityScore} label="Priority" />
      </div>

      {/* Score bars */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Customer Impact', value: feature.customerImpact, color: 'bg-blue-500' },
          { label: 'Business Relevance', value: feature.businessRelevance, color: 'bg-violet-500' },
          { label: 'Risk Reduction', value: feature.riskReductionPotential, color: 'bg-emerald-500' },
        ].map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-slate-400">{bar.label}</span>
              <span className="text-[10px] font-bold text-slate-300">{bar.value}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${bar.color} rounded-full transition-all duration-700`} style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Segments */}
      <div className="px-5 pb-3 flex flex-wrap gap-1">
        {feature.segments.map((s: string, i: number) => (
          <span key={i} className="text-[10px] bg-slate-700/60 text-slate-300 rounded-full px-2 py-0.5">{s}</span>
        ))}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2 flex items-center justify-between text-slate-500 hover:text-slate-300 transition-colors border-t border-slate-700/40 text-xs"
      >
        <span>AI Reasoning & Customer Quotes</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700/40 p-5 space-y-3">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <div className="text-violet-400 text-xs font-semibold mb-1">🤖 AI Reasoning</div>
            <p className="text-slate-300 text-sm leading-relaxed">{feature.reasoning}</p>
          </div>
          <div className="space-y-2">
            <div className="text-slate-400 text-xs font-semibold">💬 Top Customer Quotes</div>
            {feature.topRequestQuotes.map((q: string, i: number) => (
              <blockquote key={i} className="text-slate-300 text-sm italic pl-3 border-l-2 border-slate-600">
                {q.replace(/^"|"$/g, '')}
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Demand Matrix visualization (2x2)
const DemandMatrix: React.FC<{ features: any[] }> = ({ features }) => {
  const quadrants = [
    { label: '⚡ Quick Wins', desc: 'High impact, Low complexity', features: features.filter(f => f.customerImpact >= 80 && f.implementationComplexity === 'LOW'), color: 'border-emerald-500/40 bg-emerald-500/5' },
    { label: '🎯 Strategic Bets', desc: 'High impact, High complexity', features: features.filter(f => f.customerImpact >= 80 && f.implementationComplexity === 'HIGH'), color: 'border-blue-500/40 bg-blue-500/5' },
    { label: '🔬 Low Priority', desc: 'Lower impact, Low complexity', features: features.filter(f => f.customerImpact < 80 && f.implementationComplexity === 'LOW'), color: 'border-slate-600/40 bg-slate-700/10' },
    { label: '⛔ Avoid Now', desc: 'Lower impact, High complexity', features: features.filter(f => f.customerImpact < 80 && f.implementationComplexity === 'HIGH'), color: 'border-red-500/20 bg-red-500/5' },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <h3 className="text-white font-bold text-lg mb-1">📊 Feature Demand Matrix</h3>
      <p className="text-slate-400 text-xs mb-4">Impact vs. Implementation Complexity — prioritization quadrant view</p>
      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((q, i) => (
          <div key={i} className={`border rounded-xl p-3 ${q.color}`}>
            <div className="font-bold text-white text-sm">{q.label}</div>
            <div className="text-slate-400 text-[10px] mb-2">{q.desc}</div>
            {q.features.length === 0 ? (
              <div className="text-slate-500 text-xs">None in this quadrant</div>
            ) : (
              q.features.map((f, fi) => (
                <div key={fi} className="text-slate-300 text-xs mb-1 flex items-center gap-1">
                  <span>•</span><span>{f.featureTitle}</span>
                  <span className="ml-auto text-slate-500 text-[10px]">#{f.priorityScore}</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Main View
// ============================================================
export const FeatureDemandView: React.FC = () => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'requests' | 'impact'>('priority');
  const [view, setView] = useState<'list' | 'matrix'>('list');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await ApiService.getFeatureDemand(productFilter === 'ALL' ? undefined : productFilter);
      setFeatures(r.features || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load feature demand data');
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

  const sorted = [...features].sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'requests') return b.requestCount - a.requestCount;
    return b.customerImpact - a.customerImpact;
  });

  const totalRequests = features.reduce((s, f) => s + f.requestCount, 0);
  const avgPriority = features.length ? Math.round(features.reduce((s, f) => s + f.priorityScore, 0) / features.length) : 0;
  const quickWins = features.filter(f => f.customerImpact >= 80 && f.implementationComplexity === 'LOW').length;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-4xl">💡</span>
            Feature Demand Intelligence
          </h1>
          <p className="text-slate-400 mt-1">
            AI-prioritized feature requests — ranked by customer impact, business relevance, and risk reduction potential.
          </p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-xl hover:bg-violet-600/30 transition-all text-sm font-semibold">
          🔄 Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">Feature Requests</div>
          <div className="text-3xl font-black text-white">{features.length}</div>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 text-center">
          <div className="text-violet-300 text-xs mb-1">Total Requests</div>
          <div className="text-3xl font-black text-white">{totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-emerald-300 text-xs mb-1">Quick Wins</div>
          <div className="text-3xl font-black text-white">{quickWins}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
          <div className="text-blue-300 text-xs mb-1">Avg Priority Score</div>
          <div className="text-3xl font-black text-white">{avgPriority}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        {products.map(p => (
          <button key={p.id} onClick={() => setProductFilter(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              productFilter === p.id ? 'bg-violet-600 border-violet-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}>
            {p.name}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {(['priority', 'requests', 'impact'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sortBy === s ? 'bg-slate-700 border-slate-500 text-white' : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div className="flex border border-slate-700 rounded-full overflow-hidden">
            {(['list', 'matrix'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${view === v ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {v === 'list' ? '☰ List' : '⊞ Matrix'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400">Analyzing feature demand signals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-center space-y-2">
          <div>
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-400">{error}</p>
            <button onClick={load} className="mt-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">Retry</button>
          </div>
        </div>
      ) : view === 'matrix' ? (
        <DemandMatrix features={features} />
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-lg font-bold text-white">No feature demand data</div>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((f, i) => (
            <FeatureCard key={f.id} feature={f} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
