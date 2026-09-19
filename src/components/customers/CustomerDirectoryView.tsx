import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Customer, Feedback, CustomerHealthScore } from '../../types.js';
import {
  Users,
  Search,
  Star,
  AlertTriangle,
  Smile,
  Frown,
  ChevronRight,
  X,
  Layers,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Activity,
  User
} from 'lucide-react';
import { formatDate, getSentimentBadgeClass } from '../../lib/utils.js';

export function CustomerDirectoryView() {
  const { setSelectedFeedbackId, addToast, setActiveTab } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [healthScores, setHealthScores] = useState<CustomerHealthScore[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerFeedbacks, setCustomerFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, healthRes] = await Promise.all([
          ApiService.getCustomers(),
          ApiService.getCustomerHealthAndChurn()
        ]);
        setCustomers(custRes.customers || []);
        setHealthScores(healthRes.healthScores || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      setIsLoadingHistory(true);
      const res = await ApiService.getCustomerDetails(cust.id);
      setCustomerFeedbacks(res.feedbackHistory || []);
    } catch (err) {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getCustomerHealth = (custId: string) => {
    return (healthScores || []).find(h => h.customerId === custId);
  };

  const filtered = (customers || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.segment || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Customer Directory & AI Churn Risk Intelligence
            </h1>
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Predictive Health ML
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify at-risk accounts, early churn warning signals, and automated retention interventions.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('sentiment_velocity')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300 transition"
        >
          <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          <span>🔴 Sentiment Velocity Alerts</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, email, or segment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Table */}
        <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${selectedCustomer ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Monitored Accounts ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-400">Click row for 360° Health Diagnostic</span>
          </div>

          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Customer Profile</th>
                <th className="px-3 py-3">Segment</th>
                <th className="px-3 py-3">Health Score</th>
                <th className="px-3 py-3">Churn Probability</th>
                <th className="px-3 py-3">Signals</th>
                <th className="px-3 py-3 text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((cust) => {
                const health = getCustomerHealth(cust.id);
                return (
                  <tr
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      selectedCustomer?.id === cust.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>{cust.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{cust.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        cust.segment === 'At-Risk'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : cust.segment === 'VIP'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : cust.segment === 'Loyal'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {cust.segment}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {health ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                health.healthScore >= 70
                                  ? 'bg-emerald-500'
                                  : health.healthScore >= 45
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${health.healthScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {health.healthScore}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {health ? (
                        <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          health.churnProbability > 0.5
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : health.churnProbability > 0.25
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {Math.round(health.churnProbability * 100)}% Risk
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-medium">{cust.totalFeedbackCount}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 font-semibold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{cust.avgRating}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Customer History & Predictive Churn Mitigation Drawer */}
        {selectedCustomer && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-500" />
                  {selectedCustomer.name}
                </h3>
                <div className="text-xs text-slate-400 font-mono">{selectedCustomer.email}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Health & Churn Diagnostic Card */}
            {(() => {
              const health = getCustomerHealth(selectedCustomer.id);
              if (!health) return null;
              return (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Account Health Index
                    </span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">{health.healthScore}/100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white/80 p-2 dark:bg-slate-800/80">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Churn Risk</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {Math.round(health.churnProbability * 100)}% ({health.riskLevel})
                      </span>
                    </div>

                    <div className="rounded-lg bg-white/80 p-2 dark:bg-slate-800/80">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Lifetime Value</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ${health.ltvUSD?.toLocaleString() || '18,500'}
                      </span>
                    </div>
                  </div>

                  {health.churnMitigationAction && (
                    <div className="rounded-lg bg-white/90 p-2.5 text-[11px] dark:bg-slate-800/90 text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400 block text-[10px] uppercase">
                        Prescribed Retention Action:
                      </span>
                      {health.churnMitigationAction}
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Feedback Ingestion History ({(customerFeedbacks || []).length})
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {isLoadingHistory ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
                ) : (customerFeedbacks || []).length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No signals recorded</div>
                ) : (
                  (customerFeedbacks || []).map((fb) => (
                    <div
                      key={fb.id}
                      onClick={() => setSelectedFeedbackId(fb.id)}
                      className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-white hover:shadow-2xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{fb.productName}</span>
                        <span>{formatDate(fb.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                        "{fb.text}"
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-flex rounded-md border px-1.5 py-0.2 text-[9px] font-bold ${getSentimentBadgeClass(fb.analysis?.sentiment)}`}>
                          {fb.analysis?.sentiment}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{fb.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
