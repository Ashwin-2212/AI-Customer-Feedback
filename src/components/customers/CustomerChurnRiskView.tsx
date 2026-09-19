import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Customer, CustomerChurnPrediction, ChurnRiskTier, ChurnContributingFactor } from '../../types.js';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  User,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';

export function CustomerChurnRiskView() {
  const { addToast } = useApp();
  const [customers, setCustomers] = useState<(Customer & { churnPrediction: CustomerChurnPrediction })[]>([]);
  const [summary, setSummary] = useState({
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    averageRiskScore: 0,
    totalRevenueAtRiskUSD: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<(Customer & { churnPrediction: CustomerChurnPrediction }) | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  const fetchChurnData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCustomerChurnIntelligence();
      setCustomers(res.customers || []);
      if (res.summary) setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load churn intelligence', err);
      addToast({
        title: 'Error loading churn scores',
        message: 'Could not calculate predictive customer risk analytics.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurnData();
  }, []);

  const getTierBadge = (tier: ChurnRiskTier, score: number) => {
    switch (tier) {
      case 'CRITICAL':
        return {
          icon: '🔴',
          label: 'Critical Risk',
          range: '81–100',
          badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-300 dark:border-rose-900/60 dark:text-rose-400',
          gaugeColor: 'text-rose-500'
        };
      case 'HIGH':
        return {
          icon: '🟠',
          label: 'High Risk',
          range: '61–80',
          badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-900/60 dark:text-amber-400',
          gaugeColor: 'text-amber-500'
        };
      case 'MEDIUM':
        return {
          icon: '🟡',
          label: 'Medium Risk',
          range: '31–60',
          badgeClass: 'bg-yellow-500/10 text-yellow-800 border-yellow-300 dark:border-yellow-900/60 dark:text-yellow-400',
          gaugeColor: 'text-yellow-500'
        };
      case 'LOW':
      default:
        return {
          icon: '🟢',
          label: 'Low Risk',
          range: '0–30',
          badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-900/60 dark:text-emerald-400',
          gaugeColor: 'text-emerald-500'
        };
    }
  };

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.segment || '').toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || c.churnPrediction?.churnRisk === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-2 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Customer Churn Risk Intelligence (0–100)
            </h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Explainable Risk Factors
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explainable customer risk scores (0–100) with factor attribution points across repeated negative feedback, unresolved complaints, and frustration.
          </p>
        </div>

        <button
          onClick={fetchChurnData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          <span>Recalculate Scores</span>
        </button>
      </div>

      {/* 4 Churn Risk Tiers Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical (81-100) */}
        <div
          onClick={() => setTierFilter(tierFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-2xs transition ${
            tierFilter === 'CRITICAL'
              ? 'ring-2 ring-rose-500 bg-rose-50/70 border-rose-300 dark:bg-rose-950/40'
              : 'bg-white border-slate-200 hover:border-rose-300 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span>🔴</span> Critical Risk</span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">81–100</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{summary.criticalCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Immediate white-glove retention intervention required.</p>
        </div>

        {/* High (61-80) */}
        <div
          onClick={() => setTierFilter(tierFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-2xs transition ${
            tierFilter === 'HIGH'
              ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300 dark:bg-amber-950/40'
              : 'bg-white border-slate-200 hover:border-amber-300 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span>🟠</span> High Risk</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">61–80</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{summary.highCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Multiple friction signals detected across recent touchpoints.</p>
        </div>

        {/* Medium (31-60) */}
        <div
          onClick={() => setTierFilter(tierFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-2xs transition ${
            tierFilter === 'MEDIUM'
              ? 'ring-2 ring-yellow-500 bg-yellow-50/70 border-yellow-300 dark:bg-yellow-950/40'
              : 'bg-white border-slate-200 hover:border-yellow-300 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span>🟡</span> Medium Risk</span>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">31–60</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{summary.mediumCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Early friction warning; standard CS check-in recommended.</p>
        </div>

        {/* Low (0-30) */}
        <div
          onClick={() => setTierFilter(tierFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-2xs transition ${
            tierFilter === 'LOW'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40'
              : 'bg-white border-slate-200 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span>🟢</span> Low Risk</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">0–30</span>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{summary.lowCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Healthy account engagement and positive sentiment trajectory.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search account name, email, or segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`rounded-lg px-2.5 py-1 transition ${
                tierFilter === tier
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Churn Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => {
          const pred = cust.churnPrediction;
          const badge = getTierBadge(pred.churnRisk as ChurnRiskTier, pred.churnScore);

          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-400"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cust.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">{cust.email}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black border ${badge.badgeClass}`}>
                    <span>{badge.icon}</span>
                    <span>{pred.riskCategory}</span>
                  </span>
                </div>

                {/* Churn Risk Score Bar */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Customer Churn Risk</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      <strong className={badge.gaugeColor}>{pred.churnScore}</strong> / 100
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pred.churnScore >= 81 ? 'bg-rose-500' :
                        pred.churnScore >= 61 ? 'bg-amber-500' :
                        pred.churnScore >= 31 ? 'bg-yellow-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${pred.churnScore}%` }}
                    />
                  </div>
                </div>

                {/* Key Signals */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Contributing Risk Drivers:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pred.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      >
                        • {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>Inspect Explainable Factors</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  LTV: ${cust.churnPrediction.estimatedLtvUSD?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Explainable Factors Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="rounded-2xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.name}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black border ${getTierBadge(selectedCustomer.churnPrediction.churnRisk as ChurnRiskTier, selectedCustomer.churnPrediction.churnScore).badgeClass}`}>
                    {selectedCustomer.churnPrediction.riskCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Email: {selectedCustomer.email} • Segment: {selectedCustomer.segment} • LTV: ${selectedCustomer.churnPrediction.estimatedLtvUSD?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-4 text-xs">
              {/* Churn Score Highlight */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Churn Risk Score</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.churnPrediction.churnScore} <span className="text-base text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Tier</span>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    {selectedCustomer.churnPrediction.churnRisk}
                  </div>
                </div>
              </div>

              {/* Contributing Factors Breakdown */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Explainable Contributing Factor Attribution:
                </span>
                {selectedCustomer.churnPrediction.contributingFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>{factor.factor}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {factor.description}
                      </p>
                      {factor.evidenceQuote && (
                        <p className="mt-1 text-[11px] italic text-slate-600 dark:text-slate-300 border-l-2 border-indigo-400 pl-2">
                          "{factor.evidenceQuote}"
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      +{factor.points} pts
                    </span>
                  </div>
                ))}
              </div>

              {/* Recommended Retention Action */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Recommended Retention Playbook</span>
                </div>
                <p className="mt-1 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                  {selectedCustomer.churnPrediction.recommendedRetentionAction}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addToast({
                    title: 'Retention Playbook Dispatched 🚀',
                    message: `Proactive retention outreach assigned to Executive CS lead for ${selectedCustomer.name}.`,
                    type: 'success'
                  });
                  setSelectedCustomer(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                <span>Execute Retention Outreach</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
