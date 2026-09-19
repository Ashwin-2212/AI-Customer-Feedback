import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../services/api.js';

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const cfg: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-300 border border-red-500/40',
    HIGH: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
    LOW: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${cfg[level] || cfg.LOW}`}>{level}</span>;
};

const TrendArrow: React.FC<{ trend: 'UP' | 'DOWN' | 'STABLE'; rate: number }> = ({ trend, rate }) => {
  if (trend === 'UP') return <span className="text-red-400 font-bold text-sm">↑ +{rate}%</span>;
  if (trend === 'DOWN') return <span className="text-emerald-400 font-bold text-sm">↓ {rate}%</span>;
  return <span className="text-slate-400 font-bold text-sm">→ Stable</span>;
};

// Issue Velocity Radar (visual bar chart style)
const VelocityRadar: React.FC<{ velocityMetrics: any[] }> = ({ velocityMetrics }) => {
  const maxVolume = Math.max(...velocityMetrics.map(v => v.currentVolume), 1);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <h3 className="text-white font-bold text-lg mb-1">📡 Issue Velocity Radar</h3>
      <p className="text-slate-400 text-xs mb-4">Complaint volume velocity vs previous period — sorted by acceleration</p>
      <div className="space-y-4">
        {velocityMetrics
          .slice()
          .sort((a, b) => Math.abs(b.growthRatePct) - Math.abs(a.growthRatePct))
          .map((m, i) => {
            const barWidth = (m.currentVolume / maxVolume) * 100;
            const isAccelerating = m.accelerating;
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm font-medium truncate max-w-[280px]">{m.issueTitle}</span>
                  <div className="flex items-center gap-2">
                    {isAccelerating && (
                      <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 font-bold">ACCELERATING</span>
                    )}
                    <TrendArrow trend={m.trend} rate={Math.abs(m.growthRatePct)} />
                  </div>
                </div>
                <div className="relative h-6 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      m.trend === 'UP'
                        ? isAccelerating ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'
                        : 'bg-gradient-to-r from-emerald-700 to-emerald-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-xs text-white font-semibold">
                    Vol: {m.currentVolume} | {m.uniqueCustomersAffected.toLocaleString()} customers
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// Forecast Card
const ForecastCard: React.FC<{ forecast: any }> = ({ forecast }) => {
  const severityEscalated = forecast.currentSeverity !== forecast.predictedSeverity;
  const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const currentIdx = severityLevels.indexOf(forecast.currentSeverity);
  const predictedIdx = severityLevels.indexOf(forecast.predictedSeverity);
  const isWorsen = predictedIdx > currentIdx;

  return (
    <div className={`bg-gradient-to-br rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${
      isWorsen && severityEscalated
        ? 'from-red-900/30 to-slate-900/60 border-red-500/40 hover:shadow-red-500/10'
        : 'from-slate-800/60 to-slate-900/60 border-slate-700/60 hover:shadow-violet-500/10'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg leading-snug">{forecast.issueTitle}</h3>
          <div className="text-slate-400 text-xs mt-0.5">Volume: {forecast.currentVolume}</div>
        </div>
        <div className={`shrink-0 text-center rounded-xl px-3 py-2 ${isWorsen ? 'bg-red-500/20 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
          <div className="text-[10px] text-slate-400 mb-1">Forecast</div>
          <div className={`text-xl font-black ${isWorsen ? 'text-red-300' : 'text-emerald-300'}`}>
            {isWorsen ? '⚠️' : '✅'}
          </div>
        </div>
      </div>

      {/* Severity transition */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Current</div>
          <SeverityBadge level={forecast.currentSeverity} />
        </div>
        <div className={`text-lg font-bold ${isWorsen ? 'text-red-400' : 'text-slate-400'}`}>→</div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Predicted ({forecast.forecastWindowDays}d)</div>
          <SeverityBadge level={forecast.predictedSeverity} />
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] text-slate-500">Growth</div>
          <div className={`text-lg font-bold ${forecast.growthRatePct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {forecast.growthRatePct > 0 ? '+' : ''}{forecast.growthRatePct}%
          </div>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">AI Confidence</span>
          <span className="text-violet-300 font-bold">{forecast.confidencePct}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700"
            style={{ width: `${forecast.confidencePct}%` }}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="mb-3">
        <div className="text-xs text-slate-400 font-semibold mb-1.5">Detection Signals</div>
        <div className="flex flex-wrap gap-1">
          {forecast.signals.map((s: string, i: number) => (
            <span key={i} className="text-[10px] bg-slate-700/60 text-slate-300 rounded-full px-2 py-0.5">{s}</span>
          ))}
        </div>
      </div>

      {/* Affected Segments */}
      <div className="flex flex-wrap gap-1 mb-4">
        {forecast.affectedSegments.map((seg: string, i: number) => (
          <span key={i} className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-full px-2 py-0.5">{seg}</span>
        ))}
      </div>

      {/* Prediction label */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-amber-300 text-[10px] font-semibold">
        🔮 {forecast.labelNote}
      </div>
    </div>
  );
};

// ============================================================
// Main View
// ============================================================
export const PredictiveIssueView: React.FC = () => {
  const [data, setData] = useState<{ forecasts: any[]; velocityMetrics: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'growth' | 'severity' | 'confidence'>('growth');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await ApiService.getPredictiveForecasts(productFilter === 'ALL' ? undefined : productFilter);
      setData(r);
    } catch (e: any) {
      setError(e.message || 'Failed to load forecasts');
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

  const severityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  const sortedForecasts = (data?.forecasts || []).slice().sort((a, b) => {
    if (sortBy === 'growth') return b.growthRatePct - a.growthRatePct;
    if (sortBy === 'severity') return (severityOrder[b.predictedSeverity] || 0) - (severityOrder[a.predictedSeverity] || 0);
    return b.confidencePct - a.confidencePct;
  });

  const acceleratingCount = data?.velocityMetrics?.filter(v => v.accelerating).length || 0;
  const highSeverityPredicted = data?.forecasts?.filter(f => f.predictedSeverity === 'CRITICAL' || f.predictedSeverity === 'HIGH').length || 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-4xl">🔮</span>
            Predictive Issue Intelligence
          </h1>
          <p className="text-slate-400 mt-1">
            AI forecasts emerging issues before they escalate — powered by velocity analysis and pattern detection.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-xl hover:bg-violet-600/30 transition-all text-sm font-semibold"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Prediction disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <div className="text-amber-300 font-semibold text-sm">AI Prediction Disclaimer</div>
          <div className="text-amber-200/70 text-xs mt-0.5">
            All forecasts below are generated by AI trend analysis. They are estimates based on historical patterns and current velocities — <strong>not guaranteed outcomes</strong>.
            Use these signals to prepare, not to panic. Always validate with your team before acting.
          </div>
        </div>
      </div>

      {/* Product filter */}
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
        <div className="ml-auto flex gap-2">
          {['growth', 'severity', 'confidence'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                sortBy === s
                  ? 'bg-slate-700 border-slate-500 text-white'
                  : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              Sort: {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400">Scanning issue velocity patterns...</p>
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
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-slate-400 text-xs mb-1">Issues Forecasted</div>
              <div className="text-3xl font-black text-white">{data?.forecasts.length || 0}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-red-300 text-xs mb-1">High/Critical Predicted</div>
              <div className="text-3xl font-black text-red-300">{highSeverityPredicted}</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-orange-300 text-xs mb-1">Accelerating Issues</div>
              <div className="text-3xl font-black text-orange-300">{acceleratingCount}</div>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 text-center">
              <div className="text-violet-300 text-xs mb-1">Avg AI Confidence</div>
              <div className="text-3xl font-black text-violet-300">
                {data?.forecasts.length
                  ? Math.round(data.forecasts.reduce((s, f) => s + f.confidencePct, 0) / data.forecasts.length)
                  : 0}%
              </div>
            </div>
          </div>

          {/* Velocity Radar */}
          {data?.velocityMetrics && data.velocityMetrics.length > 0 && (
            <VelocityRadar velocityMetrics={data.velocityMetrics} />
          )}

          {/* Forecast Cards */}
          {sortedForecasts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-lg font-bold text-white">No concerning forecasts detected</div>
              <div className="text-sm mt-1">All monitored issues appear stable or improving.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5">
              {sortedForecasts.map((f: any) => (
                <ForecastCard key={f.id} forecast={f} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
