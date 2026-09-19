import React, { useState, useEffect } from 'react';
import { Product, ProductComparisonItem } from '../../types.js';
import { ApiService } from '../../services/api.js';
import { X, Scale, Sparkles, CheckCircle, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function ProductComparisonModal({ isOpen, onClose, products }: ProductComparisonModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ProductComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length >= 2) {
      setSelectedIds(products.slice(0, 3).map(p => p.id));
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  }, [products, isOpen]);

  useEffect(() => {
    if (selectedIds.length > 0 && isOpen) {
      fetchComparison();
    }
  }, [selectedIds, isOpen]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await ApiService.compareProducts(selectedIds);
      if (res.success && res.comparison) {
        setComparison(res.comparison);
      }
    } catch (err) {
      console.error('Failed to compare products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return;
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) return; // Limit to 4 for clean matrix
      setSelectedIds(prev => [...prev, id]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Intelligence Comparison Matrix</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare health scores, customer risk tiers, complaint velocity, and resolution rates across target products.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mr-2">Select Products (Max 4):</span>
          {products.map(p => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {p.name} ({p.code})
              </button>
            );
          })}
        </div>

        {/* Matrix Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Comparing target products...</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60">
                  <th className="p-3 w-48">Metric / Dimension</th>
                  {comparison.map(item => (
                    <th key={item.product.id} className="p-3 text-center min-w-44">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{item.product.name}</div>
                      <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{item.product.code}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {/* Status Row */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Status</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.product.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* AI Health Score */}
                <tr className="bg-indigo-50/30 dark:bg-indigo-950/20">
                  <td className="p-3 font-bold text-indigo-900 dark:text-indigo-200">AI Health Score</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center">
                      <span className={`text-lg font-black ${
                        item.healthScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                        item.healthScore >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.healthScore} / 100
                      </span>
                    </td>
                  ))}
                </tr>

                {/* CSAT Rating */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Customer CSAT</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center font-bold text-slate-900 dark:text-white">
                      {item.csat}%
                    </td>
                  ))}
                </tr>

                {/* Feedback Volume */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Monitored Feedback Volume</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {item.feedbackVolume} records
                    </td>
                  ))}
                </tr>

                {/* Open Issues */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Open Issues</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      {item.openIssuesCount}
                    </td>
                  ))}
                </tr>

                {/* Critical Issues */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Critical Issues</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.criticalIssuesCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.criticalIssuesCount}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Customer Risk Tier */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Customer Risk Tier</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.customerRisk === 'HIGH' || item.customerRisk === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        item.customerRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.customerRisk}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Resolution Rate */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Resolution Rate</td>
                  {comparison.map(item => (
                    <td key={item.product.id} className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {item.resolutionRate}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
