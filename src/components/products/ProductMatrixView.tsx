import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { Product } from '../../types.js';
import {
  Package,
  Star,
  Smile,
  Frown,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export function ProductMatrixView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await ApiService.getProducts();
        setProducts(res.products);
      } catch (err) {}
      finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Product Satisfaction & Matrix Benchmarks
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comparative CSAT benchmarks, rating distributions, and negative complaint drivers across your product catalog.
        </p>
      </div>

      {/* Grid of Product Matrix Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {prod.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {prod.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{prod.avgRating}</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {prod.description}
              </p>

              {/* CSAT & Proportions Bar */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Customer CSAT</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{prod.csat}% Satisfied</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${prod.positiveRate}%` }}
                    title={`Positive: ${prod.positiveRate}%`}
                  />
                  <div
                    className="bg-rose-500"
                    style={{ width: `${prod.negativeRate}%` }}
                    title={`Negative: ${prod.negativeRate}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{prod.positiveRate}% Positive</span>
                  <span>{prod.negativeRate}% Negative</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{prod.totalFeedback} total signals</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  Active Monitoring <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
