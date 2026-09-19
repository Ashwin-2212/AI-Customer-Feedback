import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { FeatureRequest } from '../../types.js';
import {
  Lightbulb,
  ThumbsUp,
  TrendingUp,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Code
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function FeatureRequestsView() {
  const { setSelectedFeedbackId, addToast } = useApp();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadFeatures() {
      try {
        setIsLoading(true);
        const res = await ApiService.getFeatureRequests();
        setFeatures(res.featureRequests);
      } catch (err) {
        console.error('Failed to load feature requests:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatures();
  }, []);

  const handleVote = async (id: string) => {
    try {
      const res = await ApiService.voteFeatureRequest(id);
      setFeatures(prev => prev.map(f => f.id === id ? res.featureRequest : f));
      addToast({
        title: 'Upvote Registered',
        message: `Demand score incremented for "${res.featureRequest.title}"`,
        type: 'success'
      });
    } catch (err) {}
  };

  const filtered = features.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
                          f.description.toLowerCase().includes(search.toLowerCase()) ||
                          f.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCategory || f.category === filterCategory;
    const matchesStatus = !filterStatus || f.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              AI-Clustered Feature Requests & Demand Matrix
            </h1>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Sparkles className="inline h-3 w-3 mr-1" />
              Automated Aggregation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customer feature requests are automatically clustered, deduplicated, and ranked by demand intensity.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search feature ideas and customer requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">All Statuses</option>
          <option value="PROPOSED">Proposed</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_DEVELOPMENT">In Development</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((feat) => (
          <div
            key={feat.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {feat.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  feat.demand === 'HIGH'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : feat.demand === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {feat.demand} Demand
                </span>
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {feat.title}
              </h3>

              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {feat.description}
              </p>

              <div className="mt-3 text-[11px] text-slate-400">
                Product: <span className="font-medium text-slate-700 dark:text-slate-300">{feat.productName}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleVote(feat.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Upvote ({feat.votes})</span>
                </button>

                {feat.feedbackIds && feat.feedbackIds.length > 0 && (
                  <button
                    onClick={() => setSelectedFeedbackId(feat.feedbackIds[0])}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400"
                  >
                    <Layers className="h-3 w-3" />
                    <span>{feat.feedbackIds.length} Citations</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
